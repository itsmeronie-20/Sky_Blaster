const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const bestText = document.getElementById("best");

const menu = document.getElementById("menu");
const menuText = document.getElementById("menuText");
const startBtn = document.getElementById("startBtn");


/* =========================
   GAME SIZE
========================= */

let W = 1200;
let H = 800;

function resizeCanvas() {

    canvas.width = W;
    canvas.height = H;

    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


/* =========================
   VARIABLES
========================= */

let running = false;

let score = 0;
let lives = 3;

let best =
    Number(localStorage.getItem("skyBlasterBest")) || 0;

bestText.textContent = best;

let level = 1;

let enemyTimer = 0;
let shootTimer = 0;

let particles = [];
let bullets = [];
let enemies = [];

let keys = {};


/* =========================
   TOUCH CONTROL
========================= */

let touchActive = false;

let targetX = W / 2;
let targetY = H - 100;


function getTouchPosition(e) {

    const rect =
        canvas.getBoundingClientRect();

    const clientX =
        e.touches ?
        e.touches[0].clientX :
        e.clientX;

    const clientY =
        e.touches ?
        e.touches[0].clientY :
        e.clientY;

    targetX =
        (clientX - rect.left)
        * (W / rect.width);

    targetY =
        (clientY - rect.top)
        * (H / rect.height);

    targetX =
        Math.max(
            40,
            Math.min(W - 40, targetX)
        );

    targetY =
        Math.max(
            80,
            Math.min(H - 60, targetY)
        );
}


/* TOUCH START */

canvas.addEventListener(
    "touchstart",
    e => {

        e.preventDefault();

        if (!running) return;

        touchActive = true;

        getTouchPosition(e);

    },
    { passive: false }
);


/* TOUCH MOVE */

canvas.addEventListener(
    "touchmove",
    e => {

        e.preventDefault();

        if (!running) return;

        touchActive = true;

        getTouchPosition(e);

    },
    { passive: false }
);


/* TOUCH END */

canvas.addEventListener(
    "touchend",
    e => {

        e.preventDefault();

        touchActive = false;

    },
    { passive: false }
);


/* =========================
   MOUSE CONTROL
========================= */

canvas.addEventListener(
    "mousedown",
    e => {

        if (!running) return;

        touchActive = true;

        getTouchPosition(e);

    }
);


canvas.addEventListener(
    "mousemove",
    e => {

        if (!running || !touchActive) return;

        getTouchPosition(e);

    }
);


canvas.addEventListener(
    "mouseup",
    () => {

        touchActive = false;

    }
);


/* =========================
   PLAYER
========================= */

const player = {

    x: W / 2,
    y: H - 100,

    width: 60,
    height: 75,

    speed: 7,

    cooldown: 9
};


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    e => {

        keys[e.key.toLowerCase()] = true;

        if (
            e.key === " " ||
            e.key.startsWith("Arrow")
        ) {
            e.preventDefault();
        }

        if (
            e.key === " " &&
            !running
        ) {
            startGame();
        }
    }
);


document.addEventListener(
    "keyup",
    e => {

        keys[e.key.toLowerCase()] = false;

    }
);


/* =========================
   START GAME
========================= */

startBtn.addEventListener(
    "click",
    startGame
);


function startGame() {

    running = true;

    score = 0;
    lives = 3;
    level = 1;

    bullets = [];
    enemies = [];
    particles = [];

    player.x = W / 2;
    player.y = H - 100;

    targetX = player.x;
    targetY = player.y;

    enemyTimer = 0;
    shootTimer = 0;

    scoreText.textContent = score;
    livesText.textContent = lives;

    menu.style.display = "none";
}


/* =========================
   SHOOT
========================= */

function shoot() {

    bullets.push({

        x: player.x,

        y: player.y - 38,

        width: 6,
        height: 20,

        speed: 12
    });
}


/* =========================
   ENEMY
========================= */

function spawnEnemy() {

    const size =
        50 + Math.random() * 15;

    enemies.push({

        x:
            size +
            Math.random() *
            (W - size * 2),

        y: -70,

        width: size,
        height: size,

        speed:
            2.2 +
            Math.random() * 1.5 +
            level * 0.25,

        health: 1
    });
}


/* =========================
   EXPLOSION
========================= */

function explosion(x, y) {

    for (let i = 0; i < 20; i++) {

        particles.push({

            x: x,
            y: y,

            vx:
                (Math.random() - 0.5) * 9,

            vy:
                (Math.random() - 0.5) * 9,

            life:
                30 +
                Math.random() * 25,

            size:
                2 +
                Math.random() * 5
        });
    }
}


/* =========================
   COLLISION
========================= */

function collision(a, b) {

    return (

        a.x - a.width / 2 <
        b.x + b.width / 2 &&

        a.x + a.width / 2 >
        b.x - b.width / 2 &&

        a.y - a.height / 2 <
        b.y + b.height / 2 &&

        a.y + a.height / 2 >
        b.y - b.height / 2
    );
}


/* =========================
   UPDATE
========================= */

function update() {

    if (!running) return;


    /* PLAYER KEYBOARD */

    if (
        keys["arrowleft"] ||
        keys["a"]
    ) {
        player.x -= player.speed;
    }

    if (
        keys["arrowright"] ||
        keys["d"]
    ) {
        player.x += player.speed;
    }

    if (
        keys["arrowup"] ||
        keys["w"]
    ) {
        player.y -= player.speed;
    }

    if (
        keys["arrowdown"] ||
        keys["s"]
    ) {
        player.y += player.speed;
    }


    /* PLAYER TOUCH */

    if (touchActive) {

        const dx =
            targetX - player.x;

        const dy =
            targetY - player.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (distance > 5) {

            const moveSpeed =
                Math.min(
                    player.speed * 1.7,
                    distance
                );

            player.x +=
                (dx / distance) *
                moveSpeed;

            player.y +=
                (dy / distance) *
                moveSpeed;
        }
    }


    /* BOUNDARIES */

    player.x =
        Math.max(
            40,
            Math.min(
                W - 40,
                player.x
            )
        );

    player.y =
        Math.max(
            80,
            Math.min(
                H - 60,
                player.y
            )
        );


    /* SHOOT */

    shootTimer--;

    const firing =
        keys[" "] ||
        touchActive;

    if (
        firing &&
        shootTimer <= 0
    ) {

        shoot();

        shootTimer =
            player.cooldown;
    }


    /* BULLETS */

    bullets.forEach(b => {

        b.y -= b.speed;

    });

    bullets =
        bullets.filter(
            b => b.y > -30
        );


    /* ENEMY SPAWN */

    enemyTimer--;

    if (enemyTimer <= 0) {

        spawnEnemy();

        enemyTimer =
            Math.max(
                18,
                60 - level * 3
            );
    }


    /* ENEMIES */

    enemies.forEach(enemy => {

        enemy.y += enemy.speed;

    });


    /* COLLISION */

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];

        let destroyed = false;


        /* BULLET HIT */

        for (
            let j = bullets.length - 1;
            j >= 0;
            j--
        ) {

            if (
                collision(
                    bullets[j],
                    enemy
                )
            ) {

                bullets.splice(j, 1);

                explosion(
                    enemy.x,
                    enemy.y
                );

                enemies.splice(i, 1);

                score += 10;

                scoreText.textContent =
                    score;

                level =
                    Math.floor(
                        score / 100
                    ) + 1;

                destroyed = true;

                break;
            }
        }

        if (destroyed) continue;


        /* PLAYER HIT */

        if (
            collision(
                player,
                enemy
            )
        ) {

            explosion(
                enemy.x,
                enemy.y
            );

            enemies.splice(i, 1);

            lives--;

            livesText.textContent =
                lives;

            if (lives <= 0) {
                gameOver();
            }
        }


        /* ENEMY ESCAPES */

        else if (
            enemy.y > H + 80
        ) {

            enemies.splice(i, 1);

            lives--;

            livesText.textContent =
                lives;

            if (lives <= 0) {
                gameOver();
            }
        }
    }


    /* PARTICLES */

    particles.forEach(p => {

        p.x += p.vx;
        p.y += p.vy;

        p.life--;

        p.vx *= 0.97;
        p.vy *= 0.97;

    });

    particles =
        particles.filter(
            p => p.life > 0
        );
}


/* =========================
   DRAW PLAYER
========================= */

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    /* FIRE */

    ctx.fillStyle = "#ff9f1c";

    ctx.beginPath();

    ctx.moveTo(-12, 32);

    ctx.lineTo(
        0,
        55 + Math.random() * 10
    );

    ctx.lineTo(12, 32);

    ctx.fill();


    /* WINGS */

    ctx.fillStyle = "#38bdf8";

    ctx.beginPath();

    ctx.moveTo(-15, 0);
    ctx.lineTo(-45, 28);
    ctx.lineTo(-15, 22);

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(15, 0);
    ctx.lineTo(45, 28);
    ctx.lineTo(15, 22);

    ctx.fill();


    /* BODY */

    ctx.fillStyle = "#e5e7eb";

    ctx.beginPath();

    ctx.moveTo(0, -38);
    ctx.lineTo(18, 28);
    ctx.lineTo(0, 38);
    ctx.lineTo(-18, 28);

    ctx.closePath();

    ctx.fill();


    /* COCKPIT */

    ctx.fillStyle = "#0ea5e9";

    ctx.beginPath();

    ctx.ellipse(
        0,
        -9,
        9,
        15,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* NOSE */

    ctx.fillStyle = "#fff";

    ctx.beginPath();

    ctx.moveTo(0, -45);
    ctx.lineTo(7, -28);
    ctx.lineTo(-7, -28);

    ctx.fill();

    ctx.restore();
}


/* =========================
   DRAW ENEMY
========================= */

function drawEnemy(enemy) {

    ctx.save();

    ctx.translate(
        enemy.x,
        enemy.y
    );


    /* WINGS */

    ctx.fillStyle = "#ef4444";

    ctx.beginPath();

    ctx.moveTo(-12, 0);
    ctx.lineTo(-38, 23);
    ctx.lineTo(-12, 17);

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(12, 0);
    ctx.lineTo(38, 23);
    ctx.lineTo(12, 17);

    ctx.fill();


    /* BODY */

    ctx.fillStyle = "#dc2626";

    ctx.beginPath();

    ctx.moveTo(0, -30);
    ctx.lineTo(16, 27);
    ctx.lineTo(0, 32);
    ctx.lineTo(-16, 27);

    ctx.closePath();

    ctx.fill();


    /* COCKPIT */

    ctx.fillStyle = "#111827";

    ctx.beginPath();

    ctx.ellipse(
        0,
        -8,
        8,
        13,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}


/* =========================
   BACKGROUND
========================= */

function drawBackground() {

    ctx.fillStyle =
        "rgba(255,255,255,.7)";

    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const x =
            (i * 137) % W;

        const y =
            (
                i * 83 +
                Date.now() / 30
            ) % H;

        ctx.fillRect(
            x,
            y,
            2,
            2
        );
    }


    ctx.fillStyle =
        "rgba(56,189,248,.08)";

    ctx.fillRect(
        0,
        H - 45,
        W,
        45
    );
}


/* =========================
   DRAW
========================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    drawBackground();


    /* BULLETS */

    bullets.forEach(b => {

        ctx.fillStyle =
            "#facc15";

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#facc15";

        ctx.fillRect(
            b.x - 3,
            b.y,
            b.width,
            b.height
        );

        ctx.shadowBlur = 0;
    });


    enemies.forEach(drawEnemy);

    drawPlayer();


    /* PARTICLES */

    particles.forEach(p => {

        ctx.globalAlpha =
            Math.max(
                0,
                p.life / 40
            );

        ctx.fillStyle =
            "#ffb703";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });

    ctx.globalAlpha = 1;
}


/* =========================
   GAME OVER
========================= */

function gameOver() {

    running = false;

    touchActive = false;


    if (score > best) {

        best = score;

        localStorage.setItem(
            "skyBlasterBest",
            best
        );
    }


    bestText.textContent =
        best;


    menuText.innerHTML =
        `💥 GAME OVER<br><br>
        Score: <b>${score}</b><br>
        Best: <b>${best}</b>`;


    startBtn.textContent =
        "PLAY AGAIN";


    menu.style.display =
        "flex";
}


/* =========================
   GAME LOOP
========================= */

function loop() {

    update();

    draw();

    requestAnimationFrame(loop);
}

loop();