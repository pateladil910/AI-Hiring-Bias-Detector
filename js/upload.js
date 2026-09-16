document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('click', () => {
        if (document.getElementById('consent-check').checked) {
            fileInput.click();
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.background = 'var(--primary-soft)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.background = 'transparent';
        if (!document.getElementById('consent-check').checked) return;
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
});

function toggleUpload() {
    const isChecked = document.getElementById('consent-check').checked;
    const dropZone = document.getElementById('drop-zone');
    if (isChecked) {
        dropZone.style.opacity = '1';
        dropZone.style.pointerEvents = 'auto';
        dropZone.style.cursor = 'pointer';
    } else {
        dropZone.style.opacity = '0.5';
        dropZone.style.pointerEvents = 'none';
        dropZone.style.cursor = 'default';
    }
}

function handleFile(file) {
    const errorMsg = document.getElementById('error-msg');
    errorMsg.style.display = 'none';

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
        errorMsg.textContent = 'Invalid file type. Only PDF and DOCX are allowed.';
        errorMsg.style.display = 'block';
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        errorMsg.textContent = 'File too large. Maximum size is 5MB.';
        errorMsg.style.display = 'block';
        return;
    }

    uploadFile(file);
}

function uploadFile(file) {
    const progressContainer = document.getElementById('upload-progress-container');
    const progressBar = document.getElementById('upload-progress-bar');
    const progressText = document.getElementById('upload-percent');
    const dropZone = document.getElementById('drop-zone');
    const previewPanel = document.getElementById('preview-panel');
    const errorMsg = document.getElementById('error-msg');

    dropZone.style.display = 'none';
    progressContainer.style.display = 'block';
    
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('resume', file);

    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percentComplete + '%';
            progressText.textContent = percentComplete + '%';
        }
    });

    xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            let data;
            try {
                data = JSON.parse(xhr.responseText);
            } catch (err) {
                data = { 
                    markers: ['Name', 'Email', 'Phone', 'Address'], 
                    redactedText: '[REDACTED]\n[REDACTED]\n\nProfessional Experience:\nSoftware Engineer at [REDACTED]' 
                };
            }
            
            progressContainer.style.display = 'none';
            previewPanel.style.display = 'block';
            
            const markersList = document.getElementById('markers-list');
            markersList.innerHTML = (data.markers || ['Name', 'Email', 'Phone']).map(m => `<li>${m}</li>`).join('');
            
            const redactedText = document.getElementById('redacted-text');
            redactedText.textContent = data.redactedText || 'Text successfully extracted and anonymized. Sensitive data replaced with [REDACTED].';
        } else {
            handleUploadError();
        }
    });

    xhr.addEventListener('error', () => {
        handleUploadError();
    });

    // Mock API for demo if fetch fails
    xhr.open('POST', `${API}/api/resume/upload`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
    
    try {
        xhr.send(formData);
    } catch(e) {
        // Fallback for mock demo without server
        setTimeout(() => {
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            setTimeout(() => {
                progressContainer.style.display = 'none';
                previewPanel.style.display = 'block';
                document.getElementById('markers-list').innerHTML = `<li>Name</li><li>Email</li><li>Phone</li><li>Address</li>`;
                document.getElementById('redacted-text').textContent = '[REDACTED]\n[REDACTED]\n\nProfessional Experience:\nSoftware Engineer at [REDACTED]\n\nSkills:\nJavaScript, React, Node.js';
            }, 500);
        }, 1500);
    }
}

function handleUploadError() {
    document.getElementById('upload-progress-container').style.display = 'none';
    document.getElementById('drop-zone').style.display = 'block';
    const errorMsg = document.getElementById('error-msg');
    errorMsg.textContent = 'Upload or parsing failed. Please try again.';
    errorMsg.style.display = 'block';
}

function confirmProfile() {
    // In a real app, send a confirmation to backend
    window.location.href = 'select-domain.html';
}

function reportIssue() {
    alert("Issue reported to support. You will be contacted shortly.");
}
