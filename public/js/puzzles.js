const Puzzles = {
  codeSaisi: "",
  codeSecret: "1204", // Le code donné par le papier

  // Fonction appelée quand on clique sur la zone rouge de la porte
  openDigicode: function () {
    console.log("Ouverture du digicode...");
    // On enlève la classe 'hidden' pour afficher l'écran noir par dessus
    document.getElementById("overlay-digicode").classList.remove("hidden");
  },

  // Fonction pour fermer (bouton X)
  closeDigicode: function () {
    document.getElementById("overlay-digicode").classList.add("hidden");
    this.codeSaisi = "";
    this.updateScreen();
  },

  // Quand on appuie sur les touches
  typeCode: function (chiffre) {
    if (this.codeSaisi.length < 4) {
      this.codeSaisi += chiffre;
      this.updateScreen();
    }
  },

  // Mettre à jour l'affichage "_ _ _ _"
  updateScreen: function () {
    document.getElementById("digicode-screen").innerText = this.codeSaisi;
  },

  // Bouton OK
  validateCode: function () {
    if (this.codeSaisi === this.codeSecret) {
      alert("Accès autorisé !"); // Petit feedback
      this.closeDigicode();

      // LA MAGIE : On change de scène vers le studio
      Game.changeScene("scene-studio");
    } else {
      alert("Code Erroné !");
      this.codeSaisi = "";
      this.updateScreen();
    }
  },
};
// --- GESTION DU DRAG & DROP (Pour le Studio) ---
// À mettre dans main.js ou ici.
// Le principe : Les objets de l'inventaire sont "draggable"
// Les slots du PC sont des zones de "drop".

/* Exemple simplifié pour le Drag & Drop HTML5 natif */
/*
1. Sur les items de l'inventaire : draggable="true" et ondragstart="drag(event)"
2. Sur les zones cibles : ondrop="drop(event)" et ondragover="allowDrop(event)"
*/

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  // Vérifier si c'est le bon instrument pour la bonne case
  ev.target.appendChild(document.getElementById(data));

  // Vérifier victoire (si les 3 slots sont pleins)
}
// --- GESTION DU DRAG & DROP (Pour le Studio) ---
// À mettre dans main.js ou ici.
// Le principe : Les objets de l'inventaire sont "draggable"
// Les slots du PC sont des zones de "drop".

/* Exemple simplifié pour le Drag & Drop HTML5 natif */
/*
1. Sur les items de l'inventaire : draggable="true" et ondragstart="drag(event)"
2. Sur les zones cibles : ondrop="drop(event)" et ondragover="allowDrop(event)"
*/

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  // Vérifier si c'est le bon instrument pour la bonne case
  ev.target.appendChild(document.getElementById(data));

  // Vérifier victoire (si les 3 slots sont pleins)

  // -- OPTION 2 -- //
  document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(MorphSVGPlugin, ScrollTrigger, SplitText);

    /* MOUVEMENT POKEMON */
    gsap.to(".pokemon", {
      duration: 2,
      y: -30,
      repeat: -1, // boucle à l'infini
      yoyo: true, // fait l'aller-retour (-50 -> 0 -> -50)
      ease: "sine.inOut",
    });

    const pokeballLinks = document.querySelectorAll(".actions > a");

    let activeBall = null; // { el, rect }
    let following = false;
    let setX, setY;

    function resetBall(ball) {
      if (!ball) return;
      gsap.to(ball.el, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "back.out",
      });
    }

    pokeballLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const pokeball = link.querySelector(".pokeball");
        const pokeballBtn = link.querySelector(".pokeball-button");
        const linkRect = link.getBoundingClientRect();

        // Si on reclique sur la même pokeball et qu'elle suit déjà : on stoppe
        if (activeBall && activeBall.el === pokeball && following) {
          resetBall(activeBall);
          following = false;
          activeBall = null;
          return;
        }

        // 1. remettre la précédente en place
        resetBall(activeBall);
        following = false;

        // 2. centrer la nouvelle (point de départ)
        gsap.set([pokeball, pokeballBtn], { x: 0, y: 0 });

        // 3. définir la nouvelle active
        setX = gsap.quickSetter(pokeball, "x", "px");
        setY = gsap.quickSetter(pokeball, "y", "px");

        activeBall = { el: pokeball, rect: linkRect };
        following = true;
      });
    });

    window.addEventListener("mousemove", (e) => {
      if (!following || !activeBall) return;

      const rect = activeBall.rect;

      const offsetX = e.clientX - (rect.left + rect.width / 2);
      const offsetY = e.clientY - (rect.top + rect.height / 2);

      setX(offsetX);
      setY(offsetY);
    });

    window.addEventListener("mouseleave", () => {
      resetBall(activeBall);
      following = false;
    });

    const pokemonLink = document.querySelector(".pokemon-link");
    if (pokemonLink) {
      pokemonLink.addEventListener("click", () => {
        // la pokeball arrête de suivre et revient à sa position d'origine
        resetBall(activeBall);
        following = false;
        activeBall = null;
      });
    }
  });
}
