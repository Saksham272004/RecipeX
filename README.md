# Smart Recipe Generator with AI Food Recognition

A modern web application that combines AI-powered food recognition with intelligent recipe matching. Upload food images to automatically detect ingredients, or manually search for recipes based on what you have in your kitchen.

## ✨ Features

### 🤖 **AI Food Recognition**
- Upload food images for automatic ingredient detection
- Powered by LogMeal Food AI API
- Real-time confidence scoring for detected ingredients
- Support for various food types and cuisines

### 🔍 **Smart Recipe Search**
- Type ingredient names with autocomplete suggestions
- Intelligent recipe matching with configurable accuracy threshold
- Search through 3000+ recipes from diverse cuisines
- Partial ingredient matching for flexible results

### ❤️ **Favorites & Management**
- Save and organize your favorite recipes
- Persistent storage using browser localStorage
- Quick access to saved recipes

### 📱 **Modern Interface**
- Fully responsive design for all devices
- Clean, intuitive user interface
- Real-time search and filtering
- Smooth animations and transitions

### 🍳 **Detailed Recipe Information**
- Complete cooking instructions
- Nutritional information and facts
- Cooking time and difficulty levels
- Serving size information

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 60+, Firefox 55+, Safari 11+, Edge 79+)
- LogMeal API key (for food recognition feature)

### Setup

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd smart-recipe-generator
   ```

2. **Configure API Key**
   - Open `config.js`
   - Replace the placeholder API key with your LogMeal API key:
   ```javascript
   LOGMEAL: {
       API_KEY: 'your-logmeal-api-key-here',
       BASE_URL: 'https://api.logmeal.es/v2/image/recognition/complete'
   }
   ```

3. **Run the Application**
   
   **Option A: Direct Browser Access**
   ```bash
   # Simply open index.html in your browser
   open index.html
   ```
   
   **Option B: Local Server (Recommended)**
   ```bash
   # Using Python
   python -m http.server 3000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:3000
   ```

4. **Access the App**
   - Open http://localhost:3000 in your browser
   - Start uploading food images or searching for recipes!

## 📁 Project Structure

```
├── index.html                 # Main application interface
├── app.js                    # Core JavaScript functionality
├── style.css                 # Complete styling and responsive design
├── config.js                 # API configuration
├── x_unique_nutrition.json   # Recipe database (3000+ recipes)
├── .gitignore               # Git ignore rules
├── LICENSE                  # MIT License
└── README.md               # This file
```

## 🔧 How It Works

### Food Recognition Flow
1. **Image Upload**: User uploads a food image
2. **API Processing**: Image sent to LogMeal API for analysis
3. **Ingredient Detection**: AI identifies food items with confidence scores
4. **Result Display**: Detected ingredients shown with add/remove options
5. **Recipe Matching**: Selected ingredients used to find matching recipes

### Recipe Search Algorithm
- **Ingredient Matching**: Calculates percentage of matching ingredients
- **Threshold Filtering**: Configurable accuracy threshold (default: 75%)
- **Smart Matching**: Supports partial and fuzzy ingredient matching
- **Ranking**: Results sorted by match percentage and relevance

## 🛠️ Technical Details

### Frontend Technologies
- **Vanilla JavaScript (ES6+)**: No frameworks, pure performance
- **CSS3**: Modern styling with Flexbox and Grid
- **HTML5**: Semantic markup and accessibility features
- **Local Storage**: Client-side data persistence

### API Integration
- **LogMeal Food AI**: Professional food recognition service
- **RESTful API**: Clean HTTP-based communication
- **Error Handling**: Graceful fallbacks and user feedback
- **Rate Limiting**: Respectful API usage patterns

### Browser Compatibility
- **Modern Browsers**: Full feature support
- **Progressive Enhancement**: Core functionality works everywhere
- **Responsive Design**: Mobile-first approach
- **Performance Optimized**: Fast loading and smooth interactions

## 🎨 Customization

### Adding New Recipes
Edit `x_unique_nutrition.json` to add recipes:

```json
{
  "id": 1,
  "name": "Delicious Recipe Name",
  "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
  "steps": [
    "Step 1: Preparation instructions",
    "Step 2: Cooking instructions",
    "Step 3: Final steps"
  ],
  "time": 30,
  "servings": 4,
  "difficulty": "medium",
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "fat": 12,
    "carbs": 40
  }
}
```

### Styling Customization
Modify `style.css` to customize:
- **Color Schemes**: Update CSS custom properties
- **Layout**: Adjust grid and flexbox configurations
- **Components**: Style individual UI elements
- **Responsive Breakpoints**: Modify media queries

### API Configuration
Update `config.js` to:
- **Change API endpoints**: Switch to different food recognition services
- **Add new APIs**: Integrate additional services
- **Modify settings**: Adjust confidence thresholds and parameters

## 🚀 Deployment

### Static Hosting (Recommended)
Deploy to any static hosting service:

- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Direct repository hosting
- **Firebase Hosting**: Google's hosting platform

### CDN Deployment
For global performance:
- Upload files to AWS S3 + CloudFront
- Use Azure Static Web Apps
- Deploy to Google Cloud Storage

### Environment Variables
For production deployment, consider:
- Moving API keys to environment variables
- Using build-time configuration
- Implementing proper secret management

## 🔒 Security Considerations

- **API Keys**: Never commit real API keys to version control
- **CORS**: Ensure proper cross-origin resource sharing
- **Input Validation**: Sanitize user inputs and file uploads
- **Rate Limiting**: Implement client-side API call throttling

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Add comments for complex functionality
- Test on multiple browsers and devices
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

**Food Recognition Not Working**
- Check API key configuration in `config.js`
- Verify internet connection
- Ensure image format is supported (JPEG, PNG)

**Recipes Not Loading**
- Check browser console for JavaScript errors
- Verify `x_unique_nutrition.json` file is accessible
- Clear browser cache and reload

**Performance Issues**
- Use local server instead of file:// protocol
- Check browser developer tools for network issues
- Ensure images are properly optimized

### Getting Help
- Check browser developer console for error messages
- Verify all files are properly uploaded/accessible
- Test with different browsers and devices
- Review API documentation for LogMeal integration

## 🌟 Acknowledgments

- **LogMeal**: AI-powered food recognition API
- **Recipe Data**: Curated collection of international recipes
- **Icons & Images**: Various open-source contributors
- **Community**: Thanks to all contributors and users

---

**Enjoy discovering new recipes with AI-powered ingredient detection! 🍳✨**