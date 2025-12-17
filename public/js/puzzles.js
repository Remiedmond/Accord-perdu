/* Fichier: js/puzzle.js */

const Puzzles = {
  codeSaisi: "",
  codeSecret: "1204",

  // Ouvre le digicode
  openDigicode: function () {
    document.getElementById("overlay-digicode").classList.remove("hidden");
  },

  // Ferme le digicode et remet à zéro
  closeDigicode: function () {
    document.getElementById("overlay-digicode").classList.add("hidden");
    this.resetCode();
  },

  // Fonction pour taper un chiffre
  typeCode: function (chiffre) {
    if (this.codeSaisi.length < 4) {
      this.codeSaisi += chiffre;
      this.updateScreen();
    }
  },

  // --- NOUVELLE FONCTION : Bouton "C" (Corriger) ---
  resetCode: function () {
    this.codeSaisi = "";
    this.updateScreen();
  },

  // Met à jour l'écran du digicode
  updateScreen: function () {
    // Affiche des tirets si vide, ou le code tapé
    const screen = document.getElementById("digicode-screen");
    screen.innerText = this.codeSaisi === "" ? "_ _ _ _" : this.codeSaisi;
  },

  // Validation du code avec la MODALE
  validateCode: function () {
    const modalOverlay = document.getElementById("modal-overlay");
    const modalDesc = document.getElementById("modal-desc");
    const modalImg = document.getElementById("modal-img");

    if (this.codeSaisi === this.codeSecret) {
      
      modalImg.style.display = "none"; 
      modalDesc.innerHTML =
        "<h2 style='color:#0f0'>ACCÈS AUTORISÉ</h2><p>Bienvenue au Studio.</p>";

      // 2. On affiche la modale
      modalOverlay.classList.remove("hidden");

      // 3. Après 2 secondes, on ferme tout et on change de salle
      setTimeout(() => {
        modalOverlay.classList.add("hidden"); // Ferme la modale
        this.closeDigicode(); // Ferme le digicode
        Game.changeScene("scene-studio"); // Change la scène !
      }, 1000);
    } else {
      // --- CAS 2 : ERREUR ---

      // 1. On secoue l'écran (Feedback visuel avec Anime.js)
      anime({
        targets: ".digicode-container",
        translateX: [{ value: -10 }, { value: 10 }, { value: 0 }],
        duration: 300,
      });

      // 2. On affiche la modale "Erreur"
      modalImg.style.display = "none"; // On cache l'image
      modalDesc.innerHTML =
        "<h2 style='color:red'>ERREUR</h2><p>Code incorrect.</p>";
      modalOverlay.classList.remove("hidden");

      // 3. On efface le code pour recommencer
      this.resetCode();
    }
  },
};




/* === PUZZLE FADERS (TABLE DE MIXAGE) === */

const FaderPuzzle = {
    // La solution attendue (Valeurs entre 0 et 100)
    // Astuce : Tu peux écrire ces chiffres sur un mur ou un post-it dans le jeu !
    solution: [75, 20, 100, 50], 
    tolerance: 10, // Marge d'erreur autorisée (ex: si cible 80, 75 à 85 est accepté)
    isSolved: false,

    init: function() {
        // Optionnel : Vérifier si courant allumé
        // if (Logic.fusesFixed < 3) { console.log("Pas de courant"); return; }
        
        document.getElementById('overlay-faders').classList.remove('hidden');
    },

    close: function() {
        document.getElementById('overlay-faders').classList.add('hidden');
    },

    check: function() {
        if(this.isSolved) return;

        let isCorrect = true;
        
        // On vérifie les 4 faders
        for (let i = 1; i <= 4; i++) {
            let val = parseInt(document.getElementById('fader-' + i).value);
            let target = this.solution[i-1];

            // Si la valeur est trop loin de la cible
            if (val < target - this.tolerance || val > target + this.tolerance) {
                isCorrect = false;
            }
        }

        const status = document.getElementById('fader-status');
        
        if (isCorrect) {
            // VICTOIRE
            this.isSolved = true;
            status.innerHTML = "RÉGLAGES PARFAITS !";
            status.style.color = "#2ecc71";
            
            // Son de succès
            // new Audio('assets/sounds/success.mp3').play();

            setTimeout(() => {
                alert("Bravo ! Tu as récupéré... ");
                // Exemple : Ajouter un objet à l'inventaire
                // Game.addToInventory('cle-usb'); 
                this.close();
            }, 1000);

        } else {
            // ÉCHEC
            status.innerHTML = "MAUVAIS RÉGLAGES...";
            status.style.color = "#e74c3c";
            
            // Petite secousse de la fenêtre
            anime({
                targets: '.fader-container',
                translateX: [-5, 5, -5, 5, 0],
                duration: 400
            });
        }
    }
};