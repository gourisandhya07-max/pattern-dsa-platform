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

// Pattern Data Structure
const patternData = {
    'sliding-window': {
        title: 'Sliding Window',
        difficulty: 'medium',
        definition: 'The Sliding Window technique is a method for solving problems that involve arrays or strings by maintaining a "window" of elements and sliding it through the data structure to find a desired result. This approach is particularly useful for problems that require finding subarrays or substrings that meet certain conditions.',
        intuition: 'Instead of using nested loops which can lead to O(n²) time complexity, we maintain two pointers that define a window of elements. We expand the window by moving the right pointer and shrink it by moving the left pointer when certain conditions are met. This allows us to solve problems in O(n) time.',
        usage: [
            'Problems involving subarrays or substrings',
            'Finding maximum/minimum values in a sliding window',
            'Problems requiring contiguous elements',
            'Optimization problems where you need to avoid nested loops',
            'Strings problems like finding longest substring without repeating characters'
        ],
        template: `// Basic Sliding Window Template
int left = 0;
int maxLength = 0;

for (int right = 0; right < n; right++) {
    // Expand window by adding right element
    
    // Shrink window from left while condition is not met
    while (condition && left <= right) {
        // Remove left element from window
        left++;
    }
    
    // Update result with current window
    maxLength = Math.max(maxLength, right - left + 1);
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1) or O(k)',
        timeExplanation: 'Each element is visited at most twice (once by right, once by left)',
        spaceExplanation: 'Usually O(1) extra space, sometimes O(k) for additional data structures',
        examples: [
            'Maximum Sum Subarray of Size K',
            'Longest Substring Without Repeating Characters',
            'Minimum Window Substring',
            'Fruit Into Baskets',
            'Permutation in String'
        ]
    },
    'two-pointers': {
        title: 'Two Pointers',
        difficulty: 'easy',
        definition: 'The Two Pointers technique uses two pointers to traverse an array or string from different positions, often from opposite ends, to solve problems efficiently. This approach is particularly effective for problems involving sorted arrays, finding pairs, or partitioning data.',
        intuition: 'By using two pointers instead of nested loops, we can reduce time complexity from O(n²) to O(n). The pointers can start from the same position and move in the same direction, or from opposite ends and move towards each other, depending on the problem requirements.',
        usage: [
            'Finding pairs that sum to a target in a sorted array',
            'Removing duplicates from a sorted array',
            'Checking if a string is a palindrome',
            'Merging two sorted arrays',
            'Finding the closest pair of elements',
            'Partitioning arrays around a pivot'
        ],
        template: `// Two Pointers Template (Opposite Direction)
int left = 0;
int right = n - 1;

while (left < right) {
    if (condition) {
        // Move pointers based on condition
        left++;
    } else {
        right--;
    }
}

// Two Pointers Template (Same Direction)
int left = 0;
for (int right = 0; right < n; right++) {
    // Expand window
    while (condition && left <= right) {
        left++;
    }
    // Process current window
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        timeExplanation: 'Each element is visited at most once by each pointer',
        spaceExplanation: 'Only constant extra space is used for the pointers',
        examples: [
            'Two Sum II (Sorted Array)',
            'Remove Duplicates from Sorted Array',
            'Valid Palindrome',
            'Container With Most Water',
            '3Sum',
            'Trapping Rain Water'
        ]
    },
    'binary-search': {
        title: 'Binary Search',
        difficulty: 'easy',
        definition: 'Binary Search is an efficient algorithm for finding an element in a sorted array by repeatedly dividing the search interval in half. It works by comparing the target value with the middle element of the array and eliminating half of the remaining elements from consideration.',
        intuition: 'Instead of checking every element linearly (O(n)), we can leverage the sorted nature of the array to eliminate half the search space with each comparison. This logarithmic approach is much faster for large datasets.',
        usage: [
            'Finding an element in a sorted array',
            'Finding the insertion point for a new element',
            'Finding the first/last occurrence of an element',
            'Searching in rotated sorted arrays',
            'Finding peak elements in arrays',
            'Solving optimization problems with monotonic conditions'
        ],
        template: `// Basic Binary Search Template
int binarySearch(int[] arr, int target) {
    int left = 0;
    int right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1; // Not found
}`,
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        timeExplanation: 'The search space is halved with each iteration',
        spaceExplanation: 'Only constant extra space is used for the pointers',
        examples: [
            'Search in Rotated Sorted Array',
            'Find First and Last Position of Element',
            'Search Insert Position',
            'Sqrt(x)',
            'Find Minimum in Rotated Sorted Array',
            'Capacity To Ship Packages Within D Days'
        ]
    },
    'dynamic-programming': {
        title: 'Dynamic Programming',
        difficulty: 'hard',
        definition: 'Dynamic Programming is a method for solving complex problems by breaking them down into simpler subproblems and storing the results of these subproblems to avoid redundant computations. It\'s particularly effective for optimization problems with overlapping subproblems and optimal substructure.',
        intuition: 'Instead of solving the same subproblems repeatedly, we store their solutions in a table (memoization) or build up solutions from smaller subproblems (tabulation). This approach transforms exponential time complexity into polynomial time.',
        usage: [
            'Problems with overlapping subproblems',
            'Optimization problems (min/max path costs)',
            'Counting problems (number of ways)',
            'Problems that can be divided into smaller subproblems',
            'Sequence alignment and string matching',
            'Resource allocation problems'
        ],
        template: `// Memoization Template
Map<Integer, Integer> memo = new HashMap<>();

int dp(int n) {
    if (memo.containsKey(n)) return memo.get(n);
    if (base_case) return value;
    
    int result = dp(smaller_problem);
    memo.put(n, result);
    return result;
}

// Tabulation Template
int[] dp = new int[n+1];
dp[0] = base_case;

for (int i = 1; i <= n; i++) {
    dp[i] = min/max of previous states;
}`,
        timeComplexity: 'O(n) or O(n²)',
        spaceComplexity: 'O(n)',
        timeExplanation: 'Depends on the number of subproblems and their dependencies',
        spaceExplanation: 'Usually O(n) for the DP table, can be optimized to O(1) in some cases',
        examples: [
            'Fibonacci Sequence',
            'Longest Common Subsequence',
            'Knapsack Problem',
            'Coin Change',
            'Longest Increasing Subsequence',
            'Edit Distance'
        ]
    },
    'recursion': {
        title: 'Recursion',
        difficulty: 'medium',
        definition: 'Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem. It\'s based on the principle of solving a problem by breaking it down into smaller, more manageable subproblems of the same type.',
        intuition: 'Complex problems can often be solved by reducing them to simpler versions of themselves. Each recursive call handles a smaller part of the problem until reaching a base case that can be solved directly.',
        usage: [
            'Tree and graph traversals',
            'Backtracking problems',
            'Divide and conquer algorithms',
            'Problems with recursive structure',
            'Mathematical computations (factorial, fibonacci)',
            'Parsing and syntax analysis'
        ],
        template: `// Basic Recursion Template
returnType solve(parameters) {
    // Base case: smallest problem that can be solved directly
    if (base_condition) {
        return base_result;
    }
    
    // Recursive case: break problem into smaller subproblems
    // Make recursive calls with smaller input
    returnType result = combine(solve(smaller_parameters));
    
    return result;
}`,
        timeComplexity: 'Depends on calls',
        spaceComplexity: 'O(depth)',
        timeExplanation: 'Depends on the number of recursive calls and work per call',
        spaceExplanation: 'O(depth) for the call stack, where depth is the maximum recursion depth',
        examples: [
            'Tree Traversals (Inorder, Preorder, Postorder)',
            'Tower of Hanoi',
            'Permutations and Combinations',
            'N-Queens Problem',
            'Sudoku Solver',
            'Merge Sort'
        ]
    },
    'queue': {
        title: 'Queue',
        difficulty: 'easy',
        definition: 'A Queue is a First-In-First-Out (FIFO) data structure that follows the principle of serving elements in the order they arrive. Elements are added to the back (enqueue) and removed from the front (dequeue).',
        intuition: 'Queues are ideal for scenarios where we need to process items in the order they were received, simulating real-world queues like waiting lines or task scheduling.',
        usage: [
            'Breadth-First Search (BFS) algorithms',
            'Level order tree traversal',
            'Task scheduling and job queues',
            'Print queue management',
            'Cache implementation (LRU)',
            'Sliding window maximum problems'
        ],
        template: `// Queue Operations Template
Queue<Integer> queue = new LinkedList<>();

// Add element to back of queue
queue.offer(element);

// Remove and return front element
int front = queue.poll();

// Peek at front element without removing
int peek = queue.peek();

// Check if queue is empty
boolean isEmpty = queue.isEmpty();

// Get queue size
int size = queue.size();`,
        timeComplexity: 'O(1) per operation',
        spaceComplexity: 'O(n)',
        timeExplanation: 'All basic operations (enqueue, dequeue, peek) are O(1)',
        spaceExplanation: 'O(n) where n is the number of elements in the queue',
        examples: [
            'Level Order Traversal of Binary Tree',
            'Breadth-First Search in Graphs',
            'Task Scheduling',
            'Print Spooling',
            'Web Crawler URL Queue',
            'Sliding Window Maximum'
        ]
    }
};

// Dynamic Pattern Detail Loading
function loadPatternDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const patternId = urlParams.get('pattern');
    
    if (!patternId || !patternData[patternId]) {
        // Default to sliding window or show error
        window.location.href = 'patterns.html';
        return;
    }
    
    const pattern = patternData[patternId];
    
    // Update page title
    document.title = `DSA Pattern Hub - ${pattern.title}`;
    
    // Update header
    const header = document.querySelector('.pattern-header');
    header.innerHTML = `
        <h1>${pattern.title}</h1>
        <div class="difficulty-badge ${pattern.difficulty}">${pattern.difficulty.charAt(0).toUpperCase() + pattern.difficulty.slice(1)}</div>
    `;
    
    // Update content
    const content = document.querySelector('.pattern-content');
    content.innerHTML = `
        <div class="pattern-section">
            <h2>Definition</h2>
            <p>${pattern.definition}</p>
        </div>
        
        <div class="pattern-section">
            <h2>Intuition</h2>
            <p>${pattern.intuition}</p>
        </div>
        
        <div class="pattern-section">
            <h2>When to Use</h2>
            <ul>
                ${pattern.usage.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
        
        <div class="pattern-section">
            <h2>Template</h2>
            <div class="code-block">
                <pre><code>${pattern.template}</code></pre>
            </div>
            <p><strong>Key Points:</strong></p>
            <ul>
                <li>Pointers define the boundaries of the search space</li>
                <li>Move pointers based on the problem conditions</li>
                <li>Track the result during the traversal</li>
            </ul>
        </div>
        
        <div class="pattern-section">
            <h2>Complexity</h2>
            <div class="complexity-grid">
                <div class="complexity-item">
                    <h3>Time Complexity</h3>
                    <p><strong>${pattern.timeComplexity}</strong></p>
                    <p>${pattern.timeExplanation}</p>
                </div>
                <div class="complexity-item">
                    <h3>Space Complexity</h3>
                    <p><strong>${pattern.spaceComplexity}</strong></p>
                    <p>${pattern.spaceExplanation}</p>
                </div>
            </div>
        </div>
        
        <div class="pattern-section">
            <h2>Example Problems</h2>
            <ul>
                ${pattern.examples.map(example => `<li>${example}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Only run on pattern detail page
if (window.location.pathname.includes("pattern-detail.html")) {
    document.addEventListener('DOMContentLoaded', loadPatternDetail);
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
