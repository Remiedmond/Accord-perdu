/* Contenu de js/phase_int.js */

const PhasePuzzle = {
    init: function() {
        console.log("OUVERTURE DU PUZZLE !"); // Regarde la console (F12) si tu vois ça
        
        const overlay = document.getElementById('overlay-phase');
        if(overlay) {
            overlay.classList.remove('hidden');
        } else {
            console.error("Erreur : Je ne trouve pas la div #overlay-phase dans le HTML");
        }
        
        // Initialisation du Canvas
        this.canvas = document.getElementById('phaseCanvas');
        if(this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.playerPhase = 180;
            this.offset = 0;
            this.isSolved = false;
            this.animate();
        }
    },

    close: function() {
        document.getElementById('overlay-phase').classList.add('hidden');
        if(this.animationId) cancelAnimationFrame(this.animationId);
    },

    updateVal: function(val) {
        if (this.isSolved) return;
        this.playerPhase = parseInt(val);
        this.checkWin();
    },

    animate: function() {
        if(!this.ctx) return;
        this.ctx.clearRect(0, 0, 600, 300);
        this.offset += 0.1;

        // Onde Rouge
        this.drawWave('rgba(255, 50, 50, 0.5)', 0);
        // Onde Verte
        let rad = (this.playerPhase * Math.PI) / 180;
        this.drawWave('#0f0', rad);
        
        this.animationId = requestAnimationFrame(() => this.animate());
    },

    drawWave: function(color, shift) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        for (let x = 0; x < 600; x++) {
            const y = 150 + Math.sin(x * 0.05 + this.offset + shift) * 50;
            if (x===0) this.ctx.moveTo(x, y); else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
    },

    checkWin: function() {
        if (this.playerPhase < 15 || this.playerPhase > 345) {
            if(!this.isSolved) {
                this.isSolved = true;
                document.getElementById('phase-status').innerText = "SYNCHRONISÉ !";
                document.getElementById('phase-status').style.color = "#0f0";
                setTimeout(() => { this.close(); alert("Gagné !"); }, 1000);
            }
        }
    }
};