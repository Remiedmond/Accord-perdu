/* Fichier: js/puzzle.js */

const Puzzles = {
  codeSaisi: "",
  codeSecret: "2612",

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
       if (Logic.fusesFixed < 3) {
         console.log("Pas de courant"); return;

        }
        else{ 
          document.getElementById('overlay-faders').classList.remove('hidden');
        }
        
        
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



/* === PUZZLE SIMON (IMAGE CLAVIER) === */

const SimonPuzzle = {
    // La séquence secrète basée sur tes noms de fichiers
    // Séquence vidéo : Vert, Bleu Foncé, Bleu Ciel, Vert
    secretSequence: ['green', 'darkblue', 'lightblue', 'green'], 
    
    playerInput: [],
    isPlayingDemo: false,
    isSolved: false,
    baseImage: "assets/img/keyboard_base.png", // Image par défaut

    init: function() {
        document.getElementById('overlay-simon').classList.remove('hidden');
        this.resetGame();
    },

    close: function() {
        document.getElementById('overlay-simon').classList.add('hidden');
    },

    resetGame: function() {
        this.playerInput = [];
        this.isPlayingDemo = false;
        document.getElementById('simon-status').innerText = "Appuie sur 'ÉCOUTER'";
        document.getElementById('simon-status').style.color = "#aaa";
        document.getElementById('simon-img').src = this.baseImage;
    },

    // 1. L'ordi joue la séquence
    startSequence: function() {
        if(this.isPlayingDemo || this.isSolved) return;
        
        this.playerInput = [];
        this.isPlayingDemo = true;
        document.getElementById('simon-status').innerText = "Regarde bien les touches...";

        let i = 0;
        const interval = setInterval(() => {
            if (i >= this.secretSequence.length) {
                clearInterval(interval);
                this.isPlayingDemo = false;
                document.getElementById('simon-status').innerText = "À toi de jouer !";
                document.getElementById('simon-status').style.color = "white";
                return;
            }
            this.flashKey(this.secretSequence[i]);
            i++;
        }, 1000); // 1 seconde entre chaque note
    },

    // Fonction qui change l'image pour simuler la lumière
    flashKey: function(colorName) {
        const img = document.getElementById('simon-img');
        
        // On change la source pour l'image colorée
        // Ex: assets/img/key_green.png
        img.src = `assets/img/key_${colorName}.png`;

        // SON (Optionnel)
        // new Audio(`assets/sounds/${colorName}.mp3`).play();

        // Après 500ms, on remet l'image vierge
        setTimeout(() => {
            img.src = this.baseImage;
        }, 500);
    },

    // 2. Quand le joueur clique sur une zone invisible
    playerClick: function(colorName) {
        if(this.isPlayingDemo || this.isSolved) return;
        
        if(document.getElementById('simon-status').innerText.includes("Appuie")) {
             this.flashKey(colorName); return; // Juste pour tester le son/image
        }

        // Feedback visuel (la touche s'allume quand on clique)
        this.flashKey(colorName);
        
        this.playerInput.push(colorName);

        // VÉRIFICATION
        const currentStep = this.playerInput.length - 1;
        
        if (this.playerInput[currentStep] !== this.secretSequence[currentStep]) {
            // ERREUR
            document.getElementById('simon-status').innerText = "Fausse note ! Recommence.";
            document.getElementById('simon-status').style.color = "#e74c3c";
            this.playerInput = [];
            
            // Petit effet de secousse
            anime({ targets: '.simon-container', translateX: [-10, 10, 0], duration: 300 });
        } 
        else {
            // Si la séquence est finie et correcte
            if (this.playerInput.length === this.secretSequence.length) {
                this.victory();
            }
        }
    },

    victory: function() {
        this.isSolved = true;
        document.getElementById('simon-status').innerText = "MÉLODIE CORRECTE !";
        document.getElementById('simon-status').style.color = "#2ecc71";

        setTimeout(() => {
            this.close(); 
            
            // Ouvre la grande modale de victoire
            const modalOverlay = document.getElementById('modal-overlay');
            const modalImg = document.getElementById('modal-img');
            const modalDesc = document.getElementById('modal-desc');

            // Utilise une image de victoire (ex: piano_ok.png ou une autre)
            modalImg.src = "assets/img/signal_ok.png"; 
            modalImg.style.display = "block";

            modalDesc.innerHTML = `
                <h2 style="color:#2ecc71">PARTITION DÉCHIFFRÉE</h2>
                <p>Tu as débloqué un nouvel indice !</p>
            `;
            
            modalOverlay.classList.remove('hidden');
        }, 1000);
    }
};