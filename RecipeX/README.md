<<<<<<< HEAD
# Smart Recipe Generator

A web application that helps you find recipes based on ingredients you have. Simple, fast, and works entirely in your browser.

## Features

- 🔍 **Smart Ingredient Search**: Type ingredient names with autocomplete suggestions
- ❤️ **Favorites System**: Save and manage your favorite recipes
- 🎯 **Smart Recipe Matching**: Find recipes with 75% ingredient accuracy threshold
- 📱 **Responsive Design**: Works perfectly on mobile and desktop
- 🍳 **Detailed Recipe Information**: Complete instructions, nutrition facts, and cooking times
- 🏠 **Multi-Section Navigation**: Home, Search, and Favorites sections
- 🚀 **No Setup Required**: Works entirely in your browser, no API keys needed

## How to Use

1. Navigate to the Search section
2. Type ingredient names in the search box
3. Select from autocomplete suggestions or type your own
4. Click "Find Recipes" to see matching recipes
5. Browse results and click on any recipe for detailed view
6. Add recipes to favorites by clicking the heart icon

## Quick Start

### Option 1: Direct Browser Access

Simply open `index.html` in your web browser. That's it!

### Option 2: With Local Server (Recommended)

1. **Run the startup script**:

   ```bash
   python start.py
   ```

   This will automatically start the servers and open the app.

2. **Manual Setup**:

   ```bash
   # Start backend (optional - for CORS support)
   cd backend
   pip install -r requirements.txt
   python main.py

   # Start frontend
   python -m http.server 3000
   ```

3. **Access the App**:
   - Frontend: http://localhost:3000

## File Structure

```
├── index.html              # Main HTML file
├── app.js                 # Frontend JavaScript
├── style.css              # Complete styling
├── x.json                 # Recipe database (100+ recipes)
├── start.py               # Startup script
├── backend/
│   ├── main.py           # Simple FastAPI server (optional)
│   └── requirements.txt  # Minimal dependencies
└── README.md
```

## Technical Details

### Recipe Matching Algorithm

- Calculates ingredient match percentage
- Requires 75% accuracy threshold for results
- Supports partial ingredient matching
- Case-insensitive search

### Browser Compatibility

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Features Used**: ES6+ JavaScript, Local Storage, Fetch API
- **Fallbacks**: Graceful degradation for unsupported features

### Performance

- **Client-side Processing**: All recipe matching happens in the browser
- **Local Storage**: Favorites saved locally
- **Fast Search**: Instant autocomplete and filtering
- **Optimized Images**: Recipe images loaded from CDN

## Customization

### Adding Recipes

Edit `x_unique_nutrition.json` to add new recipes with this structure:

```json
{
  "id": 1,
  "name": "Recipe Name",
  "ingredients": ["ingredient1", "ingredient2"],
  "steps": ["Step 1", "Step 2"],
  "time": 30,
  "servings": 4,
  "difficulty": "easy",
  "nutrition": {
    "calories": 300,
    "protein": 20,
    "fat": 10,
    "carbs": 30
  }
}
```

### Styling

Modify `style.css` to customize:

- Color scheme and themes
- Layout and spacing
- Component styling
- Responsive breakpoints

## Deployment

### Static Hosting

Deploy to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

Simply upload all files to your hosting provider.

### With Backend (Optional)

If you want to keep the optional backend:

- Deploy backend to Heroku, Railway, or similar
- Update any API URLs in the frontend
- Ensure CORS is properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues:

1. Check that you're using a modern browser
2. Try refreshing the page
3. Clear browser cache and local storage
4. Open browser developer tools to check for errors

Enjoy cooking with your Smart Recipe Generator! 🍳✨
=======
# RecipeX
>>>>>>> 69f0ee2a23a060549efdebf6759a7bbe5d8eac76
