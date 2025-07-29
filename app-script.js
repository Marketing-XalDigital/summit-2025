class SlotMachineApp {
    constructor() {
        this.currentUser = null;
        this.hasSpun = false;
        this.texts = [];
        this.adminEmails = ['camila.hernandez@xaldigital.com', 'sergio.sanchez@xaldigital.com', 'valeria.lorenzana@xaldigital.com'];
        
        this.initializeElements();
        this.loadTexts();
        this.setupEventListeners();
        this.initializeStorage();
    }

    initializeElements() {
        this.loginScreen = document.getElementById('login-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.loginForm = document.getElementById('login-form');
        this.userNameSpan = document.getElementById('user-name');
        this.logoutBtn = document.getElementById('logout-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.spinBtn = document.getElementById('spin-btn');
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];
    }

    loadTexts() {
        const textSections = document.querySelectorAll('.text-section');
        textSections.forEach((section, index) => {
            const spans = section.querySelectorAll('span');
            this.texts[index] = Array.from(spans).map(span => span.textContent);
        });
    }

    setupEventListeners() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        this.exportBtn.addEventListener('click', () => this.exportToExcel());
        this.clearBtn.addEventListener('click', () => this.clearAllData());
        this.spinBtn.addEventListener('click', () => this.handleSpin());
    }

    initializeStorage() {
        if (!localStorage.getItem('usuarios')) {
            localStorage.setItem('usuarios', JSON.stringify([]));
        }
        if (!localStorage.getItem('jugadas')) {
            localStorage.setItem('jugadas', JSON.stringify([]));
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    handleLogin(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        
        if (!nombre || !email) {
            alert('Por favor, completa todos los campos');
            return;
        }
        
        if (!this.validateEmail(email)) {
            alert('Por favor, ingresa un correo válido');
            return;
        }
        
        this.currentUser = { nombre, email };
        this.hasSpun = false;
        
        // Registrar login
        this.addUserToStorage(nombre, email);
        
        // Cambiar a pantalla de juego
        this.showGameScreen();
    }

    addUserToStorage(nombre, email) {
        const now = new Date().toLocaleString('es-ES');
        const usuarios = JSON.parse(localStorage.getItem('usuarios'));
        usuarios.push({ nombre, email, fechaLogin: now });
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    addGameToStorage(nombre, email, resultado1, resultado2, resultado3) {
        const now = new Date().toLocaleString('es-ES');
        const jugadas = JSON.parse(localStorage.getItem('jugadas'));
        jugadas.push({ nombre, email, resultado1, resultado2, resultado3, fechaJugada: now });
        localStorage.setItem('jugadas', JSON.stringify(jugadas));
    }

    exportToExcel() {
        const usuarios = JSON.parse(localStorage.getItem('usuarios'));
        const jugadas = JSON.parse(localStorage.getItem('jugadas'));
        
        const workbook = XLSX.utils.book_new();
        
        // Hoja Usuarios
        const usuariosData = [['Nombre', 'Correo', 'Fecha/Hora Login']];
        usuarios.forEach(u => usuariosData.push([u.nombre, u.email, u.fechaLogin]));
        const usuariosWS = XLSX.utils.aoa_to_sheet(usuariosData);
        XLSX.utils.book_append_sheet(workbook, usuariosWS, 'Usuarios');
        
        // Hoja Jugadas
        const jugadasData = [['Nombre', 'Correo', 'Resultado 1', 'Resultado 2', 'Resultado 3', 'Fecha/Hora Jugada']];
        jugadas.forEach(j => jugadasData.push([j.nombre, j.email, j.resultado1, j.resultado2, j.resultado3, j.fechaJugada]));
        const jugadasWS = XLSX.utils.aoa_to_sheet(jugadasData);
        XLSX.utils.book_append_sheet(workbook, jugadasWS, 'Jugadas');
        
        XLSX.writeFile(workbook, 'tragamonedas_datos.xlsx');
    }
    
    clearAllData() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('usuarios');
            localStorage.removeItem('jugadas');
            this.initializeStorage();
            alert('Todos los datos han sido eliminados.');
        }
    }

    showGameScreen() {
        this.loginScreen.classList.remove('active');
        this.gameScreen.classList.add('active');
        this.userNameSpan.textContent = `Bienvenido, ${this.currentUser.nombre}`;
        this.spinBtn.disabled = false;
        this.spinBtn.textContent = 'GIRAR';
        
        // Mostrar botones solo para administradores
        if (this.adminEmails.includes(this.currentUser.email)) {
            this.exportBtn.style.display = 'inline-block';
            this.clearBtn.style.display = 'inline-block';
        } else {
            this.exportBtn.style.display = 'none';
            this.clearBtn.style.display = 'none';
        }
    }

    showLoginScreen() {
        this.gameScreen.classList.remove('active');
        this.loginScreen.classList.add('active');
        this.loginForm.reset();
    }

    handleLogout() {
        this.currentUser = null;
        this.hasSpun = false;
        this.showLoginScreen();
    }

    getRandomText(reelIndex) {
        const reelTexts = this.texts[reelIndex];
        return reelTexts[Math.floor(Math.random() * reelTexts.length)];
    }

    handleSpin() {
        if (this.hasSpun) return;
        
        this.hasSpun = true;
        this.spinBtn.disabled = true;
        this.spinBtn.textContent = 'GIRANDO...';
        
        // Iniciar animación
        this.reels.forEach(reel => reel.classList.add('spinning'));
        
        // Animar textos durante el giro
        const intervals = this.reels.map((reel, index) => {
            return setInterval(() => {
                const strip = reel.querySelector('.reel-strip');
                strip.textContent = this.getRandomText(index);
            }, 100);
        });
        
        // Detener rodillos uno por uno
        setTimeout(() => this.stopReel(0, intervals[0]), 1000 + Math.random() * 1000);
        setTimeout(() => this.stopReel(1, intervals[1]), 1500 + Math.random() * 1000);
        setTimeout(() => this.stopReel(2, intervals[2]), 2000 + Math.random() * 1000);
    }

    stopReel(reelIndex, interval) {
        clearInterval(interval);
        const reel = this.reels[reelIndex];
        reel.classList.remove('spinning');
        
        // Texto final
        const strip = reel.querySelector('.reel-strip');
        const finalText = this.getRandomText(reelIndex);
        strip.textContent = finalText;
        
        // Verificar si todos terminaron
        const stillSpinning = this.reels.some(r => r.classList.contains('spinning'));
        if (!stillSpinning) {
            this.finishGame();
        }
    }

    finishGame() {
        const results = this.reels.map(reel => 
            reel.querySelector('.reel-strip').textContent
        );
        
        // Guardar jugada
        this.addGameToStorage(
            this.currentUser.nombre,
            this.currentUser.email,
            results[0],
            results[1],
            results[2]
        );
        
        this.spinBtn.textContent = 'YA JUGASTE';
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new SlotMachineApp();
});