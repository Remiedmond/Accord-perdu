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
