// backend/src/services/gemini.service.ts
import axios from 'axios';

interface IAIDetails {
  title: string;
  description: string;
  category: string;
  subCategory: string;
  gender: string;
  occasion: string;
  season: string;
  brand: string;
  color: string;
  pattern: string;
  sleeveType: string;
  fabric: string;
  fit: string;
  material: string;
  style: string;
  ageGroup: string;
  tags: string[];
  estimatedValue: number;
  resalePrice: number;
  conditionScore: number;
  carbonSavings: number;
  waterSavings: number;
  sustainabilityRating: number;
  trendScore: number;
  colorPalette: string[];
  logosDetected: string[];
  damageDetected: {
    hasDamage: boolean;
    details: string;
    score: number;
  };
  isAuthentic: boolean;
}

export const analyzeListingImage = async (base64Image: string, categoryHint: string = ''): Promise<IAIDetails> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('[AI Service] GEMINI_API_KEY not configured. Falling back to local high-fidelity mock analyzer.');
    return generateMockAIAnalysis(categoryHint);
  }

  try {
    // Strip headers if base64 contains data:image/png;base64,
    const match = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
    const mimeType = match ? match[1] : 'image/jpeg';
    const base64Data = match ? match[2] : base64Image;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `
      You are a world-class fashion appraiser and verification specialist. Analyze this garment image in detail.
      Generate a structured JSON output with the following properties:
      {
        "title": "A catchy, premium retail listing title (5-10 words)",
        "description": "An engaging, detailed retail description describing fabric, style, and fit (50-100 words)",
        "category": "Main classification category (e.g. Tops, Bottoms, Dresses, Outerwear, Activewear, Accessories)",
        "subCategory": "Specific type (e.g. Hoodie, Denim Jeans, Blazer, Cardigan)",
        "gender": "One of: Male, Female, Unisex",
        "occasion": "Style occasion (e.g. Casual, Formal, Party, Streetwear)",
        "season": "Best season (e.g. Summer, Winter, Autumn, Spring)",
        "brand": "Predicted brand (e.g. Nike, Patagonia, Zara, Levi's, Gucci, Uniqlo or 'Unbranded')",
        "color": "Dominant color",
        "pattern": "Pattern type (e.g. Solid, Striped, Plaid, Floral, Graphic)",
        "sleeveType": "Sleeve details (e.g. Long Sleeve, Short Sleeve, Sleeveless, N/A)",
        "fabric": "Fabric knit (e.g. Denim, Cotton fleece, Linen, Wool)",
        "fit": "Fit cut (e.g. Oversized, Slim Fit, Relaxed, Regular)",
        "material": "Material component (e.g. 100% Cotton, Polyester Blend, Leather)",
        "style": "Fashion aesthetic (e.g. Vintage, Minimalist, Y2K, Grunge, Gorpcore)",
        "ageGroup": "Target demographic (e.g. Adult, Teen, Kids)",
        "tags": ["array", "of", "4-6", "lowercase", "search", "tags"],
        "estimatedValue": 1000, // Estimated retail price in Indian Rupees (numeric)
        "resalePrice": 500, // Recommended second-hand price in Rupees (numeric)
        "conditionScore": 85, // Condition percentage out of 100 (numeric)
        "carbonSavings": 12.5, // Estimated CO2 saved in kg by reuse (numeric, typically 5-20)
        "waterSavings": 2500, // Estimated water saved in liters by reuse (numeric, typically 1000-5000)
        "sustainabilityRating": 4, // Score out of 5 (numeric)
        "trendScore": 75, // Popularity trend index out of 100 (numeric)
        "colorPalette": ["Hex1", "Hex2", "Hex3"], // Hex color palette codes
        "logosDetected": [], // Array of detected brand logos
        "damageDetected": {
          "hasDamage": false,
          "details": "e.g. slight wrinkle, minor cuff stain or 'None'",
          "score": 0 // Damage severity score 0-100 (numeric)
        },
        "isAuthentic": true // Boolean flag indicating if it is authentic/original
      }
      Do NOT wrap the output in markdown code blocks. Output ONLY raw, valid JSON.
    `;

    const response = await axios.post(endpoint, {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error('Empty response from AI Vision model.');
    
    return JSON.parse(resultText) as IAIDetails;
  } catch (err: any) {
    console.error('[AI Service] Gemini vision call error:', err.message);
    return generateMockAIAnalysis(categoryHint);
  }
};

export const parseSearchQuery = async (query: string): Promise<any> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return generateMockSearchParse(query);
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const prompt = `
      Convert the following natural language query into a structured MongoDB search query object.
      Query: "${query}"
      Output ONLY a JSON representation of parameters:
      {
        "text": "clean search phrase",
        "brand": "specific brand if mentioned or null",
        "category": "category like Tops/Bottoms/Dresses if matches or null",
        "maxPrice": numeric max price if mentioned or null,
        "color": "color if mentioned or null",
        "size": "size (e.g. S, M, L) if mentioned or null",
        "condition": "condition filter or null",
        "exchangeOnly": boolean (true if swap/exchange mentioned),
        "donationOnly": boolean (true if donate/gift mentioned)
      }
      Output raw JSON only.
    `;

    const response = await axios.post(endpoint, {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error('Empty parsing response.');
    
    return JSON.parse(resultText);
  } catch (err: any) {
    return generateMockSearchParse(query);
  }
};

// --- HIGH-FIDELITY FALLBACK MOCK DATA GENERATORS ---

const generateMockAIAnalysis = (hint: string = ''): IAIDetails => {
  const normalizedHint = hint.toLowerCase();
  
  let title = 'Premium Vintage Oversized Jacket';
  let category = 'Outerwear';
  let subCategory = 'Denim Jacket';
  let tags = ['denim', 'vintage', 'oversized', 'jacket', 'streetwear'];
  let color = 'Indigo Blue';
  let fabric = 'Denim';
  let estimatedValue = 3500;
  let resalePrice = 1499;
  let carbonSavings = 18.4;
  let waterSavings = 3400;

  if (normalizedHint.includes('shirt') || normalizedHint.includes('tee')) {
    title = 'Eco-Cotton Streetwear Tee';
    category = 'Tops';
    subCategory = 'T-Shirt';
    tags = ['cotton', 'streetwear', 'tee', 'graphic', 'minimalist'];
    color = 'Off-White';
    fabric = '100% Organic Cotton';
    estimatedValue = 1200;
    resalePrice = 450;
    carbonSavings = 6.2;
    waterSavings = 2700;
  } else if (normalizedHint.includes('jean') || normalizedHint.includes('pant')) {
    title = 'Relaxed Fit Cargo Denim Jeans';
    category = 'Bottoms';
    subCategory = 'Jeans';
    tags = ['relaxed', 'denim', 'cargo', 'bluejeans', 'casual'];
    color = 'Stone Wash Blue';
    fabric = 'Heavyweight Denim';
    estimatedValue = 2900;
    resalePrice = 1200;
    carbonSavings = 14.2;
    waterSavings = 4000;
  }

  return {
    title,
    description: `A vintage-inspired, highly durable ${subCategory} crafted from premium ${fabric}. Designed with a relaxed ${color} wash and optimized tailoring for comfortable everyday casual wear.`,
    category,
    subCategory,
    gender: 'Unisex',
    occasion: 'Casual',
    season: 'Autumn',
    brand: 'Levi\'s',
    color,
    pattern: 'Solid',
    sleeveType: category === 'Bottoms' ? 'N/A' : 'Long Sleeve',
    fabric,
    fit: 'Oversized',
    material: fabric,
    style: 'Vintage',
    ageGroup: 'Adult',
    tags,
    estimatedValue,
    resalePrice,
    conditionScore: 90,
    carbonSavings,
    waterSavings,
    sustainabilityRating: 5,
    trendScore: 82,
    colorPalette: ['#1e293b', '#475569', '#cbd5e1'],
    logosDetected: ['Levi\'s Red Tab'],
    damageDetected: {
      hasDamage: false,
      details: 'None',
      score: 0
    },
    isAuthentic: true
  };
};

const generateMockSearchParse = (query: string): any => {
  const lower = query.toLowerCase();
  const res: any = {
    text: query,
    brand: null,
    category: null,
    maxPrice: null,
    color: null,
    size: null,
    condition: null,
    exchangeOnly: false,
    donationOnly: false
  };

  // Extract Max Price
  const priceMatch = lower.match(/(under|below|less than|rs\.?|₹)\s?(\d+)/);
  if (priceMatch) {
    res.maxPrice = parseInt(priceMatch[2]);
  }

  // Extract Sizes
  if (/\b(small|medium|large|xl|xxl|s|m|l)\b/.test(lower)) {
    const sizeMatch = lower.match(/\b(small|medium|large|xl|xxl|s|m|l)\b/);
    if (sizeMatch) {
      res.size = sizeMatch[1].toUpperCase();
    }
  }

  // Extract Colors
  const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'brown', 'pink', 'grey'];
  for (const c of colors) {
    if (lower.includes(c)) {
      res.color = c;
      break;
    }
  }

  // Extract Brands
  const brands = ['nike', 'adidas', 'patagonia', 'zara', 'gucci', 'levis', 'levi\'s', 'uniqlo'];
  for (const b of brands) {
    if (lower.includes(b)) {
      res.brand = b;
      break;
    }
  }

  // Swap / Donate indicators
  if (lower.includes('swap') || lower.includes('exchange')) {
    res.exchangeOnly = true;
  }
  if (lower.includes('donate') || lower.includes('free') || lower.includes('gift')) {
    res.donationOnly = true;
  }

  return res;
};
