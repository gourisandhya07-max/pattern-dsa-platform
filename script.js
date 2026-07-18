// Dark Mode Management with localStorage
let darkModeInitialized = false;

// API base URL (backend runs separately on localhost:5500)
const apiBase = 'http://localhost:5500';
const learningProgressKey = 'dsaLearningProgress';
const onboardingStateKey = 'dsaOnboardingState';

function getLearningState() {
    try {
        const saved = JSON.parse(localStorage.getItem(learningProgressKey) || 'null');
        return saved || { score: 0, answered: 0, completedQuestions: [] };
    } catch {
        return { score: 0, answered: 0, completedQuestions: [] };
    }
}

function saveLearningState(state) {
    localStorage.setItem(learningProgressKey, JSON.stringify(state));
}

function getOnboardingState() {
    try {
        const saved = JSON.parse(localStorage.getItem(onboardingStateKey) || 'null');
        return saved || { level: '', completed: false };
    } catch {
        return { level: '', completed: false };
    }
}

function saveOnboardingState(state) {
    localStorage.setItem(onboardingStateKey, JSON.stringify(state));
}

function renderLearningInteractivity() {
    const containers = document.querySelectorAll('[data-learning-quiz]');
    if (!containers.length) return;

    const path = (window.location.pathname.split('/').pop() || '').toLowerCase();
    const isHomePage = path === '' || path === 'index.html' || path === '/';
    if (!isHomePage) return;

    const username = localStorage.getItem('username');

    const onboardingState = getOnboardingState();
    const questions = [
        {
            id: 'window',
            prompt: 'Which pattern is best for longest contiguous subarrays with a constraint?',
            options: ['Sliding Window', 'Binary Search', 'DFS', 'Merge Sort'],
            answer: 0,
            explanation: 'Sliding Window is ideal for contiguous subarrays and substrings.'
        },
        {
            id: 'big-o',
            prompt: 'What does O(log n) usually describe?',
            options: ['Linear growth', 'Logarithmic growth', 'Exponential growth', 'Constant growth'],
            answer: 1,
            explanation: 'O(log n) appears in binary search because the search space shrinks quickly.'
        },
        {
            id: 'practice',
            prompt: 'Why should you practice after learning a pattern?',
            options: ['It helps you recognize the pattern faster', 'It makes the code longer', 'It removes the need for explanation', 'It avoids complexity analysis'],
            answer: 0,
            explanation: 'Practice turns recognition into instinct and strengthens problem-solving.'
        }
    ];

    containers.forEach((container) => {
        if (!username) {
            container.innerHTML = `
                <div class="learning-card">
                    <div class="learning-header">
                        <h3>Quick check ready</h3>
                        <span class="learning-badge">Sign in</span>
                    </div>
                    <p class="learning-question">Log in to unlock the interactive quick check, save your progress, and receive guided feedback.</p>
                    <div class="learning-options">
                        <a class="option-btn" href="login.html" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">Log in or register</a>
                    </div>
                </div>
            `;
            return;
        }

        if (!onboardingState.level) {
            container.innerHTML = `
                <div class="learning-card">
                    <div class="learning-header">
                        <h3>Welcome back, ${username}</h3>
                        <span class="learning-badge">Quick setup</span>
                    </div>
                    <p class="learning-question">Before you start, how would you describe your current level?</p>
                    <div class="learning-options">
                        <button class="option-btn" data-level="beginner">Complete beginner</button>
                        <button class="option-btn" data-level="intermediate">Intermediate</button>
                        <button class="option-btn" data-level="expert">Expert</button>
                    </div>
                </div>
            `;
            container.querySelectorAll('.option-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const selectedLevel = btn.dataset.level;
                    const nextState = getOnboardingState();
                    nextState.level = selectedLevel;
                    nextState.completed = selectedLevel === 'beginner';
                    saveOnboardingState(nextState);
                    renderLearningInteractivity();
                });
            });
            return;
        }

        if (onboardingState.level === 'beginner') {
            container.innerHTML = `
                <div class="learning-card">
                    <div class="learning-header">
                        <h3>Perfect for beginners</h3>
                        <span class="learning-badge">Skipped</span>
                    </div>
                    <p class="learning-question">We’ll keep the first lessons simple. You can jump straight into the patterns and practice when you’re ready.</p>
                    <div class="learning-options">
                        <a class="option-btn" href="patterns.html" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">Start exploring patterns</a>
                    </div>
                </div>
            `;
            return;
        }

        const state = getLearningState();
        const question = questions[state.answered % questions.length];
        const progressPercent = Math.min(100, Math.round((state.completedQuestions.length / 6) * 100));
        container.innerHTML = `
            <div class="learning-card">
                <div class="learning-header">
                    <h3>Quick Check</h3>
                    <span class="learning-badge">${state.completedQuestions.length}/6 done</span>
                </div>
                <div class="learning-progress">
                    <div class="learning-progress-bar" style="width:${progressPercent}%"></div>
                </div>
                <p class="learning-question">${question.prompt}</p>
                <div class="learning-options">
                    ${question.options.map((option, index) => `<button class="option-btn" data-index="${index}">${option}</button>`).join('')}
                </div>
                <p class="learning-feedback" aria-live="polite"></p>
                <button class="learning-refresh" type="button">Try another one</button>
            </div>
        `;

        const feedbackEl = container.querySelector('.learning-feedback');
        const refreshBtn = container.querySelector('.learning-refresh');
        container.querySelectorAll('.option-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const selectedIndex = Number(btn.dataset.index);
                const isCorrect = selectedIndex === question.answer;
                const nextState = getLearningState();
                if (!nextState.completedQuestions.includes(question.id)) {
                    nextState.completedQuestions.push(question.id);
                }
                nextState.answered = nextState.completedQuestions.length;
                nextState.score += isCorrect ? 1 : 0;
                nextState.lastUpdated = new Date().toLocaleString();
                saveLearningState(nextState);

                feedbackEl.textContent = isCorrect ? `Correct! ${question.explanation}` : `Not quite. ${question.explanation}`;
                feedbackEl.className = `learning-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
                container.querySelectorAll('.option-btn').forEach((option) => option.disabled = true);
                refreshBtn.style.display = 'inline-flex';
            });
        });

        refreshBtn.addEventListener('click', () => renderLearningInteractivity());
    });
}

function getBotReply(message) {
    const text = message.toLowerCase();
    if (/(slow|performance|bug|error|refresh|backend|server)/.test(text)) {
        return 'If the app feels slow, make sure the backend server is running on localhost:5500 and refresh once. The UI itself is lightweight, so most issues are caused by the server or a stale browser tab.';
    }
    if (/(sliding window|window)/.test(text)) {
        return 'Sliding Window is great for contiguous subarrays or substrings. Keep two pointers, expand and shrink carefully, and update the best answer as the window moves.';
    }
    if (/(binary search|log n|o\(log n\))/.test(text)) {
        return 'Binary search uses a sorted array and halves the search space every step. That is why it is O(log n) rather than O(n).';
    }
    if (/(greedy|dp|dynamic programming|backtracking)/.test(text)) {
        return 'Greedy picks the best local choice, DP stores subproblem results, and backtracking explores options and prunes when needed. Choose the approach based on overlap and optimality.';
    }
    if (/(login|logout|account|auth)/.test(text)) {
        return 'Use the Login page to sign in or register. After that, your progress and favorite patterns will be available across the site.';
    }
    if (/(hello|hi|help|thanks)/.test(text)) {
        return 'I can help with DSA concepts, app usage, and performance tips. Try asking about sliding window, binary search, or login issues.';
    }
    return 'I can explain DSA patterns like Sliding Window, Two Pointers, Binary Search, DP, and answer questions about this app’s performance or login flow. Try something like “Explain sliding window” or “Why is the app slow?”';
}

function initChatbot() {
    if (document.getElementById('aiBotWidget')) return;

    const widget = document.createElement('div');
    widget.id = 'aiBotWidget';
    widget.className = 'ai-chatbot';
    widget.innerHTML = `
        <button class="chat-toggle" type="button" aria-label="Open AI assistant">🤖</button>
        <div class="chat-window">
            <div class="chat-header">
                <strong>AI Study Bot</strong>
                <span>Ask anything</span>
            </div>
            <div class="chat-messages">
                <div class="message bot">Hi! I can explain DSA patterns and answer questions about this app.</div>
            </div>
            <div class="chat-suggestions">
                <button type="button" data-suggestion="Explain sliding window">Sliding Window</button>
                <button type="button" data-suggestion="Why does this app feel slow?">App Performance</button>
                <button type="button" data-suggestion="What is O(log n)?">Big-O</button>
            </div>
            <form class="chat-form">
                <input type="text" class="chat-input" placeholder="Ask about DSA or the app" />
                <button type="submit">Send</button>
            </form>
        </div>
    `;

    document.body.appendChild(widget);

    const toggle = widget.querySelector('.chat-toggle');
    const windowEl = widget.querySelector('.chat-window');
    const form = widget.querySelector('.chat-form');
    const input = widget.querySelector('.chat-input');
    const messages = widget.querySelector('.chat-messages');

    toggle.addEventListener('click', () => {
        windowEl.classList.toggle('open');
    });

    widget.querySelectorAll('[data-suggestion]').forEach((btn) => {
        btn.addEventListener('click', () => {
            input.value = btn.getAttribute('data-suggestion');
            form.requestSubmit();
        });
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const value = input.value.trim();
        if (!value) return;
        const userMessage = document.createElement('div');
        userMessage.className = 'message user';
        userMessage.textContent = value;
        messages.appendChild(userMessage);
        input.value = '';
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot';
        botMessage.textContent = getBotReply(value);
        messages.appendChild(botMessage);
        messages.scrollTop = messages.scrollHeight;
    });
}

// ---------- Authentication & Navigation Helpers ----------
function checkAuthentication() {
    const username = localStorage.getItem('username');
    const path = (window.location.pathname.split('/').pop() || '').toLowerCase();

    // Keep the login page available, but do not block the rest of the learning experience.
    if (!username && path === 'login.html') {
        return;
    }

    // Optional auth for the app: allow learners to browse lessons even before logging in.
    return;
}

function updateNavForAuth() {
    const nav = document.querySelector('.nav');
    const navUl = document.querySelector('.nav ul');
    if (!navUl || !nav) return;
    const username = localStorage.getItem('username');

    // greeting
    let greetEl = nav.querySelector('#userGreeting');
    if (username) {
        if (!greetEl) {
            greetEl = document.createElement('span');
            greetEl.id = 'userGreeting';
            greetEl.style.marginLeft = '1rem';
            greetEl.style.fontWeight = '500';
            nav.insertBefore(greetEl, navUl);
        }
        greetEl.textContent = `Hello, ${username}`;
    } else if (greetEl) {
        greetEl.remove();
    }

    // ensure leaderboard link exists
    if (!navUl.querySelector('a[href="leaderboard.html"]')) {
        const li = document.createElement('li');
        li.innerHTML = '<a href="leaderboard.html">Leaderboard</a>';
        navUl.appendChild(li);
    }

    // add login/logout links depending on state
    if (username) {
        // remove any existing login link
        const loginLink = navUl.querySelector('a[href="login.html"]');
        if (loginLink) {
            loginLink.closest('li').remove();
        }
        if (!navUl.querySelector('#logoutLink')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="#" id="logoutLink">Logout</a>';
            navUl.appendChild(li);
            li.querySelector('#logoutLink').addEventListener('click', e => {
                e.preventDefault();
                const shouldLogout = window.confirm('Are you sure you want to log out?');
                if (!shouldLogout) return;
                localStorage.removeItem('username');
                localStorage.removeItem(learningProgressKey);
                localStorage.removeItem(onboardingStateKey);
                updateNavForAuth();
                if (typeof renderLearningInteractivity === 'function') {
                    renderLearningInteractivity();
                }
            });
        }
    } else {
        // not logged in
        if (!navUl.querySelector('a[href="login.html"]')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="login.html">Login</a>';
            navUl.appendChild(li);
        }
        const logoutLink = navUl.querySelector('#logoutLink');
        if (logoutLink) {
            logoutLink.closest('li').remove();
        }
    }
}

function sendProgress(progress) {
    const username = localStorage.getItem('username');
    if (!username) return;
    fetch(`${apiBase}/updateProgress`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, progress})
    }).catch(err => console.warn('progress update failed', err));
}

function initLoginPage() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInput = document.getElementById('username');
    const passInput = document.getElementById('password');
    const authForm = document.getElementById('authForm');
    const authStatus = document.getElementById('authStatus');

    const submitAuthRequest = async (mode) => {
        if (!userInput || !passInput) return;
        const username = userInput.value.trim();
        const password = passInput.value;
        if (!username || !password) return alert('Enter credentials');

        try {
            const endpoint = mode === 'register' ? '/register' : '/login';
            const res = await fetch(`${apiBase}${endpoint}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('username', username);
                if (authStatus) {
                    authStatus.textContent = `Welcome, ${username}! You are now signed in.`;
                    authStatus.style.display = 'block';
                }
                userInput.value = '';
                passInput.value = '';
                if (typeof updateNavForAuth === 'function') {
                    updateNavForAuth();
                }
                if (typeof renderLearningInteractivity === 'function') {
                    renderLearningInteractivity();
                }
            } else {
                alert(data.message || (mode === 'register' ? 'Registration failed' : 'Login failed'));
            }
        } catch (err) {
            console.error(err);
            alert(mode === 'register' ? 'Registration request failed' : 'Login request failed');
        }
    };

    if (authForm) {
        authForm.addEventListener('submit', e => {
            e.preventDefault();
            if (loginBtn) {
                loginBtn.click();
            }
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', async e => {
            e.preventDefault();
            await submitAuthRequest('login');
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', async e => {
            e.preventDefault();
            await submitAuthRequest('register');
        });
    }
}

function loadLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if (!list) return;
    fetch(`${apiBase}/leaderboard`)
        .then(r => r.json())
        .then(data => {
            list.innerHTML = '';
            data.forEach(u => {
                const li = document.createElement('li');
                li.textContent = `${u.username} – ${u.progress}%`;
                list.appendChild(li);
            });
        })
        .catch(err => console.warn('Leaderboard load failed', err));
}


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

let commonInitHasRun = false;

// Call on page load for all common initialization
function commonInit() {
    if (commonInitHasRun) return;
    commonInitHasRun = true;

    initDarkModeOnLoad();
    initializeDarkMode();
    highlightActivePage();
    checkAuthentication();
    updateNavForAuth();
    renderLearningInteractivity();
    initChatbot();
    runPageSpecificInit();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', commonInit, { once: true });
} else {
    commonInit();
}

// Page-specific initialization
function runPageSpecificInit() {
    const path = window.location.pathname.split('/').pop() || 'index.html';

    if (path === 'login.html') {
        initLoginPage();
        return; // nothing else to do on login page
    }

    if (path.includes('patterns.html')) {
        renderPatterns();
        // search/filter event listeners already wired in renderPatterns
        initializeFavoritesFilter();
        sendProgress(30);
    }
    if (path.includes('index.html') || path === '' || path === '/') {
        initializeHomeStats();
        sendProgress(10);
    }
    if (path.includes('pattern-detail.html')) {
        sendProgress(50);
    }
    if (path.includes('practice.html')) {
        sendProgress(70);
    }
    if (path.includes('leaderboard.html')) {
        loadLeaderboard();
        sendProgress(90);
    }
}

// dynamically build pattern cards from patternData
function renderPatterns() {
    const container = document.getElementById('patternsContainer');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(patternData).forEach((id) => {
        const p = patternData[id];
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-difficulty', p.difficulty);
        card.setAttribute('data-pattern-id', id);
        card.innerHTML = `
            <div class="card-header">
                <h2>${p.title}</h2>
                <button class="favorite-btn" title="Add to Favorites">♡</button>
            </div>
            <div class="difficulty-badge ${p.difficulty}">${p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}</div>
            <p><strong>When to Use:</strong> ${p.usage[0] || ''}</p>
            <p><strong>Time Complexity:</strong> ${p.timeComplexity}</p>
            <a href="pattern-detail.html?pattern=${id}" class="toggle-btn" style="display: inline-block; text-decoration: none; color: inherit;">View Details</a>
        `;
        container.appendChild(card);
    });
    // attach favorite button handlers and count
    initializeFavorites();
    updateFavoriteCount();
    // wire filters & search again just in case
    applyFilters();
}

// Home page statistic updater
function initializeHomeStats() {
    const countEl = document.getElementById('patternCount');
    if (countEl) {
        const total = Object.keys(patternData).length;
        countEl.textContent = total;
    }
}

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
    
    // Add click handlers with animation feedback
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
                // Trigger heartbeat animation on favorite
                btn.style.animation = 'none';
                setTimeout(() => {
                    btn.style.animation = 'heartPulse 0.4s ease';
                }, 10);
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
    },
    'prefix-sum': {
        title: 'Prefix Sum',
        difficulty: 'easy',
        definition: 'The Prefix Sum technique precomputes cumulative sums of array elements to enable quick range sum queries. It involves creating an auxiliary array where each element represents the sum of all elements up to that position.',
        intuition: 'Rather than recalculating sums for ranges repeatedly, we precompute them once. This trades O(n) space for significant time savings when answering multiple range queries.',
        usage: [
            'Range sum queries on static arrays',
            'Finding subarrays with a given sum',
            'Problems involving cumulative totals',
            'Image processing (2D prefix sums)',
            'Counting problems with constraints',
            'Optimization problems with sum constraints'
        ],
        template: `// Prefix Sum Template
int[] prefix = new int[n + 1];
prefix[0] = 0;

// Build prefix sum array
for (int i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
}

// Query range sum from index l to r (inclusive)
int rangeSum(int l, int r) {
    return prefix[r + 1] - prefix[l];
}

// 2D Prefix Sum
int[][] prefix2D = new int[m + 1][n + 1];
for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
        prefix2D[i][j] = matrix[i-1][j-1] + prefix2D[i-1][j] 
                       + prefix2D[i][j-1] - prefix2D[i-1][j-1];
    }
}`,
        timeComplexity: 'O(n) preprocessing + O(1) per query',
        spaceComplexity: 'O(n)',
        timeExplanation: 'Preprocessing takes O(n) time, but each range sum query is answered in O(1) time',
        spaceExplanation: 'O(n) for the prefix sum array',
        examples: [
            'Range Sum Query - Immutable',
            'Subarray Sum Equals K',
            'Contiguous Array',
            'Product of Array Except Self',
            'Maximum Subarray',
            'Continuous Subarray Sum'
        ]
    },
    'backtracking': {
        title: 'Backtracking',
        difficulty: 'medium',
        definition: 'Backtracking is a systematic exploration technique that builds solutions incrementally and abandons a candidate path as soon as it determines the path cannot lead to a valid solution. It uses recursion to explore all possible combinations and prunes branches that violate constraints.',
        intuition: 'Rather than exploring all combinations exhaustively, backtracking makes decisions at each step and backtracks (undoes the decision) when it encounters a constraint violation or dead end. This pruning significantly reduces the search space.',
        usage: [
            'Permutation and combination problems',
            'N-Queens and similar constraint satisfaction problems',
            'Generating all valid parentheses/expressions',
            'Sudoku solver',
            'Word ladder and path problems',
            'Subset and partition problems'
        ],
        template: `// Backtracking Template
void backtrack(parameters) {
    // Base case: solution found or invalid
    if (isComplete(state)) {
        results.add(new ArrayList<>(currentSolution));
        return;
    }
    
    // Try all candidates
    for (Candidate candidate : getCandidates(state)) {
        // Check if candidate is valid
        if (isValid(candidate, state)) {
            // Make choice
            currentSolution.add(candidate);
            state.update(candidate);
            
            // Explore further
            backtrack(state);
            
            // Undo choice (backtrack)
            currentSolution.remove(currentSolution.size() - 1);
            state.revert(candidate);
        }
    }
}`,
        timeComplexity: 'O(b^d) worst case',
        spaceComplexity: 'O(d)',
        timeExplanation: 'b is the branching factor and d is the depth; can be significantly reduced with pruning',
        spaceExplanation: 'O(d) for the recursion call stack and current solution path',
        examples: [
            'Permutations',
            'Combinations',
            'N-Queens Problem',
            'Generate Parentheses',
            'Sudoku Solver',
            'Word Search'
        ]
    }
};

// Dynamic Pattern Detail Loading
function getPatternLessonState(patternId) {
    try {
        const saved = JSON.parse(localStorage.getItem(`patternLesson:${patternId}`) || 'null');
        return saved || { patternId, level: '', sectionIndex: 0, completedSections: 0, score: 0, answers: [] };
    } catch (err) {
        console.warn('Could not load lesson state', err);
        return { patternId, level: '', sectionIndex: 0, completedSections: 0, score: 0, answers: [] };
    }
}

function savePatternLessonState(patternId, state) {
    localStorage.setItem(`patternLesson:${patternId}`, JSON.stringify(state));
}

function buildPatternLessonSections(pattern, level) {
    const levelLabel = level === 'beginner' ? 'Beginner' : level === 'intermediate' ? 'Intermediate' : 'Expert';
    const levelHint = {
        beginner: 'Keep it simple: focus on the core idea and a common example.',
        intermediate: 'Connect the pattern to a few real problem clues and common templates.',
        expert: 'Think about trade-offs, constraints, and when this pattern is worth the extra structure.'
    }[level] || 'Keep practicing the rhythm of the pattern.';

    return [
        {
            title: '1. Understand the idea',
            body: `
                <p>${pattern.definition}</p>
                <p><strong>${levelLabel} tip:</strong> ${levelHint}</p>
                <p>${pattern.intuition}</p>
            `,
            question: {
                prompt: `Which statement best describes ${pattern.title}?`,
                options: [
                    `It helps you avoid repeated work by moving through data in a focused way.`,
                    `It always sorts everything in place.`,
                    `It only works for trees.`,
                    `It ignores time complexity completely.`
                ],
                answer: 0,
                explanation: `Exactly — ${pattern.title} is about reducing repetitive work and keeping the search space efficient.`
            }
        },
        {
            title: '2. See when it helps',
            body: `
                <p><strong>Good clues:</strong></p>
                <ul>${pattern.usage.slice(0, 4).map(item => `<li>${item}</li>`).join('')}</ul>
                <p>When you spot a contiguous range, a substring, or a sorted structure, this pattern is often the right fit.</p>
            `,
            question: {
                prompt: 'Which problem type is the best fit for this pattern?',
                options: [
                    'Finding a subarray or substring that satisfies a rule.',
                    'Creating a random password generator.',
                    'Printing all files in a folder.',
                    'Reversing a string without looking at it.'
                ],
                answer: 0,
                explanation: 'Great choice — patterns like this shine when a window or pair of pointers can move through the data without checking everything again.'
            }
        },
        {
            title: '3. Follow the template',
            body: `
                <div class="code-block">
                    <pre><code>${escapeHtml(pattern.template)}</code></pre>
                </div>
                <p><strong>Key takeaway:</strong> move the boundaries carefully, update the result as you go, and only shrink or expand when the condition changes.</p>
            `,
            question: {
                prompt: 'What is the main job of the movement step in the template?',
                options: [
                    'To keep the window or pointers in sync while the answer is updated.',
                    'To print the code once and stop.',
                    'To ignore invalid states.',
                    'To compare every pair of elements twice.'
                ],
                answer: 0,
                explanation: 'Perfect — the motion of the pointers is what keeps the logic efficient and easy to reason about.'
            }
        },
        {
            title: '4. Measure your progress',
            body: `
                <div class="complexity-grid">
                    <div class="complexity-item">
                        <h3>Time</h3>
                        <p><strong>${pattern.timeComplexity}</strong></p>
                        <p>${pattern.timeExplanation}</p>
                    </div>
                    <div class="complexity-item">
                        <h3>Space</h3>
                        <p><strong>${pattern.spaceComplexity}</strong></p>
                        <p>${pattern.spaceExplanation}</p>
                    </div>
                </div>
                <p><strong>Try this next:</strong> revisit the examples and explain the pattern in your own words before you solve a new challenge.</p>
            `,
            question: {
                prompt: 'Why do learners benefit from practicing this pattern after reading it?',
                options: [
                    'Because it helps the pattern become familiar and easier to recognize in future problems.',
                    'Because it removes the need for preparation.',
                    'Because it shortens the code without changing the logic.',
                    'Because it makes every problem O(1).'
                ],
                answer: 0,
                explanation: 'Exactly — practice turns the idea into instinct, which is the real goal of learning a pattern.'
            }
        }
    ];
}

function renderPatternLesson(pattern, patternId, state) {
    const header = document.querySelector('.pattern-header');
    const content = document.querySelector('.pattern-content');
    if (!header || !content) return;

    const sections = buildPatternLessonSections(pattern, state.level || 'beginner');
    const totalSections = sections.length;
    const currentSectionIndex = Math.min(state.sectionIndex || 0, totalSections - 1);
    const currentSection = sections[currentSectionIndex];
    const progressPercent = Math.min(100, Math.round(((state.completedSections || 0) / totalSections) * 100));
    const completedCount = state.completedSections || 0;

    document.title = `DSA Pattern Hub - ${pattern.title}`;
    header.innerHTML = `
        <h1>${pattern.title}</h1>
        <div class="difficulty-badge ${pattern.difficulty}">${pattern.difficulty.charAt(0).toUpperCase() + pattern.difficulty.slice(1)}</div>
        <div class="lesson-progress-card">
            <div class="lesson-progress-bar">
                <span style="width: ${progressPercent}%"></span>
            </div>
            <div class="lesson-progress-meta">
                <span>Level: <strong>${(state.level || 'beginner').charAt(0).toUpperCase() + (state.level || 'beginner').slice(1)}</strong></span>
                <span>${completedCount}/${totalSections} sections complete</span>
            </div>
        </div>
    `;

    const isCheckpoint = state.view === 'checkpoint';
    if (isCheckpoint) {
        content.innerHTML = `
            <div class="lesson-shell">
                <div class="lesson-card">
                    <div class="lesson-step">Checkpoint ${currentSectionIndex + 1}</div>
                    <h2>Quick check</h2>
                    <p><strong>${currentSection.question.prompt}</strong></p>
                    <div class="quiz-options">
                        ${currentSection.question.options.map((option, index) => `<button class="quiz-option" data-index="${index}" type="button">${option}</button>`).join('')}
                    </div>
                    <div class="quiz-feedback" aria-live="polite"></div>
                    <button class="nav-button continue-btn" type="button" disabled>Continue</button>
                </div>
            </div>
        `;

        const feedbackEl = content.querySelector('.quiz-feedback');
        const continueBtn = content.querySelector('.continue-btn');
        const optionButtons = content.querySelectorAll('.quiz-option');

        optionButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const selectedIndex = Number(button.dataset.index);
                const isCorrect = selectedIndex === currentSection.question.answer;
                const nextState = getPatternLessonState(patternId);
                nextState.patternId = patternId;
                nextState.level = state.level || 'beginner';
                nextState.sectionIndex = currentSectionIndex;
                nextState.completedSections = Math.max(nextState.completedSections || 0, currentSectionIndex + 1);
                nextState.score = (nextState.score || 0) + (isCorrect ? 1 : 0);
                nextState.answers.push({ section: currentSectionIndex + 1, correct: isCorrect, selectedIndex });
                nextState.view = 'theory';
                savePatternLessonState(patternId, nextState);
                feedbackEl.innerHTML = isCorrect
                    ? `<span class="feedback success">✅ Correct! ${currentSection.question.explanation}<br>Nice work — you’ve got this concept.</span>`
                    : `<span class="feedback error">⚠️ Not quite. ${currentSection.question.explanation}</span>`;
                optionButtons.forEach((option) => option.disabled = true);
                continueBtn.disabled = false;
                continueBtn.textContent = currentSectionIndex + 1 >= totalSections ? 'Finish lesson' : 'Next section';
            });
        });

        continueBtn.addEventListener('click', () => {
            const nextState = getPatternLessonState(patternId);
            nextState.patternId = patternId;
            nextState.level = state.level || 'beginner';
            if (currentSectionIndex + 1 >= totalSections) {
                nextState.completedSections = totalSections;
                nextState.sectionIndex = totalSections;
                nextState.completed = true;
                nextState.view = 'complete';
                savePatternLessonState(patternId, nextState);
                content.innerHTML = `
                    <div class="lesson-shell">
                        <div class="lesson-card">
                            <h2>Lesson complete!</h2>
                            <p>You finished the guided lesson for <strong>${pattern.title}</strong>.</p>
                            <p>Your score: <strong>${nextState.score}/${totalSections}</strong></p>
                            <p>Keep practicing and revisit the examples whenever you feel stuck.</p>
                            <div class="lesson-actions">
                                <button class="nav-button" type="button" data-reset-lesson="true">Restart lesson</button>
                                <a class="nav-button" href="practice.html">Practice now</a>
                            </div>
                        </div>
                    </div>
                `;
                content.querySelector('[data-reset-lesson="true"]').addEventListener('click', () => {
                    const resetState = { patternId, level: state.level || 'beginner', sectionIndex: 0, completedSections: 0, score: 0, answers: [], view: 'theory' };
                    savePatternLessonState(patternId, resetState);
                    renderPatternLesson(pattern, patternId, resetState);
                });
                return;
            }
            nextState.sectionIndex = currentSectionIndex + 1;
            nextState.view = 'theory';
            savePatternLessonState(patternId, nextState);
            renderPatternLesson(pattern, patternId, nextState);
        });
        return;
    }

    content.innerHTML = `
        <div class="lesson-shell">
            <div class="lesson-card">
                <div class="lesson-step">Section ${currentSectionIndex + 1} of ${totalSections}</div>
                <h2>${currentSection.title}</h2>
                <div class="lesson-body">${currentSection.body}</div>
                <div class="lesson-actions">
                    <button class="nav-button" type="button" data-go-checkpoint="true">Continue to question</button>
                </div>
            </div>
        </div>
    `;

    content.querySelector('[data-go-checkpoint="true"]').addEventListener('click', () => {
        const nextState = getPatternLessonState(patternId);
        nextState.patternId = patternId;
        nextState.level = state.level || 'beginner';
        nextState.sectionIndex = currentSectionIndex;
        nextState.completedSections = Math.max(nextState.completedSections || 0, currentSectionIndex + 1);
        nextState.view = 'checkpoint';
        savePatternLessonState(patternId, nextState);
        renderPatternLesson(pattern, patternId, nextState);
    });
}

function loadPatternDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const patternId = urlParams.get('pattern');
    
    if (!patternId || !patternData[patternId]) {
        const header = document.querySelector('.pattern-header');
        const content = document.querySelector('.pattern-content');
        if (header) header.innerHTML = '<h1>Pattern not found</h1><div class="difficulty-badge medium">Unavailable</div>';
        if (content) content.innerHTML = '<div class="lesson-shell"><div class="lesson-card"><h2>Pattern unavailable</h2><p>The requested lesson could not be loaded. Please return to the patterns list.</p></div></div>';
        return;
    }
    
    const pattern = patternData[patternId];
    const state = getPatternLessonState(patternId);
    const header = document.querySelector('.pattern-header');
    const content = document.querySelector('.pattern-content');
    if (!header || !content) return;

    if (!state.level) {
        header.innerHTML = `
            <h1>${pattern.title}</h1>
            <div class="difficulty-badge ${pattern.difficulty}">${pattern.difficulty.charAt(0).toUpperCase() + pattern.difficulty.slice(1)}</div>
        `;
        content.innerHTML = `
            <div class="lesson-shell">
                <div class="lesson-card">
                    <h2>Choose your level</h2>
                    <p>Before you start, tell us how confident you feel with <strong>${pattern.title}</strong>.</p>
                    <div class="level-picker">
                        <button class="level-btn" type="button" data-level="beginner">Beginner</button>
                        <button class="level-btn" type="button" data-level="intermediate">Intermediate</button>
                        <button class="level-btn" type="button" data-level="expert">Expert</button>
                    </div>
                </div>
            </div>
        `;
        content.querySelectorAll('.level-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const nextState = getPatternLessonState(patternId);
                nextState.patternId = patternId;
                nextState.level = button.dataset.level;
                nextState.sectionIndex = 0;
                nextState.completedSections = 0;
                nextState.score = 0;
                nextState.answers = [];
                nextState.view = 'theory';
                savePatternLessonState(patternId, nextState);
                renderPatternLesson(pattern, patternId, nextState);
            });
        });
        return;
    }

    renderPatternLesson(pattern, patternId, state);
}

// Helper function to escape HTML in code blocks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Only run on pattern detail page
if (window.location.pathname.includes("pattern-detail.html")) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPatternDetail, { once: true });
    } else {
        loadPatternDetail();
    }
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

    let visibleCount = 0;
    
    cards.forEach((card, index) => {
        const text = card.innerText.toLowerCase();
        const difficulty = card.getAttribute("data-difficulty");
        const patternId = card.getAttribute("data-pattern-id");
        
        const matchesSearch = text.includes(filter);
        const matchesDifficulty = selectedDifficulty === "all" || difficulty === selectedDifficulty;
        const isFavorited = savedFavorites.includes(patternId);
        const matchesFavoriteFilter = !showOnlyFavorites || isFavorited;
        
        const shouldShow = matchesSearch && matchesDifficulty && matchesFavoriteFilter;
        
        if (shouldShow) {
            card.style.display = "block";
            card.style.animation = `slideIn 0.3s ease forwards`;
            card.style.animationDelay = `${index * 0.05}s`;
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });

    // Show/hide "no results" message
    updateNoResultsMessage(visibleCount);
}

function updateNoResultsMessage(visibleCount) {
    const container = document.getElementById("patternsContainer");
    let noResultsMsg = document.getElementById("noResultsMessage");
    
    if (visibleCount === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement("div");
            noResultsMsg.id = "noResultsMessage";
            noResultsMsg.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    <p style="font-size: 1.1rem; font-weight: 500; margin-bottom: 0.5rem;">No patterns found</p>
                    <p style="font-size: 0.95rem; opacity: 0.8;">Try adjusting your search or filters</p>
                </div>
            `;
            container.appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Practice Editor Functionality
function initializePracticeEditor() {
    const runButton = document.getElementById('runButton');
    const clearButton = document.getElementById('clearOutput');
    const codeInput = document.getElementById('codeInput');
    const outputArea = document.getElementById('output');
    
    if (runButton && codeInput && outputArea) {
        runButton.addEventListener('click', function() {
            const code = codeInput.value;
            if (!code.trim()) {
                outputArea.innerHTML = '<span style="color: var(--text-muted); opacity: 0.7;">Please enter some code to run</span>';
                return;
            }
            
            runCode(code, outputArea);
        });
        
        // Allow Ctrl+Enter or Cmd+Enter to run code
        codeInput.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                runButton.click();
            }
        });
    }
    
    if (clearButton && outputArea) {
        clearButton.addEventListener('click', function() {
            outputArea.innerHTML = '';
        });
    }
}

// Execute Python code using Pyodide (WebAssembly Python)
async function runCode(code, outputArea) {
    const runButton = document.querySelector('#runButton');
    const originalText = runButton.textContent;
    
    try {
        runButton.disabled = true;
        runButton.textContent = '⏳ Running...';
        outputArea.innerHTML = '<span style="color: var(--text-muted); opacity: 0.7;">Executing code...</span>';
        
        // Check if Pyodide is already loaded
        if (typeof globalThis.pyodide === 'undefined') {
            // Load Pyodide for the first time
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
            script.onload = async () => {
                globalThis.pyodide = await globalThis.loadPyodide();
                await executeCode(code, outputArea);
                runButton.disabled = false;
                runButton.textContent = originalText;
            };
            script.onerror = () => {
                outputArea.innerHTML = '<span style="color: #ef4444;">Error loading Python environment</span>';
                runButton.disabled = false;
                runButton.textContent = originalText;
            };
            document.head.appendChild(script);
        } else {
            await executeCode(code, outputArea);
            runButton.disabled = false;
            runButton.textContent = originalText;
        }
    } catch (error) {
        outputArea.innerHTML = `<span style="color: #ef4444;">Error: ${error.message}</span>`;
        runButton.disabled = false;
        runButton.textContent = originalText;
    }
}

async function executeCode(code, outputArea) {
    try {
        const pyodide = globalThis.pyodide;

        // Wrap the user's code to capture stdout/ stderr and provide a simple input implementation
        const wrapped = `
import sys, io, js
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

def input(prompt=''):
    return js.prompt(prompt)

${code}

__output = sys.stdout.getvalue()
__error = sys.stderr.getvalue()
`;
        await pyodide.runPythonAsync(wrapped);

        // Retrieve captured output
        let resultOutput = '';
        let resultError = '';
        try {
            resultOutput = pyodide.globals.get('__output').toString();
            resultError = pyodide.globals.get('__error').toString();
        } catch (e) {
            // ignore if not found
        }

        if (resultError && resultError.trim()) {
            outputArea.innerHTML = `<span style="color: #ef4444; white-space: pre-wrap;">${escapeHtml(resultError)}</span>`;
        } else if (resultOutput && resultOutput.trim()) {
            outputArea.innerHTML = `<span style="color: var(--text-primary); white-space: pre-wrap;">${escapeHtml(resultOutput)}</span>`;
        } else {
            outputArea.innerHTML = '<span style="color: var(--text-muted); opacity: 0.7;">Code executed successfully (no output)</span>';
        }
    } catch (error) {
        const errorMsg = error.message || String(error);
        outputArea.innerHTML = `<span style="color: #ef4444; white-space: pre-wrap;">Error: ${escapeHtml(errorMsg)}</span>`;
    }
}

// Initialize practice editor whenever the page loads (function will only attach listeners if elements exist)
document.addEventListener('DOMContentLoaded', initializePracticeEditor);