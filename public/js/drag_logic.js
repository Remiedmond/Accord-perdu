/* Fichier: js/drag_logic.js */

// Configuration pour Interact.js
interact('.draggable-item').draggable({
    inertia: true,
    modifiers: [
        interact.modifiers.restrictRect({
            restriction: '#scene-studio', // On ne peut pas sortir du studio
            endOnly: true
        })
    ],
    autoScroll: true,
    
    // Fonction qui bouge l'élément visuellement
    listeners: {
        move: dragMoveListener,
    }
});

// Configuration des Dropzones (Zones cibles)
interact('.dropzone').dropzone({
    accept: '.draggable-item', // Accepte les éléments draggable
    overlap: 0.50, // Il faut que l'objet soit à 50% dessus pour que ça marche

    // Quand un objet passe au-dessus
    ondragenter: function (event) {
        var draggableElement = event.relatedTarget;
        var dropzoneElement = event.target;

        // Feedback visuel (Zone devient verte)
        dropzoneElement.classList.add('dropzone-active');
    },

    // Quand on quitte la zone
    ondragleave: function (event) {
        event.target.classList.remove('dropzone-active');
    },

    // Quand on LÂCHE l'objet
    ondrop: function (event) {
        var draggableElement = event.relatedTarget;
        var dropzoneElement = event.target;

        // On vérifie si c'est le BON objet dans la BONNE case
        // On compare l'ID de l'objet (ex: drag-drums) avec le data-accept de la zone
        if (draggableElement.id === dropzoneElement.dataset.accept) {
            
            // 1. On "lock" l'objet : il n'est plus bougeable
            interact(draggableElement).draggable(false);
            
            // 2. On le place parfaitement au centre de la zone (Esthétique)
            // Note: Pour simplifier en Hackathon, on le cache et on remplit la zone
            draggableElement.style.display = 'none';
            dropzoneElement.style.background = "#2ecc71"; // Vert plein
            dropzoneElement.style.border = "2px solid #fff";
            dropzoneElement.innerText = "OK !";
            dropzoneElement.classList.remove('dropzone'); // On désactive la zone

            // 3. Petit son de succès (si tu as Howler.js configuré)
            // sons.clic.play(); 

            // 4. Vérifier si TOUT est fini
            checkVictory();
        } else {
            // Mauvaise case !
            dropzoneElement.classList.remove('dropzone-active');
            
            // Animation "Non non" (Rouge)
            anime({
                targets: dropzoneElement,
                backgroundColor: ['rgba(255,0,0,0.5)', 'rgba(0,0,0,0)'],
                duration: 500
            });
        }
    }
});

// Fonction standard Interact.js pour bouger les éléments (Ne pas toucher)
function dragMoveListener (event) {
    var target = event.target;
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

// Fonction de Victoire
function checkVictory() {
    // On compte combien de cases sont vertes (validées)
    // On cherche les éléments qui ont le style background vert
    // (Méthode simple pour le hackathon)
    let validated = 0;
    document.querySelectorAll('#scene-studio div').forEach(div => {
        if(div.innerText === "OK !") validated++;
    });

    if (validated === 3) {
        // VICTOIRE FINALE !
        setTimeout(() => {
            // On réutilise ta modale
            const modalOverlay = document.getElementById('modal-overlay');
            const modalDesc = document.getElementById('modal-desc');
            const modalImg = document.getElementById('modal-img');
            
            modalImg.style.display = 'none';
            modalDesc.innerHTML = `
                <h1 style="color:#f1c40f; font-size:3rem">VICTOIRE !</h1>
                <p>Le mix est parfait. Evan envoie le fichier à temps.</p>
                <p>Merci d'avoir joué !</p>
                <br>
                <button onclick="location.reload()" style="padding:10px; cursor:pointer">Rejouer</button>
            `;
            
            modalOverlay.classList.remove('hidden');
            
            // Ici : Lancer la musique finale si tu as le fichier !
        }, 500);
    }
}


/* --- LOGIQUE FUSIBLES (STUDIO) --- */
/* Fichier: js/drag_logic.js */

const Logic = {
    fusesFixed: 0,
    bootTimeout: null, // Variable pour stocker le timer (et pouvoir l'annuler)
    isSystemReady: false, // Devient TRUE quand le boot est fini
    isUnlocked: false,    // Devient TRUE quand le mot de passe est bon
    pcPassword: "EVAN",

    init: function() {
        // 1. Rendre les fusibles bougeables
        interact('.draggable-fuse').draggable({
            inertia: true,
            modifiers: [ interact.modifiers.restrictRect({ restriction: '#scene-studio' }) ],
            autoScroll: true,
            listeners: { move: dragMoveListener }
        });

        // 2. Zone de dépôt (Le compteur)
        interact('.dropzone-fuse').dropzone({
            accept: '.draggable-fuse',
            overlap: 0.50,
            ondrop: function (event) {
                // On appelle la fonction de placement
                Logic.placeFuse(event.relatedTarget);
            }
        });
    },

    // --- QUAND ON POSE UN FUSIBLE ---
    placeFuse: function(fuseElement) {
        // Trouver le premier slot vide (qui n'est pas vert)
        const slots = [
            document.getElementById('slot-1'), 
            document.getElementById('slot-2'), 
            document.getElementById('slot-3')
        ];
        
        let emptyIndex = -1;
        // On cherche une case qui n'a PAS la classe "active"
        for(let i=0; i<3; i++) {
            if (!slots[i].classList.contains('active')) {
                emptyIndex = i;
                break;
            }
        }

        // Si on a trouvé une place
        if (emptyIndex !== -1) {
            // Cacher le fusible
            fuseElement.style.display = 'none';
            // On note dans le fusible où il est rangé (1, 2 ou 3)
            fuseElement.setAttribute('data-slot', emptyIndex + 1);

            // Allumer le slot
            slots[emptyIndex].classList.add('active'); // Marque comme occupé
            slots[emptyIndex].style.background = "#0f0"; // Vert

            this.fusesFixed++;

            // Si on a les 3 -> On allume !
            if (this.fusesFixed === 3) {
                this.turnPowerOn();
            }
        }
    },

    // --- QUAND ON ENLÈVE UN FUSIBLE (CLICK) ---
    removeFuse: function(slotNum) {
        const slot = document.getElementById('slot-' + slotNum);
        
        // Si le slot est déjà éteint, on ne fait rien
        if (!slot.classList.contains('active')) return;

        // 1. On éteint le slot
        slot.classList.remove('active');
        slot.style.background = "#000"; // Retour au noir

        // 2. On retrouve le fusible qui était caché pour le réafficher
        const fuse = document.querySelector(`.draggable-fuse[data-slot="${slotNum}"]`);
        if (fuse) {
            fuse.style.display = 'flex';
            fuse.style.transform = 'translate(0px, 0px)';
            fuse.setAttribute('data-x', 0);
            fuse.setAttribute('data-y', 0);
            fuse.style.top = "60%"; // Par terre
            fuse.style.left = (20 + slotNum * 10) + "%"; // Un peu décalé
        }

        this.fusesFixed--;

        // 3. COUPURE DE COURANT !
        this.turnPowerOff();
    },

    // --- ALLUMAGE (Ton code adapté) ---
    turnPowerOn: function() {
        // Animation de la lumière
        anime({
            targets: '#studio-darkness',
            opacity: 0,
            duration: 1500,
            easing: 'linear',
            complete: () => {
                document.getElementById('studio-darkness').style.display = 'none';
            }
        });

        // Lancer le démarrage
        this.startComputerBoot();
    },

    // --- EXTINCTION (Nouveau) ---
    turnPowerOff: function() {
        console.log("Coupure de courant !");

        // 1. Arrêter le chargement en cours 
        if (this.bootTimeout) {
            clearTimeout(this.bootTimeout);
            this.bootTimeout = null;
        }

        // 2. Remettre le noir
        const darkness = document.getElementById('studio-darkness');
        darkness.style.display = 'block';
        anime({
            targets: '#studio-darkness',
            opacity: 1,
            duration: 200, 
            easing: 'linear'
        });

        // 3. Cacher les écrans
        document.getElementById('boot-overlay').classList.add('hidden');
        document.getElementById('tracks-rack').classList.add('hidden');
    
        document.querySelector('.loading-bar').style.width = "0%";
    },

    startComputerBoot: function() {
        const bootScreen = document.getElementById('boot-overlay');
        const loadingBar = document.querySelector('.loading-bar');

        bootScreen.classList.remove('hidden');
        setTimeout(() => { loadingBar.style.width = "100%"; }, 50);

            this.bootTimeout = setTimeout(() => {
            bootScreen.classList.add('hidden');
            this.isSystemReady = true; 
            
            document.getElementById('daw-screen').style.cursor = "pointer";
            
        }, 3500); // 3.5 secondes d'attente
    },
        // --- 1. OUVRIR L'ÉCRAN VERROUILLÉ ---
   

// --- 1. OUVRIR L'ÉCRAN VERROUILLÉ ---
    openLockedScreen: function() {
        
        if (this.isSystemReady && this.fusesFixed === 3 && !this.isUnlocked) {
            
            document.getElementById('locked-overlay').classList.remove('hidden');
            this.sreencache = true;
            
            // Focus sur le champ de mot de passe
            const passwordField = document.getElementById('pc-password');
            if(passwordField) {
                passwordField.value = "";
                passwordField.focus();
            }
        } 
        else if (this.fusesFixed < 3) {
          this.sreencache = false;
        }
    },

    closeLockedScreen: function() {
        document.getElementById('locked-overlay').classList.add('hidden');
    },

    // --- 3. VÉRIFIER LE MOT DE PASSE ---
    checkPassword: function() {
        const input = document.getElementById('pc-password');
        
        if (input.value.toUpperCase() === this.pcPassword) {
            // SUCCÈS
            this.isUnlocked = true;
            this.closeLockedScreen();
            
            // On lance l'interface de musique
            this.showMusicInterface();
            
        } else {
            // ERREUR
            // Animation de secousse sur le conteneur
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
        const rack = document.getElementById('tracks-rack');
        rack.classList.remove('hidden');
        
        anime({
            targets: '#tracks-rack',
            translateY: [100, 0], 
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutExpo'
        });
    }
};

// On lance l'initialisation
Logic.init();

// Fonction helper standard Interact.js
function dragMoveListener (event) {
    var target = event.target;
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}




