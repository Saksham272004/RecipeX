console.log('🚀 App.js is loading...');

let recipes = [];
let allIngredients = [];
let selectedIngredients = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

console.log('📊 Initial variables set');

// Page sections
let homeSection, searchSection, favoritesSection;

// DOM elements
let recipeList, recipeDetails, ingredientInput, suggestionsBox, selectedBox;

// Clean ingredient names by removing non-alphabetic prefixes and measurements
function cleanIngredientName(ingredient) {
  if (!ingredient || typeof ingredient !== 'string') {
    return '';
  }

  let cleaned = ingredient.trim();

  // Remove leading numbers, percentages, and symbols (like "2% low-fat milk" -> "low-fat milk")
  cleaned = cleaned.replace(/^[0-9]+[%]?\s*/, '');

  // Remove other leading non-alphabetic characters (symbols, spaces)
  cleaned = cleaned.replace(/^[^a-zA-Z]+/, '').trim();

  // Remove common measurement prefixes and numbers
  const measurementPrefixes = [
    'cup', 'cups', 'c', 'tbsp', 'tsp', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
    'oz', 'ounce', 'ounces', 'lb', 'lbs', 'pound', 'pounds',
    'gram', 'grams', 'g', 'kg', 'kilogram', 'kilograms',
    'ml', 'milliliter', 'milliliters', 'liter', 'liters', 'l',
    'pint', 'pints', 'pt', 'quart', 'quarts', 'qt', 'gallon', 'gallons', 'gal',
    'inch', 'inches', 'cm', 'centimeter', 'centimeters'
  ];

  // Split by spaces and remove measurement words and numbers from the beginning
  let words = cleaned.split(/\s+/);

  // Remove leading numbers and measurements
  while (words.length > 0) {
    const firstWord = words[0].toLowerCase();

    // Remove if it's a number (including fractions like "1/2")
    if (/^[0-9]+([\/][0-9]+)?$/.test(firstWord)) {
      words.shift();
      continue;
    }

    // Remove if it's a measurement unit
    if (measurementPrefixes.includes(firstWord)) {
      words.shift();
      continue;
    }

    // Remove if it's a number followed by measurement (like "2cups")
    if (/^[0-9]+[a-zA-Z]+$/.test(firstWord) && measurementPrefixes.some(unit => firstWord.includes(unit))) {
      words.shift();
      continue;
    }

    break; // Stop if current word is not a number or measurement
  }

  cleaned = words.join(' ').trim();

  // Remove any remaining leading non-alphabetic characters
  cleaned = cleaned.replace(/^[^a-zA-Z]+/, '').trim();

  // Remove common descriptor words that aren't actual ingredients
  const descriptorWords = [
    'of', 'the', 'and', 'or', 'with', 'without', 'plus', 'extra',
    'fresh', 'dried', 'frozen', 'canned', 'bottled', 'packaged',
    'chopped', 'sliced', 'diced', 'minced', 'grated', 'shredded',
    'cooked', 'uncooked', 'raw', 'prepared', 'ready',
    'low-fat', 'non-fat', 'fat-free', 'sugar-free', 'salt-free',
    'organic', 'natural', 'pure', 'whole', 'reduced'
  ];

  words = cleaned.split(/\s+/);
  while (words.length > 1 && descriptorWords.includes(words[0].toLowerCase())) {
    words.shift();
  }

  cleaned = words.join(' ').trim();

  // Final cleanup - ensure we have something meaningful
  if (cleaned.length < 2) {
    return ingredient.trim(); // Return original if cleaning resulted in too short string
  }

  return cleaned;
}

// Load recipes and collect ingredients
async function loadRecipes() {
  console.log('🔄 loadRecipes function called');
  try {
    console.log('📂 Loading recipes from x_unique_nutrition.json...');
    console.log('🌐 Fetching from URL:', "./x_unique_nutrition.json");
    const res = await fetch("./x_unique_nutrition.json");
    console.log('📡 Fetch response:', res);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    recipes = await res.json();
    console.log('Raw recipes loaded:', recipes.length);

    // Validate recipe structure
    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error('Invalid recipe data: not an array or empty');
    }

    // Enhance recipes with better images and clean ingredient names
    recipes = recipes.map(recipe => {
      const newImage = generateRecipeImage(recipe);
      const cleanedIngredients = recipe.ingredients.map(ingredient => {
        const cleaned = cleanIngredientName(ingredient.toLowerCase());
        return cleaned || ingredient; // Keep original if cleaning results in empty string
      });

      // Also clean recipe names that start with numbers
      let cleanedName = recipe.name;
      if (/^[0-9]/.test(cleanedName)) {
        cleanedName = cleanedName.replace(/^[0-9]+\s*/, '').trim();
      }

      return {
        ...recipe,
        name: cleanedName,
        image: newImage,
        ingredients: cleanedIngredients
      };
    });

    console.log('Loaded recipes with images:', recipes.length);

    // Collect all unique ingredients and clean them
    allIngredients = [
      ...new Set(recipes.flatMap((r) => r.ingredients.map((i) => cleanIngredientName(i.toLowerCase()))))
    ].filter(ingredient => ingredient.length > 0); // Remove empty ingredients

    console.log('Collected ingredients:', allIngredients.length);

    // Log some examples of cleaned ingredients for debugging
    const sampleIngredients = allIngredients.slice(0, 10);
    console.log('Sample cleaned ingredients:', sampleIngredients);

    // Show popular recipes on home page
    displayPopularRecipes();

    // Initially show empty state in search section
    showEmptySearchState();

    console.log('Recipe loading complete!');
    return Promise.resolve();
  } catch (err) {
    console.error('Error loading recipes:', err);
    if (recipeList) {
      recipeList.innerHTML = `
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <h3>Error Loading Recipes</h3>
          <p>Could not load recipe database: ${err.message}</p>
          <p>Please check the console for more details.</p>
        </div>
      `;
    }
    return Promise.reject(err);
  }
}

// Generate recipe images based on recipe names and ingredients
function generateRecipeImage(recipe) {
  const recipeName = recipe.name.toLowerCase();
  const ingredients = recipe.ingredients.map(ing => ing.toLowerCase());

  // First check for exact recipe name matches
  const exactMatches = {
    'spaghetti carbonara': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=400&fit=crop&crop=center',
    'chicken alfredo': 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=600&h=400&fit=crop&crop=center',
    'margherita pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop&crop=center',
    'caesar salad': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop&crop=center',
    'grilled salmon': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=600&h=400&fit=crop&crop=center',
    'beef steak': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop&crop=center',
    'chocolate cake': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop&crop=center',
    'fried rice': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&h=400&fit=crop&crop=center',
    'tomato soup': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&crop=center',
    'pancakes': 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=400&fit=crop&crop=center'
  };

  // Check for exact matches first
  for (const [exactName, imageUrl] of Object.entries(exactMatches)) {
    if (recipeName.includes(exactName)) {
      return imageUrl;
    }
  }

  // Define specific images for different food categories
  const imageCategories = {
    breakfast: {
      keywords: ['breakfast', 'pancake', 'waffle', 'toast', 'cereal', 'oatmeal', 'eggs', 'bacon', 'omelet'],
      images: [
        'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&h=400&fit=crop&crop=center'
      ]
    },
    pizza: {
      keywords: ['pizza', 'margherita', 'pepperoni'],
      images: [
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop&crop=center'
      ]
    },
    pasta: {
      keywords: ['pasta', 'spaghetti', 'linguine', 'fettuccine', 'penne', 'carbonara', 'bolognese', 'alfredo'],
      images: [
        'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=600&h=400&fit=crop&crop=center'
      ]
    },
    chicken: {
      keywords: ['chicken', 'poultry', 'grilled chicken', 'fried chicken', 'wings'],
      images: [
        'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&crop=center'
      ]
    },
    dessert: {
      keywords: ['cake', 'cookie', 'pie', 'dessert', 'sweet', 'chocolate', 'ice cream'],
      images: [
        'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop&crop=center'
      ]
    }
  };

  // Default fallback images
  const defaultImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&crop=center'
  ];

  // Find matching category
  for (const [categoryName, category] of Object.entries(imageCategories)) {
    const hasKeyword = category.keywords.some(keyword =>
      recipeName.includes(keyword) ||
      ingredients.some(ing => ing.includes(keyword))
    );

    if (hasKeyword) {
      const imageIndex = recipe.id % category.images.length;
      return category.images[imageIndex];
    }
  }

  // Fallback to default images
  const imageIndex = recipe.id % defaultImages.length;
  return defaultImages[imageIndex];
}

// Reset display state for clean transitions
function resetDisplayState() {
  console.log('Resetting display state...');

  if (recipeList) {
    recipeList.innerHTML = '';
    recipeList.style.display = 'block';
  }

  if (recipeDetails) {
    recipeDetails.innerHTML = '';
    recipeDetails.style.display = 'none';
  }
}

// Show empty search state
function showEmptySearchState() {
  console.log('Showing empty search state');
  resetDisplayState();

  if (recipeList) {
    recipeList.innerHTML = `
      <div class="empty-search-state">
        <span class="search-icon">🔍</span>
        <h3>Ready to find recipes?</h3>
        <p>Add ingredients above to discover amazing recipes!</p>
      </div>
    `;
  }
}

// Show recipe list in grid format
function displayRecipes(recipesToShow) {
  console.log('Displaying recipes:', recipesToShow.length);

  resetDisplayState();

  if (recipeList) {
    recipeList.style.display = 'block';
    recipeList.style.flex = '1';
    recipeList.style.width = '100%';
  }

  if (recipeDetails) {
    recipeDetails.style.display = 'none';
  }

  if (recipesToShow.length === 0) {
    recipeList.innerHTML = `
      <div class="no-results">
        <span class="no-results-icon">🔍</span>
        <h3>No specific recipe found</h3>
        <p>We couldn't find recipes matching your selected ingredients.</p>
        <div class="no-results-suggestions">
          <h4>Try these suggestions:</h4>
          <ul>
            <li>Try different ingredient combinations</li>
            <li>Remove some ingredients to broaden your search</li>
            <li>Add more common ingredients like salt, pepper, or oil</li>
            <li>Search for basic ingredients like chicken, pasta, or vegetables</li>
          </ul>
        </div>
        <div class="selected-ingredients-display">
          <p><strong>Your selected ingredients:</strong> ${selectedIngredients.join(', ')}</p>
        </div>
      </div>
    `;
    return;
  }

  // Create full-frame results container
  recipeList.innerHTML = `
    <div class="full-frame-results">
      <div class="results-header">
        <h3>Found ${recipesToShow.length} recipe${recipesToShow.length !== 1 ? 's' : ''}</h3>
        <p>Click on any recipe to view full details</p>
      </div>
      <div class="full-frame-grid" id="fullFrameGrid">
        <!-- Recipe cards will be added here -->
      </div>
    </div>
  `;

  const gridContainer = document.getElementById('fullFrameGrid');

  recipesToShow.forEach((recipe) => {
    const card = createCompactRecipeCard(recipe);
    gridContainer.appendChild(card);
  });
}

// Create compact recipe card
function createCompactRecipeCard(recipe) {
  const isFavorited = favorites.some(fav => fav.id === recipe.id);

  const card = document.createElement('div');
  card.className = 'recipe-card-compact';
  card.innerHTML = `
    <div class="card-image-container">
      <img src="${recipe.image}" alt="${recipe.name}" onerror="handleImageError(this)" />
      <button class="favorite-btn-compact ${isFavorited ? 'favorited' : 'not-favorited'}" 
              onclick="toggleFavorite(${recipe.id}, this, event)">
        ${isFavorited ? '❤️' : '🤍'}
      </button>
    </div>
    <div class="card-content">
      <h4>${recipe.name}</h4>
      <div class="card-meta">
        <span class="meta-badge time">⏱️ ${recipe.time} min</span>
        <span class="meta-badge difficulty-${recipe.difficulty}">📊 ${recipe.difficulty}</span>
      </div>
      <div class="card-ingredients">
        <div class="ingredients-preview">
          ${recipe.ingredients.slice(0, 4).join(', ')}${recipe.ingredients.length > 4 ? '...' : ''}
        </div>
        ${recipe.dietary && recipe.dietary.length > 0 ? `
        <div class="dietary-tags">
          ${recipe.dietary.map(diet => `<span class="dietary-tag">${diet}</span>`).join('')}
        </div>
        ` : ''}
      </div>
    </div>
  `;

  // Add click handler for recipe details
  card.addEventListener('click', (e) => {
    if (!e.target.classList.contains('favorite-btn-compact')) {
      showRecipeDetails(recipe);
      showSection('search');
    }
  });

  return card;
}

// Show recipe details in expanded view
function showRecipeDetails(recipe) {
  const isFavorited = favorites.some(fav => fav.id === recipe.id);

  if (recipeList) {
    recipeList.style.display = 'none';
  }

  if (recipeDetails) {
    recipeDetails.style.display = 'block';
    recipeDetails.style.flex = '1';
    recipeDetails.style.width = '100%';
  }

  recipeDetails.innerHTML = `
    <div class="recipe-detail-header">
      <button id="backToGrid" class="back-btn">← Back to Results</button>
      <button class="favorite-btn-detail ${isFavorited ? 'favorited' : 'not-favorited'}" 
              onclick="toggleFavorite(${recipe.id}, this, event)">
        ${isFavorited ? '❤️' : '🤍'} ${isFavorited ? 'Remove from' : 'Add to'} Favorites
      </button>
    </div>
    
    <div class="recipe-detail-content">
      <h2>${recipe.name || "Unnamed Recipe"}</h2>
      <div class="recipe-meta">
        <span class="meta-item">⏱️ ${recipe.time} min</span>
        <span class="meta-item">👥 ${recipe.servings} servings</span>
        <span class="meta-item difficulty-${recipe.difficulty}">📊 ${recipe.difficulty}</span>
      </div>
      
      ${recipe.dietary && recipe.dietary.length > 0 ? `
      <div class="dietary-info">
        <h4>Dietary Information</h4>
        <div class="dietary-badges">
          ${recipe.dietary.map(diet => `<span class="dietary-badge">${diet}</span>`).join('')}
        </div>
      </div>
      ` : ''}
      
      <img src="${recipe.image}" alt="${recipe.name}" class="recipe-detail-image" onerror="handleImageError(this)" />
      
      <div class="recipe-sections">
        <div class="ingredients-section">
          <h3>🥘 Ingredients</h3>
          <ul class="ingredients-list">
            ${recipe.ingredients.map((ing) => `<li>${ing}</li>`).join("")}
          </ul>
        </div>
        
        <div class="steps-section">
          <h3>👨‍🍳 Instructions</h3>
          <div class="steps-list">
            ${recipe.steps.map((step) => `<div class="step-item">${step}</div>`).join("")}
          </div>
        </div>
        
        <div class="nutrition-section">
          <h3>📊 Nutrition Facts</h3>
          <div class="nutrition-grid">
            <div class="nutrition-item">
              <span class="nutrition-value">${recipe.nutrition.calories}</span>
              <span class="nutrition-label">Calories</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-value">${recipe.nutrition.protein}g</span>
              <span class="nutrition-label">Protein</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-value">${recipe.nutrition.fat}g</span>
              <span class="nutrition-label">Fat</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-value">${recipe.nutrition.carbs}g</span>
              <span class="nutrition-label">Carbs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add back button functionality
  document.getElementById('backToGrid').addEventListener('click', () => {
    if (recipeList) {
      recipeList.style.display = 'block';
    }
    if (recipeDetails) {
      recipeDetails.style.display = 'none';
    }
    const generateBtn = document.getElementById("generateBtn");
    if (generateBtn) {
      generateBtn.click();
    }
  });

  recipeDetails.scrollIntoView({ behavior: 'smooth' });
}

// Fallback image handler for broken images
function handleImageError(img) {
  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&crop=center';
  if (img.src !== fallbackImage) {
    img.src = fallbackImage;
  }
}

// Handle ingredient selection
function addIngredient(ingredient) {
  console.log('Adding ingredient:', ingredient);
  if (!selectedIngredients.includes(ingredient)) {
    selectedIngredients.push(ingredient);
    updateSelectedBox();
    updateIngredientGridButtons(); // Update grid buttons
    console.log('Selected ingredients:', selectedIngredients);
  }

  if (ingredientInput) {
    ingredientInput.value = "";
  }

  if (suggestionsBox) {
    suggestionsBox.innerHTML = "";
  }

  const clearInputBtn = document.getElementById("clearInputBtn");
  if (clearInputBtn) {
    clearInputBtn.classList.remove("visible");
  }
}

function updateSelectedBox() {
  console.log('Updating selected box with:', selectedIngredients);
  const selectedContainer = document.getElementById('selectedIngredients');

  if (selectedContainer) {
    if (selectedIngredients.length === 0) {
      selectedContainer.innerHTML = '';
    } else {
      selectedContainer.innerHTML = selectedIngredients
        .map(ing =>
          `<span class="ingredient-chip" onclick="removeIngredient('${ing}')">
            ${ing} <span class="remove">✕</span>
          </span>`
        )
        .join("");
    }
    console.log('Selected ingredients updated');
  } else {
    console.error('selectedIngredients container not found');
  }
}

function removeIngredient(ingredient) {
  console.log('Removing ingredient:', ingredient);
  selectedIngredients = selectedIngredients.filter((i) => i !== ingredient);
  updateSelectedBox();
  updateIngredientGridButtons(); // Update grid buttons
}

// Initialize navigation when DOM is loaded
function initializeNavigation() {
  console.log('Initializing navigation...');

  homeSection = document.getElementById('homeSection');
  searchSection = document.getElementById('searchSection');
  favoritesSection = document.getElementById('favoritesSection');

  const searchFeature = document.getElementById('searchFeature');
  const favoritesFeature = document.getElementById('favoritesFeature');

  if (searchFeature) {
    searchFeature.addEventListener('click', () => {
      showSection('search');
    });
  }

  if (favoritesFeature) {
    favoritesFeature.addEventListener('click', () => {
      showSection('favorites');
    });
  }

  const backHomeBtn = document.getElementById('backHomeBtn');
  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', () => {
      showSection('home');
    });
  }

  const browseFavoritesBtn = document.getElementById('browseFavoritesBtn');
  if (browseFavoritesBtn) {
    browseFavoritesBtn.addEventListener('click', () => {
      showSection('search');
    });
  }
}

// Show specific section
function showSection(section) {
  console.log('Switching to section:', section);

  document.querySelectorAll('.page-section').forEach(sec => {
    sec.classList.remove('active');
  });

  switch (section) {
    case 'home':
      if (homeSection) {
        homeSection.classList.add('active');
        setTimeout(() => displayPopularRecipes(), 100);
      }
      break;
    case 'search':
      if (searchSection) {
        searchSection.classList.add('active');
        if (selectedIngredients.length === 0) {
          showEmptySearchState();
        }
      }
      break;
    case 'favorites':
      if (favoritesSection) {
        favoritesSection.classList.add('active');
        displayFavorites();
      }
      break;
  }

  console.log('Section switched to:', section);
}

// Display popular recipes on home page
function displayPopularRecipes() {
  console.log('Displaying popular recipes...');
  const popularContainer = document.getElementById('popularRecipesList');

  if (!popularContainer) {
    console.error('popularRecipesList container not found');
    return;
  }

  if (!recipes || recipes.length === 0) {
    console.log('Recipes not loaded yet, showing loading state');
    popularContainer.innerHTML = `
      <div class="loading-recipes">
        <span class="loading-icon">⏳</span>
        <p>Loading recipes...</p>
      </div>
    `;
    return;
  }

  console.log('Recipes available:', recipes.length);

  const shuffled = [...recipes].sort(() => 0.5 - Math.random());
  const popularRecipes = shuffled.slice(0, 6);

  popularContainer.innerHTML = '';

  popularRecipes.forEach(recipe => {
    const card = createCompactRecipeCard(recipe);
    popularContainer.appendChild(card);
  });

  console.log('Popular recipes displayed:', popularRecipes.length);
}

// Display favorites
function displayFavorites() {
  const favoritesList = document.getElementById('favoritesList');
  if (!favoritesList) return;

  if (favorites.length === 0) {
    favoritesList.innerHTML = `
      <div class="empty-favorites">
        <span class="empty-icon">💔</span>
        <h3>No favorites yet</h3>
        <p>Start exploring recipes and add them to your favorites!</p>
        <button id="browseFavoritesBtn" class="cta-button">Browse Recipes</button>
      </div>
    `;

    document.getElementById('browseFavoritesBtn').addEventListener('click', () => {
      showSection('search');
    });
    return;
  }

  favoritesList.innerHTML = '';
  const gridContainer = document.createElement('div');
  gridContainer.className = 'recipe-grid-container';

  favorites.forEach(recipe => {
    const card = createCompactRecipeCard(recipe);
    gridContainer.appendChild(card);
  });

  favoritesList.appendChild(gridContainer);
}

// Toggle favorite
function toggleFavorite(recipeId, button, event) {
  event.stopPropagation();

  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  const existingIndex = favorites.findIndex(fav => fav.id === recipeId);

  if (existingIndex > -1) {
    favorites.splice(existingIndex, 1);
    button.innerHTML = '🤍';
    button.className = button.className.replace('favorited', 'not-favorited');
  } else {
    favorites.push(recipe);
    button.innerHTML = '❤️';
    button.className = button.className.replace('not-favorited', 'favorited');
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Image recognition functionality - LogMeal API only
async function analyzeImage(base64Image) {
  console.log('🔍 Starting image analysis...');
  console.log('📸 Base64 image length:', base64Image ? base64Image.length : 'No image');

  let detections = [];

  // Debug API configuration
  console.log('🔧 API Config check:');
  console.log('- window.API_CONFIG exists:', !!window.API_CONFIG);
  console.log('- LOGMEAL config exists:', !!window.API_CONFIG?.LOGMEAL);
  console.log('- API_KEY exists:', !!window.API_CONFIG?.LOGMEAL?.API_KEY);
  console.log('- API_KEY value:', window.API_CONFIG?.LOGMEAL?.API_KEY);
  console.log('- BASE_URL:', window.API_CONFIG?.LOGMEAL?.BASE_URL);

  // Check if LogMeal API is configured
  if (window.API_CONFIG?.LOGMEAL?.API_KEY && window.API_CONFIG.LOGMEAL.API_KEY !== 'YOUR_LOGMEAL_API_KEY_HERE') {
    console.log('🍕 Using LogMeal API for detection...');
    try {
      detections = await detectWithLogMeal(base64Image);
    } catch (error) {
      console.error('❌ Error in detectWithLogMeal:', error);
      return [];
    }
  } else {
    console.log('⚠️ LogMeal API not configured');
    console.log('⚠️ Reason: API key missing or is placeholder');
    alert('❌ API Error: Please check console for details');
    return [];
  }

  console.log('🎯 Final detections:', detections);
  return detections;
}

// LogMeal Food AI API
async function detectWithLogMeal(base64Image) {
  try {
    console.log('🔄 Starting LogMeal API call...');
    console.log('🔑 API Key:', window.API_CONFIG.LOGMEAL.API_KEY ? 'Present' : 'Missing');
    console.log('🌐 API URL:', window.API_CONFIG.LOGMEAL.BASE_URL);

    // LogMeal API expects FormData with image file
    const formData = new FormData();
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    formData.append('image', blob, 'image.jpg');

    console.log('📤 FormData prepared with image blob, size:', blob.size);

    const response = await fetch("/.netlify/functions/logmeal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ LogMeal API error response:', errorText);
      throw new Error(`LogMeal API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ LogMeal response received:', data);
    console.log('🔍 Response structure check:');
    console.log('- segmentation_results:', !!data.segmentation_results);
    console.log('- recognition_results:', !!data.recognition_results);
    console.log('- results:', !!data.results);
    console.log('- Full response keys:', Object.keys(data));
    
    // Log first segmentation result for debugging
    if (data.segmentation_results && data.segmentation_results[0]) {
      console.log('🔍 First segmentation result:', data.segmentation_results[0]);
      if (data.segmentation_results[0].recognition_results) {
        console.log('🔍 First recognition results:', data.segmentation_results[0].recognition_results.slice(0, 3));
      }
    }

    // Handle different response formats
    let detections = [];

    // Check for segmentation_results format (LogMeal's actual format)
    if (data.segmentation_results && data.segmentation_results.length > 0) {
      console.log('📊 Processing segmentation results...');
      data.segmentation_results.forEach(result => {
        if (result.recognition_results && result.recognition_results.length > 0) {
          result.recognition_results.forEach(recognition => {
            if (recognition.name && recognition.prob > 0.15) { // Lower threshold for more results
              const foodName = recognition.name;
              const mappedIngredient = mapFoodToIngredient(foodName.toLowerCase());
              
              // Show detected food even if not in recipe database
              const ingredientName = mappedIngredient || foodName;
              console.log(`🍽️ Detected: ${foodName} -> ${ingredientName} (confidence: ${recognition.prob})`);
              
              detections.push({
                name: ingredientName,
                confidence: recognition.prob
              });
            }
          });
        }
      });
    }
    // Check for direct recognition results format
    else if (data.recognition_results && data.recognition_results.length > 0) {
      console.log('📊 Processing direct recognition results...');
      data.recognition_results.forEach(recognition => {
        if (recognition.name && recognition.prob > 0.3) {
          const foodName = recognition.name.toLowerCase();
          const mappedIngredient = mapFoodToIngredient(foodName);
          
          // Show detected food even if not in recipe database
          const ingredientName = mappedIngredient || foodName;
          console.log(`🍽️ Detected: ${foodName} -> ${ingredientName} (confidence: ${recognition.prob})`);
          
          detections.push({
            name: ingredientName,
            confidence: recognition.prob
          });
        }
      });
    }
    // Check for other possible formats
    else if (data.results && Array.isArray(data.results)) {
      console.log('📊 Processing results array...');
      data.results.forEach(result => {
        if (result.name && result.confidence > 0.3) {
          const foodName = result.name.toLowerCase();
          const mappedIngredient = mapFoodToIngredient(foodName);
          
          // Show detected food even if not in recipe database
          const ingredientName = mappedIngredient || foodName;
          console.log(`🍽️ Detected: ${foodName} -> ${ingredientName} (confidence: ${result.confidence})`);
          
          detections.push({
            name: ingredientName,
            confidence: result.confidence
          });
        }
      });
    }

    console.log('🎯 Processed detections:', detections);
    console.log('🎯 Detections count:', detections.length);
    
    if (detections.length === 0) {
      console.log('⚠️ No ingredients detected in this image');
    }

    return detections;
  } catch (error) {
    console.error('❌ LogMeal API error:', error);
    console.error('❌ Error details:', error.message);
    return [];
  }
}

// Map food items to recipe ingredients
function mapFoodToIngredient(foodName) {
  const foodMappings = {
    'tomato': 'tomato',
    'tomatoes': 'tomato',
    'onion': 'onion',
    'onions': 'onion',
    'garlic': 'garlic',
    'chicken': 'chicken',
    'beef': 'beef',
    'pork': 'pork',
    'fish': 'fish',
    'salmon': 'salmon',
    'tuna': 'tuna',
    'cheese': 'cheese',
    'milk': 'milk',
    'egg': 'egg',
    'eggs': 'egg',
    'bread': 'bread',
    'rice': 'rice',
    'pasta': 'pasta',
    'potato': 'potato',
    'potatoes': 'potato',
    'carrot': 'carrot',
    'carrots': 'carrot',
    'bell pepper': 'bell pepper',
    'pepper': 'bell pepper',
    'mushroom': 'mushroom',
    'mushrooms': 'mushroom',
    'spinach': 'spinach',
    'lettuce': 'lettuce',
    'cucumber': 'cucumber',
    'avocado': 'avocado',
    'lemon': 'lemon',
    'lime': 'lime',
    'apple': 'apple',
    'banana': 'banana',
    'orange': 'orange',
    'broccoli': 'broccoli',
    'cauliflower': 'cauliflower',
    'zucchini': 'zucchini',
    'eggplant': 'eggplant',
    'corn': 'corn',
    'beans': 'beans',
    'peas': 'peas'
  };

  return foodMappings[foodName] || null;
}



// Handle detected ingredients display
function displayDetectedIngredients(detections) {
  console.log('🎨 displayDetectedIngredients called with:', detections);
  
  const resultsContainer = document.getElementById('recognitionResults');
  const detectedContainer = document.getElementById('detectedIngredients');

  console.log('🎨 HTML elements found:', {
    resultsContainer: !!resultsContainer,
    detectedContainer: !!detectedContainer
  });

  if (!resultsContainer || !detectedContainer) {
    console.error('❌ Missing HTML elements for displaying results');
    return;
  }

  if (detections.length === 0) {
    console.log('🎨 No detections to display, hiding results');
    resultsContainer.classList.add('hidden');
    return;
  }

  console.log('🎨 Displaying', detections.length, 'detections on page');

  detectedContainer.innerHTML = detections.map(detection => `
    <div class="detected-ingredient" data-ingredient="${detection.name}">
      <span class="ingredient-name">${detection.name}</span>
      <span class="confidence">${Math.round(detection.confidence * 100)}%</span>
      <button class="toggle-btn" onclick="toggleDetectedIngredient('${detection.name}', this)">
        ✅ Add
      </button>
    </div>
  `).join('');

  resultsContainer.classList.remove('hidden');
}

// Toggle detected ingredient
function toggleDetectedIngredient(ingredient, button) {
  const ingredientDiv = button.parentElement;

  if (button.textContent.includes('Add')) {
    addIngredient(ingredient);
    button.innerHTML = '❌ Remove';
    button.classList.add('remove-mode');
    ingredientDiv.classList.add('added');
  } else {
    removeIngredient(ingredient);
    button.innerHTML = '✅ Add';
    button.classList.remove('remove-mode');
    ingredientDiv.classList.remove('added');
  }
}

// Add all detected ingredients
function addAllDetectedIngredients() {
  const detectedIngredients = document.querySelectorAll('.detected-ingredient');
  detectedIngredients.forEach(div => {
    const ingredient = div.dataset.ingredient;
    const button = div.querySelector('.toggle-btn');

    if (button.textContent.includes('Add')) {
      addIngredient(ingredient);
      button.innerHTML = '❌ Remove';
      button.classList.add('remove-mode');
      div.classList.add('added');
    }
  });
}

// Search functionality
function searchRecipes() {
  console.log('🔍 Searching recipes with ingredients:', selectedIngredients);

  if (selectedIngredients.length === 0) {
    showEmptySearchState();
    return;
  }

  const matchingRecipes = recipes.filter(recipe => {
    const recipeIngredients = recipe.ingredients.map(ing => ing.toLowerCase());
    const matchCount = selectedIngredients.filter(selected =>
      recipeIngredients.some(recipeIng =>
        recipeIng.includes(selected.toLowerCase()) ||
        selected.toLowerCase().includes(recipeIng)
      )
    ).length;

    return matchCount > 0;
  });

  // Sort by number of matching ingredients
  matchingRecipes.sort((a, b) => {
    const aMatches = selectedIngredients.filter(selected =>
      a.ingredients.some(ing =>
        ing.toLowerCase().includes(selected.toLowerCase()) ||
        selected.toLowerCase().includes(ing.toLowerCase())
      )
    ).length;

    const bMatches = selectedIngredients.filter(selected =>
      b.ingredients.some(ing =>
        ing.toLowerCase().includes(selected.toLowerCase()) ||
        selected.toLowerCase().includes(ing.toLowerCase())
      )
    ).length;

    return bMatches - aMatches;
  });

  console.log('📊 Found matching recipes:', matchingRecipes.length);
  displayRecipes(matchingRecipes);
}

console.log('📝 Setting up event listeners...');

// Fallback for window load event
window.addEventListener('load', () => {
  console.log('🌟 Window load event fired');
});

console.log('📝 Setting up DOMContentLoaded listener...');

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOM Content Loaded - Initializing Smart Recipe Generator...');
  console.log('🌐 Current URL:', window.location.href);
  console.log('📄 Document ready state:', document.readyState);

  // Get DOM elements
  recipeList = document.getElementById('recipeList');
  recipeDetails = document.getElementById('recipeDetails');
  ingredientInput = document.getElementById('ingredientInput');

  // Initialize navigation
  initializeNavigation();

  // Load recipes
  try {
    await loadRecipes();
    // Display all ingredients grid after recipes are loaded
    displayAllIngredients();
    console.log('✅ App initialization complete!');
  } catch (error) {
    console.error('❌ App initialization failed:', error);
  }

  // Set up ingredient input
  if (ingredientInput) {
    ingredientInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (query.length > 0) {
        const matches = allIngredients.filter(ing =>
          ing.includes(query) && !selectedIngredients.includes(ing)
        ).slice(0, 10);

        showSuggestions(matches);
      } else {
        hideSuggestions();
      }
    });
  }

  // Set up add ingredient button
  const addIngredientBtn = document.getElementById('addIngredientBtn');
  if (addIngredientBtn) {
    addIngredientBtn.addEventListener('click', () => {
      const ingredient = ingredientInput.value.trim().toLowerCase();
      if (ingredient && allIngredients.includes(ingredient)) {
        addIngredient(ingredient);
      }
    });
  }

  // Set up generate recipes button
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const loadingSpinner = document.getElementById('loadingSpinner');
      if (loadingSpinner) {
        loadingSpinner.classList.remove('hidden');
      }

      setTimeout(() => {
        searchRecipes();
        if (loadingSpinner) {
          loadingSpinner.classList.add('hidden');
        }
      }, 500);
    });
  }

  // Set up image upload functionality
  const imageInput = document.getElementById('imageInput');
  const uploadImageBtn = document.getElementById('uploadImageBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const removeImageBtn = document.getElementById('removeImageBtn');
  const addAllDetectedBtn = document.getElementById('addAllDetectedBtn');

  if (uploadImageBtn) {
    uploadImageBtn.addEventListener('click', () => {
      imageInput.click();
    });
  }

  if (imageInput) {
    imageInput.addEventListener('change', handleImageUpload);
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleImageAnalysis);
  }

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', removeImage);
  }

  if (addAllDetectedBtn) {
    addAllDetectedBtn.addEventListener('click', addAllDetectedIngredients);
  }
});

// Image upload handling
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    if (imagePreview && previewImg) {
      previewImg.src = e.target.result;
      imagePreview.classList.remove('hidden');
    }
  };
  reader.readAsDataURL(file);
}

// Image analysis handling
async function handleImageAnalysis() {
  const previewImg = document.getElementById('previewImg');
  const loadingDiv = document.getElementById('recognitionLoading');
  const resultsDiv = document.getElementById('recognitionResults');

  if (!previewImg || !previewImg.src) return;

  // Show loading
  if (loadingDiv) loadingDiv.classList.remove('hidden');
  if (resultsDiv) resultsDiv.classList.add('hidden');

  try {
    // Convert image to base64
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      // Analyze image
      const detections = await analyzeImage(base64);

      // Hide loading
      if (loadingDiv) loadingDiv.classList.add('hidden');

      // Display results
      displayDetectedIngredients(detections);
    };

    img.src = previewImg.src;
  } catch (error) {
    console.error('Image analysis error:', error);
    if (loadingDiv) loadingDiv.classList.add('hidden');
  }
}

// Remove uploaded image
function removeImage() {
  const imagePreview = document.getElementById('imagePreview');
  const imageInput = document.getElementById('imageInput');
  const resultsDiv = document.getElementById('recognitionResults');

  if (imagePreview) imagePreview.classList.add('hidden');
  if (imageInput) imageInput.value = '';
  if (resultsDiv) resultsDiv.classList.add('hidden');
}

// Show ingredient suggestions
function showSuggestions(matches) {
  let suggestionsBox = document.getElementById('suggestionsBox');

  if (!suggestionsBox) {
    suggestionsBox = document.createElement('div');
    suggestionsBox.id = 'suggestionsBox';
    suggestionsBox.className = 'suggestions-box';
    ingredientInput.parentNode.appendChild(suggestionsBox);
  }

  if (matches.length > 0) {
    suggestionsBox.innerHTML = matches.map(ingredient =>
      `<div class="suggestion-item" onclick="addIngredient('${ingredient}')">${ingredient}</div>`
    ).join('');
    suggestionsBox.style.display = 'block';
  } else {
    suggestionsBox.style.display = 'none';
  }
}

// Hide ingredient suggestions
function hideSuggestions() {
  const suggestionsBox = document.getElementById('suggestionsBox');
  if (suggestionsBox) {
    suggestionsBox.style.display = 'none';
  }
}

// Display all available ingredients in a grid
function displayAllIngredients() {
  const allIngredientsContainer = document.getElementById('allIngredients');

  if (!allIngredientsContainer || !allIngredients || allIngredients.length === 0) {
    console.log('No ingredients container or ingredients not loaded yet');
    return;
  }

  console.log('Displaying all ingredients grid:', allIngredients.length);

  // Sort ingredients alphabetically
  const sortedIngredients = [...allIngredients].sort();

  allIngredientsContainer.innerHTML = `
    <h3>Available Ingredients</h3>
    <p>Click on any ingredient to add it to your recipe search:</p>
    <div class="ingredients-grid">
      ${sortedIngredients.map(ingredient => `
        <button class="ingredient-btn ${selectedIngredients.includes(ingredient) ? 'selected' : ''}" 
                onclick="toggleIngredientFromGrid('${ingredient}')"
                data-ingredient="${ingredient}">
          ${ingredient}
        </button>
      `).join('')}
    </div>
  `;
}

// Toggle ingredient from grid
function toggleIngredientFromGrid(ingredient) {
  if (selectedIngredients.includes(ingredient)) {
    removeIngredient(ingredient);
  } else {
    addIngredient(ingredient);
  }

  // Update the grid button appearance
  updateIngredientGridButtons();
}

// Update ingredient grid button appearances
function updateIngredientGridButtons() {
  const ingredientButtons = document.querySelectorAll('.ingredient-btn');

  ingredientButtons.forEach(button => {
    const ingredient = button.dataset.ingredient;
    if (selectedIngredients.includes(ingredient)) {
      button.classList.add('selected');
    } else {
      button.classList.remove('selected');
    }
  });
}

// Make functions globally accessible
window.removeIngredient = removeIngredient;
window.toggleFavorite = toggleFavorite;
window.toggleDetectedIngredient = toggleDetectedIngredient;
window.toggleIngredientFromGrid = toggleIngredientFromGrid;