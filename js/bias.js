document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    try {
        // Mock API fetch GET /api/audit/my
        const data = [
            {
                category: 'Redaction Coverage',
                status: 'Passed',
                evidence: 'Removed Name, Email, Phone, Address. Kept Work Experience and Skills.',
                limitations: 'May not catch unique contextual identifiers in free text.'
            },
            {
                category: 'Resume Readability',
                status: 'Review Needed',
                evidence: '95% of parsed tokens were recognized as standard technical terms.',
                limitations: 'Highly specialized domain jargon might have been truncated.'
            },
            {
                category: 'Assessment Consistency',
                status: 'Passed',
                evidence: 'Rubric v2.4 applied. Standard 30min time limit enforced globally.',
                limitations: 'Does not account for external interruptions during the test.'
            },
            {
                category: 'Access Control',
                status: 'Passed',
                evidence: 'Profile only accessed by authorized Recruiter ID #8842.',
                limitations: 'Cannot verify if screen was shared externally.'
            },
            {
                category: 'Result Traceability',
                status: 'Passed',
                evidence: 'Formula v1.1. Inputs logged with UTC timestamps.',
                limitations: 'None.'
            }
        ];

        renderAuditCards(data);
    } catch(err) {
        console.error(err);
    }
});

function renderAuditCards(data) {
    const container = document.getElementById('audit-cards-container');
    container.innerHTML = data.map(event => {
        let statusBadge = '';
        if (event.status === 'Passed') statusBadge = `<span class="badge" style="background:var(--success-soft);color:var(--success);">${event.status}</span>`;
        else if (event.status === 'Review Needed') statusBadge = `<span class="badge" style="background:var(--warning-soft);color:var(--warning);">${event.status}</span>`;
        else statusBadge = `<span class="badge" style="background:var(--border);color:var(--text-muted);">${event.status}</span>`;

        return `
            <div class="card" style="padding:1.5rem;">
                <div class="flex-between" style="margin-bottom:1rem; border-bottom:1px solid var(--border); padding-bottom:1rem;">
                    <h3 style="font-size:1.2rem; margin:0;">${event.category}</h3>
                    ${statusBadge}
                </div>
                <div style="display:flex; flex-direction:column; gap:1rem;">
                    <div>
                        <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.25rem;">Evidence</div>
                        <div style="font-size:0.95rem;">${event.evidence}</div>
                    </div>
                    <div>
                        <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.25rem;">Known Limitations</div>
                        <div style="font-size:0.9rem; color:var(--text-muted); font-style:italic;">${event.limitations}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
