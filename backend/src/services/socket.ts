// backend/src/services/socket.ts
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { Message } from '../models/Message';
import { Chat } from '../models/Chat';
import { Notification } from '../models/Notification';

// Keep track of live product views in memory
// Map of listingId -> Set of socketIds
const liveProductViews = new Map<string, Set<string>>();
// Map of socketId -> listingId currently viewed
const socketCurrentListing = new Map<string, string>();

export const configureRealTimeAppEngine = (io: SocketServer) => {
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) return next(new Error('Authentication failed: Missing cookies.'));

      const cookies = cookie.parse(cookieHeader);
      const token = cookies.accessToken;
      if (!token) return next(new Error('Authentication failed: Access token missing.'));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret_fallback') as any;
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication failed: Token payload invalid.'));
    }
  });

  io.on('connection', (socket) => {
    const activeSessionUser = socket.data.userId;
    socket.join(activeSessionUser);
    console.log(`[RealTime Pipeline] Securely mapped user context channel: ${activeSessionUser}`);

    // --- CHAT ROOM ACTIONS ---
    socket.on('join_chat_room', ({ chatId }) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on('send_chat_message', async ({ chatId, content, mediaUrls }) => {
      try {
        const messageInstance = await Message.create({
          chat: chatId,
          sender: activeSessionUser,
          content,
          mediaUrls: mediaUrls || [],
          readBy: [activeSessionUser]
        });

        const hydratedMessage = await messageInstance.populate('sender', 'email');
        await Chat.findByIdAndUpdate(chatId, { lastMessage: messageInstance._id });

        io.to(`chat_${chatId}`).emit('new_message_received', hydratedMessage);

        const chatRoom = await Chat.findById(chatId);
        chatRoom?.participants.forEach((recipientId: any) => {
          if (recipientId.toString() !== activeSessionUser.toString()) {
            io.to(recipientId.toString()).emit('chat_notification_alert', {
              chatId,
              snippet: content.substring(0, 60),
              senderId: activeSessionUser
            });
          }
        });
      } catch (err) {
        socket.emit('error_response', { message: 'Message processing execution failed.' });
      }
    });

    socket.on('typing_status', ({ chatId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        chatId,
        userId: activeSessionUser,
        isTyping
      });
    });

    socket.on('mark_read', async ({ chatId }) => {
      try {
        // Mark all unread messages in this chat as read
        await Message.updateMany(
          { chat: chatId, sender: { $ne: activeSessionUser }, readBy: { $ne: activeSessionUser } },
          { $addToSet: { readBy: activeSessionUser } }
        );
        socket.to(`chat_${chatId}`).emit('messages_seen', {
          chatId,
          userId: activeSessionUser
        });
      } catch (err) {
        console.error('[RealTime] Error marking messages read:', err);
      }
    });

    // --- LIVE PRODUCT VIEWS ---
    socket.on('view_product', ({ listingId }) => {
      // Leave previous product view if any
      const previousListing = socketCurrentListing.get(socket.id);
      if (previousListing) {
        const prevSet = liveProductViews.get(previousListing);
        if (prevSet) {
          prevSet.delete(socket.id);
          io.to(`product_${previousListing}`).emit('live_viewers_count', prevSet.size);
        }
      }

      socket.join(`product_${listingId}`);
      socketCurrentListing.set(socket.id, listingId);

      let viewers = liveProductViews.get(listingId);
      if (!viewers) {
        viewers = new Set<string>();
        liveProductViews.set(listingId, viewers);
      }
      viewers.add(socket.id);

      io.to(`product_${listingId}`).emit('live_viewers_count', viewers.size);
    });

    socket.on('leave_product_view', () => {
      const listingId = socketCurrentListing.get(socket.id);
      if (listingId) {
        const viewers = liveProductViews.get(listingId);
        if (viewers) {
          viewers.delete(socket.id);
          io.to(`product_${listingId}`).emit('live_viewers_count', viewers.size);
        }
        socket.leave(`product_${listingId}`);
        socketCurrentListing.delete(socket.id);
      }
    });

    // --- REALTIME OFFERS / AUCTIONS ---
    socket.on('submit_live_offer', ({ recipientId, swapRequestId, message }) => {
      io.to(recipientId).emit('live_swap_offer_alert', {
        swapRequestId,
        message,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      // Clean up product views
      const listingId = socketCurrentListing.get(socket.id);
      if (listingId) {
        const viewers = liveProductViews.get(listingId);
        if (viewers) {
          viewers.delete(socket.id);
          io.to(`product_${listingId}`).emit('live_viewers_count', viewers.size);
        }
        socketCurrentListing.delete(socket.id);
      }

      socket.leave(activeSessionUser);
      console.log(`[RealTime Pipeline] Client disconnected: ${socket.id}`);
    });
  });
};