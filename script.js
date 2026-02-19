function toggleContent(button) {
    const content = button.nextElementSibling;
    content.style.display = content.style.display === "block" ? "none" : "block";
}

const darkModeToggle = document.getElementById("darkModeToggle");
if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        const nav = document.querySelector(".nav");
        if (nav) nav.classList.toggle("dark-mode");
        const hero = document.querySelector(".hero");
        if (hero) hero.classList.toggle("dark-mode");
    });
}

// Only run search/filter on patterns page
if (window.location.pathname.includes("patterns.html")) {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            filterCards();
        });
    }

    const difficultyFilter = document.getElementById("difficultyFilter");
    if (difficultyFilter) {
        difficultyFilter.addEventListener("change", function () {
            filterCards();
        });
    }
}

function filterCards() {
    const searchInput = document.getElementById("searchInput");
    const difficultyFilter = document.getElementById("difficultyFilter");
    if (!searchInput || !difficultyFilter) return;

    const filter = searchInput.value.toLowerCase();
    const selectedDifficulty = difficultyFilter.value;
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        const difficulty = card.getAttribute("data-difficulty");
        const matchesSearch = text.includes(filter);
        const matchesDifficulty = selectedDifficulty === "all" || difficulty === selectedDifficulty;
        card.style.display = matchesSearch && matchesDifficulty ? "block" : "none";
    });
}
