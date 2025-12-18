// ========== MAIN.JS - VERSION FINALE CORRIGÉE ==========

var Game = {
  inventory: [],

  init: function () {
    console.log("✓ Game.init() appelé");

    // UI visible
    var uiLayer = document.getElementById("ui-layer");
    if (uiLayer) {
      uiLayer.style.opacity = "1";
    }

    // Attacher les événements à la vidéo
    this.attachVideoEvents();

    console.log("✓ Jeu initialisé");
  },

  attachVideoEvents: function () {
    var self = this;
    var video = document.getElementById("intro-video");

    if (video) {
      // Événement clic sur la vidéo
      video.onclick = function () {
        console.log("📹 Clic sur vidéo détecté");
        self.startGame();
      };

      // Événement fin de vidéo
      video.onended = function () {
        console.log("📹 Fin de vidéo détectée");
        self.startGame();
      };

      console.log("✓ Événements vidéo attachés");
    } else {
      console.warn("⚠️ Vidéo #intro-video introuvable");
    }
  },

  startGame: function () {
    console.log("🚀 Game.startGame() appelé");

    try {
      // Arrêter la vidéo
      var video = document.getElementById("intro-video");
      if (video) {
        video.pause();
      }

      // Masquer l'écran de démarrage si présent
      var startScreen = document.getElementById("start-screen");
      if (startScreen) {
        startScreen.style.display = "none";
      }

      // Changer de scène
      this.changeScene("scene-ruelle");
    } catch (error) {
      console.error("❌ Erreur dans startGame:", error);
    }
  },

  changeScene: function (sceneId) {
    console.log("🎬 Changement vers:", sceneId);

    var currentScene = document.querySelector(".scene.active");
    var nextScene = document.getElementById(sceneId);

    if (!currentScene) {
      console.error("❌ Scène actuelle introuvable");
      return;
    }

    if (!nextScene) {
      console.error("❌ Scène suivante introuvable:", sceneId);
      return;
    }

    // Si anime.js n'est pas disponible
    if (typeof anime === "undefined") {
      console.log("⚠️ Anime.js non disponible, transition simple");
      currentScene.classList.remove("active");
      currentScene.classList.add("hidden");
      nextScene.classList.remove("hidden");
      nextScene.classList.add("active");
      return;
    }

    // Animation avec anime.js
    anime({
      targets: currentScene,
      opacity: 0,
      duration: 800,
      easing: "easeInOutQuad",
      complete: function () {
        currentScene.classList.remove("active");
        currentScene.classList.add("hidden");

        nextScene.classList.remove("hidden");
        nextScene.classList.add("active");
        nextScene.style.opacity = 0;

        anime({
          targets: nextScene,
          opacity: [0, 1],
          duration: 800,
          easing: "easeInOutQuad",
          complete: function () {
            console.log("✓ Transition terminée");
          },
        });
      },
    });
  },

  examine: function (objet) {
    if (objet === "flyer") {
      if (typeof anime !== "undefined") {
        anime({
          targets: "#item-flyer",
          scale: [1, 1.2, 1],
          duration: 300,
        });
      }

      var modalImg = document.getElementById("modal-img");
      var modalDesc = document.getElementById("modal-desc");
      var overlay = document.getElementById("modal-overlay");

      if (modalImg) modalImg.src = "assets/img/indice_flyer_zoom.png";
      if (modalDesc)
        modalDesc.innerHTML =
          "Un flyer froissé trouvé par terre.<br>On peut y lire une date griffonnée : <strong style='color:#f1c40f'>2612</strong>";
      if (overlay) overlay.classList.remove("hidden");

      if (typeof anime !== "undefined") {
        anime({
          targets: ".modal-content",
          scale: [0.8, 1],
          opacity: [0, 1],
          duration: 300,
          easing: "easeOutBack",
        });
      }
    }
  },

  closeModal: function () {
    var overlay = document.getElementById("modal-overlay");
    if (overlay) {
      overlay.classList.add("hidden");
    }
  },
};

// Rendre Game disponible globalement
window.Game = Game;

// Initialiser au chargement
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    console.log("📄 DOM chargé");
    Game.init();
  });
} else {
  console.log("📄 DOM déjà chargé");
  Game.init();
}

console.log("✓ main.js chargé, Game disponible");
