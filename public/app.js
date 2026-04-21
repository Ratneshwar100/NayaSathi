document.addEventListener('DOMContentLoaded', () => {

    // --- Authentication Logic ---
    const authContainer = document.getElementById('authContainer');
    const mainAppContainer = document.getElementById('mainAppContainer');
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Toggle forms
    showSignup.addEventListener('click', () => {
        loginCard.classList.add('hidden');
        signupCard.classList.remove('hidden');
    });

    showLogin.addEventListener('click', () => {
        signupCard.classList.add('hidden');
        loginCard.classList.remove('hidden');
    });

    // Determine current auth state
    const checkAuth = () => {
        // Clear any old local storage tokens to migrate fully to session
        localStorage.removeItem('ns_token');
        localStorage.removeItem('ns_user');
        
        const token = sessionStorage.getItem('ns_token');
        if (token) {
            authContainer.classList.add('hidden');
            mainAppContainer.classList.remove('hidden');
            // If main functionality requires current User info, load it here.
        } else {
            authContainer.classList.remove('hidden');
            mainAppContainer.classList.add('hidden');
        }
    };

    // Logout
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('ns_token');
        sessionStorage.removeItem('ns_user');
        loginForm.reset();
        signupForm.reset();
        checkAuth();
    });

    // Login Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('loginId').value;
        const pass = document.getElementById('loginPass').value;
        
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password: pass })
            });
            const data = await res.json();
            if (data.success) {
                sessionStorage.setItem('ns_token', data.token);
                sessionStorage.setItem('ns_user', JSON.stringify(data.user));
                checkAuth();
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error logging in');
        }
    });

    // Signup Submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const phone = document.getElementById('signupPhone').value;
        const email = document.getElementById('signupEmail').value;
        const pass = document.getElementById('signupPass').value;
        
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, id: phone, email, password: pass })
            });
            const data = await res.json();
            if (data.success) {
                alert('Account created! Please log in.');
                showLogin.click(); // switch to login view
            } else {
                alert(data.message || 'Signup failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating account');
        }
    });

    checkAuth();

    const dashCards = document.querySelectorAll('.dash-card');
    const sections = document.querySelectorAll('.view-section');
    const langToggle = document.getElementById('langToggle');
    const backBtn = document.getElementById('backBtn');
    let currentLang = 'hi-IN'; // Default to Hindi preference for speech

    // Ensure speech synthesis is available
    const synth = window.speechSynthesis;

    // --- Tab Navigation (Dashboard Routing) ---
    dashCards.forEach(card => {
        card.addEventListener('click', () => {
            // Hide all sections
            sections.forEach(s => s.classList.remove('active'));
            
            // Show target section
            const targetId = card.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            // Show back button since we are not on home anymore
            backBtn.classList.remove('hidden');

            // Fetch data if needed when tab is clicked
            if (targetId === 'view-rights') loadRights();
            if (targetId === 'view-schemes') loadSchemes();
        });
    });

    // --- Back Button Logic ---
    backBtn.addEventListener('click', () => {
        // Hide all sections
        sections.forEach(s => s.classList.remove('active'));
        // Show home
        document.getElementById('view-home').classList.add('active');
        // Hide back button
        backBtn.classList.add('hidden');
    });

    // --- Language Toggle ---
    langToggle.addEventListener('click', () => {
        if(currentLang === 'hi-IN') {
            currentLang = 'en-IN';
            langToggle.innerHTML = "ENG";
            alert("Speech set to English (UI updates coming soon in full verson)");
        } else {
            currentLang = 'hi-IN';
            langToggle.innerHTML = "अ/A";
            alert("स्पीच हिंदी/हिंग्लिश के लिए सेट (Speech set to Hindi)");
        }
    });

    // --- Chatbot Functionality ---
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatWindow = document.getElementById('chatWindow');

    const appendMessage = (text, isBot = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;
        msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        if (isBot) {
            speakText(text);
        }
    };

    const sendMessage = async (text) => {
        if (!text.trim()) return;
        appendMessage(text, false);
        chatInput.value = '';

        try {
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, language: currentLang })
            });
            const data = await res.json();
            if (data.success) {
                appendMessage(data.reply, true);
            } else {
                appendMessage('Sorry, I am facing some network issues.', true);
            }
        } catch (err) {
            console.error(err);
            appendMessage('An error occurred. Please try again.', true);
        }
    };

    sendBtn.addEventListener('click', () => sendMessage(chatInput.value));
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(chatInput.value);
    });

    // --- Voice Support (Speech to Text) ---
    const voiceBtn = document.getElementById('voiceBtn');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = currentLang;

        recognition.onstart = () => {
            voiceBtn.classList.add('pulse-recording');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            sendMessage(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            voiceBtn.classList.remove('pulse-recording');
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('pulse-recording');
        };

        voiceBtn.addEventListener('click', () => {
             // stop speaking ifbot is talking
             if(synth.speaking) synth.cancel();
             
             recognition.lang = currentLang; // update lang if changed
             recognition.start();
        });
    } else {
        voiceBtn.style.display = 'none';
        console.log("Speech recognition not supported");
    }

    const stopVoiceBtn = document.getElementById('stopVoiceBtn');
    if (stopVoiceBtn) {
        stopVoiceBtn.addEventListener('click', () => {
            if (synth.speaking) {
                synth.cancel();
            }
        });
    }

    // --- Voice Support (Text to Speech) ---
    function speakText(text) {
         if (synth.speaking) {
            console.error('synth.speaking');
            return;
        }
        if (text !== '') {
            const utterThis = new SpeechSynthesisUtterance(text);
            utterThis.onend = function (event) {
                console.log('SpeechSynthesisUtterance.onend');
            }
            utterThis.onerror = function (event) {
                console.error('SpeechSynthesisUtterance.onerror');
            }
            utterThis.lang = currentLang;
            utterThis.rate = 0.9; // Slightly slower for clear understanding
            synth.speak(utterThis);
        }
    }


    // --- Rights Module ---
    const rightsFilters = document.querySelectorAll('#rightsFilters .filter-btn');
    const rightsList = document.getElementById('rightsList');
    let allRights = {};

    const loadRights = async () => {
        if(Object.keys(allRights).length > 0) return; // already loaded
        try {
            const res = await fetch('/api/rights');
            const data = await res.json();
            if (data.success) {
                allRights = data.rights;
                renderRights('Women'); // Default
            }
        } catch (err) {
            console.error(err);
        }
    };

    const renderRights = (category) => {
        rightsList.innerHTML = '';
        const list = allRights[category] || [];
        list.forEach((r, index) => {
            rightsList.innerHTML += `
                <div class="card right-card" style="cursor: pointer;" data-category="${category}" data-index="${index}">
                    <span class="tag">${category} Rights</span>
                    <h3>${r.title}</h3>
                    <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.desc}</p>
                    <div style="text-align: right; margin-top: 10px;"><small style="color: var(--primary-color); font-weight: bold;">Click to read more <i class="fas fa-arrow-right"></i></small></div>
                </div>
            `;
        });
        
        // Add click events to new cards
        document.querySelectorAll('.right-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const cat = e.currentTarget.getAttribute('data-category');
                const idx = e.currentTarget.getAttribute('data-index');
                const right = allRights[cat][idx];
                
                document.getElementById('modalTitle').innerText = right.title;
                document.getElementById('modalCategory').innerText = cat + " Rights";
                document.getElementById('modalDesc').innerText = right.desc;
                document.getElementById('modalFullText').innerHTML = right.fullDetails || "<p>Detailed information about <strong>" + right.title + "</strong> will be updated soon.</p>";
                
                document.getElementById('rightModal').classList.remove('hidden');
            });
        });
    };

    // Modal Close Logic
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('rightModal').classList.add('hidden');
        });
    }

    rightsFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            rightsFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderRights(btn.getAttribute('data-cat'));
        });
    });

    // --- Schemes Module ---
    const schemesFilters = document.querySelectorAll('#schemesFilters .filter-btn');
    const schemesList = document.getElementById('schemesList');

    const loadSchemes = async (category = 'Farmer') => {
        try {
            const res = await fetch(`/api/schemes?category=${category}`);
            const data = await res.json();
            if (data.success) {
                schemesList.innerHTML = '';
                data.schemes.forEach(s => {
                    schemesList.innerHTML += `
                        <div class="card">
                            <span class="tag">${s.category} Scheme</span>
                            <h3>${s.name}</h3>
                            <p>${s.description}</p>
                            <p><strong>Eligibility:</strong> ${s.eligibility}</p>
                            <p><strong>Apply:</strong> ${s.howToApply}</p>
                        </div>
                    `;
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    schemesFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            schemesFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadSchemes(btn.getAttribute('data-cat'));
        });
    });

    // --- Documents Module ---
    const docForm = document.getElementById('docForm');
    const docResult = document.getElementById('docResult');
    const docOutput = document.getElementById('docOutput');

    docForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            type: document.getElementById('docType').value,
            name: document.getElementById('docName').value,
            address: document.getElementById('docAddress').value,
            description: document.getElementById('docDesc').value
        };

        try {
            const res = await fetch('/api/documents/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                docOutput.value = data.document;
                docResult.classList.remove('hidden');
                
                // Scroll to result
                docResult.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (err) {
            console.error(err);
            alert("Error generating document");
        }
    });

    // --- Saved Documents Logic ---
    const saveDocBtn = document.getElementById('saveDocBtn');
    const savedDocsList = document.getElementById('savedDocsList');
    
    const loadSavedDocs = () => {
        const docs = JSON.parse(localStorage.getItem('savedDocs') || '[]');
        savedDocsList.innerHTML = '';
        
        if (docs.length === 0) {
            savedDocsList.innerHTML = '<p style="color:var(--text-muted); font-style: italic;">No saved documents yet.</p>';
            return;
        }
        
        docs.forEach((doc, index) => {
            const preview = doc.substring(0, 100) + '...';
            savedDocsList.innerHTML += `
                <div class="card">
                    <span class="tag" style="background:#e3f2fd; color:#0277bd;">Document #${index + 1}</span>
                    <p style="margin-top:10px; font-size: 0.9rem; border-left: 3px solid #e5e7eb; padding-left: 10px;">${preview}</p>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="btn-secondary" onclick="useDocInChat(${index})" style="flex: 1;"><i class="fas fa-robot"></i> Ask Chatbot</button>
                        <button class="btn-secondary" onclick="deleteDoc(${index})" style="color:#d32f2f; border-color:#d32f2f;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    };

    saveDocBtn.addEventListener('click', () => {
        const content = docOutput.value;
        if (!content) return;
        const docs = JSON.parse(localStorage.getItem('savedDocs') || '[]');
        docs.push(content);
        localStorage.setItem('savedDocs', JSON.stringify(docs));
        alert("Document saved successfully!");
        loadSavedDocs();
    });

    // Global functions for inline onclick handlers inside the closure
    window.useDocInChat = (index) => {
        const docs = JSON.parse(localStorage.getItem('savedDocs') || '[]');
        const docText = docs[index];
        if(!docText) return;
        
        // Switch to chat view
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById('view-chat').classList.add('active');
        
        // Ensure Back button is visible
        if (backBtn) backBtn.classList.remove('hidden');
        
        // Populate chat input
        document.getElementById('chatInput').value = "Please review my document:\n" + docText;
        document.getElementById('chatInput').focus();
    };

    window.deleteDoc = (index) => {
        if(confirm("Are you sure you want to delete this document?")) {
            const docs = JSON.parse(localStorage.getItem('savedDocs') || '[]');
            docs.splice(index, 1);
            localStorage.setItem('savedDocs', JSON.stringify(docs));
            loadSavedDocs();
        }
    };

    // Initial load
    loadSavedDocs();

});
