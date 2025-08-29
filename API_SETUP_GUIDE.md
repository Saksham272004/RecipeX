# 🍕 LogMeal API Setup Guide

This guide will help you set up the LogMeal API for ingredient recognition in your Smart Recipe Generator.

## 🚀 Quick Start

1. **Get your LogMeal API key**
2. **Add it to `config.js`**
3. **Test your setup**

---

## 📋 LogMeal Food AI API

### 🥇 LogMeal (Primary Food Recognition)

**Best for:** Professional food analysis and ingredient detection
**Free Tier:** 1,000 requests/month
**Accuracy:** ⭐⭐⭐⭐⭐
**Food Focus:** ⭐⭐⭐⭐⭐

**Setup:**

1. Go to [LogMeal.com](https://logmeal.com/)
2. Sign up for a developer account
3. Navigate to your dashboard
4. Get your Bearer token (API key)

---

## 🔑 Adding Your API Key

1. Open `config.js`
2. Replace the placeholder with your real LogMeal API key:

```javascript
const API_CONFIG = {
  LOGMEAL: {
    API_KEY: 'your_actual_logmeal_api_key_here', // Replace this
    BASE_URL: 'https://api.logmeal.es/v2/image/segmentation/complete'
  }
};
```

---

## 🧪 Testing Your Setup

1. **Open your app** in a web browser
2. **Upload a food image** using the camera/upload button
3. **Click "Analyze Image"**
4. **Check the browser console** (F12) for API logs:
   - ✅ `"🍕 Using LogMeal API for detection..."`
   - ✅ `"✅ LogMeal response received"`
   - ❌ `"❌ LogMeal API error"` (check your API key)

---

## 🔍 Troubleshooting

### API Key Issues
- **Double-check** your LogMeal API key is correct
- **Ensure** no extra spaces or characters
- **Verify** your account has remaining quota (1,000/month free)

### Network Issues
- **Check** your internet connection
- **Try** a different food image
- **Look** at browser console for error details

### Image Issues
- **Use** clear, well-lit food photos
- **Try** different image formats (JPG, PNG, WebP)
- **Ensure** image size is under 5MB
- **Focus** on individual ingredients rather than complex dishes

---

## 🎯 LogMeal Features

- ✅ **Food Recognition**: Identifies specific food items
- ✅ **Ingredient Detection**: Extracts ingredients from dishes  
- ✅ **Nutritional Analysis**: Provides nutritional information
- ✅ **High Accuracy**: Specialized for food analysis
- ✅ **Segmentation**: Identifies different food regions in images

---

## 📊 API Limits

- **Free Tier**: 1,000 requests/month
- **Response Time**: ~2-5 seconds
- **Image Size**: Max 5MB
- **Formats**: JPG, PNG, WebP
- **Rate Limit**: No specific limit mentioned

---

## 🔄 Fallback Mode

If LogMeal API is not configured or fails, the app will automatically switch to **demo mode** with sample ingredient detections. This ensures your app always works, even without an API key.

---

## 🛡️ Security Best Practices

### For Development:
- Keep `config.js` in your `.gitignore` file
- Never commit API keys to public repositories

### For Production:
- Use environment variables instead of `config.js`
- Implement server-side API calls to hide keys
- Set up API key restrictions and quotas

### Example .gitignore entry:
```
config.js
.env
*.key
```

---

## 💡 Tips for Better Results

1. **Photo Quality:**
   - Use good lighting
   - Keep ingredients clearly visible
   - Avoid cluttered backgrounds
   - Focus on individual ingredients

2. **API Usage:**
   - Cache results to save API calls
   - Monitor your usage to avoid quota limits
   - Implement retry logic for failed requests

3. **User Experience:**
   - Always provide fallback options
   - Show loading states during analysis
   - Allow manual ingredient addition

---

## 🚀 Ready to Go!

Once you've added your LogMeal API key to `config.js`, your app will automatically use real food recognition instead of demo data. The interface remains the same, but you'll get actual ingredient detection from your photos!

**Need help?** Check the browser console (F12) for detailed error messages and API call logs!