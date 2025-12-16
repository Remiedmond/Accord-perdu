/* Fichier: js/drag_logic.js */

const Logic = {
    // --- ÉTAT DU JEU (STUDIO) ---
    fusesFixed: 0,
    bootTimeout: null,
    isSystemReady: false,
    isUnlocked: false,
    pcPassword: "EVAN",
    musicTracksPlaced: 0,

    // --- INITIALISATION ---
    init: function() {
        console.log("⚡ Logic Studio Initialisé");
        this.setupFuses();
        this.setupMusicDrag();
    },

    // ============================================
    // 1. LOGIQUE DES FUSIBLES (COURANT)
    // ============================================
    setupFuses: function() {
        // Draggable Fusibles
        interact('.draggable-fuse').draggable({
            inertia: true,
            modifiers: [ interact.modifiers.restrictRect({ restriction: '#scene-studio' }) ],
            autoScroll: true,
            listeners: { move: this.dragMoveListener }
        });

        // Dropzone Compteur
        interact('.dropzone-fuse').dropzone({
            accept: '.draggable-fuse',
            overlap: 0.50,
            ondrop: (event) => {
                this.placeFuse(event.relatedTarget);
            }
        });
    },

    placeFuse: function(fuseElement) {
        // Trouver un slot vide
        const slots = [
            document.getElementById('slot-1'), 
            document.getElementById('slot-2'), 
            document.getElementById('slot-3')
        ];
        
        let emptyIndex = -1;
        for(let i=0; i<3; i++) {
            if (!slots[i].classList.contains('active')) {
                emptyIndex = i;
                break;
            }
        }

        if (emptyIndex !== -1) {
            fuseElement.style.display = 'none'; // Cache le fusible draggable
            fuseElement.setAttribute('data-slot', emptyIndex + 1);

            slots[emptyIndex].classList.add('active');
            slots[emptyIndex].style.background = "#0f0"; // Allume le slot

            this.fusesFixed++;
            if (this.fusesFixed === 3) {
                this.turnPowerOn();
            }
        }
    },

    removeFuse: function(slotNum) {
        const slot = document.getElementById('slot-' + slotNum);
        if (!slot.classList.contains('active')) return;

        // Reset slot
        slot.classList.remove('active');
        slot.style.background = "#000";

        // Réapparaître le fusible
        const fuse = document.querySelector(`.draggable-fuse[data-slot="${slotNum}"]`);
        if (fuse) {
            fuse.style.display = 'flex';
            // Reset position visuelle
            fuse.style.transform = 'translate(0px, 0px)';
            fuse.setAttribute('data-x', 0);
            fuse.setAttribute('data-y', 0);
            // Positionner au sol pour ne pas le perdre
            fuse.style.top = "70%"; 
            fuse.style.left = (20 + slotNum * 15) + "%"; 
        }

        this.fusesFixed--;
        this.turnPowerOff();
    },

    turnPowerOn: function() {
        // Anime l'éclairage
        anime({
            targets: '#studio-darkness',
            opacity: 0,
            duration: 1500,
            easing: 'linear',
            complete: () => {
                document.getElementById('studio-darkness').style.display = 'none';
                this.startComputerBoot();
            }
        });
    },

    turnPowerOff: function() {
        console.log("Coupure de courant !");
        
        // Reset system
        this.isSystemReady = false;
        if (this.bootTimeout) clearTimeout(this.bootTimeout);

        // Remettre le noir
        const darkness = document.getElementById('studio-darkness');
        darkness.style.display = 'block';
        anime({ targets: '#studio-darkness', opacity: 1, duration: 200, easing: 'linear' });

        // Cacher interface PC
        document.getElementById('boot-overlay').classList.add('hidden');
        document.getElementById('tracks-rack').classList.add('hidden');
        document.getElementById('locked-overlay').classList.add('hidden');
        document.querySelector('.loading-bar').style.width = "0%";
    },

    startComputerBoot: function() {
        const bootScreen = document.getElementById('boot-overlay');
        const loadingBar = document.querySelector('.loading-bar');

        bootScreen.classList.remove('hidden');
        // Animation barre
        setTimeout(() => { loadingBar.style.width = "100%"; }, 50);

        this.bootTimeout = setTimeout(() => {
            bootScreen.classList.add('hidden');
            this.isSystemReady = true;
            console.log("PC Démarré");
        }, 3500);
    },

    // ============================================
    // 2. LOGIQUE ORDINATEUR (PASSWORD)
    // ============================================
    openLockedScreen: function() {
        // On ne peut ouvrir que si courant ON et PC démarré
        if (this.isSystemReady && this.fusesFixed === 3) {
            // Si déjà déverrouillé, on ne montre plus l'écran de login, mais direct le DAW ?
            // Pour ce jeu, on considère que si c'est déverrouillé, le rack apparait déjà.
            // Mais si le joueur re-clique :
            if(!this.isUnlocked) {
                document.getElementById('locked-overlay').classList.remove('hidden');
                setTimeout(() => document.getElementById('pc-password').focus(), 100);
            } else {
                 // Feedback si déjà ouvert
                 console.log("Déjà déverrouillé");
            }
        } else {
            // Feedback visuel "Pas de courant" ?
            anime({
                targets: '#daw-screen',
                translateX: [0, -5, 5, 0],
                duration: 200
            });
        }
    },

    closeLockedScreen: function() {
        document.getElementById('locked-overlay').classList.add('hidden');
    },

    checkPassword: function() {
        const input = document.getElementById('pc-password');
        if (input.value.toUpperCase() === this.pcPassword) {
            this.isUnlocked = true;
            this.closeLockedScreen();
            this.showMusicInterface();
        } else {
            anime({
                targets: '.screen-container',
                translateX: [ -10, 10, -10, 10, 0 ],
                duration: 400
            });
            input.value = "";
            input.placeholder = "ERREUR";
        }
    },

    showMusicInterface: function() {
        // Faire apparaître le rack d'instruments
        const rack = document.getElementById('tracks-rack');
        rack.classList.remove('hidden');
        
        anime({
            targets: '#tracks-rack',
            translateY: [100, 0], 
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutExpo'
        });
        
        // Passer à l'objectif suivant dans Hints.js
        if(typeof HintSystem !== 'undefined') HintSystem.completeObjective('entrer-studio');
    },

    // ============================================
    // 3. LOGIQUE MUSIQUE (DRAG & DROP)
    // ============================================
    setupMusicDrag: function() {
        // Draggable Items
        interact('.draggable-item').draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: '#scene-studio',
                    endOnly: true
                })
            ],
            autoScroll: true,
            listeners: { move: this.dragMoveListener }
        });

        // Dropzones
        interact('.dropzone').dropzone({
            accept: '.draggable-item',
            overlap: 0.50,
            ondragenter: function (event) {
                event.target.classList.add('dropzone-active');
            },
            ondragleave: function (event) {
                event.target.classList.remove('dropzone-active');
            },
            ondrop: (event) => {
                this.handleMusicDrop(event.relatedTarget, event.target);
            }
        });
    },

    handleMusicDrop: function(draggableElement, dropzoneElement) {
        // Vérif ID (ex: id="drag-drums" va dans data-accept="drag-drums")
        if (draggableElement.id === dropzoneElement.dataset.accept) {
            
            // Lock
            interact(draggableElement).draggable(false);
            
            // Visuel
            draggableElement.style.display = 'none';
            dropzoneElement.style.background = "#2ecc71"; // Vert
            dropzoneElement.style.color = "#000";
            dropzoneElement.style.fontWeight = "bold";
            dropzoneElement.innerText = "TRACK OK";
            dropzoneElement.classList.remove('dropzone');

            this.musicTracksPlaced++;
            this.checkVictory();

        } else {
            // Erreur
            dropzoneElement.classList.remove('dropzone-active');
            anime({
                targets: dropzoneElement,
                backgroundColor: ['rgba(255,0,0,0.5)', 'rgba(0,0,0,0)'],
                duration: 500
            });
        }
    },

    checkVictory: function() {
        if (this.musicTracksPlaced === 3) {
            setTimeout(() => {
                if(typeof TimerSystem !== 'undefined') TimerSystem.stopTimer();
                
                const modalOverlay = document.getElementById('modal-overlay');
                const modalDesc = document.getElementById('modal-desc');
                const modalImg = document.getElementById('modal-img');
                
                modalImg.style.display = 'none';
                modalDesc.innerHTML = `
                    <h1 style="color:#f1c40f; font-size:3rem">VICTOIRE !</h1>
                    <p>Le mix est terminé. Evan a sauvé le morceau !</p>
                    <button onclick="location.reload()" style="padding:15px; margin-top:20px; cursor:pointer; background:#f1c40f; border:none; border-radius:5px; font-weight:bold;">Rejouer</button>
                `;
                modalOverlay.classList.remove('hidden');
                
                // Confettis ou autre effet ici
            }, 500);
        }
    },

    // Utilitaire mouvement Interact.js
    dragMoveListener: function(event) {
        var target = event.target;
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
};

// Démarrage
Logic.init();