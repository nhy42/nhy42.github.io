const smokeCanvas = document.getElementById("smokeCanvas");
const smokectx = smokeCanvas.getContext("2d");
const smoke2Canvas = document.getElementById("smoke2Canvas");
const smoke2ctx = smoke2Canvas.getContext("2d");
const generalCanvas = document.getElementById("generalCanvas");
const generalctx = generalCanvas.getContext("2d");
let particleArray = [], sparklerArray = [], eraserArray = [];
let RUNNING = false, STOPANIMATION = false;
let dieTimeout, startTimeout = [];
const colorPack = {  // [main], [smoke], [flame], "imageURL"
    "cyan":   [[0, 255, 255, 1], [0, 160, 160, 0.5], [0, 100, 100, 0], "../img/flare.png"],
    "pink":   [[255, 0, 255, 1], [160, 0, 160, 0.5], [100, 0, 100, 0], "../img/flarePink.png"],
    "orange":   [[255, 142, 0, 1], [160, 88, 0, 0.5], [100, 56, 0, 0], "../img/flareOrange.png"],
    "yellow": [[255, 255, 0, 1], [160, 160, 0, 0.5], [100, 100, 0, 0], "../img/flareYellow.png"],
    "red":    [[255, 0, 0, 1], [160, 0, 0, 0.5], [100, 0, 0, 0], "../img/flareRed.png"],
    "green":  [[0, 255, 0, 1], [0, 160, 0, 0.5], [0, 100, 0, 0], "../img/flareGreen.png"],
    "white":  [[200, 200, 200, 1], [160, 160, 160, 0.5], [100, 100, 100, 0], "../img/flareWhite.png"],
    "blue":   [[0, 0, 255, 1], [0, 0, 160, 0.5], [0, 0, 100, 0], "../img/flareBlue.png"]
};
let currentColor = "cyan", newColor;
let maxFPS = 60, fpsInterval = 1000 / maxFPS, now, then = 0, elapsed;


let smokeSize = function (t) {return t > 120 ? 120 : 5 + 115 * t/120;};
let smokeColor= function (t) {return colorfade(colorPack[currentColor][1], [69, 69, 69, 0.5], t, 65);};
let sparkSize = function (t) {return t > 40 ? 0 : 3 - 3 * t/40;};
let sparkColor= function (t) {return colorfade([255, 255, 255, 1], colorPack[currentColor][0], t, 30);};
let flameSize = function (t) {
    let size = 0;
    if (t < 20) {
        size = 20*(t/20);
    } else if (t <= 60) {
        size = 20 - 20*((t-20)/40)
    }
    return size;
};
let flameColor= function (t) {
    let tColor;
    if (t <= 20) {
        tColor = colorfade([255, 255, 255, 0.7], colorPack[currentColor][0], t, 20);
    } else {
        tColor = colorfade(colorPack[currentColor][0], colorPack[currentColor][2], t - 20, 40);  // here 40 = 60
    }
    return tColor;
};
let feufoSize = function (t) {return t > 150 ? 7 : 7 * t/150;};
let feufoColor= function (t, color) {
    let tColor = "rgba(0, 0, 0, 0)";
    if (t < 140) {
        tColor = colorfade(colorPack[color][1], [69, 69, 69, 0.5], t, 150);
    } else if (t <= 200) {
        tColor = colorfade([69, 69, 69, 0.5], [69, 69, 69, 0], t, 150);
    }
    return tColor;
};

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
    constructor(x, y, type, centered=true, color="default") {
        this.x = x;
        this.y = y;
        this.type = type;
        this.centered = centered;
        this.color = color === "default" ? "cyan" : color;
        this.dead = false;
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
            case 5:
                this.randThreshold = 0.85;
                this.pAmmount = 1;
                break;
        }
    }
    sparkle() {
        if (this.dead) {
            return;
        }
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
                    case 5:
                        vx = (Math.random() - 0.5) * 0.5;
                        vy = -2;
                        let color = this.color;  // needed for some obscure reasons
                        particleArray.push(new Particle(
                            this.x, this.y, vx, vy, smokectx, feufoSize, 0,
                            (function (t) {return feufoColor(t, color)}),
                            Math.round(Math.random()*20+200), [Math.PI*2, 0]
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
    die() {
        this.dead = true;
        if (this.type === 1) {
            eraserArray.push(new Eraser(this.x - 275, this.y + 15, this.x + 275, 0, 200, smokectx));
        } else if (this.type === 5) {
            eraserArray.push(new Eraser(this.x - 20, this.y + 8, this.x + 20, this.y - 81, 220, smokectx));
        }
    }
}

class Eraser {
    constructor(x1, y1, x2, y2, t, ctx) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.tMax = t;
        this.ctx = ctx;
        this.yStep = y2 - y1;
        this.timeAlive = 0;
        this.startCounter = 0;
    }
    erase() {
        if (this.startCounter < 40) {
            this.startCounter++;
            return true;
        }
        this.timeAlive++;
        if (this.timeAlive <= this.tMax) {
            this.ctx.clearRect(this.x1, this.y1, this.x2 - this.x1, this.yStep * this.timeAlive / this.tMax);
            return true;
        } else {
            this.ctx.clearRect(this.x1, this.y1, this.x2 - this.x1, this.yStep);
            return false;
        }
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

function htmlChangeColor(element) {
    if (Object.keys(colorPack).includes(element.elements["color"].value)) {
        changeColor(element.elements["color"].value);
    }
}

function changeColor(colorName) {
    if (RUNNING) {
        die();
        newColor = colorName;
        setTimeout(applyColorChange, 1000);
    } else {
        newColor = colorName;
        currentColor = colorName;
        document.getElementById("flareIMG").src = colorPack[currentColor][3];
    }
}

function applyColorChange() {
    currentColor = newColor;
    document.getElementById("flareIMG").src = colorPack[currentColor][3];
    go();
}

function fpsLimit() {
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        return true;
    }
    return false;
}

function clearSmokeCanvas() {
    smoke2ctx.clearRect(0, 0, smoke2Canvas.width, smoke2Canvas.height);
    smoke2ctx.globalAlpha = .9;
    smoke2ctx.drawImage(smokeCanvas, 0, 0);
    smokectx.clearRect(0, 0, smokeCanvas.width, smokeCanvas.height);
    smokectx.drawImage(smoke2Canvas, 0, 0);
}

function animate() {
    if (STOPANIMATION) {
        return;
    }
    if (!fpsLimit()) {
        requestAnimationFrame(animate);
        return;
    }
    if (smokeCanvas.height !== window.innerHeight || smokeCanvas.width !== window.innerWidth) {
        particleArray.splice(0, particleArray.length);
        let height = window.innerHeight;
        let width = window.innerWidth;
        smokeCanvas.height = height;
        smokeCanvas.width = width;
        smoke2Canvas.height = height;
        smoke2Canvas.width = width;
        generalCanvas.height = height;
        generalCanvas.width = width;
        for (let i = 0; i < sparklerArray.length; i++) {
            if (sparklerArray[i].centered) {
                sparklerArray[i].changePos(width/2, height/2);
            }
        }
    }
    clearSmokeCanvas();
    generalctx.clearRect(0, 0, generalCanvas.width, generalCanvas.height);
    for (let i = 0; i < sparklerArray.length; i++) {
        sparklerArray[i].sparkle();
    }
    for (let i = 0; i < particleArray.length; i++) {
        if (particleArray[i].update()) {
            particleArray[i].draw();
        } else {
            particleArray.splice(i, 1);
            i--;
        }
    }
    for (let i = 0; i < eraserArray.length; i++) {
        if (!eraserArray[i].erase()) {
            eraserArray.splice(i, 1);
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
    startTimeout.push(setTimeout(start1, 4500));
    startTimeout.push(setTimeout(start1, 4500));
    startTimeout.push(setTimeout(start1, 4500));
    startTimeout.push(setTimeout(start1, 3700));
    startTimeout.push(setTimeout(start2, 3500));
    startTimeout.push(setTimeout(start3, 1000));
    startTimeout.push(setTimeout(start4, 500));
    dieTimeout = setTimeout(die, 600500);
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
    for (let i = startTimeout.length - 1; i >=0; i--) {
        clearTimeout(startTimeout[i]);
        startTimeout.splice(i, 1);
    }
    for (let i = 0; i < sparklerArray.length; i++) {
        sparklerArray[i].die();
    }
    sparklerArray.splice(0, sparklerArray.length);
    RUNNING = false;
    clearInterval(dieTimeout);
}
/*
sparklerArray.push(new Sparkler(500, 500, 5, false, "red"));
sparklerArray.push(new Sparkler(600, 500, 5, false, "green"));
sparklerArray.push(new Sparkler(500, 600, 5, false, "cyan"));
sparklerArray.push(new Sparkler(600, 600, 5, false, "orange"));
sparklerArray.push(new Sparkler(300, 500, 5, false, "blue"));
sparklerArray.push(new Sparkler(400, 500, 5, false, "pink"));
sparklerArray.push(new Sparkler(300, 600, 5, false, "white"));
sparklerArray.push(new Sparkler(400, 600, 5, false, "yellow"));*/
