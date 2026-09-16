let allCandidates = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth() || (!checkRole('recruiter') && !checkRole('admin'))) return;
    
    // Mock fetch GET /api/recruiter/candidates
    allCandidates = [
        { refId: 'REF-8921', domain: 'Frontend React', status: 'Review Pending', score: 86.4, date: '2026-10-15' },
        { refId: 'REF-4412', domain: 'Backend Node.js', status: 'Advanced', score: 92.1, date: '2026-10-14' },
        { refId: 'REF-9932', domain: 'Frontend React', status: 'Hold', score: 74.5, date: '2026-10-14' },
        { refId: 'REF-1123', domain: 'Backend Node.js', status: 'Review Pending', score: 81.2, date: '2026-10-13' }
    ];

    loadCandidates();
});

function loadCandidates() {
    const domainFilter = document.getElementById('filter-domain').value;
    const statusFilter = document.getElementById('filter-status').value;
    const searchFilter = document.getElementById('search-ref').value.toLowerCase();

    let filtered = allCandidates.filter(c => {
        let match = true;
        if (domainFilter !== 'all' && !c.domain.toLowerCase().includes(domainFilter === 'd1' ? 'frontend' : 'backend')) match = false;
        if (statusFilter !== 'all' && !c.status.toLowerCase().includes(statusFilter === 'pending' ? 'pending' : statusFilter)) match = false;
        if (searchFilter && !c.refId.toLowerCase().includes(searchFilter)) match = false;
        return match;
    });

    const tbody = document.getElementById('candidates-tbody');
    const emptyState = document.getElementById('empty-state');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        tbody.innerHTML = filtered.map(c => {
            let statusBadge = '';
            if (c.status === 'Advanced') statusBadge = `<span class="badge" style="background:var(--success-soft);color:var(--success);">${c.status}</span>`;
            else if (c.status === 'Hold') statusBadge = `<span class="badge" style="background:var(--warning-soft);color:var(--warning);">${c.status}</span>`;
            else statusBadge = `<span class="badge" style="background:var(--primary-soft);color:var(--primary);">${c.status}</span>`;

            return `
                <tr onclick="openReviewPanel('${c.refId}')">
                    <td style="font-family:var(--font-mono); font-weight:700;">${c.refId}</td>
                    <td>${c.domain}</td>
                    <td>${statusBadge}</td>
                    <td style="font-weight:700; color:var(--primary);">${c.score.toFixed(1)}</td>
                    <td>${c.date}</td>
                    <td><button class="btn btn-outline" style="height:2rem; padding:0 0.75rem; font-size:0.8rem;">Review</button></td>
                </tr>
            `;
        }).join('');
    }
}

function openReviewPanel(refId) {
    document.getElementById('review-panel').style.display = 'block';
    document.getElementById('panel-ref-id').textContent = `Candidate ${refId}`;
    document.getElementById('review-ref-id').value = refId;
    document.getElementById('review-form').reset();
    
    // Scroll to panel
    document.getElementById('review-panel').scrollIntoView({ behavior: 'smooth' });
}

function closeReviewPanel() {
    document.getElementById('review-panel').style.display = 'none';
}

function submitReview(e) {
    e.preventDefault();
    const refId = document.getElementById('review-ref-id').value;
    const outcome = document.querySelector('input[name="outcome"]:checked').value;
    
    // Mock POST /api/recruiter/reviews
    alert(`Review saved for ${refId}. Outcome: ${outcome}`);
    
    // Update local state for demo
    const cand = allCandidates.find(c => c.refId === refId);
    if (cand) {
        cand.status = outcome === 'More Info Needed' ? 'Review Pending' : outcome + (outcome === 'Advance' ? 'd' : '');
    }
    
    closeReviewPanel();
    loadCandidates();
}
