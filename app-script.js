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
        this.setupPhoneValidation();
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

    setupPhoneValidation() {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        
        phoneInputs.forEach(input => {
            input.addEventListener('input', function(e) {
                // Remover cualquier carácter que no sea número
                this.value = this.value.replace(/[^0-9]/g, '');
                
                // Limitar a 10 dígitos
                if (this.value.length > 10) {
                    this.value = this.value.slice(0, 10);
                }
            });
            
            // Validación adicional en tiempo real
            input.addEventListener('blur', function(e) {
                if (this.value.length !== 10 && this.value.length > 0) {
                    this.setCustomValidity('El número de teléfono debe tener exactamente 10 dígitos');
                } else {
                    this.setCustomValidity('');
                }
            });
        });
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

    validatePhone(phone) {
        // Validar que sea exactamente 10 dígitos
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    }

    handleRegistration(e) {
        e.preventDefault();
        
        const competitor1 = {
            nombre: document.getElementById('nombre1').value.trim(),
            email: document.getElementById('email1').value.trim(),
            telefono: document.getElementById('telefono1').value.trim()
        };
        
        const competitor2 = {
            nombre: document.getElementById('nombre2').value.trim(),
            email: document.getElementById('email2').value.trim(),
            telefono: document.getElementById('telefono2').value.trim()
        };
        
        // Validar que todos los campos estén completos
        if (!competitor1.nombre || !competitor1.email || !competitor1.telefono || 
            !competitor2.nombre || !competitor2.email || !competitor2.telefono) {
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
        
        // Validar teléfonos
        if (!this.validatePhone(competitor1.telefono)) {
            alert('Por favor, ingresa un número de teléfono válido de 10 dígitos para el Competidor 1');
            return;
        }
        
        if (!this.validatePhone(competitor2.telefono)) {
            alert('Por favor, ingresa un número de teléfono válido de 10 dígitos para el Competidor 2');
            return;
        }
        
        // Validar que no sean el mismo email
        if (competitor1.email === competitor2.email) {
            alert('Los competidores deben tener correos electrónicos diferentes');
            return;
        }
        
        // Validar que no sean el mismo teléfono
        if (competitor1.telefono === competitor2.telefono) {
            alert('Los competidores deben tener números de teléfono diferentes');
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
        const competidores = JSON.parse(localStorage.getItem('competidores')) || [];
        
        const competenciaId = Date.now();
        
        // Agregar entrada de competencia con ambos competidores
        const nuevaCompetencia = {
            competidor1: {
                nombre: competitor1.nombre,
                email: competitor1.email,
                telefono: competitor1.telefono
            },
            competidor2: {
                nombre: competitor2.nombre,
                email: competitor2.email,
                telefono: competitor2.telefono
            },
            fechaRegistro: now,
            competenciaId: competenciaId
        };
        
        competidores.push(nuevaCompetencia);
        localStorage.setItem('competidores', JSON.stringify(competidores));
        
        // Guardar el ID en currentCompetitors para usarlo después
        this.currentCompetitors.competenciaId = competenciaId;
        
        console.log('Competidores guardados:', nuevaCompetencia);
    }

    addGameToStorage(resultado1, resultado2, resultado3) {
        const now = new Date().toLocaleString('es-ES');
        const jugadas = JSON.parse(localStorage.getItem('jugadas')) || [];
        
        const nuevaJugada = {
            competidor1: {
                nombre: this.currentCompetitors.competitor1.nombre,
                email: this.currentCompetitors.competitor1.email,
                telefono: this.currentCompetitors.competitor1.telefono
            },
            competidor2: {
                nombre: this.currentCompetitors.competitor2.nombre,
                email: this.currentCompetitors.competitor2.email,
                telefono: this.currentCompetitors.competitor2.telefono
            },
            resultado1,
            resultado2,
            resultado3,
            fechaJugada: now,
            competenciaId: this.currentCompetitors.competenciaId || Date.now()
        };
        
        jugadas.push(nuevaJugada);
        localStorage.setItem('jugadas', JSON.stringify(jugadas));
        
        console.log('Jugada guardada:', nuevaJugada);
    }

    exportToExcel() {
        console.log('Iniciando exportación...');
        
        // Verificar si XLSX está disponible
        console.log('Verificando XLSX:', typeof XLSX);
        if (typeof XLSX === 'undefined') {
            console.error('XLSX no está disponible');
            alert('Error: La librería de Excel no se pudo cargar. Por favor, recarga la página e intenta de nuevo.');
            return;
        }

        const competidores = JSON.parse(localStorage.getItem('competidores')) || [];
        const jugadas = JSON.parse(localStorage.getItem('jugadas')) || [];
        
        console.log('Datos obtenidos:');
        console.log('- Competidores:', competidores);
        console.log('- Jugadas:', jugadas);
        
        // Verificar si hay datos para exportar
        if (competidores.length === 0 && jugadas.length === 0) {
            alert('No hay datos para exportar. Registra algunos competidores y juega primero.');
            return;
        }
        
        try {
            console.log('Creando workbook...');
            const workbook = XLSX.utils.book_new();
            
            // Hoja Competidores
            console.log('Preparando datos de competidores...');
            const competidoresData = [['Competidor 1 - Nombre', 'Competidor 1 - Email', 'Competidor 1 - Teléfono', 'Competidor 2 - Nombre', 'Competidor 2 - Email', 'Competidor 2 - Teléfono', 'Fecha/Hora Registro', 'ID Competencia']];
            
            competidores.forEach((c, index) => {
                console.log(`Procesando competidor ${index + 1}:`, c);
                
                // Verificar estructura de datos
                if (!c.competidor1 || !c.competidor2) {
                    console.warn(`Estructura de datos incorrecta en competidor ${index + 1}:`, c);
                    return; // Saltar este registro
                }
                
                competidoresData.push([
                    c.competidor1.nombre || '', 
                    c.competidor1.email || '', 
                    c.competidor1.telefono || '', 
                    c.competidor2.nombre || '', 
                    c.competidor2.email || '', 
                    c.competidor2.telefono || '', 
                    c.fechaRegistro || '',
                    c.competenciaId || ''
                ]);
            });
            
            console.log('Datos finales de competidores:', competidoresData);
            console.log('Creando hoja de competidores...');
            const competidoresWS = XLSX.utils.aoa_to_sheet(competidoresData);
            XLSX.utils.book_append_sheet(workbook, competidoresWS, 'Competidores');
            
            // Hoja Jugadas
            console.log('Preparando datos de jugadas...');
            const jugadasData = [['Competidor 1 - Nombre', 'Competidor 1 - Email', 'Competidor 1 - Teléfono', 'Competidor 2 - Nombre', 'Competidor 2 - Email', 'Competidor 2 - Teléfono', 'Resultado 1', 'Resultado 2', 'Resultado 3', 'Fecha/Hora Jugada', 'ID Competencia']];
            
            jugadas.forEach((j, index) => {
                console.log(`Procesando jugada ${index + 1}:`, j);
                
                // Verificar estructura de datos
                if (!j.competidor1 || !j.competidor2) {
                    console.warn(`Estructura de datos incorrecta en jugada ${index + 1}:`, j);
                    return; // Saltar este registro
                }
                
                jugadasData.push([
                    j.competidor1.nombre || '', 
                    j.competidor1.email || '', 
                    j.competidor1.telefono || '', 
                    j.competidor2.nombre || '', 
                    j.competidor2.email || '', 
                    j.competidor2.telefono || '', 
                    j.resultado1 || '', 
                    j.resultado2 || '', 
                    j.resultado3 || '', 
                    j.fechaJugada || '',
                    j.competenciaId || ''
                ]);
            });
            
            console.log('Datos finales de jugadas:', jugadasData);
            console.log('Creando hoja de jugadas...');
            const jugadasWS = XLSX.utils.aoa_to_sheet(jugadasData);
            XLSX.utils.book_append_sheet(workbook, jugadasWS, 'Jugadas');
            
            // Generar nombre de archivo con timestamp
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const filename = `tragamonedas_competidores_${timestamp}.xlsx`;
            
            console.log('Escribiendo archivo:', filename);
            XLSX.writeFile(workbook, filename);
            
            console.log('Excel exportado exitosamente:', filename);
            alert('Excel exportado exitosamente: ' + filename);
            
        } catch (error) {
            console.error('Error detallado al exportar Excel:', error);
            console.error('Stack trace:', error.stack);
            
            // Fallback: exportar como CSV
            this.exportAsCSV();
        }
    }

    exportAsCSV() {
        console.log('Iniciando exportación de respaldo como CSV...');
        
        try {
            const competidores = JSON.parse(localStorage.getItem('competidores')) || [];
            const jugadas = JSON.parse(localStorage.getItem('jugadas')) || [];
            
            let csvContent = '';
            
            // CSV de Competidores
            csvContent += 'COMPETIDORES\n';
            csvContent += 'Competidor 1 - Nombre,Competidor 1 - Email,Competidor 1 - Teléfono,Competidor 2 - Nombre,Competidor 2 - Email,Competidor 2 - Teléfono,Fecha/Hora Registro,ID Competencia\n';
            
            competidores.forEach(c => {
                csvContent += `"${c.competidor1?.nombre || ''}","${c.competidor1?.email || ''}","${c.competidor1?.telefono || ''}","${c.competidor2?.nombre || ''}","${c.competidor2?.email || ''}","${c.competidor2?.telefono || ''}","${c.fechaRegistro || '"}","${c.competenciaId || '"}"\n`;
            });
            
            csvContent += '\nJUGADAS\n';
            csvContent += 'Competidor 1 - Nombre,Competidor 1 - Email,Competidor 1 - Teléfono,Competidor 2 - Nombre,Competidor 2 - Email,Competidor 2 - Teléfono,Resultado 1,Resultado 2,Resultado 3,Fecha/Hora Jugada,ID Competencia\n';
            
            jugadas.forEach(j => {
                csvContent += `"${j.competidor1?.nombre || ''}","${j.competidor1?.email || ''}","${j.competidor1?.telefono || ''}","${j.competidor2?.nombre || ''}","${j.competidor2?.email || ''}","${j.competidor2?.telefono || ''}","${j.resultado1 || ''}","${j.resultado2 || ''}","${j.resultado3 || ''}","${j.fechaJugada || '"}","${j.competenciaId || '"}"\n`;
            });
            
            // Crear y descargar el archivo CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
            link.setAttribute('download', `tragamonedas_competidores_${timestamp}.csv`);
            
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('CSV exportado exitosamente como respaldo');
            alert('Se exportó como CSV debido a un problema con Excel. El archivo contiene toda la información.');
            
        } catch (csvError) {
            console.error('Error al exportar CSV de respaldo:', csvError);
            alert('Error al exportar los datos. Por favor, contacta al administrador.');
        }
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
