// Wait for DOM content to finish loading
document.addEventListener("DOMContentLoaded", () => {
    const cardInner = document.getElementById('card-inner');
    const signupTriggers = document.querySelectorAll('.btn-trigger-signup');
    const loginTriggers = document.querySelectorAll('.btn-trigger-login');
    const telemetryLogs = document.getElementById('telemetry-logs');

    // 1. 3D Card Flipping & History URL State sync
    const setCardState = (isSignup) => {
        if (!cardInner) return;
        
        if (isSignup) {
            cardInner.classList.add('flipped');
            // Update URL to signup.html dynamically without page reload
            try {
                if (window.location.pathname.indexOf('signup.html') === -1) {
                    history.pushState({ state: 'signup' }, 'Sign Up | EquiHire AI', 'signup.html');
                }
            } catch (e) {
                console.log("pushState bypassed (likely running on local file:// protocol)");
            }
            document.title = 'Sign Up | EquiHire AI';
        } else {
            cardInner.classList.remove('flipped');
            // Update URL to login.html dynamically without page reload
            try {
                if (window.location.pathname.indexOf('login.html') === -1) {
                    history.pushState({ state: 'login' }, 'Login | EquiHire AI', 'login.html');
                }
            } catch (e) {
                console.log("pushState bypassed (likely running on local file:// protocol)");
            }
            document.title = 'Login | EquiHire AI';
        }
    };

    // Attach click events to triggers (supporting both tabs and links)
    signupTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            setCardState(true);
        });
    });

    loginTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            setCardState(false);
        });
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        const path = window.location.pathname;
        if (path.includes('signup.html')) {
            setCardState(true);
        } else if (path.includes('login.html')) {
            setCardState(false);
        }
    });

    // 2. Continuous Objective Telemetry Typing Logs
    if (telemetryLogs) {
        const logs = [
            "Syncing safe talent pipeline...",
            "parsing skill nodes... [OK]",
            "redacting gender tokens... [OK]",
            "redacting age identifiers... [OK]",
            "extracting code repositories...",
            "analyzing technical merit...",
            "calculating match vectors...",
            "pipeline score: 99.4% objectivity",
            "Anonymization audit verified.",
            "Analyzing next candidate..."
        ];

        let logIndex = 0;

        const writeLogLine = (text, callback) => {
            const p = document.createElement('p');
            p.className = 'font-mono text-[9px] text-slate-500 leading-normal opacity-0 transition-opacity duration-300';
            telemetryLogs.appendChild(p);
            
            let charIndex = 0;
            const typeChar = () => {
                if (charIndex < text.length) {
                    p.textContent += text.charAt(charIndex);
                    charIndex++;
                    p.style.opacity = '1';
                    setTimeout(typeChar, 30);
                } else {
                    // Auto scroll to bottom
                    telemetryLogs.scrollTop = telemetryLogs.scrollHeight;
                    if (callback) callback();
                }
            };
            typeChar();
        };

        const runLogSequence = () => {
            // Keep logs within bounds (delete oldest logs if too many)
            if (telemetryLogs.childNodes.length > 12) {
                telemetryLogs.removeChild(telemetryLogs.firstChild);
            }
            
            writeLogLine("> " + logs[logIndex], () => {
                logIndex = (logIndex + 1) % logs.length;
                // Wait between 1.5s to 3s to print the next line
                setTimeout(runLogSequence, Math.random() * 1500 + 1500);
            });
        };

        // Start typing telemetry logs
        setTimeout(runLogSequence, 800);
    }
});