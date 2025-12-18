const Logic = {
  fusesFixed: 0,
  bootTimeout: null,
  isSystemReady: false,
  isUnlocked: false,
  pcPassword: "BEAT",
  musicTracksPlaced: 0,

  init: function () {
    console.log("⚡ Logic Studio Initialisé");
    this.setupFuses();
    this.setupMusicDrag();
  },

  // ============ FUSIBLES ============
  setupFuses: function () {
    interact(".draggable-fuse").draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({ restriction: "#scene-studio" }),
      ],
      autoScroll: true,
      listeners: { move: this.dragMoveListener },
    });

    interact(".dropzone-fuse").dropzone({
      accept: ".draggable-fuse",
      overlap: 0.5,
      ondrop: (event) => {
        this.placeFuse(event.relatedTarget);
      },
    });
  },

  placeFuse: function (fuseElement) {
    const slots = [
      document.getElementById("slot-1"),
      document.getElementById("slot-2"),
      document.getElementById("slot-3"),
    ];

    let emptyIndex = -1;
    for (let i = 0; i < 3; i++) {
      if (!slots[i].classList.contains("active")) {
        emptyIndex = i;
        break;
      }
    }

    if (emptyIndex !== -1) {
      fuseElement.style.display = "none";
      fuseElement.setAttribute("data-slot", emptyIndex + 1);

      slots[emptyIndex].classList.add("active");
      slots[emptyIndex].style.background = "#0f0";

      this.fusesFixed++;

      if (typeof StudioGame !== "undefined") {
        StudioGame.onFusibleRebranche();
      }

      if (this.fusesFixed === 3) {
        this.turnPowerOn();

        if (typeof HintSystem !== "undefined") {
          HintSystem.completeObjective("allumer-studio");
        }
      }
    }
  },

  removeFuse: function (slotNum) {
    const slot = document.getElementById("slot-" + slotNum);
    if (!slot.classList.contains("active")) return;

    slot.classList.remove("active");
    slot.style.background = "#000";

    const fuse = document.querySelector(
      `.draggable-fuse[data-slot="${slotNum}"]`
    );
    if (fuse) {
      fuse.style.display = "flex";
      fuse.style.transform = "translate(0px, 0px)";
      fuse.setAttribute("data-x", 0);
      fuse.setAttribute("data-y", 0);
      fuse.style.top = "70%";
      fuse.style.left = 20 + slotNum * 15 + "%";
    }

    this.fusesFixed--;

    if (typeof StudioGame !== "undefined") {
      StudioGame.onFusibleDebranche();
    }

    this.turnPowerOff();
  },

  turnPowerOn: function () {
    anime({
      targets: "#studio-darkness",
      opacity: 0,
      duration: 1500,
      easing: "linear",
      complete: () => {
        document.getElementById("studio-darkness").style.display = "none";
        this.startComputerBoot();

        // ⭐ PENSÉE : Lumières allumées
        setTimeout(() => {
          if (typeof GameState !== "undefined") {
            GameState.showThought("Voyons voir cet ordinateur maintenant.");
          }
        }, 1000);
      },
    });
  },

  turnPowerOff: function () {
    console.log("Coupure de courant !");

    this.isSystemReady = false;
    if (this.bootTimeout) clearTimeout(this.bootTimeout);

    const darkness = document.getElementById("studio-darkness");
    darkness.style.display = "block";
    anime({
      targets: "#studio-darkness",
      opacity: 1,
      duration: 200,
      easing: "linear",
    });

    document.getElementById("boot-overlay").classList.add("hidden");
    document.getElementById("locked-overlay").classList.add("hidden");
    document.querySelector(".loading-bar").style.width = "0%";
  },

  startComputerBoot: function () {
    const bootScreen = document.getElementById("boot-overlay");
    const loadingBar = document.querySelector(".loading-bar");

    bootScreen.classList.remove("hidden");
    setTimeout(() => {
      loadingBar.style.width = "100%";
    }, 50);

    this.bootTimeout = setTimeout(() => {
      bootScreen.classList.add("hidden");
      this.isSystemReady = true;
      console.log("PC ouvert");
    }, 3500);
  },

  // ============ ORDINATEUR ============
  openLockedScreen: function () {
    if (this.isSystemReady && this.fusesFixed === 3) {
      if (!this.isUnlocked) {
        document.getElementById("locked-overlay").classList.remove("hidden");
        setTimeout(() => {
          const pwd = document.getElementById("pc-password");
          if (pwd) pwd.focus();
        }, 100);
      } else {
        this.openDesktop();
      }
    } else {
      // ⭐ PENSÉE : Pas de courant
      if (typeof GameState !== "undefined") {
        GameState.showThought("Pas de courant, je dois d'abord allumer.");
      }

      anime({
        targets: "#daw-screen",
        translateX: [0, -5, 5, 0],
        duration: 200,
      });
    }
  },

  checkPassword: function () {
    const input = document.getElementById("pc-password");
    if (input.value.toUpperCase() === this.pcPassword) {
      this.isUnlocked = true;

      if (typeof StudioGame !== "undefined") {
        StudioGame.onOrdinateurDeverrouille();
      }

      // ⭐ RÉCOMPENSE : Note RÉ
      if (typeof GameState !== "undefined") {
        GameState.addNote("re");
      }

      if (typeof HintSystem !== "undefined") {
        HintSystem.completeObjective("deverrouiller-pc");
      }

      this.closeLockedScreen();
      this.openDesktop();

      // ⭐ PENSÉE : PC déverrouillé
      setTimeout(() => {
        if (typeof GameState !== "undefined") {
          GameState.showThought(
            "Il est temps d'ouvrir la première application."
          );
        }
      }, 1000);
    } else {
      anime({
        targets: ".screen-container",
        translateX: [-10, 10, -10, 10, 0],
        duration: 400,
      });
      input.value = "";
      input.placeholder = "ERREUR";
    }
  },

  openDesktop: function () {
    document.getElementById("pc-main-overlay").classList.remove("hidden");
  },

  closeDesktop: function () {
    document.getElementById("pc-main-overlay").classList.add("hidden");
  },

  closeLockedScreen: function () {
    document.getElementById("locked-overlay").classList.add("hidden");
  },

  openPostIt: function (idModale) {
    if (this.fusesFixed === 3) {
      const fenetre = document.getElementById(idModale);
      if (fenetre) {
        fenetre.classList.remove("hidden");
        this.sreencache = true;
      }
    } else {
      console.log("Trop sombre pour lire !");
      if (typeof GameState !== "undefined") {
        GameState.showThought("Il fait trop sombre pour lire ça.");
      }
      this.sreencache = false;
    }
  },

  closePostIt: function (idModale) {
    const fenetre = document.getElementById(idModale);
    if (fenetre) {
      fenetre.classList.add("hidden");
    }
  },

  // ============ MUSIQUE (non utilisé pour l'instant) ============
  setupMusicDrag: function () {
    // Vide pour l'instant
  },

  dragMoveListener: function (event) {
    var target = event.target;
    var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    target.style.transform = "translate(" + x + "px, " + y + "px)";
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
  },
};

Logic.init();
