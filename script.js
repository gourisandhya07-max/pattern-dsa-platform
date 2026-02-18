function toggleContent(button) {
    const content = button.nextElementSibling;
    content.style.display = content.style.display === "block" ? "none" : "block";
}

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", function () {
    filterCards();
});

const difficultyFilter = document.getElementById("difficultyFilter");
difficultyFilter.addEventListener("change", function () {
    filterCards();
});

const darkModeToggle = document.getElementById("darkModeToggle");
darkModeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    document.querySelector("header").classList.toggle("dark-mode");
});

function filterCards() {
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
