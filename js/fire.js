const smokeCanvas = document.getElementById("smokeCanvas");
const smokectx = smokeCanvas.getContext("2d");
smokeCanvas.height = window.innerHeight;
smokeCanvas.width = window.innerWidth;
let particleArray = [];
let sparklerArray = [];

class Particle {
    constructor(x, y, vx, vy, type) {
        this.x = x;
        this.y = y;
        this.timeAlive = 0;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        switch (type) {
            case 1:  // smoke
                this.fillStyle = "rgba(65, 65, 65, 0.5)";
                //this.fillStyle = "white";
                this.ctx = smokectx;
                this.size = 5;
                this.grav = -5;
            break;
        }
    }
    update() {
        this.x += this.vx * 0.167;
        this.y += this.vy * 0.167;
        this.vy += this.grav * 0.167;
        this.timeAlive += 1;

        switch (this.type) {
            case 1:
                if (this.size < 30) {
                    this.size += 4 * 0.167;
                }
            break;
        }

        return !(this.y + this.size < 0 || this.y - this.size > window.innerHeight) || this.timeAlive > 150;
    }
    draw() {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, Math.PI, 0);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

class Sparkler {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        switch (type) {
            case 1:
                this.randThreshold = 0.3;
                this.pAmmount = 7;
            break;
        }
    }
    sparkle() {
        for (let i = 0; i < this.pAmmount; i++) {
            if (Math.random() > this.randThreshold) {
                particleArray.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 15, (Math.random() - 0.2) * 12 - 4, this.type))
            }
        }
    }

}

function animate() {
    smokectx.fillStyle = "rgba(0, 0, 0, 0.05)"
    smokectx.fillRect(0, 0, smokeCanvas.width, smokeCanvas.height);
    for (let i = 0; i < sparklerArray.length; i++) {
        sparklerArray[i].sparkle();
    }
    for (let i = particleArray.length - 1; i >= 0; i--) {
        if (particleArray[i].update()) {
            particleArray[i].draw();
        } else {
            particleArray.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

function go() {
    sparklerArray.push(new Sparkler(500, 500, 1));
}