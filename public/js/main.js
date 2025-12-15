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
            // 1. Feedback visuel (Animation Anime.js)
            anime({
                targets: '#item-flyer',
                scale: [1, 1.5, 0], // Grossit puis disparait
                duration: 500,
                easing: 'easeInOutQuad'
            });

            // 2. Afficher l'info au joueur
            // Plus tard, tu pourras faire une belle modale HTML. 
            // Pour l'instant, une alerte suffit pour avancer.
            setTimeout(() => {
                alert("Vous ramassez un flyer froissé...\n\nCONCOURS CE SOIR AVANT MINUIT !\nCode d'entrée du studio : 1204");
                
                // 3. Ajouter à l'inventaire visuel (optionnel)
                document.getElementById('inventory').innerHTML += '<div class="inv-item">Flyer</div>';
            }, 500);
        }
    }
};

window.onload = Game.init;