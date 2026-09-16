document.addEventListener('DOMContentLoaded', () => {
  ParityNav.renderHeader(3);
  setupDragAndDrop();
});

function triggerFileInput() {
  document.getElementById('file-input').click();
}

function setupDragAndDrop() {
  const dropZone = document.getElementById('drop-zone');

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndUpload(files[0]);
    }
  });
}

function handleFileSelected(e) {
  const files = e.target.files;
  if (files.length > 0) {
    validateAndUpload(files[0]);
  }
}

function validateAndUpload(file) {
  const name = file.name.toLowerCase();
  const sizeMB = file.size / (1024 * 1024);

  if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
    alert('Invalid format. Please upload a PDF (.pdf) or Word document (.docx).');
    return;
  }

  if (sizeMB > 10) {
    alert(`File size (${sizeMB.toFixed(1)} MB) exceeds 10 MB limit.`);
    return;
  }

  startDeterminateUpload(file.name);
}

function startDeterminateUpload(fileName) {
  const card = document.getElementById('progress-card');
  const progFilename = document.getElementById('prog-filename');
  const progPercent = document.getElementById('prog-percent');
  const progFill = document.getElementById('prog-fill');
  const progStatus = document.getElementById('prog-status');

  card.style.display = 'block';
  progFilename.textContent = fileName;

  let percent = 0;
  const statuses = [
    'Reading document bytes...',
    'Stripping demographic headers (Photo, Address)...',
    'Extracting technical skill vectors...',
    'Synthesizing candidate profile payload...'
  ];

  const interval = setInterval(() => {
    percent += 5;
    if (percent > 100) percent = 100;

    progPercent.textContent = `${percent}%`;
    progFill.style.width = `${percent}%`;

    const statusIdx = Math.min(Math.floor((percent / 100) * statuses.length), statuses.length - 1);
    progStatus.textContent = statuses[statusIdx];

    if (percent >= 100) {
      clearInterval(interval);
      
      // Write resume info to sessionStorage
      const candidate = ParityStore.get('candidate') || { name: 'Alex Vance' };
      const resume = {
        filename: fileName,
        parsed: {
          name: candidate.name,
          email: candidate.email || 'alex.vance@example.com',
          phone: '+1 (555) 234-8901',
          skills: ['React', 'TypeScript', 'Node.js', 'System Architecture', 'PostgreSQL', 'GraphQL', 'AWS', 'Docker'],
          experience: [
            { role: 'Senior Full Stack Engineer', company: 'Apex Tech', period: '2021 – Present', description: 'Architected high-throughput React/Node microservices.' },
            { role: 'Software Engineer', company: 'Nexus Systems', period: '2018 – 2021', description: 'Developed TypeScript UI design system and REST APIs.' }
          ],
          education: 'B.S. in Computer Science — State University (2018)'
        }
      };
      ParityStore.set('resume', resume);

      setTimeout(() => {
        window.location.href = '../04-resume-parser/index.html';
      }, 500);
    }
  }, 120);
}

function loadSampleResume() {
  startDeterminateUpload('Alex_Vance_Senior_Dev_Resume.pdf');
}
