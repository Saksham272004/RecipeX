let recipes = [];
let allIngredients = [];
let selectedIngredients = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Page sections
let homeSection, searchSection, favoritesSection;

// DOM elements
let recipeList, recipeDetails, ingredientInput, suggestionsBox, selectedBox;

// Load recipes and collect ingredients
async function loadRecipes() {
  try {
    console.log('Loading recipes from x_unique_nutrition.json...');
    const res = await fetch("./x_unique_nutrition.json");

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    recipes = await res.json();
    console.log('Raw recipes loaded:', recipes.length);

    // Validate recipe structure
    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error('Invalid recipe data: not an array or empty');
    }

    // Enhance recipes with better images
    recipes = recipes.map(recipe => {
      const newImage = generateRecipeImage(recipe);
      return {
        ...recipe,
        image: newImage
      };
    });

    console.log('Loaded recipes with images:', recipes.length);

    // Collect all unique ingredients
    allIngredients = [
      ...new Set(recipes.flatMap((r) => r.ingredients.map((i) => i.toLowerCase())))
    ];

    console.log('Collected ingredients:', allIngredients.length);

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
    'pancakes': 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=400&fit=crop&crop=center',
    'hamburger': 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop&crop=center',
    'sushi': 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=600&h=400&fit=crop&crop=center',
    'lasagna': 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=600&h=400&fit=crop&crop=center',
    'ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop&crop=center',
    'fish and chips': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&h=400&fit=crop&crop=center',
    'greek salad': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop&crop=center',
    'fried chicken': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&crop=center',
    'ice cream': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop&crop=center',
    'cheesecake': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&h=400&fit=crop&crop=center',
    'paella': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&h=400&fit=crop&crop=center'
  };

  // Check for exact matches first
  for (const [exactName, imageUrl] of Object.entries(exactMatches)) {
    if (recipeName.includes(exactName)) {
      return imageUrl;
    }
  }

  // Define specific images for different food categories with more accurate recipe photos
  const imageCategories = {
    // Breakfast items
    breakfast: {
      keywords: ['breakfast', 'pancake', 'waffle', 'toast', 'cereal', 'oatmeal', 'eggs', 'bacon', 'omelet', 'french toast'],
      images: [
        'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=400&fit=crop&crop=center', // pancakes
        'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop&crop=center', // eggs benedict
        'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&h=400&fit=crop&crop=center', // avocado toast
        'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop&crop=center', // oatmeal
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop&crop=center'  // breakfast plate
      ]
    },

    // Pizza
    pizza: {
      keywords: ['pizza', 'margherita', 'pepperoni'],
      images: [
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop&crop=center', // margherita pizza
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop&crop=center', // pepperoni pizza
        'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop&crop=center', // wood fired pizza
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop&crop=center'  // pizza slice
      ]
    },

    // Pasta dishes
    pasta: {
      keywords: ['pasta', 'spaghetti', 'linguine', 'fettuccine', 'penne', 'macaroni', 'carbonara', 'bolognese', 'alfredo', 'lasagna'],
      images: [
        'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=400&fit=crop&crop=center', // spaghetti carbonara
        'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600&h=400&fit=crop&crop=center', // pasta with tomato sauce
        'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&h=400&fit=crop&crop=center', // penne pasta
        'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=600&h=400&fit=crop&crop=center', // fettuccine alfredo
        'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=600&h=400&fit=crop&crop=center'  // lasagna
      ]
    },

    // Soup and stews
    soup: {
      keywords: ['soup', 'broth', 'bisque', 'chowder', 'stew', 'ramen', 'pho', 'minestrone', 'tomato soup'],
      images: [
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&crop=center', // tomato soup
        'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&h=400&fit=crop&crop=center', // vegetable soup
        'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=400&fit=crop&crop=center', // chicken soup
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop&crop=center', // ramen
        'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop&crop=center'  // beef stew
      ]
    },

    // Salads
    salad: {
      keywords: ['salad', 'greens', 'lettuce', 'spinach', 'caesar', 'greek', 'cobb', 'caprese'],
      images: [
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop&crop=center', // caesar salad
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&crop=center', // mixed greens
        'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop&crop=center', // greek salad
        'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=600&h=400&fit=crop&crop=center', // caprese salad
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop&crop=center'  // garden salad
      ]
    },

    // Chicken dishes
    chicken: {
      keywords: ['chicken', 'poultry', 'grilled chicken', 'fried chicken', 'chicken breast', 'wings', 'drumstick'],
      images: [
        'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop&crop=center', // grilled chicken
        'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=400&fit=crop&crop=center', // roasted chicken
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&h=400&fit=crop&crop=center', // chicken breast
        'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&crop=center', // fried chicken
        'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&h=400&fit=crop&crop=center'  // chicken wings
      ]
    },

    // Beef dishes
    beef: {
      keywords: ['beef', 'steak', 'burger', 'ground beef', 'ribeye', 'sirloin', 'filet', 'meatball', 'roast beef'],
      images: [
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop&crop=center', // grilled steak
        'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop&crop=center', // hamburger
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop&crop=center', // beef steak
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop&crop=center', // meatballs
        'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop&crop=center'  // roast beef
      ]
    },

    // Seafood
    seafood: {
      keywords: ['fish', 'salmon', 'tuna', 'shrimp', 'seafood', 'crab', 'lobster', 'cod', 'tilapia', 'prawns'],
      images: [
        'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=600&h=400&fit=crop&crop=center', // grilled salmon
        'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&h=400&fit=crop&crop=center', // seafood platter
        'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&h=400&fit=crop&crop=center', // fish and chips
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=center', // shrimp dish
        'https://images.unsplash.com/photo-1559847844-d724ce1b2b5e?w=600&h=400&fit=crop&crop=center'  // lobster
      ]
    },

    // Rice dishes
    rice: {
      keywords: ['rice', 'risotto', 'fried rice', 'pilaf', 'biryani', 'paella', 'sushi'],
      images: [
        'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&h=400&fit=crop&crop=center', // fried rice
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=center', // risotto
        'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=600&h=400&fit=crop&crop=center', // sushi
        'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&h=400&fit=crop&crop=center', // paella
        'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop&crop=center'  // biryani
      ]
    },

    // Sandwiches and wraps
    sandwich: {
      keywords: ['sandwich', 'wrap', 'sub', 'panini', 'club', 'blt', 'grilled cheese', 'burrito', 'quesadilla'],
      images: [
        'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=600&h=400&fit=crop&crop=center', // sandwich
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop&crop=center', // grilled cheese
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop&crop=center', // club sandwich
        'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&h=400&fit=crop&crop=center', // wrap
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop&crop=center'  // panini
      ]
    },

    // Desserts
    dessert: {
      keywords: ['cake', 'cookie', 'pie', 'dessert', 'sweet', 'chocolate', 'ice cream', 'pudding', 'brownie', 'cheesecake', 'tiramisu'],
      images: [
        'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop&crop=center', // chocolate cake
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop&crop=center', // cookies
        'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&h=400&fit=crop&crop=center', // cheesecake
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop&crop=center', // ice cream
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=600&h=400&fit=crop&crop=center'  // tiramisu
      ]
    },

    // Vegetarian/Vegan
    vegetarian: {
      keywords: ['vegetarian', 'vegan', 'tofu', 'quinoa', 'lentil', 'bean', 'veggie', 'plant-based'],
      images: [
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&crop=center', // veggie bowl
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop&crop=center', // quinoa salad
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop&crop=center', // tofu dish
        'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=600&h=400&fit=crop&crop=center', // lentil curry
        'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop&crop=center'  // veggie stir fry
      ]
    }
  };

  // Default fallback images - high quality food photos
  const defaultImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&crop=center', // general food
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&crop=center', // plated dish
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&crop=center', // gourmet meal
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop&crop=center', // restaurant dish
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop&crop=center'  // home cooked meal
  ];

  // Find matching category with priority order
  const categoryPriority = ['pizza', 'pasta', 'chicken', 'beef', 'seafood', 'rice', 'sandwich', 'soup', 'salad', 'breakfast', 'dessert', 'vegetarian'];

  for (const categoryName of categoryPriority) {
    const category = imageCategories[categoryName];
    if (category) {
      const hasKeyword = category.keywords.some(keyword =>
        recipeName.includes(keyword) ||
        ingredients.some(ing => ing.includes(keyword))
      );

      if (hasKeyword) {
        const imageIndex = recipe.id % category.images.length;
        return category.images[imageIndex];
      }
    }
  }

  // Fallback to default images
  const imageIndex = recipe.id % defaultImages.length;
  return defaultImages[imageIndex];
}

// Reset display state for clean transitions
function resetDisplayState() {
  console.log('Resetting display state...');

  // Clear any existing content
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

  // Reset the display state properly
  resetDisplayState();

  // Make sure recipe list is visible and details are hidden
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

  // Hide recipe grid and show details in full frame
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
    // Show grid and hide details
    if (recipeList) {
      recipeList.style.display = 'block';
    }
    if (recipeDetails) {
      recipeDetails.style.display = 'none';
    }
    // Re-run the last search to show grid
    const generateBtn = document.getElementById("generateBtn");
    if (generateBtn) {
      generateBtn.click();
    }
  });

  // Scroll to top of details
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
}

// Make functions globally accessible for onclick handlers
window.removeIngredient = removeIngredient;
window.toggleFavorite = toggleFavorite;

// Initialize navigation when DOM is loaded
function initializeNavigation() {
  console.log('Initializing navigation...');

  // Get page sections
  homeSection = document.getElementById('homeSection');
  searchSection = document.getElementById('searchSection');
  favoritesSection = document.getElementById('favoritesSection');

  // Hero feature click handlers
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

  // Back to home button
  const backHomeBtn = document.getElementById('backHomeBtn');
  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', () => {
      showSection('home');
    });
  }

  // Browse recipes button in favorites
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

  // Remove active class from all sections
  document.querySelectorAll('.page-section').forEach(sec => {
    sec.classList.remove('active');
  });

  // Add active class to selected section
  switch (section) {
    case 'home':
      if (homeSection) {
        homeSection.classList.add('active');
        // Always refresh popular recipes when going to home
        setTimeout(() => displayPopularRecipes(), 100);
      }
      break;
    case 'search':
      if (searchSection) {
        searchSection.classList.add('active');
        // Reset search state when entering search section
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

  // Get 6 random recipes as "popular"
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

    // Re-attach event listener
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

  if (favoritesSection && favoritesSection.classList.contains('active')) {
    displayFavorites();
  }
}

// Search functionality
function setupSearchFunctionality() {
  console.log('Setting up search functionality...');

  if (!ingredientInput) {
    console.error('ingredientInput not found');
    return;
  }

  const addIngredientBtn = document.getElementById("addIngredientBtn");
  const allIngredientsContainer = document.getElementById("allIngredients");
  const generateBtn = document.getElementById("generateBtn");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const resultsFilters = document.getElementById("resultsFilters");

  // Display all available ingredients as clickable options
  function displayAllIngredients() {
    if (!allIngredientsContainer || allIngredients.length === 0) return;

    allIngredientsContainer.innerHTML = '<h4>Available Ingredients:</h4>';

    // Show first 50 ingredients to avoid overwhelming the UI
    const ingredientsToShow = allIngredients.slice(0, 50);

    ingredientsToShow.forEach(ingredient => {
      const option = document.createElement('span');
      option.className = 'ingredient-option';
      option.textContent = ingredient;
      option.addEventListener('click', () => addIngredient(ingredient));
      allIngredientsContainer.appendChild(option);
    });
  }

  // Add ingredient button functionality
  if (addIngredientBtn) {
    addIngredientBtn.addEventListener("click", () => {
      const ingredient = ingredientInput.value.trim().toLowerCase();
      if (ingredient) {
        addIngredient(ingredient);
        ingredientInput.value = "";
      }
    });
  }

  // Enter key to add ingredient
  ingredientInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const ingredient = ingredientInput.value.trim().toLowerCase();
      if (ingredient) {
        addIngredient(ingredient);
        ingredientInput.value = "";
      }
    }
  });

  // Generate recipes functionality
  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      console.log('Generate button clicked, selected ingredients:', selectedIngredients);

      if (selectedIngredients.length === 0) {
        alert('Please select at least one ingredient to generate recipes.');
        return;
      }

      // Show loading spinner
      if (loadingSpinner) {
        loadingSpinner.classList.remove('hidden');
      }

      // Hide generate button temporarily
      generateBtn.style.display = 'none';

      // Ensure we have recipes loaded
      if (!recipes || recipes.length === 0) {
        console.error('No recipes loaded');
        if (recipeList) {
          recipeList.innerHTML = `
            <div class="error-state">
              <span class="error-icon">⚠️</span>
              <h3>No Recipes Available</h3>
              <p>Recipe database not loaded. Please refresh the page.</p>
            </div>
          `;
        }
        return;
      }

      // Get dietary preferences
      const preferences = Array.from(document.querySelectorAll('.pref-options input:checked'))
        .map(cb => cb.value.toLowerCase());

      // Simulate loading time for better UX
      setTimeout(() => {
        let filtered = recipes.filter((recipe) => {
          const recipeIngs = recipe.ingredients.map((i) => i.toLowerCase());
          const matched = selectedIngredients.filter((ing) =>
            recipeIngs.includes(ing)
          ).length;

          const accuracy = (matched / selectedIngredients.length) * 100;

          // Apply dietary filters if any are selected
          if (preferences.length > 0) {
            // Check if recipe meets all selected dietary preferences
            const recipeDietary = recipe.dietary || [];
            const meetsAllPreferences = preferences.every(pref =>
              recipeDietary.includes(pref)
            );
            if (!meetsAllPreferences) return false;
          }

          return accuracy >= 50; // Lower threshold for better results
        });

        console.log('🎯 Filtered recipes:', filtered.length);

        // Hide loading spinner
        if (loadingSpinner) {
          loadingSpinner.classList.add('hidden');
        }

        // Show results filters
        if (resultsFilters) {
          resultsFilters.classList.remove('hidden');
        }

        // Show generate button again
        generateBtn.style.display = 'block';

        displayRecipes(filtered);
      }, 1500); // 1.5 second loading simulation
    });
  }

  // Display all ingredients when search section loads
  displayAllIngredients();

  console.log('Search functionality setup complete');
}




// No backend API needed - client-side only functionality

// Initialize everything when DOM is ready
function initializeApp() {
  console.log('🚀 Initializing app...');

  // Initialize page sections
  homeSection = document.getElementById('homeSection');
  searchSection = document.getElementById('searchSection');
  favoritesSection = document.getElementById('favoritesSection');

  // Initialize DOM elements
  recipeList = document.getElementById("recipeList");
  recipeDetails = document.getElementById("recipeDetails");
  ingredientInput = document.getElementById("ingredientInput");
  suggestionsBox = document.getElementById("suggestions");
  selectedBox = document.getElementById("selectedIngredients");

  // Debug: Check if elements were found
  console.log('DOM Elements check:');
  console.log('- homeSection:', !!homeSection);
  console.log('- searchSection:', !!searchSection);
  console.log('- favoritesSection:', !!favoritesSection);
  console.log('- recipeList:', !!recipeList);
  console.log('- recipeDetails:', !!recipeDetails);
  console.log('- ingredientInput:', !!ingredientInput);
  console.log('- selectedBox:', !!selectedBox);
  console.log('- popularRecipesList:', !!document.getElementById("popularRecipesList"));
  console.log('- generateBtn:', !!document.getElementById("generateBtn"));
  console.log('- addIngredientBtn:', !!document.getElementById("addIngredientBtn"));

  // Initialize components in order
  initializeNavigation();

  // Load recipes first, then setup search functionality
  loadRecipes().then(() => {
    setupSearchFunctionality();
    console.log('App initialization complete');
  }).catch(error => {
    console.error('App initialization failed:', error);
    setupSearchFunctionality(); // Still setup search even if recipes fail
  });
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}