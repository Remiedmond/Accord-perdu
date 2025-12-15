const Game = {
    inventory: [],
    
    init: function() {
        console.log("Jeu démarré");
        // Lancer la musique d'ambiance ici si besoin
    },

    // Changer de salle avec une transition Anime.js
    changeScene: function(sceneId) {
        // 1. Fondu au noir (optionnel) ou juste switch de classe
        const currentScene = document.querySelector('.scene.active');
        const nextScene = document.getElementById(sceneId);

        // Animation de sortie
        anime({
            targets: currentScene,
            opacity: 0,
            duration: 500,
            easing: 'easeInOutQuad',
            complete: () => {
                currentScene.classList.remove('active');
                currentScene.classList.add('hidden');
                
                nextScene.classList.remove('hidden');
                nextScene.classList.add('active');
                
                // Animation d'entrée
                anime({
                    targets: nextScene,
                    opacity: [0, 1],
                    duration: 500,
                    easing: 'easeInOutQuad'
                });
            }
        });
    },

   examine: function(objet) {
        if (objet === 'flyer') {
            // 1. Petit effet visuel sur l'objet au sol (feedback)
            anime({
                targets: '#item-flyer',
                scale: [1, 1.2, 1],
                duration: 300
            });

            // 2. Remplir la modale avec les infos du Flyer
            const modalImg = document.getElementById('modal-img');
            const modalDesc = document.getElementById('modal-desc');
            const overlay = document.getElementById('modal-overlay');

            // C'est ici que tu définis l'image "Zoomée" (je te la donne juste après)
            modalImg.src = 'asset/img/indice_flyer_zoom.png'; 
            
            // Le texte qui s'affiche sous l'image
            modalDesc.innerHTML = "Un flyer froissé trouvé par terre.<br>On peut y lire une date griffonnée : <strong style='color:yellow'>1204</strong>";

            // 3. Afficher la modale
            overlay.classList.remove('hidden');
        }
    },

    closeModal: function() {
        // Cacher la modale
        document.getElementById('modal-overlay').classList.add('hidden');
    }
};

window.onload = Game.init;