document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // NAVBAR MOBILE
    // ======================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.navbar-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.innerHTML = navLinks.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        
        // Chiudi menu al click su link
        document.querySelectorAll('.navbar-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }

    // ======================
    // SMOOTH SCROLLING
    // ======================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if(this.hash !== "") {
                e.preventDefault();
                
                const target = document.querySelector(this.hash);
                if(target) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    
                    window.scrollTo({
                        top: targetPosition - navbarHeight,
                        behavior: 'smooth'
                    });

                    // Chiudi menu mobile se aperto
                    if (navLinks) {
                        navLinks.classList.remove('active');
                        if (hamburger) {
                            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                        }
                    }
                }
            }
        });
    });

    // ======================
    // ANIMAZIONI
    // ======================
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.servizio, .prezzi-container, .contatti-form');
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const scrollPosition = window.pageYOffset + navbarHeight;
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const screenPosition = window.innerHeight + scrollPosition;
            
            if(elementPosition < screenPosition * 0.85) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Imposta stato iniziale animazioni
    window.addEventListener('load', function() {
        const servizi = document.querySelectorAll('.servizio');
        const prezziContainer = document.querySelector('.prezzi-container');
        const contattiForm = document.querySelector('.contatti-form');
        
        servizi.forEach((servizio, index) => {
            servizio.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
        });
        
        if(prezziContainer) {
            prezziContainer.style.transition = 'all 0.6s ease-out 0.2s';
        }
        
        if(contattiForm) {
            contattiForm.style.transition = 'all 0.6s ease-out 0.4s';
        }

        animateOnScroll();
    });

    window.addEventListener('scroll', animateOnScroll);

    // ======================
    // HEADER SCROLL EFFECT
    // ======================
    const header = document.querySelector('.navbar');
    if (header) {
        window.addEventListener('scroll', function() {
            if(window.scrollY > 100) {
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                header.style.background = 'rgba(44, 62, 80, 0.95)';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                header.style.background = 'var(--primary)';
            }
        });
    }

    // ======================
    // ADMIN PANEL
    // ======================
    const ADMIN_PASSWORD = "ProWash2024"; // CAMBIA IN PRODUZIONE!
    let currentMessageIndex = null;

    // Elementi UI
    const adminAccessBtn = document.getElementById('adminAccessBtn');
    const adminPanel = document.getElementById('adminPanel');
    const closeAdminPanel = document.getElementById('closeAdminPanel');
    const refreshMessages = document.getElementById('refreshMessages');
    const deleteMessageBtn = document.getElementById('deleteMessage');
    const messageSearch = document.getElementById('messageSearch');

    if (adminAccessBtn) adminAccessBtn.style.display = 'flex';

    // Event Listeners
    if (adminAccessBtn) adminAccessBtn.addEventListener('click', showAdminPanel);
    if (closeAdminPanel) closeAdminPanel.addEventListener('click', hideAdminPanel);
    if (refreshMessages) refreshMessages.addEventListener('click', loadMessages);
    if (deleteMessageBtn) deleteMessageBtn.addEventListener('click', deleteCurrentMessage);
    if (messageSearch) messageSearch.addEventListener('input', loadMessages);

    // Funzioni principali
    function showAdminPanel() {
        const password = prompt("Inserisci la password di amministrazione:");
        
        if(password === ADMIN_PASSWORD) {
            adminPanel.style.display = 'block';
            loadMessages();
        } else if(password !== null) {
            alert("Password errata!");
        }
    }

    function hideAdminPanel() {
        adminPanel.style.display = 'none';
        currentMessageIndex = null;
        document.getElementById('messageDetail').style.display = 'none';
    }

    function loadMessages() {
        const messages = getMessages();
        const searchTerm = messageSearch.value.toLowerCase();
        const messagesList = document.getElementById('messagesList');
        
        messagesList.innerHTML = '';
        
        const filteredMessages = messages.filter(msg => 
            msg.name.toLowerCase().includes(searchTerm) || 
            msg.email.toLowerCase().includes(searchTerm) ||
            msg.message.toLowerCase().includes(searchTerm)
        );
        
        if(filteredMessages.length === 0) {
            messagesList.innerHTML = '<div class="no-messages">Nessun messaggio trovato</div>';
            document.getElementById('messageDetail').style.display = 'none';
            return;
        }
        
        filteredMessages.forEach((msg, index) => {
            const messageElement = document.createElement('div');
            messageElement.className = `message-item ${msg.read ? '' : 'unread'}`;
            messageElement.innerHTML = `
                <div class="message-preview">
                    <div>
                        <span class="message-sender">${msg.name}</span>
                        <span class="message-preview-text">${msg.message.substring(0, 60)}${msg.message.length > 60 ? '...' : ''}</span>
                    </div>
                    <span class="message-date">${formatDate(msg.date)}</span>
                </div>
            `;
            
            messageElement.addEventListener('click', () => viewMessage(index));
            messagesList.appendChild(messageElement);
        });
    }

    function viewMessage(index) {
        const messages = getMessages();
        const msg = messages[index];
        currentMessageIndex = index;
        
        // Segna come letto
        if(!msg.read) {
            msg.read = true;
            saveMessages(messages);
        }
        
        document.getElementById('detailName').textContent = msg.name;
        document.getElementById('detailEmail').textContent = msg.email;
        document.getElementById('detailDate').textContent = formatDate(msg.date, true);
        document.getElementById('detailMessage').textContent = msg.message;
        document.getElementById('replyLink').href = `mailto:${msg.email}?subject=Risposta al tuo messaggio&body=Ciao ${msg.name},\n\n`;
        
        document.getElementById('messageDetail').style.display = 'block';
    }

    function deleteCurrentMessage() {
        if(currentMessageIndex === null) return;
        
        if(confirm("Eliminare questo messaggio?")) {
            const messages = getMessages();
            messages.splice(currentMessageIndex, 1);
            saveMessages(messages);
            document.getElementById('messageDetail').style.display = 'none';
            loadMessages();
            currentMessageIndex = null;
        }
    }

    // Funzioni di supporto
    function getMessages() {
        return JSON.parse(localStorage.getItem('proWashMessages')) || [];
    }

    function saveMessages(messages) {
        localStorage.setItem('proWashMessages', JSON.stringify(messages));
    }

    function formatDate(dateString, full = false) {
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        
        if(full) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return new Date(dateString).toLocaleDateString('it-IT', options);
    }

    // ======================
    // GESTIONE FORM CONTATTI
    // ======================
    const contactForm = document.getElementById('contactForm');
    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const messages = getMessages();
            
            messages.push({
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message'),
                date: new Date().toISOString(),
                read: false
            });
            
            saveMessages(messages);
            alert('Messaggio inviato con successo!');
            this.reset();
        });
    }
});