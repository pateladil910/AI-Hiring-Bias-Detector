document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth() || !checkRole('candidate')) return;

    const user = getUser();
    const welcome = document.getElementById('welcome-message');
    if (welcome) {
        welcome.textContent = `Welcome, cloaked_${Math.floor(Math.random() * 10000)}`;
    }

    try {
        const response = await fetch(`${API}/api/candidate/application`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        let progress = 1;
        if (response.ok) {
            const data = await response.json();
            progress = data.step || 1;
        }

        renderStepper(progress);
    } catch (err) {
        renderStepper(1); // Default to 1 on error for demo
    }
});

function renderStepper(currentStep) {
    const steps = [
        { num: 1, name: 'Resume Upload', url: 'upload-resume.html', btn: 'Upload Resume' },
        { num: 2, name: 'Domain Selection', url: 'select-domain.html', btn: 'Select Domain' },
        { num: 3, name: 'MCQ Assessment', url: 'assessment.html', btn: 'Start Assessment' },
        { num: 4, name: 'Coding Challenge', url: 'coding-test.html', btn: 'Start Coding' },
        { num: 5, name: 'Results', url: 'final-score.html', btn: 'View Results' }
    ];

    for (let i = 1; i <= 5; i++) {
        const circle = document.getElementById(`circle-${i}`);
        if (!circle) continue;
        
        if (i < currentStep) {
            circle.style.background = 'var(--success)';
            circle.style.color = '#fff';
            circle.innerHTML = '✓';
        } else if (i === currentStep) {
            circle.style.background = 'var(--primary)';
            circle.style.color = '#fff';
        } else {
            circle.style.background = 'var(--surface)';
            circle.style.border = '2px solid var(--border)';
            circle.style.color = 'var(--text-muted)';
        }
    }

    const details = document.getElementById('current-step-details');
    if (details && currentStep <= 5) {
        const step = steps[currentStep - 1];
        details.innerHTML = `
            <h3 style="margin-bottom: 0.5rem;">Current Step: ${step.name}</h3>
            <div style="margin-bottom: 1.5rem;">
                <span class="badge" style="background:var(--primary-soft); color:var(--primary);">In progress</span>
            </div>
            <a href="${step.url}" class="btn btn-primary">${step.btn} →</a>
        `;
    }
}
