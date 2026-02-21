// Dark Mode Management with localStorage
let darkModeInitialized = false;

function initializeDarkMode() {
    if (darkModeInitialized) return;
    darkModeInitialized = true;
    
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    const darkModeToggle = document.getElementById("darkModeToggle");
    
    // Initialize icon based on saved preference
    updateDarkModeUI(darkModeEnabled);
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", function (e) {
            e.preventDefault();
            // Get current state
            const isDarkModeCurrently = document.documentElement.classList.contains("dark-theme");
            // Toggle it
            const newDarkModeState = !isDarkModeCurrently;
            
            // Apply to all elements
            applyDarkMode(newDarkModeState);
            
            // Save to localStorage
            localStorage.setItem('darkMode', newDarkModeState);
            
            // Update UI
            updateDarkModeUI(newDarkModeState);
        });
    }
}

function applyDarkMode(isDarkMode) {
    if (isDarkMode) {
        document.documentElement.classList.add("dark-theme");
    } else {
        document.documentElement.classList.remove("dark-theme");
    }
}

function updateDarkModeUI(isDarkMode) {
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        if (isDarkMode) {
            darkModeToggle.innerHTML = '☀️';
            darkModeToggle.title = 'Switch to Light Mode';
            darkModeToggle.setAttribute('aria-label', 'Switch to Light Mode');
        } else {
            darkModeToggle.innerHTML = '🌙';
            darkModeToggle.title = 'Switch to Dark Mode';
            darkModeToggle.setAttribute('aria-label', 'Switch to Dark Mode');
        }
    }
    
    // Apply dark mode to all relevant elements
    applyDarkMode(isDarkMode);
}

// Initialize dark mode on page load
function initDarkModeOnLoad() {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
        document.documentElement.classList.add("dark-theme");
        updateDarkModeUI(true);
    } else {
        updateDarkModeUI(false);
    }
}

// Navigation active page highlighting
function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav ul li a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Call on page load
document.addEventListener('DOMContentLoaded', function() {
    initDarkModeOnLoad();
    initializeDarkMode();
    highlightActivePage();
});

// Also call immediately in case DOM is already ready
initDarkModeOnLoad();
initializeDarkMode();
highlightActivePage();

function toggleContent(button) {
    const content = button.nextElementSibling;
    content.style.display = content.style.display === "block" ? "none" : "block";
}

// ===== FAVORITES SYSTEM =====
function initializeFavorites() {
    const favoritesBtns = document.querySelectorAll('.favorite-btn');
    const savedFavorites = JSON.parse(localStorage.getItem('favoritePatterns')) || [];
    
    // Load saved favorites
    favoritesBtns.forEach(btn => {
        const patternId = btn.closest('.card').getAttribute('data-pattern-id');
        if (savedFavorites.includes(patternId)) {
            btn.classList.add('favorited');
            btn.textContent = '♥';
        }
    });
    
    // Add click handlers
    favoritesBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = btn.closest('.card');
            const patternId = card.getAttribute('data-pattern-id');
            
            if (btn.classList.contains('favorited')) {
                btn.classList.remove('favorited');
                btn.textContent = '♡';
                // Remove from favorites
                const index = savedFavorites.indexOf(patternId);
                if (index > -1) {
                    savedFavorites.splice(index, 1);
                }
            } else {
                btn.classList.add('favorited');
                btn.textContent = '♥';
                // Add to favorites
                if (!savedFavorites.includes(patternId)) {
                    savedFavorites.push(patternId);
                }
            }
            
            localStorage.setItem('favoritePatterns', JSON.stringify(savedFavorites));
            updateFavoriteCount();
            applyFilters();
        });
    });
    
    updateFavoriteCount();
}

function updateFavoriteCount() {
    const count = JSON.parse(localStorage.getItem('favoritePatterns'))?.length || 0;
    const countElement = document.getElementById('favoriteCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Favorites filter toggle
function initializeFavoritesFilter() {
    const favoritesFilterBtn = document.getElementById('favoritesFilter');
    let showingOnlyFavorites = false;
    
    if (favoritesFilterBtn) {
        favoritesFilterBtn.addEventListener('click', function() {
            showingOnlyFavorites = !showingOnlyFavorites;
            favoritesFilterBtn.classList.toggle('active');
            
            if (showingOnlyFavorites) {
                favoritesFilterBtn.title = 'Show All Patterns';
            } else {
                favoritesFilterBtn.title = 'Show Favorites Only';
            }
            
            applyFilters();
        });
    }
    
    window.isShowingOnlyFavorites = () => showingOnlyFavorites;
}

// Clear all favorites
function initializeClearFavorites() {
    const clearBtn = document.getElementById('clearFavoritesBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all favorites?')) {
                localStorage.setItem('favoritePatterns', JSON.stringify([]));
                
                const favoritesBtns = document.querySelectorAll('.favorite-btn');
                favoritesBtns.forEach(btn => {
                    btn.classList.remove('favorited');
                    btn.textContent = '♡';
                });
                
                updateFavoriteCount();
                applyFilters();
            }
        });
    }
}

// Only run search/filter on patterns page
if (window.location.pathname.includes("patterns.html")) {
    document.addEventListener('DOMContentLoaded', function() {
        initializeFavorites();
        initializeFavoritesFilter();
        initializeClearFavorites();
        
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.addEventListener("keyup", applyFilters);
        }

        const difficultyFilter = document.getElementById("difficultyFilter");
        if (difficultyFilter) {
            difficultyFilter.addEventListener("change", applyFilters);
        }
    });
}

function applyFilters() {
    const searchInput = document.getElementById("searchInput");
    const difficultyFilter = document.getElementById("difficultyFilter");
    if (!searchInput || !difficultyFilter) return;

    const filter = searchInput.value.toLowerCase();
    const selectedDifficulty = difficultyFilter.value;
    const cards = document.querySelectorAll(".card");
    const savedFavorites = JSON.parse(localStorage.getItem('favoritePatterns')) || [];
    const showOnlyFavorites = window.isShowingOnlyFavorites ? window.isShowingOnlyFavorites() : false;

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        const difficulty = card.getAttribute("data-difficulty");
        const patternId = card.getAttribute("data-pattern-id");
        
        const matchesSearch = text.includes(filter);
        const matchesDifficulty = selectedDifficulty === "all" || difficulty === selectedDifficulty;
        const isFavorited = savedFavorites.includes(patternId);
        const matchesFavoriteFilter = !showOnlyFavorites || isFavorited;
        
        card.style.display = matchesSearch && matchesDifficulty && matchesFavoriteFilter ? "block" : "none";
    });
}
