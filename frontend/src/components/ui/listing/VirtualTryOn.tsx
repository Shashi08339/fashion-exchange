// frontend/src/components/ui/listing/VirtualTryOn.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Maximize2, RotateCcw, AlertCircle, ShoppingBag } from 'lucide-react';
import { Button } from '../button';
import { Card, CardHeader, CardTitle, CardContent } from '../card';

interface IVirtualTryOnProps {
  garmentImage?: string;
  garmentTitle?: string;
}

export const VirtualTryOn: React.FC<IVirtualTryOnProps> = ({ 
  garmentImage = 'https://res.cloudinary.com/demo/image/upload/v1600000000/sample.jpg',
  garmentTitle = 'Garment Item' 
}) => {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger draw on canvas when images or slider adjustments change
  useEffect(() => {
    drawCanvas();
  }, [modelImage, scale, offsetY, offsetX, garmentImage]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw model background
    if (modelImage) {
      const modelImg = new Image();
      modelImg.src = modelImage;
      modelImg.onload = () => {
        ctx.drawImage(modelImg, 0, 0, canvas.width, canvas.height);
        drawGarment(ctx, canvas);
      };
    } else {
      // Draw placeholder grey silhouette
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw simple center line indicator
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      ctx.fillStyle = '#9ca3af';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload your photo to try on', canvas.width / 2, canvas.height / 2 - 10);
      
      drawGarment(ctx, canvas);
    }
  };

  const drawGarment = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const garmImg = new Image();
    garmImg.src = garmentImage;
    garmImg.onload = () => {
      // Draw overlay garment in the center with scale and offsets
      const baseWidth = canvas.width * 0.45;
      const baseHeight = (garmImg.height / garmImg.width) * baseWidth;

      const targetWidth = baseWidth * scale;
      const targetHeight = baseHeight * scale;

      const x = (canvas.width - targetWidth) / 2 + offsetX;
      const y = (canvas.height - targetHeight) / 3 + offsetY;

      ctx.save();
      // Apply a slight opacity to make it overlay naturally
      ctx.globalAlpha = 0.92;
      ctx.drawImage(garmImg, x, y, targetWidth, targetHeight);
      ctx.restore();
    };
  };

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setModelImage(url);
    }
  };

  const resetAdjustments = () => {
    setScale(1);
    setOffsetY(0);
    setOffsetX(0);
  };

  return (
    <Card className="glass-panel overflow-hidden border-white/20 shadow-premium">
      <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-slate-900 dark:to-slate-800">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500 animate-spin" /> AI Smart Fitting Room
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Canvas preview */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative rounded-2xl overflow-hidden shadow-premium border border-gray-100 bg-white">
            <canvas 
              ref={canvasRef} 
              width={320} 
              height={400} 
              className="w-full max-w-[320px] aspect-[4/5] object-contain"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Adjust the garment overlay using sliders
          </p>
        </div>

        {/* Adjustments Panel */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" /> Fitting garment
              </h3>
              <p className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                {garmentTitle}
              </p>
            </div>

            {/* Model Upload Button */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                Your Silhouette Photo
              </label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleModelUpload}
                accept="image/*"
                className="hidden" 
              />
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2 py-3"
              >
                <Upload className="w-4 h-4" /> Upload Fitting Photo
              </Button>
            </div>

            {/* Sliders */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">
                  <span>Scale size</span>
                  <span>{Math.round(scale * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.05"
                  value={scale} 
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">
                  <span>Vertical position</span>
                  <span>{offsetY}px</span>
                </div>
                <input 
                  type="range" 
                  min="-100" 
                  max="100" 
                  step="1"
                  value={offsetY} 
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">
                  <span>Horizontal position</span>
                  <span>{offsetX}px</span>
                </div>
                <input 
                  type="range" 
                  min="-50" 
                  max="50" 
                  step="1"
                  value={offsetX} 
                  onChange={(e) => setOffsetX(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={resetAdjustments} className="flex-1 gap-1">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
            <Button className="flex-1 gap-1">
              <Maximize2 className="w-4 h-4" /> Save fitting
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
