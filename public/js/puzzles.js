const Puzzles = {
    codeSaisi: "",
    codeSecret: "1204", // Le code donné par le papier

    // Fonction appelée quand on clique sur la zone rouge de la porte
    openDigicode: function() {
        console.log("Ouverture du digicode...");
        // On enlève la classe 'hidden' pour afficher l'écran noir par dessus
        document.getElementById('overlay-digicode').classList.remove('hidden');
    },

    // Fonction pour fermer (bouton X)
    closeDigicode: function() {
        document.getElementById('overlay-digicode').classList.add('hidden');
        this.codeSaisi = "";
        this.updateScreen();
    },

    // Quand on appuie sur les touches
    typeCode: function(chiffre) {
        if (this.codeSaisi.length < 4) {
            this.codeSaisi += chiffre;
            this.updateScreen();
        }
    },

    // Mettre à jour l'affichage "_ _ _ _"
    updateScreen: function() {
        document.getElementById('digicode-screen').innerText = this.codeSaisi;
    },

    // Bouton OK
    validateCode: function() {
        if (this.codeSaisi === this.codeSecret) {
            alert("Accès autorisé !"); // Petit feedback
            this.closeDigicode();
            
            // LA MAGIE : On change de scène vers le studio
            Game.changeScene('scene-studio'); 
        } else {
            alert("Code Erroné !");
            this.codeSaisi = "";
            this.updateScreen();
        }
    }
};
// --- GESTION DU DRAG & DROP (Pour le Studio) ---
// À mettre dans main.js ou ici. 
// Le principe : Les objets de l'inventaire sont "draggable"
// Les slots du PC sont des zones de "drop".

/* Exemple simplifié pour le Drag & Drop HTML5 natif */
/*
1. Sur les items de l'inventaire : draggable="true" et ondragstart="drag(event)"
2. Sur les zones cibles : ondrop="drop(event)" et ondragover="allowDrop(event)"
*/

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  // Vérifier si c'est le bon instrument pour la bonne case
  ev.target.appendChild(document.getElementById(data));
  
  // Vérifier victoire (si les 3 slots sont pleins)
}