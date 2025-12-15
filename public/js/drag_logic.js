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

let fusesFixed = 0; // Compteur

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
        // On cache le fusible qu'on vient de lâcher
        event.relatedTarget.style.display = 'none';
        
        // On allume une petite lumière sur le compteur (feedback)
        const slots = document.querySelectorAll('.slot-light');
        if(slots[fusesFixed]) slots[fusesFixed].style.background = "#0f0"; // Vert
        
        fusesFixed++;

        // Si on a les 3
        if (fusesFixed === 3) {
            turnPowerOn();
        }
    }
});

function turnPowerOn() {
    // 1. Son d'électricité (si tu as)
    // new Audio('asset/audio/startup.mp3').play();

    // 2. On enlève le noir (Lumière revient)
    anime({
        targets: '#studio-darkness',
        opacity: 0,
        duration: 1500,
        easing: 'linear',
        complete: () => {
            document.getElementById('studio-darkness').style.display = 'none';
            
            // 3. LANCEMENT DU DÉMARRAGE ORDI
            startComputerBoot();
        }
    });
}

function startComputerBoot() {
    const bootScreen = document.getElementById('boot-overlay');
    const loadingBar = document.querySelector('.loading-bar');

    // Affiche l'écran de boot
    bootScreen.classList.remove('hidden');

    // Lance l'animation de la barre de chargement (CSS width)
    // Petit délai pour que le navigateur prenne en compte l'affichage
    setTimeout(() => {
        loadingBar.style.width = "100%";
    }, 100);

    // 4. Une fois le chargement fini (3 secondes plus tard)
    setTimeout(() => {
        // On cache l'écran de boot
        bootScreen.classList.add('hidden');
        
        // On affiche ENFIN le rack de musique et l'écran interactif
        showMusicInterface();

    }, 3500); // 3.5 secondes d'attente
}

function showMusicInterface() {
    const rack = document.getElementById('tracks-rack');
    rack.classList.remove('hidden');
    
    // Animation d'entrée du rack (il monte du bas)
    anime({
        targets: '#tracks-rack',
        translateY: [100, 0], 
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo'
    });

    alert("Système opérationnel. Placez les pistes pour lancer le mix !");
}