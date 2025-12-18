// ======== GAME STATE - GESTION GLOBALE ========
const GameState = {
  // Notes collectées (pour l'ordre)
  notes: {
    re: false,
    do: false,
    sol: false,
    fa: false,
    mi: false,
  },

  // Ordre strict des objectifs
  objectiveOrder: [
    "allumer-studio",
    "deverrouiller-pc",
    "egaliser-pistes",
    "regler-niveaux",
    "simon-puzzle",
    "trouver-inspiration",
    "jouer-morceau",
  ],

  currentObjectiveIndex: 0,

  // Vérifier si on peut accéder à un puzzle
  canAccessPuzzle: function (puzzleName) {
    const puzzleObjectives = {
      phase: "egaliser-pistes",
      faders: "regler-niveaux",
      simon: "simon-puzzle",
      fusibles: "trouver-inspiration",
      notes: "jouer-morceau",
    };

    const requiredObjective = puzzleObjectives[puzzleName];
    if (!requiredObjective) return true;

    const requiredIndex = this.objectiveOrder.indexOf(requiredObjective);
    return this.currentObjectiveIndex >= requiredIndex;
  },

  // Obtenir l'objectif actuel
  getCurrentObjective: function () {
    return this.objectiveOrder[this.currentObjectiveIndex];
  },

  // Passer à l'objectif suivant
  completeCurrentObjective: function () {
    if (this.currentObjectiveIndex < this.objectiveOrder.length - 1) {
      this.currentObjectiveIndex++;
      return true;
    }
    return false;
  },

  // Ajouter une note à l'inventaire
  addNote: function (noteName) {
    if (this.notes[noteName]) {
      console.log(`Note ${noteName.toUpperCase()} déjà collectée`);
      return false;
    }

    this.notes[noteName] = true;
    this.displayNoteInUI(noteName);
    return true;
  },

  // Afficher la note dans l'UI
  displayNoteInUI: function (noteName) {
    const container = document.getElementById("notes-container");
    if (!container) {
      // Créer le conteneur s'il n'existe pas
      const newContainer = document.createElement("div");
      newContainer.id = "notes-container";
      newContainer.className = "notes-inventory";
      document.getElementById("ui-layer").appendChild(newContainer);
      return this.displayNoteInUI(noteName);
    }

    const noteEl = document.createElement("div");
    noteEl.className = "note-item";
    noteEl.textContent = `♪ ${noteName.toUpperCase()}`;
    noteEl.style.background = this.getNoteColor(noteName);
    container.appendChild(noteEl);

    // Animation d'apparition
    if (window.anime) {
      anime({
        targets: noteEl,
        scale: [0, 1],
        rotate: [0, 360],
        duration: 600,
        easing: "easeOutElastic(1, .8)",
      });
    }

    console.log(`✓ Note ${noteName.toUpperCase()} ajoutée à l'inventaire`);
  },

  // Couleurs des notes
  getNoteColor: function (noteName) {
    const colors = {
      re: "#e74c3c", // Rouge
      do: "#3498db", // Bleu
      sol: "#f1c40f", // Jaune
      fa: "#2ecc71", // Vert
      mi: "#9b59b6", // Violet
    };
    return colors[noteName] || "#fff";
  },

  // Vérifier si toutes les notes sont collectées
  hasAllNotes: function () {
    return Object.values(this.notes).every((collected) => collected);
  },

  // Afficher une pensée
  showThought: function (text, duration = 3000) {
    const container = document.getElementById("thoughts-container");
    if (!container) {
      const newContainer = document.createElement("div");
      newContainer.id = "thoughts-container";
      newContainer.className = "thoughts-hidden";
      document.body.appendChild(newContainer);
      return this.showThought(text, duration);
    }

    container.textContent = text;
    container.classList.remove("thoughts-hidden");
    container.classList.add("thoughts-visible");

    if (window.anime) {
      anime({
        targets: container,
        translateX: "-50%",
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 400,
        easing: "easeOutQuad",
      });
    }

    setTimeout(() => {
      if (window.anime) {
        anime({
          targets: container,
          translateX: "-50%",
          opacity: [1, 0],
          duration: 300,
          easing: "easeInQuad",
          complete: () => {
            container.classList.remove("thoughts-visible");
            container.classList.add("thoughts-hidden");
          },
        });
      } else {
        container.classList.remove("thoughts-visible");
        container.classList.add("thoughts-hidden");
      }
    }, duration);
  },

  // Message quand on clique trop tôt
  showNotYetMessage: function () {
    this.showThought("Ça me servira plus tard, je dois rester organisé.");
  },
};

// Log de démarrage
console.log("🎮 GameState initialisé");
