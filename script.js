function toggleContent(button) {
    const content = button.nextElementSibling;
    content.style.display = content.style.display === "block" ? "none" : "block";
}

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", function () {
    const filter = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(filter) ? "block" : "none";
    });
});
