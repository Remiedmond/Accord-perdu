const Game = {
    inventory: [],
    
    init: function() {
        console.log("Jeu initialisé");
        
        const uiLayer = document.getElementById('ui-layer');
        if(uiLayer) {
            uiLayer.style.opacity = '0'; 
        }
    },

    // === NOUVELLE FONCTION : DÉMARRAGE DU JEU ===
    // Cette fonction est appelée par le onclick="" ou onended="" de la vidéo
    startGame: function() {
        console.log("Lancement du jeu...");
        
        // 1. Gérer la vidéo
        const video = document.getElementById('intro-video');
        if (video) {
            video.pause(); // On s'assure que le son coupe
        }

        // 2. Afficher l'interface (Timer + Inventaire) avec une petite animation douce
        const uiLayer = document.getElementById('ui-layer');
        if(uiLayer) {
            anime({
                targets: uiLayer,
                opacity: [0, 1],
                duration: 1000,
                easing: 'linear'
            });
        }

        // 3. Lancer le Timer (si le script timer.js est bien chargé)
        if (typeof Timer !== 'undefined' && Timer.start) {
            Timer.start();
        }

        // 4. Utiliser ta fonction de transition pour aller vers la ruelle
        this.changeScene('scene-ruelle');
    },

    // Changer de salle avec une transition Anime.js
    changeScene: function(sceneId) {
        // La scène actuelle est celle qui a la classe 'active' (au début, c'est scene-accueil)
        const currentScene = document.querySelector('.scene.active');
        const nextScene = document.getElementById(sceneId);

        if (!currentScene || !nextScene) return; // Sécurité

        // Animation de sortie (Fade Out)
        anime({
            targets: currentScene,
            opacity: 0,
            duration: 800, // Un peu plus lent pour l'ambiance
            easing: 'easeInOutQuad',
            complete: () => {
                // Une fois invisible, on change les classes
                currentScene.classList.remove('active');
                currentScene.classList.add('hidden');
                
                // On prépare la prochaine scène
                nextScene.classList.remove('hidden');
                nextScene.classList.add('active');
                nextScene.style.opacity = 0; // On s'assure qu'elle est invisible avant le fade in
                
                // Animation d'entrée (Fade In)
                anime({
                    targets: nextScene,
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeInOutQuad'
                });
            }
        });
    },

    examine: function(objet) {
        if (objet === 'flyer') {
            anime({
                targets: '#item-flyer',
                scale: [1, 1.2, 1],
                duration: 300
            });

            // 2. Remplir la modale avec les infos du Flyer
            const modalImg = document.getElementById('modal-img');
            const modalDesc = document.getElementById('modal-desc');
            const overlay = document.getElementById('modal-overlay');

            // Attention au chemin : souvent "assets" avec un s, vérifie ton dossier
            modalImg.src = 'assets/img/indice_flyer_zoom.png'; 
            
            // Le texte qui s'affiche sous l'image
            modalDesc.innerHTML = "Un flyer froissé trouvé par terre.<br>On peut y lire une date griffonnée : <strong style='color:#f1c40f'>1204</strong>";

            // 3. Afficher la modale
            overlay.classList.remove('hidden');
            
            // Petite animation d'apparition de la modale
            anime({
                targets: '.modal-content',
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutBack'
            });
        }
    },

    closeModal: function() {
        // Cacher la modale
        document.getElementById('modal-overlay').classList.add('hidden');
    }
};

// Lancer l'init au chargement
window.onload = Game.init;