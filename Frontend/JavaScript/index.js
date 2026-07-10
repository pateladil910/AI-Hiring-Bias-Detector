// Wait for DOM content to finish loading
document.addEventListener("DOMContentLoaded", () => {
    console.log("EquiHire AI Talent Console Initialized.");

    const candidateRows = document.querySelectorAll('.candidate-row');
    candidateRows.forEach(row => {
        const btn = row.querySelector('button');
        if (btn) {
            btn.addEventListener('click', () => {
                const candidateId = row.querySelector('td').textContent;
                alert(`Opening anonymized skills graph profile for candidate: ${candidateId}`);
            });
        }
    });
});
