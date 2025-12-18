// ======== STUDIO LOGIC - ÉNIGME FUSIBLES AVEC TIMER 15s ========
const StudioGame = {
  noteMI: false,
  fusiblesDebranches: 0,
  ordinateurDeverrouille: false,
  timerMI: null,

  // Pièces cachées dans le studio
  coins: {
    coin1: false,
    coin2: false,
  },

  init: function () {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  },

  setup: function () {
    this.setupClicks();
    this.setupCoins();
    console.log("🎹 Studio énigme fusibles OK");
  },

  setupClicks: function () {
    const attach = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.onclick = fn;
    };

    // Note MI cliquable (non utilisée maintenant car direct dans inventaire)
    // attach("note-mi-collectible", () => this.collecterNoteMI());
  },

  // ========== PIÈCES CACHÉES ==========
  setupCoins: function () {
    const attach = (id, coinKey) => {
      const el = document.getElementById(id);
      if (el) {
        el.onclick = () => this.collectCoin(coinKey, el);
      }
    };

    attach("studio-coin-1", "coin1");
    attach("studio-coin-2", "coin2");
  },

  collectCoin: function (coinKey, element) {
    if (this.coins[coinKey]) {
      if (typeof GameState !== "undefined") {
        GameState.showThought("Il n'y a plus rien ici.");
      }
      return;
    }

    this.coins[coinKey] = true;

    if (typeof GameState !== "undefined") {
      GameState.showThought("Tiens ? Une pièce cachée !");
    }

    if (typeof HintSystem !== "undefined") {
      HintSystem.addCoins(1);
    }

    if (window.anime) {
      anime({
        targets: element,
        scale: [1, 1.5, 0],
        opacity: [1, 1, 0],
        duration: 600,
        complete: () => {
          element.style.display = "none";
        },
      });
    } else {
      element.style.display = "none";
    }
  },

  // ========== ÉNIGME FUSIBLES AVEC TIMER 15s ==========
  onOrdinateurDeverrouille: function () {
    this.ordinateurDeverrouille = true;
    console.log("💻 Ordinateur déverrouillé - énigme fusibles activée");
  },

  onFusibleDebranche: function () {
    if (!this.ordinateurDeverrouille) return;

    this.fusiblesDebranches++;
    console.log(`⚡ Fusibles débranchés : ${this.fusiblesDebranches}/2`);

    // Annuler le timer précédent si existant
    if (this.timerMI) {
      clearTimeout(this.timerMI);
      this.timerMI = null;
    }

    // Si exactement 2 fusibles débranchés
    if (this.fusiblesDebranches === 2 && !this.noteMI) {
      if (typeof GameState !== "undefined") {
        GameState.showThought("Hmm... Attendons un peu...");
      }

      // ⭐ TIMER DE 2 SECONDES
      this.timerMI = setTimeout(() => {
        this.donnerNoteMI();
      }, 2000); 

      console.log("⏱️ Timer 2s démarré pour la note MI");
    }
  },

  onFusibleRebranche: function () {
    if (this.fusiblesDebranches > 0) {
      this.fusiblesDebranches--;
      console.log(`⚡ Fusible rebranché : ${this.fusiblesDebranches}/2`);

      // Annuler le timer si on rebranche un fusible
      if (this.timerMI) {
        clearTimeout(this.timerMI);
        this.timerMI = null;
        console.log("⏱️ Timer annulé (fusible rebranché)");
      }
    }
  },

  donnerNoteMI: function () {
    if (this.noteMI) return;

    this.noteMI = true;

    // ⭐ RÉCOMPENSE : Note MI directement dans l'inventaire
    if (typeof GameState !== "undefined") {
      GameState.addNote("mi");
      GameState.showThought("Eureka ! J'ai trouvé l'inspiration !");
    }

    // Compléter l'objectif
    if (typeof HintSystem !== "undefined") {
      HintSystem.completeObjective("trouver-inspiration");
    }

    // Pensée finale
    setTimeout(() => {
      if (typeof GameState !== "undefined") {
        GameState.showThought("Il est temps d'attaquer la production.");
      }
    }, 2000);

    console.log("✅ Note MI donnée après 15 secondes !");
  },
};

StudioGame.init();
