class SlotMachineApp {
    constructor() {
        this.currentCompetitors = null;
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
        this.competitor1Name = document.getElementById('competitor1-name');
        this.competitor2Name = document.getElementById('competitor2-name');
        this.exportBtn = document.getElementById('export-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.newCompetitionBtn = document.getElementById('new-competition-btn');
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
        this.loginForm.addEventListener('submit', (e) => this.handleRegistration(e));
        this.newCompetitionBtn.addEventListener('click', () => this.handleNewCompetition());
        this.exportBtn.addEventListener('click', () => this.exportToExcel());
        this.clearBtn.addEventListener('click', () => this.clearAllData());
        this.spinBtn.addEventListener('click', () => this.handleSpin());
    }

    initializeStorage() {
        if (!localStorage.getItem('competidores')) {
            localStorage.setItem('competidores', JSON.stringify([]));
        }
        if (!localStorage.getItem('jugadas')) {
            localStorage.setItem('jugadas', JSON.stringify([]));
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    handleRegistration(e) {
        e.preventDefault();
        
        const competitor1 = {
            nombre: document.getElementById('nombre1').value.trim(),
            email: document.getElementById('email1').value.trim()
        };
        
        const competitor2 = {
            nombre: document.getElementById('nombre2').value.trim(),
            email: document.getElementById('email2').value.trim()
        };
        
        // Validar que todos los campos estén completos
        if (!competitor1.nombre || !competitor1.email || !competitor2.nombre || !competitor2.email) {
            alert('Por favor, completa todos los campos para ambos competidores');
            return;
        }
        
        // Validar emails
        if (!this.validateEmail(competitor1.email)) {
            alert('Por favor, ingresa un correo válido para el Competidor 1');
            return;
        }
        
        if (!this.validateEmail(competitor2.email)) {
            alert('Por favor, ingresa un correo válido para el Competidor 2');
            return;
        }
        
        // Validar que no sean el mismo email
        if (competitor1.email === competitor2.email) {
            alert('Los competidores deben tener correos electrónicos diferentes');
            return;
        }
        
        this.currentCompetitors = {
            competitor1,
            competitor2
        };
        this.hasSpun = false;
        
        // Registrar ambos competidores
        this.addCompetitorsToStorage(competitor1, competitor2);
        
        // Cambiar a pantalla de juego
        this.showGameScreen();
    }

    addCompetitorsToStorage(competitor1, competitor2) {
        const now = new Date().toLocaleString('es-ES');
        const competidores = JSON.parse(localStorage.getItem('competidores'));
        
        // Agregar entrada de competencia con ambos competidores
        competidores.push({
            competidor1: {
                nombre: competitor1.nombre,
                email: competitor1.email
            },
            competidor2: {
                nombre: competitor2.nombre,
                email: competitor2.email
            },
            fechaRegistro: now,
            competenciaId: Date.now() // ID único para la competencia
        });
        
        localStorage.setItem('competidores', JSON.stringify(competidores));
    }

    addGameToStorage(resultado1, resultado2, resultado3) {
        const now = new Date().toLocaleString('es-ES');
        const jugadas = JSON.parse(localStorage.getItem('jugadas'));
        
        jugadas.push({
            competidor1: {
                nombre: this.currentCompetitors.competitor1.nombre,
                email: this.currentCompetitors.competitor1.email
            },
            competidor2: {
                nombre: this.currentCompetitors.competitor2.nombre,
                email: this.currentCompetitors.competitor2.email
            },
            resultado1,
            resultado2,
            resultado3,
            fechaJugada: now,
            competenciaId: this.currentCompetitors.competenciaId || Date.now()
        });
        
        localStorage.setItem('jugadas', JSON.stringify(jugadas));
    }

    exportToExcel() {
        const competidores = JSON.parse(localStorage.getItem('competidores'));
        const jugadas = JSON.parse(localStorage.getItem('jugadas'));
        
        const workbook = XLSX.utils.book_new();
        
        // Hoja Competidores
        const competidoresData = [['Competidor 1 - Nombre', 'Competidor 1 - Email', 'Competidor 2 - Nombre', 'Competidor 2 - Email', 'Fecha/Hora Registro', 'ID Competencia']];
        competidores.forEach(c => competidoresData.push([
            c.competidor1.nombre, 
            c.competidor1.email, 
            c.competidor2.nombre, 
            c.competidor2.email, 
            c.fechaRegistro,
            c.competenciaId
        ]));
        const competidoresWS = XLSX.utils.aoa_to_sheet(competidoresData);
        XLSX.utils.book_append_sheet(workbook, competidoresWS, 'Competidores');
        
        // Hoja Jugadas
        const jugadasData = [['Competidor 1 - Nombre', 'Competidor 1 - Email', 'Competidor 2 - Nombre', 'Competidor 2 - Email', 'Resultado 1', 'Resultado 2', 'Resultado 3', 'Fecha/Hora Jugada', 'ID Competencia']];
        jugadas.forEach(j => jugadasData.push([
            j.competidor1.nombre, 
            j.competidor1.email, 
            j.competidor2.nombre, 
            j.competidor2.email, 
            j.resultado1, 
            j.resultado2, 
            j.resultado3, 
            j.fechaJugada,
            j.competenciaId
        ]));
        const jugadasWS = XLSX.utils.aoa_to_sheet(jugadasData);
        XLSX.utils.book_append_sheet(workbook, jugadasWS, 'Jugadas');
        
        XLSX.writeFile(workbook, 'tragamonedas_competidores.xlsx');
    }
    
    clearAllData() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('competidores');
            localStorage.removeItem('jugadas');
            this.initializeStorage();
            alert('Todos los datos han sido eliminados.');
        }
    }

    showGameScreen() {
        this.loginScreen.classList.remove('active');
        this.gameScreen.classList.add('active');
        
        // Mostrar nombres de los competidores
        this.competitor1Name.textContent = this.currentCompetitors.competitor1.nombre;
        this.competitor2Name.textContent = this.currentCompetitors.competitor2.nombre;
        
        this.spinBtn.disabled = false;
        this.spinBtn.textContent = 'GIRAR';
        
        // Verificar si alguno de los competidores es admin para mostrar botones
        const isAdmin = this.adminEmails.includes(this.currentCompetitors.competitor1.email) || 
                       this.adminEmails.includes(this.currentCompetitors.competitor2.email);
        
        if (isAdmin) {
            this.exportBtn.style.display = 'inline-block';
            this.clearBtn.style.display = 'inline-block';
        } else {
            this.exportBtn.style.display = 'none';
            this.clearBtn.style.display = 'none';
        }
        
        // El botón "Nueva Competencia" siempre visible
        this.newCompetitionBtn.style.display = 'inline-block';
    }

    showLoginScreen() {
        this.gameScreen.classList.remove('active');
        this.loginScreen.classList.add('active');
        this.loginForm.reset();
    }

    handleNewCompetition() {
        this.currentCompetitors = null;
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
        
        // Guardar jugada con ambos competidores
        this.addGameToStorage(results[0], results[1], results[2]);
        
        this.spinBtn.textContent = 'YA JUGASTE - NUEVA COMPETENCIA';
        this.spinBtn.onclick = () => this.handleNewCompetition();
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new SlotMachineApp();
});
