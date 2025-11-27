function addChip(listEl, value) {
    if (!value) return;

    // kiểm tra duplicate
    const exists = Array.from(listEl.children).some(chip => chip.textContent.trim().startsWith(value));
    if (exists) return;

    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = value;

    const remove = document.createElement("span");
    remove.className = "remove-chip";
    remove.innerHTML = "&times;";
    remove.addEventListener("click", () => chip.remove());

    chip.appendChild(remove);
    listEl.appendChild(chip);
}

const skillsList = document.getElementById("skills-list");
const skillInput = document.getElementById("skill-input");

skillInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        addChip(skillsList, skillInput.value.trim());
        skillInput.value = "";
    }
});

const modeButtons = document.querySelectorAll('.mode-btn');

modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active'); 
    });
});
