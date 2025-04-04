document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // FUNZIONALITÀ GENERALI
    // ======================
    
    // Menu mobile
    const menuToggle = document.createElement('button');
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.classList.add('menu-toggle');
    document.querySelector('header').appendChild(menuToggle);

    const navMenu = document.querySelector('nav ul');
    
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('show');
        this.classList.toggle('open');
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if(this.hash !== "") {
                e.preventDefault();
                
                const target = document.querySelector(this.hash);
                if(target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });

                    // Chiudi menu mobile se aperto
                    navMenu.classList.remove('show');
                    menuToggle.classList.remove('open');
                }
            }
        });
    });

    // Animazioni al caricamento
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.servizio, .prezzi-container, .contatti-form');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if(elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Imposta stato iniziale animazioni
    const servizi = document.querySelectorAll('.servizio');
    const prezziContainer = document.querySelector('.prezzi-container');
    const contattiForm = document.querySelector('.contatti-form');
    
    servizi.forEach(servizio => {
        servizio.style.opacity = '0';
        servizio.style.transform = 'translateY(30px)';
        servizio.style.transition = 'all 0.6s ease-out';
    });
    
    if(prezziContainer) {
        prezziContainer.style.opacity = '0';
        prezziContainer.style.transform = 'translateY(30px)';
        prezziContainer.style.transition = 'all 0.6s ease-out 0.2s';
    }
    
    if(contattiForm) {
        contattiForm.style.opacity = '0';
        contattiForm.style.transform = 'translateY(30px)';
        contattiForm.style.transition = 'all 0.6s ease-out 0.4s';
    }

    // Esegui animazioni
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // Header che cambia allo scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if(window.scrollY > 100) {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            header.style.background = 'rgba(44, 62, 80, 0.95)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            header.style.background = 'var(--primary)';
        }
    });

    // ======================
    // FUNZIONALITÀ ADMIN
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

    // Mostra pulsante admin
    adminAccessBtn.style.display = 'flex';

    // Event Listeners
    adminAccessBtn.addEventListener('click', showAdminPanel);
    closeAdminPanel.addEventListener('click', hideAdminPanel);
    refreshMessages.addEventListener('click', loadMessages);
    deleteMessageBtn.addEventListener('click', deleteCurrentMessage);
    messageSearch.addEventListener('input', loadMessages);

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