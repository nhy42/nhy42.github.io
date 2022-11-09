const smokeCanvas = document.getElementById("smokeCanvas");
const smokectx = smokeCanvas.getContext("2d");/*
smokeCanvas.height = window.innerHeight;
smokeCanvas.width = window.innerWidth;*/
const generalCanvas = document.getElementById("generalCanvas");
const generalctx = generalCanvas.getContext("2d");/*
generalCanvas.height = window.innerHeight;
generalCanvas.width = window.innerWidth;*/
let particleArray = [];
let sparklerArray = [];
let RUNNING = false;


let smokeSize = function (t) {return t > 120 ? 120 : 5 + 115 * t/120;}
let smokeColor= function (t) {return colorfade([0, 160, 160, 0.5], [69, 69, 69, 0.5], t, 65);}
let sparkSize = function (t) {return t > 40 ? 0 : 3 - 3 * t/40;}
let sparkColor= function (t) {return colorfade([255, 255, 255, 1], [0, 255, 255, 1], t, 30);}
let flameSize = function (t) {
    let size = 0;
    if (t < 20) {
        size = 20*(t/20);
    } else if (t <= 60) {
        size = 20 - 20*((t-20)/40)
    }
    return size;
}
let flameColor= function (t) {
    let tColor;
    if (t < 20) {
        tColor = colorfade([255, 255, 255, 0.7], [0, 255, 255, 1], t, 20);
    } else {
        tColor = colorfade([0, 255, 255, 1], [0, 100, 100, 0], t - 20, 40);  // here 40 = 60
    }
    return tColor;
}


class Particle {
    constructor(x, y, vx, vy, ctx, size, grav, color, maxLife, arc) {
        this.x = x;
        this.y = y;
        this.timeAlive = 0;
        this.vx = vx;
        this.vy = vy;
        this.ctx = ctx;
        this.size = size;
        this.grav = grav;
        this.fillStyle = color;
        this.maxLife = maxLife;
        this.arc = arc;

        this.currentSize = typeof this.size == "function" ? this.size(this.timeAlive) : this.size;
    }
    update() {
        this.x += this.vx * 0.167;
        this.y += this.vy * 0.167;
        this.vy += this.grav * 0.167;
        this.timeAlive += 1;

        this.currentSize = typeof this.size == "function" ? this.size(this.timeAlive) : this.size;

        return !(this.currentSize <= 0 ||
            this.y + this.currentSize < 0 ||
            this.y - this.currentSize > window.innerHeight ||
            this.timeAlive > this.maxLife);
    }
    draw() {
        this.ctx.fillStyle = typeof this.fillStyle == "function" ? this.fillStyle(this.timeAlive) : this.fillStyle;
        this.ctx.beginPath();
        this.ctx.arc(Math.round(this.x), Math.round(this.y), this.currentSize, this.arc[0], this.arc[1]);
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
                this.randThreshold = 0.4;
                this.pAmmount = 1;
                break;
            case 2:
                this.randThreshold = 0.5;
                this.pAmmount = 1;
                break;
            case 3:
                this.randThreshold = 0.98;
                this.pAmmount = 1;
                break;
            case 4:
                this.randThreshold = 0.6;
                this.pAmmount = 1;
                break;
        }
    }
    sparkle() {
        for (let i = 0; i < this.pAmmount; i++) {
            if (Math.random() > this.randThreshold) {
                let vx, vy;
                switch (this.type) {
                    case 1:
                        vx = (Math.random() - 0.5) * 20;
                        vy = (Math.random() - 0.2) * 12 - 8;
                        particleArray.push(new Particle(
                            this.x, this.y, vx, vy, smokectx, smokeSize,
                            -5, smokeColor, 200, [Math.PI, 0]
                        ));
                        break;
                    case 2:
                        vx = (Math.random() * 30 + 15) * (Math.random() > 0.5 ? 1 : -1);
                        vy = Math.random() * -50;
                        particleArray.push(new Particle(
                            this.x, this.y, vx, vy, generalctx, sparkSize,
                            20, sparkColor, 40, [0, 2*Math.PI]
                        ));
                        break;
                    case 3:
                        vx = (Math.random() * 40 + 15) * (Math.random() > 0.5 ? 1 : -1);
                        vy = Math.random() * -50;
                        particleArray.push(new Particle(
                            this.x, this.y, vx, vy, generalctx, Math.round(Math.random()*3+2),
                            20, sparkColor, 160, [0, 2*Math.PI]
                        ));
                        break;
                    case 4:
                        vx = (Math.random() - 0.5) * 2;
                        vy = -5;
                        particleArray.push(new Particle(
                            this.x, this.y, vx, vy, generalctx, flameSize,
                            -1, flameColor, 60, [0, Math.PI*2]
                        ));
                        break;
                }
            }
        }
    }
    changePos(x, y) {
        this.x = x;
        this.y = y;
    }

}

function colorfade(start, end, t, tmax) {
    let newColor;
    if (t <= tmax) {
        newColor = [
            Math.round(start[0] + (end[0] - start[0]) * (t/tmax)),
            Math.round(start[1] + (end[1] - start[1]) * (t/tmax)),
            Math.round(start[2] + (end[2] - start[2]) * (t/tmax)),
            start[3] + (end[3] - start[3]) * (t/tmax)
        ];
    } else {
        newColor = end;
    }
    return("rgba("+newColor[0]+","+newColor[1]+","+newColor[2]+","+newColor[3]+")");
}

function animate() {
    if (smokeCanvas.height !== window.innerHeight || smokeCanvas.width !== window.innerWidth) {
        particleArray.splice(0, particleArray.length);
        let height = window.innerHeight;
        let width = window.innerWidth;
        smokeCanvas.height = height;
        smokeCanvas.width = width;
        generalCanvas.height = height;
        generalCanvas.width = width;
        for (let i = 0; i < sparklerArray.length; i++) {
            sparklerArray[i].changePos(width/2, height/2);
        }
    }
    smokectx.fillStyle = "rgba(48, 48, 48, 0.1)";
    smokectx.fillRect(0, 0, smokeCanvas.width, smokeCanvas.height);
    generalctx.clearRect(0, 0, smokeCanvas.width, smokeCanvas.height);
    for (let i = 0; i < sparklerArray.length; i++) {
        sparklerArray[i].sparkle();
    }
    for (let i = 0; i < particleArray.length; i++) {  // let i = particleArray.length - 1; i >= 0; i--
        if (particleArray[i].update()) {
            particleArray[i].draw();
        } else {
            particleArray.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

function go() {
    if (RUNNING) {
        return;
    }
    RUNNING = true;
    setTimeout(start1, 4000);
    setTimeout(start1, 4000);
    setTimeout(start1, 4000);
    setTimeout(start1, 3200);
    setTimeout(start2, 3000);
    setTimeout(start3, 500);
    setTimeout(start4, 0);
    setTimeout(die, 600000);
}

function start1() {
    let height = window.innerHeight;
    let width = window.innerWidth;
    sparklerArray.push(new Sparkler(width/2, height/2, 1));

}

function start2() {
    let height = window.innerHeight;
    let width = window.innerWidth;
    sparklerArray.push(new Sparkler(width/2, height/2, 2));
}

function start3() {
    let height = window.innerHeight;
    let width = window.innerWidth;
    sparklerArray.push(new Sparkler(width/2, height/2, 3));
}

function start4() {
    let height = window.innerHeight;
    let width = window.innerWidth;
    sparklerArray.push(new Sparkler(width/2, height/2, 4));
}

function die() {
    sparklerArray.splice(0, sparklerArray.length);
    RUNNING = false;
}
