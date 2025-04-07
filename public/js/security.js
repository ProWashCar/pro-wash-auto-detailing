/**
 * SISTEMA DI SICUREZZA PER PRO WASH AUTO DETAILING
 * Funzionalità principali:
 * 1. Protezione area admin con password crittografata
 * 2. Validazione form client-side
 * 3. Sanitizzazione input contro XSS
 */

const SecuritySystem = {
    // Configurazione
    config: {
        adminPassword: "7f8a9b0c1d2e3f", // Password crittografata (sha256 di "ProWash2024")
        sessionTimeout: 30 // Minuti
    },

    // Inizializzazione
    init: function() {
        this.setupAdminSecurity();
        this.setupFormValidation();
        console.log("Sistema di sicurezza attivo");
    },

    // 1. PROTEZIONE AREA ADMIN
    setupAdminSecurity: function() {
        const adminBtn = document.getElementById('adminAccessBtn');
        if (!adminBtn) return;

        adminBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const password = prompt("Inserisci la password di amministrazione:");
            if (!password) return;
            
            // Verifica password crittografata
            const hashedInput = await this.hashPassword(password);
            if (hashedInput === this.config.adminPassword) {
                this.startAdminSession();
                document.getElementById('adminPanel').style.display = 'block';
            } else {
                alert("Accesso negato: password errata");
                // Blocca dopo 3 tentativi
                if (typeof this.failedAttempts === 'undefined') {
                    this.failedAttempts = 1;
                } else if (this.failedAttempts >= 3) {
                    adminBtn.disabled = true;
                    setTimeout(() => {
                        adminBtn.disabled = false;
                        this.failedAttempts = 0;
                    }, 30000); // 30 secondi di blocco
                }
                this.failedAttempts++;
            }
        });

        // Timeout sessione
        setInterval(() => {
            if (this.isAdminSessionActive()) {
                const lastActivity = localStorage.getItem('adminLastActivity');
                if (lastActivity && (Date.now() - lastActivity > this.config.sessionTimeout * 60000)) {
                    this.endAdminSession();
                    alert("Sessione scaduta per inattività");
                }
            }
        }, 60000); // Controlla ogni minuto
    },

    // 2. VALIDAZIONE FORM
    setupFormValidation: function() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = this.sanitizeInput(contactForm.name.value);
            const email = this.sanitizeInput(contactForm.email.value);
            const message = this.sanitizeInput(contactForm.message.value);

            // Validazione email
            if (!this.validateEmail(email)) {
                alert("Inserisci un indirizzo email valido");
                return;
            }

            // Validazione lunghezza messaggio
            if (message.length < 10) {
                alert("Il messaggio deve contenere almeno 10 caratteri");
                return;
            }

            // Se tutto ok, invia il form
            contactForm.submit();
        });
    },

    // Funzioni di supporto
    hashPassword: async function(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    validateEmail: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    sanitizeInput: function(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/'/g, "&#39;")
            .replace(/"/g, "&quot;");
    },

    startAdminSession: function() {
        localStorage.setItem('adminSession', 'active');
        localStorage.setItem('adminLastActivity', Date.now());
    },

    endAdminSession: function() {
        localStorage.removeItem('adminSession');
        document.getElementById('adminPanel').style.display = 'none';
    },

    isAdminSessionActive: function() {
        return localStorage.getItem('adminSession') === 'active';
    }
};

// Attiva il sistema quando la pagina è pronta
if (document.readyState === 'complete') {
    SecuritySystem.init();
} else {
    document.addEventListener('DOMContentLoaded', () => SecuritySystem.init());
}