// ======== LOGIQUE SCÈNE RUELLE - AUTONOME ========
const RuelleGame = {
  lettresCollectees: { F: false },
  poubelles: {
    milieu: false,
    droite: false,
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
    this.setupDragDrop();
    this.createThoughtsContainer();
    console.log("🏙️ Ruelle OK");
  },

  setupClicks: function () {
    const attach = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.onclick = fn;
    };

    attach("item-flyer", () => this.examinerFlyer());
    attach("goutiere-secret", () => this.secretGoutiere());
    attach("tag-mur", () => this.voirTag());

    // Pensées sur les poubelles (clic direct sans gants)
    attach("poubelle-milieu", () => this.penserPoubelle());
    attach("poubelle-droite", () => this.penserPoubelle());
  },

  setupDragDrop: function () {
    if (typeof interact === "undefined") return;

    interact(".gants-draggable").draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: "#scene-ruelle",
          endOnly: true,
        }),
      ],
      listeners: {
        start: (e) => {
          e.target.style.zIndex = "1000";
        },
        move: (e) => {
          const t = e.target,
            x = (parseFloat(t.getAttribute("data-x")) || 0) + e.dx,
            y = (parseFloat(t.getAttribute("data-y")) || 0) + e.dy;
          t.style.transform = `translate(${x}px, ${y}px)`;
          t.setAttribute("data-x", x);
          t.setAttribute("data-y", y);
        },
        end: (e) => {
          e.target.style.zIndex = "500";
        },
      },
    });

    const setupDrop = (id, fn) => {
      interact(id).dropzone({
        accept: ".gants-draggable",
        overlap: 0.5,
        ondragenter: (e) => e.target.classList.add("dropzone-active"),
        ondragleave: (e) => e.target.classList.remove("dropzone-active"),
        ondrop: (e) => fn(e.relatedTarget, e.target),
      });
    };

    setupDrop("#poubelle-droite", (g, p) => this.ouvrirPoubelleDroite(g, p));
    setupDrop("#poubelle-milieu", (g, p) => this.bonusPoubelleMilieu(g, p));
  },

  // ========== SYSTÈME DE PENSÉES ==========
  createThoughtsContainer: function () {
    if (!document.getElementById("thoughts-container")) {
      const container = document.createElement("div");
      container.id = "thoughts-container";
      container.className = "thoughts-hidden";
      document.body.appendChild(container);
    }
  },

  showThought: function (text, duration = 3000) {
    const container = document.getElementById("thoughts-container");
    if (!container) return;

    container.textContent = text;
    container.classList.remove("thoughts-hidden");
    container.classList.add("thoughts-visible");

    // Animation d'apparition
    if (window.anime) {
      anime({
        targets: container,
        translateX: "-50%", // Maintenir le centrage horizontal
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 400,
        easing: "easeOutQuad",
      });
    }

    // Disparition automatique
    setTimeout(() => {
      this.hideThought();
    }, duration);
  },

  hideThought: function () {
    const container = document.getElementById("thoughts-container");
    if (!container) return;

    if (window.anime) {
      anime({
        targets: container,
        translateX: "-50%", // Maintenir le centrage horizontal
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
  },

  examinerFlyer: function () {
    const premiereFois = !this.lettresCollectees.F;

    if (premiereFois) {
      // Petit effet visuel sur l'objet au sol
      const f = document.getElementById("item-flyer");
      if (window.anime) {
        anime({ targets: f, scale: [1, 1.2, 1], duration: 300 });
      }
    }

    setTimeout(
      () => {
        // Remplir la modale avec les infos du Flyer
        const modalImg = document.getElementById("modal-img");
        const modalDesc = document.getElementById("modal-desc");
        const overlay = document.getElementById("modal-overlay");

        if (modalImg && modalDesc && overlay) {
          modalImg.src = "assets/img/papier_sol.png";
          modalImg.style.display = "block";
          modalDesc.innerHTML =
            "Un flyer froissé par terre.<br> C'est pour un concours de musique, je dois créer une prod !<br> La lettre <strong>F</strong> est inscrite et séparée du texte, elle doit être importante.";
          overlay.classList.remove("hidden");
        }

        // Marquer comme collecté
        this.lettresCollectees.F = true;
      },
      premiereFois ? 300 : 0
    );
  },

  ouvrirPoubelleDroite: function (gants, poubelle) {
    if (this.poubelles.droite) {
      this.showThought("Cette poubelle est déjà fouillée.");
      return;
    }

    poubelle.classList.remove("dropzone-active");
    if (window.anime)
      anime({ targets: poubelle, scale: [1, 1.1, 1], duration: 500 });

    this.poubelles.droite = true;

    // Changer le fond pour montrer la poubelle ouverte
    this.changerFondPoubelle();

    this.showThought("Avec les gants, ça passe... J'ai trouvé un 'L' !");

    setTimeout(() => {
      this.checkRetirerGants(gants);
    }, 600);
  },

  bonusPoubelleMilieu: function (gants, poubelle) {
    if (this.poubelles.milieu) {
      this.showThought("Cette poubelle est déjà fouillée.");
      return;
    }

    poubelle.classList.remove("dropzone-active");
    this.poubelles.milieu = true;

    this.showThought("Oh ! Une pièce dans la poubelle !");

    setTimeout(() => {
      if (typeof HintSystem !== "undefined") HintSystem.addCoins(1);
      this.checkRetirerGants(gants);
    }, 600);
  },

  penserPoubelle: function () {
    const pensees = [
      "Une poubelle... C'est dégoûtant, je ne vais pas y toucher.",
      "Sans protection, pas question de mettre la main là-dedans !",
      "Ça sent mauvais...",
    ];
    const pensee = pensees[Math.floor(Math.random() * pensees.length)];
    this.showThought(pensee);
  },

  checkRetirerGants: function (gants) {
    if (this.poubelles.milieu && this.poubelles.droite) {
      if (window.anime) {
        anime({
          targets: gants,
          scale: 0,
          opacity: 0,
          duration: 300,
          complete: () => gants.remove(),
        });
      } else {
        gants.remove();
      }
    }
  },

  changerFondPoubelle: function () {
    // Changer l'image de fond pour montrer la poubelle ouverte
    const bgImg = document.querySelector("#scene-ruelle .bg-img");
    if (bgImg) {
      // Animation de transition
      if (window.anime) {
        anime({
          targets: bgImg,
          opacity: [1, 0],
          duration: 300,
          easing: "easeInQuad",
          complete: () => {
            bgImg.src = "assets/img/bg_ruelle_1.png";
            anime({
              targets: bgImg,
              opacity: [0, 1],
              duration: 300,
              easing: "easeOutQuad",
            });
          },
        });
      } else {
        bgImg.src = "assets/img/bg_ruelle_poubelle_ouverte.png";
      }
    }
  },

  secretGoutiere: function () {
    const g = document.getElementById("goutiere-secret");
    if (g && g.dataset.found !== "true") {
      g.dataset.found = "true";
      this.showThought("Tiens ? Une pièce cachée !");
      if (typeof HintSystem !== "undefined") HintSystem.addCoins(1);
      if (window.anime)
        anime({ targets: g, scale: [1, 1.3, 1], duration: 400 });
    } else {
      this.showThought("Il n'y a plus rien ici.");
    }
  },

  voirTag: function () {
    this.showThought(
      "Ce ne sont pas les lettres qui comptent mais leur rang.. Hmm.."
    );

    setTimeout(() => {
      const modalImg = document.getElementById("modal-img");
      const modalDesc = document.getElementById("modal-desc");
      const overlay = document.getElementById("modal-overlay");
    }, 500);
  },
};

RuelleGame.init();
