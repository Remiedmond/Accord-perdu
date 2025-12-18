// ======== SYSTÈME DE TIMER - VERSION CORRIGÉE ========

const TimerSystem = {
  timeRemaining: 15 * 60, // 45 minutes en secondes
  timerInterval: null,
  timeWarningThreshold: 5 * 60, // Seuil d'alerte à 5 minutes

  // ============ INITIALISATION ============
  init: function () {
    this.createTimerDisplay();
    this.startTimer();
    console.log("⏱️ Timer initialisé");
  },

  // Créer ou utiliser l'affichage du timer
  createTimerDisplay: function () {
    let timer = document.getElementById("timer");

    if (!timer) {
      // L'élément n'existe pas, on le crée
      timer = document.createElement("div");
      timer.id = "timer";

      const uiLayer = document.getElementById("ui-layer");
      if (uiLayer) {
        uiLayer.appendChild(timer);
      } else {
        document.body.appendChild(timer);
      }

      console.log("✓ Timer créé dynamiquement");
    } else {
      console.log("✓ Timer existant utilisé");
    }

    // Ajouter la classe timer-display si elle n'est pas présente
    if (!timer.classList.contains("timer-display")) {
      timer.className = "timer-display";
    }

    // Forcer les styles de base (au cas où le CSS ne charge pas)
    timer.style.position = "fixed";
    timer.style.top = "20px";
    timer.style.left = "20px";
    timer.style.zIndex = "1000";

    this.updateDisplay();
  },

  // ============ GESTION DU TIMER ============
  startTimer: function () {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateDisplay();

      // Vérifier si temps critique
      if (this.timeRemaining === this.timeWarningThreshold) {
        this.onTimeWarning();
      }

      // Vérifier si temps écoulé
      if (this.timeRemaining <= 0) {
        this.onTimeUp();
      }
    }, 1000);
  },

  stopTimer: function () {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  updateDisplay: function () {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    const display = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

    const timerEl = document.getElementById("timer");
    if (timerEl) {
      timerEl.textContent = display;

      // Ajouter la classe critique si nécessaire
      if (this.timeRemaining <= this.timeWarningThreshold) {
        timerEl.classList.add("critical");
      } else {
        timerEl.classList.remove("critical");
      }
    }
  },

  // ============ MODIFICATIONS DE TEMPS ============
  addTime: function (seconds) {
    this.timeRemaining += seconds;
    this.updateDisplay();
    this.showTimerNotification(`+${Math.floor(seconds / 60)} min`, "bonus");

    // Animation
    this.animateTimer("bonus");
  },

  removeTime: function (seconds) {
    this.timeRemaining -= seconds;
    if (this.timeRemaining < 0) this.timeRemaining = 0;
    this.updateDisplay();
    this.showTimerNotification(`-${Math.floor(seconds / 60)} min`, "penalty");

    // Animation
    this.animateTimer("penalty");
  },

  // ============ ÉVÉNEMENTS ============
  onTimeWarning: function () {
    this.showTimerNotification("⚠️ Moins de 5 minutes !", "warning");
  },

  onTimeUp: function () {
    this.stopTimer();
    this.showGameOverModal();
  },

  onVictory: function () {
    this.stopTimer();
    this.showVictoryModal();
  },

  // ============ ANIMATIONS ============
  animateTimer: function (type) {
    const timerEl = document.getElementById("timer");
    if (!timerEl || typeof anime === "undefined") return;

    if (type === "bonus") {
      anime({
        targets: timerEl,
        scale: [1, 1.2, 1],
        color: ["#00ff00", "#00ff00", "#00ff00"],
        duration: 500,
        easing: "easeInOutQuad",
      });
    } else if (type === "penalty") {
      anime({
        targets: timerEl,
        translateX: [-10, 10, -10, 10, 0],
        duration: 400,
        easing: "easeInOutQuad",
      });
    }
  },

  // ============ NOTIFICATIONS ============
  showTimerNotification: function (message, type) {
    const notif = document.createElement("div");
    notif.className = `timer-notification timer-notif-${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);

    if (typeof anime !== "undefined") {
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

  // ============ MODALS ============
  showGameOverModal: function () {
    const modal = this.createModal(
      "⏱️ TEMPS ÉCOULÉ !",
      "Vous n'avez pas réussi à terminer à temps...",
      [{ text: "Recommencer", action: () => location.reload() }]
    );
    document.body.appendChild(modal);
  },

  showVictoryModal: function () {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    const modal = this.createModal(
      "🎵 VICTOIRE ! 🎵",
      `Vous avez terminé avec ${minutes}:${String(seconds).padStart(
        2,
        "0"
      )} restantes !`,
      [{ text: "Rejouer", action: () => location.reload() }]
    );
    document.body.appendChild(modal);
  },

  createModal: function (title, content, buttons) {
    const modal = document.createElement("div");
    modal.className = "timer-modal-overlay";

    const buttonsHTML = buttons
      .map(
        (btn, index) =>
          `<button class="timer-modal-btn" onclick="TimerSystem.modalActions[${index}]()">${btn.text}</button>`
      )
      .join("");

    modal.innerHTML = `
      <div class="timer-modal-container">
        <h2>${title}</h2>
        <div class="timer-modal-body">${content}</div>
        <div class="timer-modal-buttons">${buttonsHTML}</div>
      </div>
    `;

    // Stocker les actions
    this.modalActions = buttons.map((btn) => btn.action);

    return modal;
  },

  // ============ GETTERS ============
  getTimeRemaining: function () {
    return this.timeRemaining;
  },

  getFormattedTime: function () {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  },
};

// Auto-initialisation au chargement de la page
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    TimerSystem.init();
  });
} else {
  TimerSystem.init();
}

console.log("✓ timer.js chargé");
