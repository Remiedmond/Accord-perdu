// ======== LOGIQUE ÉNIGME FUSIBLES STUDIO - SIMPLIFIÉ ========
const StudioGame = {
  noteMI: false,
  fusiblesDebranches: 0,
  ordinateurDeverrouille: false,

  init: function () {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  },

  setup: function () {
    this.setupClicks();
    this.createNoteDisplay();
    console.log("🎹 Studio énigme fusibles OK");
  },

  setupClicks: function () {
    const attach = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.onclick = fn;
    };

    // Note MI cliquable
    attach("note-mi-collectible", () => this.collecterNoteMI());
  },

  // ========== AFFICHAGE DE LA NOTE ==========
  createNoteDisplay: function () {
    if (!document.getElementById("note-mi-display")) {
      const container = document.createElement("div");
      container.id = "note-mi-display";
      container.className = "note-display";
      document.getElementById("ui-layer").appendChild(container);
    }
  },

  ajouterNoteUI: function () {
    const container = document.getElementById("note-mi-display");
    if (!container) return;

    container.innerHTML = "♪ MI";
    container.style.display = "flex";

    if (window.anime) {
      anime({
        targets: container,
        scale: [0, 1],
        rotate: [0, 360],
        opacity: [0, 1],
        duration: 600,
        easing: "easeOutElastic(1, .8)",
      });
    }
  },

  // ========== ÉNIGME DES FUSIBLES ==========
  onOrdinateurDeverrouille: function () {
    this.ordinateurDeverrouille = true;
    console.log("💻 Ordinateur déverrouillé - énigme fusibles activée");
  },

  onFusibleDebranche: function () {
    if (!this.ordinateurDeverrouille) return;

    this.fusiblesDebranches++;
    console.log(`⚡ Fusibles débranchés : ${this.fusiblesDebranches}/2`);

    if (this.fusiblesDebranches === 2 && !this.noteMI) {
      this.apparaitreNoteMI();
    }
  },

  onFusibleRebranche: function () {
    if (this.fusiblesDebranches > 0) {
      this.fusiblesDebranches--;
      console.log(`⚡ Fusible rebranché : ${this.fusiblesDebranches}/2`);
    }
  },

  apparaitreNoteMI: function () {
    const noteMI = document.getElementById("note-mi-collectible");
    if (!noteMI) {
      console.warn("Note MI introuvable dans le HTML");
      return;
    }

    noteMI.style.display = "flex";
    noteMI.style.opacity = "0";

    this.showThought("Étrange... Une note de musique est apparue !");

    if (window.anime) {
      anime({
        targets: noteMI,
        opacity: [0, 1],
        scale: [0, 1],
        rotate: [0, 720],
        duration: 1000,
        easing: "easeOutElastic(1, .6)",
      });
    } else {
      noteMI.style.opacity = "1";
    }
  },

  collecterNoteMI: function () {
    if (this.noteMI) {
      this.showThought("J'ai déjà la note MI.");
      return;
    }

    this.noteMI = true;
    this.ajouterNoteUI();
    this.showThought("J'ai trouvé la note MI !");

    const element = document.getElementById("note-mi-collectible");
    if (element) {
      if (window.anime) {
        anime({
          targets: element,
          scale: 0,
          opacity: 0,
          duration: 400,
          complete: () => (element.style.display = "none"),
        });
      } else {
        element.style.display = "none";
      }
    }

    // Bonus si systèmes disponibles
    if (typeof HintSystem !== "undefined") {
      HintSystem.completeObjective("collecter-note-mi");
    }
    if (typeof TimerSystem !== "undefined") {
      TimerSystem.addTime(30);
    }
  },

  // ========== SYSTÈME DE PENSÉES ==========
  showThought: function (text, duration = 3000) {
    const container = document.getElementById("thoughts-container");
    if (!container) {
      const newContainer = document.createElement("div");
      newContainer.id = "thoughts-container";
      newContainer.className = "thoughts-hidden";
      document.body.appendChild(newContainer);
      this.showThought(text, duration);
      return;
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
};

StudioGame.init();
