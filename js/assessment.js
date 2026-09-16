let currentQuestionIndex = 0;
let questions = [];
let answers = {};
let timerInterval;
let timeRemaining = 1800; // 30 mins

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
});

async function startTimerAndAssessment() {
    document.getElementById('instructions-screen').style.display = 'none';
    document.getElementById('assessment-screen').style.display = 'block';

    const assessmentId = localStorage.getItem('current_assessment_id') || 'demo';
    
    // Mock load questions
    questions = [
        { id: 'q1', text: 'In React 18, what is the primary function of the useDeferredValue hook?', options: ['To defer updating a non-urgent part of UI', 'To cache API responses', 'To memoize callbacks', 'To handle side effects'] },
        { id: 'q2', text: 'What is the time complexity of searching in a balanced BST?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'] },
        { id: 'q3', text: 'Which HTTP method is typically used to partially update a resource?', options: ['POST', 'PUT', 'PATCH', 'DELETE'] },
        { id: 'q4', text: 'What is the output of typeof null in JavaScript?', options: ['null', 'undefined', 'object', 'number'] },
        { id: 'q5', text: 'Which sorting algorithm has the best worst-case time complexity?', options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Insertion Sort'] },
        { id: 'q6', text: 'If 3 cats catch 3 bunnies in 3 minutes, how long does it take 100 cats to catch 100 bunnies?', options: ['100 minutes', '3 minutes', '300 minutes', '1 minute'] },
        { id: 'q7', text: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?', options: ['$0.10', '$0.05', '$0.15', '$0.50'] },
        { id: 'q8', text: 'Look at this series: 2, 6, 18, 54, ... What number should come next?', options: ['108', '148', '162', '216'] }
    ];

    renderQuestion();
    startTimer();
    
    // Autosave every 30s
    setInterval(autosave, 30000);
}

function renderQuestion() {
    const q = questions[currentQuestionIndex];
    const container = document.getElementById('question-container');
    
    container.innerHTML = `
        <h3 style="margin-bottom:1.5rem;">${currentQuestionIndex + 1}. ${q.text}</h3>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
            ${q.options.map((opt, i) => `
                <label style="display:flex; align-items:center; gap:0.75rem; padding:1rem; border:1px solid var(--border); border-radius:var(--radius-sm); cursor:pointer; background: ${answers[q.id] === i ? 'var(--primary-soft)' : 'var(--surface)'};">
                    <input type="radio" name="q_${q.id}" value="${i}" ${answers[q.id] === i ? 'checked' : ''} onchange="saveAnswer('${q.id}', ${i})">
                    <span>${opt}</span>
                </label>
            `).join('')}
        </div>
    `;

    document.getElementById('progress-text').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    document.getElementById('progress-bar').style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;

    document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('submit-btn').style.display = 'block';
    } else {
        document.getElementById('next-btn').style.display = 'block';
        document.getElementById('submit-btn').style.display = 'none';
    }
}

function saveAnswer(qId, val) {
    answers[qId] = val;
    renderQuestion(); // Re-render to update selected styles
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

function startTimer() {
    const timerText = document.getElementById('timer-text');
    timerInterval = setInterval(() => {
        timeRemaining--;
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        timerText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        // Screen reader announcements at 10m, 5m, 1m could be done via aria-live regions
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitAssessment();
        }
    }, 1000);
}

async function autosave() {
    document.getElementById('autosave-indicator').textContent = 'Saving...';
    // Mock PUT to /api/assessment/:id/answers
    setTimeout(() => {
        const now = new Date();
        document.getElementById('autosave-indicator').textContent = `Saved ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    }, 500);
}

async function submitAssessment() {
    clearInterval(timerInterval);
    // Mock POST to /api/assessment/:id/submit
    alert('Assessment submitted successfully!');
    window.location.href = 'coding-test.html';
}
