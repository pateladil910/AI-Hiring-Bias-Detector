document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
});

async function runTests() {
    const code = document.getElementById('code-editor').value;
    const resultsPanel = document.getElementById('test-results');
    
    resultsPanel.innerHTML = '<div style="color:var(--text-muted);">Running tests...</div>';

    // Mock API call to run code
    setTimeout(() => {
        // Simple client-side mock evaluation
        let passed = false;
        if (code.includes('return') && (code.includes('map') || code.includes('for'))) {
            passed = true;
        }

        if (passed) {
            resultsPanel.innerHTML = `
                <div style="color:var(--success); margin-bottom:0.5rem; font-weight:700;">✓ All Test Cases Passed (3/3)</div>
                <div style="padding:0.5rem; background:#f0fdf6; border-left:3px solid var(--success); margin-bottom:0.5rem;">
                    Test 1: nums=[2,7,11,15], target=9 <br>Expected: [0,1] | Output: [0,1] <span style="color:var(--success);">[PASS]</span>
                </div>
                <div style="padding:0.5rem; background:#f0fdf6; border-left:3px solid var(--success); margin-bottom:0.5rem;">
                    Test 2: nums=[3,2,4], target=6 <br>Expected: [1,2] | Output: [1,2] <span style="color:var(--success);">[PASS]</span>
                </div>
                <div style="padding:0.5rem; background:#f0fdf6; border-left:3px solid var(--success);">
                    Test 3: nums=[3,3], target=6 <br>Expected: [0,1] | Output: [0,1] <span style="color:var(--success);">[PASS]</span>
                </div>
            `;
        } else {
            resultsPanel.innerHTML = `
                <div style="color:var(--danger); margin-bottom:0.5rem; font-weight:700;">✗ Tests Failed (0/3)</div>
                <div style="padding:0.5rem; background:#fde8e8; border-left:3px solid var(--danger); margin-bottom:0.5rem;">
                    Test 1: nums=[2,7,11,15], target=9 <br>Expected: [0,1] | Output: undefined <span style="color:var(--danger);">[FAIL]</span>
                </div>
            `;
        }
    }, 1000);
}

async function submitSolution() {
    const code = document.getElementById('code-editor').value;
    // Mock POST to /api/assessment/:id/submit
    alert('Solution submitted successfully!');
    window.location.href = 'final-score.html';
}
