/* ======== PUZZLES CORRIGÉS - VERSION FINALE COMPLÈTE ======== */

const Puzzles = {
  codeSaisi: "",
  codeSecret: "2612",

  openDigicode: function () {
    document.getElementById("overlay-digicode").classList.remove("hidden");
  },

  closeDigicode: function () {
    document.getElementById("overlay-digicode").classList.add("hidden");
    this.resetCode();
  },

  typeCode: function (chiffre) {
    if (this.codeSaisi.length < 4) {
      this.codeSaisi += chiffre;
      this.updateScreen();
    }
  },

  resetCode: function () {
    this.codeSaisi = "";
    this.updateScreen();
  },

  updateScreen: function () {
    const screen = document.getElementById("digicode-screen");
    screen.innerText = this.codeSaisi === "" ? "_ _ _ _" : this.codeSaisi;
  },

  validateCode: function () {
    const modalOverlay = document.getElementById("modal-overlay");
    const modalDesc = document.getElementById("modal-desc");
    const modalImg = document.getElementById("modal-img");

    if (this.codeSaisi === this.codeSecret) {
      modalImg.style.display = "none";
      modalDesc.innerHTML =
        "<h2 style='color:#0f0'>ACCÈS AUTORISÉ</h2><p>Bienvenue au Studio.</p>";
      modalOverlay.classList.remove("hidden");

      if (typeof HintSystem !== "undefined") {
        HintSystem.completeObjective("entrer-studio");
      }

      setTimeout(() => {
        modalOverlay.classList.add("hidden");
        this.closeDigicode();
        Game.changeScene("scene-studio");

        // Pensée en entrant dans le studio
        setTimeout(() => {
          if (typeof GameState !== "undefined") {
            GameState.showThought(
              "Il fait sombre ici, je devrais rallumer le courant."
            );
          }
        }, 1000);
      }, 1000);
    } else {
      anime({
        targets: ".digicode-container",
        translateX: [{ value: -10 }, { value: 10 }, { value: 0 }],
        duration: 300,
      });
      modalImg.style.display = "none";
      modalDesc.innerHTML =
        "<h2 style='color:red'>ERREUR</h2><p>Code incorrect.</p>";
      modalOverlay.classList.remove("hidden");
      this.resetCode();
    }
  },
};

/* ======== PUZZLE PHASE (ÉGALISATION) ======== */
const PhasePuzzle = {
  init: function () {
    // Vérifier l'ordre
    if (
      typeof GameState !== "undefined" &&
      !GameState.canAccessPuzzle("phase")
    ) {
      GameState.showNotYetMessage();
      return;
    }

    console.log("OUVERTURE DU PUZZLE !");
    const overlay = document.getElementById("overlay-phase");
    if (overlay) {
      overlay.classList.remove("hidden");
    }

    this.canvas = document.getElementById("phaseCanvas");
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
      this.playerPhase = 180;
      this.offset = 0;
      this.isSolved = false;
      this.animate();
    }
  },

  close: function () {
    document.getElementById("overlay-phase").classList.add("hidden");
    if (this.animationId) cancelAnimationFrame(this.animationId);
  },

  updateVal: function (val) {
    if (this.isSolved) return;
    this.playerPhase = parseInt(val);
    this.checkWin();
  },

  animate: function () {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, 600, 300);
    this.offset += 0.1;

    this.drawWave("rgba(255, 50, 50, 0.5)", 0);
    let rad = (this.playerPhase * Math.PI) / 180;
    this.drawWave("#0f0", rad);

    this.animationId = requestAnimationFrame(() => this.animate());
  },

  drawWave: function (color, shift) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    for (let x = 0; x < 600; x++) {
      const y = 150 + Math.sin(x * 0.05 + this.offset + shift) * 50;
      if (x === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
  },

  checkWin: function () {
    if (this.playerPhase < 15 || this.playerPhase > 345) {
      if (!this.isSolved) {
        this.isSolved = true;

        const status = document.getElementById("phase-status");
        status.innerText = "SYNCHRONISÉ !";
        status.style.color = "#2ecc71";

        setTimeout(() => {
          this.close();

          // ⭐ RÉCOMPENSE : Note DO
          if (typeof GameState !== "undefined") {
            GameState.addNote("do");
          }

          // Compléter l'objectif
          if (typeof HintSystem !== "undefined") {
            HintSystem.completeObjective("egaliser-pistes");
          }

          // Pensée
          if (typeof GameState !== "undefined") {
            GameState.showThought(
              "J'ai les quotas, plus qu'à se pencher sur la table de mixage."
            );
          }

          // Modale
          const modalOverlay = document.getElementById("modal-overlay");
          const modalImg = document.getElementById("modal-img");
          const modalDesc = document.getElementById("modal-desc");

          modalImg.src = "assets/img/instructions volume.png";
          modalImg.style.display = "block";
          modalImg.style.maxWidth = "100%";

          modalDesc.innerHTML = `
            <h2 style="color:#2ecc71; margin-top:0;">SIGNAL RÉTABLI</h2>
            <p>L'interférence est supprimée.</p>
            <p>✨ Note <strong>DO</strong> obtenue !</p>
          `;

          modalOverlay.classList.remove("hidden");
        }, 1000);
      }
    }
  },
};

/* ======== PUZZLE FADERS (TABLE DE MIXAGE) ======== */
const FaderPuzzle = {
  solution: [75, 20, 100, 50],
  tolerance: 10,
  isSolved: false,

  init: function () {
    // Vérifier l'ordre
    if (
      typeof GameState !== "undefined" &&
      !GameState.canAccessPuzzle("faders")
    ) {
      GameState.showNotYetMessage();
      return;
    }

    if (typeof Logic !== "undefined" && Logic.fusesFixed < 3) {
      console.log("Pas de courant");
      if (typeof GameState !== "undefined") {
        GameState.showThought("Pas de courant pour l'instant.");
      }
      return;
    }

    document.getElementById("overlay-faders").classList.remove("hidden");
  },

  close: function () {
    document.getElementById("overlay-faders").classList.add("hidden");
  },

  check: function () {
    if (this.isSolved) return;

    let isCorrect = true;

    for (let i = 1; i <= 4; i++) {
      let val = parseInt(document.getElementById("fader-" + i).value);
      let target = this.solution[i - 1];

      if (val < target - this.tolerance || val > target + this.tolerance) {
        isCorrect = false;
      }
    }

    const status = document.getElementById("fader-status");

    if (isCorrect) {
      this.isSolved = true;
      status.innerHTML = "RÉGLAGES PARFAITS !";
      status.style.color = "#2ecc71";

      setTimeout(() => {
        this.close();

        // ⭐ RÉCOMPENSE : Note SOL
        if (typeof GameState !== "undefined") {
          GameState.addNote("sol");
        }

        // Compléter l'objectif
        if (typeof HintSystem !== "undefined") {
          HintSystem.completeObjective("regler-niveaux");
        }

        // Pensée
        if (typeof GameState !== "undefined") {
          GameState.showThought("Je devrais ajouter un peu de piano..");
        }
      }, 1000);
    } else {
      status.innerHTML = "MAUVAIS RÉGLAGES...";
      status.style.color = "#e74c3c";

      if (typeof anime !== "undefined") {
        anime({
          targets: ".fader-container",
          translateX: [-5, 5, -5, 5, 0],
          duration: 400,
        });
      }
    }
  },
};

/* ======== PUZZLE SIMON ======== */
const SimonPuzzle = {
  secretSequence: ["green", "darkblue", "lightblue", "green"],
  playerInput: [],
  isPlayingDemo: false,
  isSolved: false,
  baseImage: "assets/img/keyboard_base.png",

  init: function () {
    // Vérifier l'ordre
    if (
      typeof GameState !== "undefined" &&
      !GameState.canAccessPuzzle("simon")
    ) {
      GameState.showNotYetMessage();
      return;
    }

    document.getElementById("overlay-simon").classList.remove("hidden");
    this.resetGame();
  },

  close: function () {
    document.getElementById("overlay-simon").classList.add("hidden");
  },

  resetGame: function () {
    this.playerInput = [];
    this.isPlayingDemo = false;
    document.getElementById("simon-status").innerText = "Appuie sur 'ÉCOUTER'";
    document.getElementById("simon-status").style.color = "#aaa";
    document.getElementById("simon-img").src = this.baseImage;
  },

  startSequence: function () {
    if (this.isPlayingDemo || this.isSolved) return;

    this.playerInput = [];
    this.isPlayingDemo = true;
    document.getElementById("simon-status").innerText =
      "Regarde bien les touches...";

    let i = 0;
    const interval = setInterval(() => {
      if (i >= this.secretSequence.length) {
        clearInterval(interval);
        this.isPlayingDemo = false;
        document.getElementById("simon-status").innerText = "À toi de jouer !";
        document.getElementById("simon-status").style.color = "white";
        return;
      }
      this.flashKey(this.secretSequence[i]);
      i++;
    }, 1000);
  },

  flashKey: function (colorName) {
    const img = document.getElementById("simon-img");
    img.src = `assets/img/key_${colorName}.png`;

    setTimeout(() => {
      img.src = this.baseImage;
    }, 500);
  },

  playerClick: function (colorName) {
    if (this.isPlayingDemo || this.isSolved) return;

    if (document.getElementById("simon-status").innerText.includes("Appuie")) {
      this.flashKey(colorName);
      return;
    }

    this.flashKey(colorName);
    this.playerInput.push(colorName);

    const currentStep = this.playerInput.length - 1;

    if (this.playerInput[currentStep] !== this.secretSequence[currentStep]) {
      document.getElementById("simon-status").innerText =
        "Fausse note ! Recommence.";
      document.getElementById("simon-status").style.color = "#e74c3c";
      this.playerInput = [];

      if (typeof anime !== "undefined") {
        anime({
          targets: ".simon-container",
          translateX: [-10, 10, 0],
          duration: 300,
        });
      }
    } else {
      if (this.playerInput.length === this.secretSequence.length) {
        this.victory();
      }
    }
  },

  victory: function () {
    this.isSolved = true;
    document.getElementById("simon-status").innerText = "MÉLODIE CORRECTE !";
    document.getElementById("simon-status").style.color = "#2ecc71";

    setTimeout(() => {
      this.close();

      // ⭐ RÉCOMPENSE : Note FA
      if (typeof GameState !== "undefined") {
        GameState.addNote("fa");
      }

      // Compléter l'objectif
      if (typeof HintSystem !== "undefined") {
        HintSystem.completeObjective("simon-puzzle");
      }

      // Pensée
      if (typeof GameState !== "undefined") {
        GameState.showThought(
          "Il me manque juste une chose, je devrais me mettre au calme."
        );
      }

      // ⭐ DÉBLOQUER L'ICÔNE PARTITION.EXE ⭐
      const iconNotes = document.getElementById("icon-notes");
      if (iconNotes) {
        iconNotes.classList.remove("hidden");
        console.log("🎼 Icône Partition.exe débloquée !");
      }

      const modalOverlay = document.getElementById("modal-overlay");
      const modalImg = document.getElementById("modal-img");
      const modalDesc = document.getElementById("modal-desc");

      modalImg.src = "assets/img/signal_ok.png";
      modalImg.style.display = "block";

      modalDesc.innerHTML = `
        <h2 style="color:#2ecc71">PARTITION DÉCHIFFRÉE</h2>
        <p>✨ Note <strong>FA</strong> obtenue !</p>
        <p>💡 Une nouvelle application est apparue sur l'ordinateur.</p>
      `;

      modalOverlay.classList.remove("hidden");
    }, 1000);
  },
};

/* ======== PUZZLE NOTES (FINAL) ======== */
const NotesPuzzle = {
  sequence: ["re", "do", "sol", "fa", "mi"],
  currentStep: 0,

  init: function () {
    // Vérifier l'ordre
    if (
      typeof GameState !== "undefined" &&
      !GameState.canAccessPuzzle("notes")
    ) {
      GameState.showNotYetMessage();
      return;
    }

    // Vérifier qu'on a toutes les notes
    if (typeof GameState !== "undefined" && !GameState.hasAllNotes()) {
      GameState.showThought(
        "Il me manque encore des notes pour jouer le morceau..."
      );
      return;
    }

    document.getElementById("overlay-notes").classList.remove("hidden");
    this.reset();
  },

  close: function () {
    document.getElementById("overlay-notes").classList.add("hidden");
  },

  reset: function () {
    this.currentStep = 0;
    document.getElementById("notes-status").innerText = "En attente...";
    document.getElementById("notes-status").style.color = "#aaa";
  },

  check: function (noteClicked) {
    const expectedNote = this.sequence[this.currentStep];

    if (noteClicked === expectedNote) {
      this.currentStep++;

      document.getElementById("notes-status").innerText = "Note enregistrée...";
      document.getElementById("notes-status").style.color = "#fff";

      if (this.currentStep >= this.sequence.length) {
        this.victory();
      }
    } else {
      this.currentStep = 0;

      const status = document.getElementById("notes-status");
      status.innerText = "Séquence incorrecte. Reset.";
      status.style.color = "#e74c3c";

      if (typeof anime !== "undefined") {
        anime({
          targets: ".notes-container",
          translateX: [-10, 10, 0],
          duration: 300,
        });
      }
    }
  },

  victory: function () {
    this.close();

    // Compléter l'objectif
    if (typeof HintSystem !== "undefined") {
      HintSystem.completeObjective("jouer-morceau");
    }

    // Vidéo de victoire
    const videoOverlay = document.getElementById("overlay-victory-video");
    const video = document.getElementById("final-video");

    if (videoOverlay && video) {
      videoOverlay.classList.remove("hidden");
      video.play().catch((e) => console.log("Clic requis"));
    } else {
      alert("VICTOIRE ! (Vidéo introuvable)");
    }
  },
};

console.log("✓ puzzles.js chargé - version complète avec Partition.exe");
