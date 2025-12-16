// ======== SYSTÈME D'INDICES ET PIÈCES ========
// À inclure dans votre HTML : <script src="js/hints.js"></script>

const HintSystem = {
  // Configuration
  coins: 0,
  coinsPerHint: 1, // Nombre de pièces pour un indice gratuit
  timePenaltyMinutes: 2, // Pénalité en minutes si pas de pièces

  // Objectifs avec leurs indices progressifs
  objectives: {
    "entrer-studio": {
      name: "Entrer dans le studio",
      completed: false,
      hints: [
        "Il doit y avoir un code quelque part dans la ruelle...",
        "Cherchez un papier au sol, peut-être un flyer ?",
        "Le code est inscrit sur le flyer : 1204",
      ],
      currentHintLevel: 0,
    },
    "trouver-instruments": {
      name: "Rassembler les instruments",
      completed: false,
      hints: [
        "Le studio contient plusieurs objets interactifs...",
        "Explorez tous les coins de la pièce",
        "Cherchez : une batterie, une basse et un clavier",
      ],
      currentHintLevel: 0,
    },
    "composer-musique": {
      name: "Composer la musique finale",
      completed: false,
      hints: [
        "Il faut placer les instruments au bon endroit...",
        "Chaque piste correspond à un type d'instrument",
        "Glissez-déposez : Batterie, Basse, Mélodie dans cet ordre",
      ],
      currentHintLevel: 0,
    },
  },

  currentObjective: "entrer-studio",
  coinZones: [],

  // ============ INITIALISATION ============
  init: function () {
    this.createHintButton();
    this.createCoinsDisplay();
    this.generateCoins();
    console.log("💡 Système d'indices initialisé");
  },

  // Créer le bouton d'indice
  createHintButton: function () {
    const btn = document.createElement("div");
    btn.id = "hint-button";
    btn.innerHTML = "💡";
    btn.title = "Demander un indice";
    btn.onclick = () => this.openHintModal();
    document.getElementById("ui-layer").appendChild(btn);
  },

  // Créer l'affichage des pièces
  createCoinsDisplay: function () {
    const display = document.createElement("div");
    display.id = "coins-display";
    display.innerHTML = `🪙 <span id="coins-count">${this.coins}</span>`;
    document.getElementById("ui-layer").appendChild(display);
  },

  // ============ GESTION DES PIÈCES ============
  addCoins: function (amount) {
    this.coins += amount;
    this.updateCoinsDisplay();
    this.showNotification(`+${amount} pièce${amount > 1 ? "s" : ""}`, "coins");
    this.animateCoins();
  },

  updateCoinsDisplay: function () {
    const count = document.getElementById("coins-count");
    if (count) count.textContent = this.coins;
  },

  animateCoins: function () {
    const display = document.getElementById("coins-display");
    if (display && window.anime) {
      anime({
        targets: display,
        scale: [1, 1.3, 1],
        duration: 300,
        easing: "easeInOutQuad",
      });
    }
  },

  // ============ GESTION DES OBJECTIFS ============
  completeObjective: function (objectiveId) {
    if (this.objectives[objectiveId]) {
      this.objectives[objectiveId].completed = true;
      this.showNotification(
        `✓ ${this.objectives[objectiveId].name}`,
        "objective"
      );

      // Passer à l'objectif suivant
      const keys = Object.keys(this.objectives);
      const currentIndex = keys.indexOf(objectiveId);
      if (currentIndex < keys.length - 1) {
        this.currentObjective = keys[currentIndex + 1];
      }
    }
  },

  getCurrentObjective: function () {
    return this.objectives[this.currentObjective];
  },

  // ============ SYSTÈME D'INDICES ============
  openHintModal: function () {
    const objective = this.getCurrentObjective();
    if (!objective) return;

    const currentHint = objective.hints[objective.currentHintLevel];
    const hasMoreHints =
      objective.currentHintLevel < objective.hints.length - 1;
    const canPayWithCoins = this.coins >= this.coinsPerHint;

    let content = `
            <div class="hint-modal-content">
                <h3>📋 ${objective.name}</h3>
                <div class="hint-current">${currentHint}</div>
        `;

    if (hasMoreHints) {
      content += `
                <div class="hint-next-option">
                    <p><strong>Besoin d'un indice plus précis ?</strong></p>
                    ${
                      canPayWithCoins
                        ? `<p class="hint-cost-coins">💰 Utiliser ${this.coinsPerHint} pièces (vous en avez ${this.coins})</p>`
                        : `<p class="hint-cost-time">⏱️ Perdre ${this.timePenaltyMinutes} minutes de temps</p>`
                    }
                </div>
            `;
    } else {
      content += `<p class="hint-max-level">📌 C'est l'indice le plus précis !</p>`;
    }

    content += "</div>";

    const buttons = hasMoreHints
      ? [
          {
            text: canPayWithCoins
              ? `Utiliser ${this.coinsPerHint} 🪙`
              : `Perdre ${this.timePenaltyMinutes} min ⏱️`,
            action: () => this.unlockNextHint(),
            className: canPayWithCoins ? "btn-pay-coins" : "btn-pay-time",
          },
          {
            text: "Fermer",
            action: () => this.closeModal(),
            className: "btn-close",
          },
        ]
      : [
          {
            text: "Fermer",
            action: () => this.closeModal(),
            className: "btn-close",
          },
        ];

    this.showModal("💡 Indice", content, buttons);
  },

  unlockNextHint: function () {
    const objective = this.getCurrentObjective();

    if (objective.currentHintLevel >= objective.hints.length - 1) {
      this.showNotification("Vous avez déjà l'indice max !", "info");
      return;
    }

    // Payer avec pièces ou temps
    if (this.coins >= this.coinsPerHint) {
      this.coins -= this.coinsPerHint;
      this.updateCoinsDisplay();
      this.showNotification(`-${this.coinsPerHint} pièces`, "coins");
    } else {
      // Utiliser le système de timer si disponible
      if (typeof TimerSystem !== "undefined") {
        TimerSystem.removeTime(this.timePenaltyMinutes * 60);
      }
    }

    // Débloquer le prochain niveau
    objective.currentHintLevel++;

    // Réafficher la modal avec le nouvel indice
    this.closeModal();
    setTimeout(() => this.openHintModal(), 300);
  },

  // ============ MODAL GÉNÉRIQUE ============
  showModal: function (title, content, buttons) {
    const modal = document.createElement("div");
    modal.id = "hint-modal-overlay";
    modal.className = "hint-modal-overlay";

    const buttonsHTML = buttons
      .map(
        (btn, index) =>
          `<button class="hint-modal-btn ${btn.className}" onclick="HintSystem.modalActions[${index}]()">${btn.text}</button>`
      )
      .join("");

    modal.innerHTML = `
            <div class="hint-modal-container">
                <h2>${title}</h2>
                <div class="hint-modal-body">${content}</div>
                <div class="hint-modal-buttons">${buttonsHTML}</div>
                <button class="hint-modal-close" onclick="HintSystem.closeModal()">✕</button>
            </div>
        `;

    document.body.appendChild(modal);

    // Stocker les actions des boutons
    this.modalActions = buttons.map((btn) => btn.action);

    // Animation d'apparition
    if (window.anime) {
      anime({
        targets: ".hint-modal-container",
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 400,
        easing: "easeOutElastic(1, .8)",
      });
    }
  },

  closeModal: function () {
    const modal = document.getElementById("hint-modal-overlay");
    if (modal) {
      if (window.anime) {
        anime({
          targets: modal,
          opacity: [1, 0],
          duration: 300,
          easing: "easeInQuad",
          complete: () => modal.remove(),
        });
      } else {
        modal.remove();
      }
    }
  },

  // ============ NOTIFICATIONS ============
  showNotification: function (message, type) {
    const notif = document.createElement("div");
    notif.className = `hint-notification hint-notif-${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);

    if (window.anime) {
      anime({
        targets: notif,
        translateX: [-300, 0],
        opacity: [0, 1],
        duration: 500,
        easing: "easeOutQuad",
        complete: () => {
          setTimeout(() => {
            anime({
              targets: notif,
              translateX: [0, -300],
              opacity: [1, 0],
              duration: 500,
              easing: "easeInQuad",
              complete: () => notif.remove(),
            });
          }, 2000);
        },
      });
    } else {
      setTimeout(() => notif.remove(), 3000);
    }
  },
};

// Auto-initialisation
window.addEventListener("DOMContentLoaded", () => {
  HintSystem.init();
});
