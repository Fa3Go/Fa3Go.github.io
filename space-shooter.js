const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let paused = false;
let score = 0;
let lives = 3;
let gameLoop;
let currentLevel = 1;

// High score
const HIGH_SCORE_KEY = 'spaceShooterHighScore';
let highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
document.getElementById('highScore').textContent = highScore;
document.getElementById('startHighScore').textContent = highScore;

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    invulnTimer: 0
};

// Bullets
let bullets = [];
const bulletSpeed = 7;
const bulletWidth = 4;
const bulletHeight = 15;
let fireCooldown = 0;
const fireRate = 8; // frames between shots

// Enemy bullets
let enemyBullets = [];
const enemyBulletSpeed = 4;

// Enemies
let enemies = [];
const enemyWidth = 40;
const enemyHeight = 30;
const enemyPadding = 10;
let enemySpeed = 1;
let enemyDirection = 1;
let enemyShootTimer = 0;
let enemyShootInterval = 120; // Shoot every 2 seconds at 60fps

// Particles (explosions)
let particles = [];

// Screen shake
let shakeMagnitude = 0;

// Level configurations
const levels = [
    {
        name: "關卡 1",
        rows: 3,
        cols: 6,
        speed: 1,
        pattern: "standard"
    },
    {
        name: "關卡 2",
        rows: 4,
        cols: 7,
        speed: 1.5,
        pattern: "pyramid"
    },
    {
        name: "關卡 3",
        rows: 5,
        cols: 8,
        speed: 2,
        pattern: "zigzag"
    },
    {
        name: "關卡 4",
        rows: 4,
        cols: 8,
        speed: 2.5,
        pattern: "diamond"
    },
    {
        name: "關卡 5",
        rows: 6,
        cols: 9,
        speed: 3,
        pattern: "walls"
    }
];

// Sci-fi realism palette (muted, not neon)
const ACCENT_BLUE = '#6fa8ff';
const ACCENT_AMBER = '#ff9d5c';
const enemyRowColors = ['#e0654a', '#d9784a', '#c98a56', '#b5975f', '#e0654a', '#d9784a'];
const starTints = ['#ffffff', '#cfe0ff', '#ffe8d0'];

// Stars background
let stars = [];
for (let i = 0; i < 120; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.3 + 0.4,
        speed: Math.random() * 0.5 + 0.15,
        tint: starTints[Math.floor(Math.random() * starTints.length)],
        twinklePhase: Math.random() * Math.PI * 2
    });
}

// Slow-drifting nebula clouds for depth
let nebulae = [];
for (let i = 0; i < 4; i++) {
    nebulae.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        radius: 120 + Math.random() * 120,
        hue: Math.random() > 0.5 ? '111, 168, 255' : '160, 130, 255',
        drift: 0.05 + Math.random() * 0.08
    });
}

const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
bgGradient.addColorStop(0, '#141c33');
bgGradient.addColorStop(0.55, '#0a0e1a');
bgGradient.addColorStop(1, '#040509');

// Keyboard state
const keys = {};

// ---- Audio (synthesized, no external files) ----
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function beep({ freq = 440, freqEnd = null, duration = 0.1, type = 'square', volume = 0.2 }) {
    try {
        const ac = getAudioCtx();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ac.currentTime);
        if (freqEnd) {
            osc.frequency.exponentialRampToValueAtTime(freqEnd, ac.currentTime + duration);
        }
        gain.gain.setValueAtTime(volume, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
        osc.connect(gain).connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + duration);
    } catch (e) {
        // Audio not available (e.g. blocked by browser) - fail silently
    }
}

const playShoot = () => beep({ freq: 880, freqEnd: 660, duration: 0.07, type: 'square', volume: 0.12 });
const playExplosion = () => beep({ freq: 180, freqEnd: 40, duration: 0.25, type: 'sawtooth', volume: 0.2 });
const playHit = () => beep({ freq: 220, freqEnd: 60, duration: 0.3, type: 'square', volume: 0.25 });
const playLevelUp = () => beep({ freq: 440, freqEnd: 880, duration: 0.2, type: 'square', volume: 0.2 });
const playGameOver = () => beep({ freq: 440, freqEnd: 80, duration: 0.6, type: 'sawtooth', volume: 0.2 });

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Stop arrow keys / space from scrolling the page while playing,
    // which can otherwise make steering feel unresponsive.
    if ((e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
         e.key === 'ArrowUp' || e.key === 'ArrowDown') && gameRunning) {
        e.preventDefault();
    }

    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && (gameRunning || paused)) {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ---- Touch controls ----
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (isTouchDevice) {
    document.body.classList.add('touch-device');
}

function bindHold(el, key) {
    const start = (e) => { e.preventDefault(); keys[key] = true; };
    const end = (e) => { e.preventDefault(); keys[key] = false; };
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchend', end, { passive: false });
    el.addEventListener('touchcancel', end, { passive: false });
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
    el.addEventListener('mouseleave', end);
}
bindHold(document.getElementById('touchLeft'), 'ArrowLeft');
bindHold(document.getElementById('touchRight'), 'ArrowRight');

// Drag anywhere on canvas to move the ship; auto-fires while dragging.
let dragging = false;
function canvasXFromClientX(clientX) {
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    return (clientX - rect.left) * scale;
}
canvas.addEventListener('touchstart', (e) => {
    if (!gameRunning || paused) return;
    dragging = true;
    const x = canvasXFromClientX(e.touches[0].clientX);
    player.x = x - player.width / 2;
}, { passive: true });
canvas.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const x = canvasXFromClientX(e.touches[0].clientX);
    player.x = x - player.width / 2;
}, { passive: true });
canvas.addEventListener('touchend', () => { dragging = false; });
canvas.addEventListener('touchcancel', () => { dragging = false; });

// Initialize enemies based on level
function createEnemies() {
    enemies = [];
    const level = levels[currentLevel - 1];
    const rows = level.rows;
    const cols = level.cols;
    const pattern = level.pattern;

    const offsetX = (canvas.width - (cols * (enemyWidth + enemyPadding))) / 2;
    const offsetY = 50;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let shouldCreate = true;

            // Apply different patterns
            switch(pattern) {
                case "pyramid":
                    // Pyramid shape - fewer enemies at top
                    shouldCreate = col >= Math.floor((cols - row - 1) / 2) &&
                                   col < cols - Math.floor((cols - row - 1) / 2);
                    break;
                case "zigzag":
                    // Zigzag pattern
                    shouldCreate = (row + col) % 2 === 0;
                    break;
                case "diamond":
                    // Diamond shape
                    const center = Math.floor(rows / 2);
                    const distance = Math.abs(row - center);
                    shouldCreate = col >= distance && col < cols - distance;
                    break;
                case "walls":
                    // Two walls on sides
                    shouldCreate = col < 2 || col >= cols - 2;
                    break;
                default:
                    // Standard grid
                    shouldCreate = true;
            }

            if (shouldCreate) {
                enemies.push({
                    x: offsetX + col * (enemyWidth + enemyPadding),
                    y: offsetY + row * (enemyHeight + enemyPadding),
                    width: enemyWidth,
                    height: enemyHeight,
                    active: true,
                    color: enemyRowColors[row % enemyRowColors.length]
                });
            }
        }
    }

    enemySpeed = level.speed;
    enemyShootInterval = Math.max(45, 120 - (currentLevel - 1) * 15);
}

// Draw player spaceship (neon vector style)
function drawPlayer() {
    // Blink while invulnerable after taking a hit
    if (player.invulnTimer > 0 && Math.floor(player.invulnTimer / 4) % 2 === 0) {
        return;
    }

    const cx = player.x + player.width / 2;
    const top = player.y;
    const bottom = player.y + player.height;

    ctx.save();

    // Engine flame (flickering, soft)
    const flameLen = 8 + Math.random() * 6;
    const flameGrad = ctx.createLinearGradient(cx, bottom, cx, bottom + flameLen);
    flameGrad.addColorStop(0, 'rgba(255, 200, 130, 0.85)');
    flameGrad.addColorStop(1, 'rgba(255, 157, 92, 0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 6, bottom - 4);
    ctx.lineTo(cx + 6, bottom - 4);
    ctx.lineTo(cx, bottom + flameLen);
    ctx.closePath();
    ctx.fill();

    // Soft ambient glow behind hull
    ctx.shadowColor = 'rgba(111, 168, 255, 0.55)';
    ctx.shadowBlur = 10;

    // Hull (gradient fill, chevron shape, metallic shading)
    const hullGrad = ctx.createLinearGradient(player.x, top, player.x + player.width, bottom);
    hullGrad.addColorStop(0, '#2c3a56');
    hullGrad.addColorStop(0.45, '#dce6ff');
    hullGrad.addColorStop(0.55, '#8fa9d6');
    hullGrad.addColorStop(1, '#22304a');
    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = 'rgba(20, 26, 40, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(player.x + player.width, bottom - 6);
    ctx.lineTo(player.x + player.width * 0.7, bottom);
    ctx.lineTo(cx, bottom - 10);
    ctx.lineTo(player.x + player.width * 0.3, bottom);
    ctx.lineTo(player.x, bottom - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.shadowBlur = 4;
    ctx.fillStyle = ACCENT_BLUE;
    ctx.beginPath();
    ctx.arc(cx, top + player.height * 0.4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Draw enemy (shaded metallic craft)
function drawEnemy(enemy) {
    if (!enemy.active) return;

    const cx = enemy.x + enemy.width / 2;
    const cy = enemy.y + enemy.height / 2;
    const w = enemy.width / 2;
    const h = enemy.height / 2;
    const color = enemy.color || ACCENT_AMBER;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    const bodyGrad = ctx.createLinearGradient(cx, cy - h, cx, cy + h);
    bodyGrad.addColorStop(0, lighten(color, 30));
    bodyGrad.addColorStop(0.5, color);
    bodyGrad.addColorStop(1, darken(color, 35));
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = darken(color, 45);
    ctx.lineWidth = 1;

    // Hexagon hull
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.5, cy - h);
    ctx.lineTo(cx + w * 0.5, cy - h);
    ctx.lineTo(cx + w, cy);
    ctx.lineTo(cx + w * 0.5, cy + h);
    ctx.lineTo(cx - w * 0.5, cy + h);
    ctx.lineTo(cx - w, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Core sensor
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgba(20, 10, 5, 0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ACCENT_AMBER;
    ctx.beginPath();
    ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function lighten(hex, amt) {
    return shade(hex, amt);
}
function darken(hex, amt) {
    return shade(hex, -amt);
}
function shade(hex, amt) {
    const num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0xff) + amt;
    let b = (num & 0xff) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `rgb(${r}, ${g}, ${b})`;
}

// Draw bullet (soft glowing bolt)
function drawBullet(bullet) {
    ctx.save();
    ctx.shadowColor = 'rgba(111, 168, 255, 0.7)';
    ctx.shadowBlur = 6;
    const grad = ctx.createLinearGradient(0, bullet.y, 0, bullet.y + bullet.height);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, ACCENT_BLUE);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect ?
        ctx.roundRect(bullet.x, bullet.y, bullet.width, bullet.height, 2) :
        ctx.rect(bullet.x, bullet.y, bullet.width, bullet.height);
    ctx.fill();
    ctx.restore();
}

// Draw enemy bullet (soft glowing amber bolt)
function drawEnemyBullet(bullet) {
    ctx.save();
    ctx.shadowColor = 'rgba(255, 157, 92, 0.7)';
    ctx.shadowBlur = 6;
    const grad = ctx.createLinearGradient(0, bullet.y, 0, bullet.y + bullet.height);
    grad.addColorStop(0, ACCENT_AMBER);
    grad.addColorStop(1, '#fff3e6');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect ?
        ctx.roundRect(bullet.x, bullet.y, bullet.width, bullet.height, 2) :
        ctx.rect(bullet.x, bullet.y, bullet.width, bullet.height);
    ctx.fill();
    ctx.restore();
}

// Draw deep-space backdrop with soft drifting nebula clouds
function drawBackground() {
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    nebulae.forEach(n => {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        grad.addColorStop(0, `rgba(${n.hue}, 0.10)`);
        grad.addColorStop(1, `rgba(${n.hue}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

function updateNebulae() {
    nebulae.forEach(n => {
        n.y += n.drift;
        if (n.y - n.radius > canvas.height) {
            n.y = -n.radius;
            n.x = Math.random() * canvas.width;
        }
    });
}

// Draw stars (soft twinkling points)
function drawStars() {
    stars.forEach(star => {
        const twinkle = 0.5 + 0.5 * Math.sin(star.twinklePhase);
        ctx.globalAlpha = 0.25 + twinkle * 0.55;
        ctx.fillStyle = star.tint;
        const size = star.radius + 0.5;
        ctx.fillRect(Math.floor(star.x), Math.floor(star.y), size, size);
    });
    ctx.globalAlpha = 1;
}

// Update stars
function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        star.twinklePhase += 0.05;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// ---- Particle explosions ----
function spawnExplosion(x, y, colors) {
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 24 + Math.random() * 10,
            maxLife: 30,
            size: 2 + Math.floor(Math.random() * 3),
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    ctx.save();
    particles.forEach(p => {
        ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    });
    ctx.restore();
}

function triggerShake(amount) {
    shakeMagnitude = Math.max(shakeMagnitude, amount);
}

// Move player
function movePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
}

// Shoot bullet
function shootBullet() {
    bullets.push({
        x: player.x + player.width / 2 - bulletWidth / 2,
        y: player.y,
        width: bulletWidth,
        height: bulletHeight
    });
    playShoot();
}

// Handle firing input (keyboard hold or touch-drag) with a fixed cooldown
function handleFiring() {
    if (fireCooldown > 0) {
        fireCooldown--;
    }
    const wantsToFire = keys[' '] || dragging;
    if (wantsToFire && fireCooldown <= 0) {
        shootBullet();
        fireCooldown = fireRate;
    }
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y + bullets[i].height < 0) {
            bullets.splice(i, 1);
        }
    }
}

// Enemy shoot
function enemyShoot() {
    // Get all active enemies
    const activeEnemies = enemies.filter(e => e.active);
    if (activeEnemies.length === 0) return;

    // Randomly select an enemy to shoot
    const randomEnemy = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];

    enemyBullets.push({
        x: randomEnemy.x + randomEnemy.width / 2 - bulletWidth / 2,
        y: randomEnemy.y + randomEnemy.height,
        width: bulletWidth,
        height: bulletHeight
    });
}

// Update enemy bullets
function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += enemyBulletSpeed;
        if (enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    }
}

// Update enemies
function updateEnemies() {
    let changeDirection = false;

    enemies.forEach(enemy => {
        if (!enemy.active) return;

        enemy.x += enemySpeed * enemyDirection;

        // Check if any enemy hits the edge
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            changeDirection = true;
        }
    });

    // Move enemies down and reverse direction
    if (changeDirection) {
        enemyDirection *= -1;
        enemies.forEach(enemy => {
            enemy.y += 20;
        });
    }
}

// Check collisions
function checkCollisions() {
    // Player bullets hit enemies
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const bullet = bullets[bi];
        let bulletHit = false;

        for (let ei = 0; ei < enemies.length && !bulletHit; ei++) {
            const enemy = enemies[ei];
            if (enemy.active &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {

                bulletHit = true;
                enemy.active = false;
                score += 10;
                document.getElementById('score').textContent = score;

                spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, [enemy.color, '#ffe8c9', ACCENT_AMBER]);
                playExplosion();

                // Check if all enemies destroyed
                if (enemies.every(e => !e.active)) {
                    levelUp();
                }
            }
        }

        if (bulletHit) {
            bullets.splice(bi, 1);
        }
    }

    // Enemy bullets hit player
    if (player.invulnTimer > 0) {
        player.invulnTimer--;
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        if (player.invulnTimer <= 0 &&
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {

            enemyBullets.splice(i, 1);
            lives--;
            document.getElementById('lives').textContent = lives;
            player.invulnTimer = 90;

            spawnExplosion(player.x + player.width / 2, player.y + player.height / 2, [ACCENT_BLUE, '#ffffff', ACCENT_AMBER]);
            triggerShake(8);
            playHit();

            if (lives <= 0) {
                gameOver();
                return;
            }
        }
    }

    // Check if enemy reached player
    enemies.forEach(enemy => {
        if (enemy.active && enemy.y + enemy.height >= player.y) {
            gameOver();
        }
    });
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
        document.getElementById('highScore').textContent = highScore;
        document.getElementById('startHighScore').textContent = highScore;
        return true;
    }
    return false;
}

// Level up
function levelUp() {
    playLevelUp();

    if (currentLevel >= levels.length) {
        // Game completed!
        gameComplete();
        return;
    }

    // Show level complete message
    document.getElementById('levelComplete').style.display = 'block';
    gameRunning = false;
    cancelAnimationFrame(gameLoop);
    bullets = [];
    enemyBullets = [];
    enemyShootTimer = 0;

    // Move to next level after 2 seconds
    setTimeout(() => {
        document.getElementById('levelComplete').style.display = 'none';
        currentLevel++;
        document.getElementById('level').textContent = currentLevel;
        createEnemies();
        gameRunning = true;
        update();
    }, 2000);
}

// Game complete
function gameComplete() {
    gameRunning = false;
    cancelAnimationFrame(gameLoop);
    const isRecord = updateHighScore();
    document.getElementById('finalScoreComplete').textContent = score;
    document.getElementById('newRecordComplete').style.display = isRecord ? 'block' : 'none';
    document.getElementById('gameComplete').style.display = 'block';
}

// Game over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(gameLoop);
    playGameOver();
    const isRecord = updateHighScore();
    document.getElementById('finalScore').textContent = score;
    document.getElementById('newRecord').style.display = isRecord ? 'block' : 'none';
    document.getElementById('gameOver').style.display = 'block';
}

// Pause / resume
function togglePause() {
    if (!gameRunning && !paused) return;

    paused = !paused;
    document.getElementById('pauseScreen').style.display = paused ? 'block' : 'none';

    if (paused) {
        cancelAnimationFrame(gameLoop);
    } else {
        update();
    }
}

// Start game
function startGame() {
    getAudioCtx();

    // Make sure keyboard input reaches the game even when it's embedded
    // in an iframe that didn't already have focus.
    window.focus();
    canvas.focus();

    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('gameComplete').style.display = 'none';
    document.getElementById('levelComplete').style.display = 'none';
    document.getElementById('pauseScreen').style.display = 'none';

    gameRunning = true;
    paused = false;
    score = 0;
    lives = 3;
    currentLevel = 1;
    bullets = [];
    enemyBullets = [];
    particles = [];
    enemyShootTimer = 0;
    fireCooldown = 0;
    shakeMagnitude = 0;
    player.invulnTimer = 0;

    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = currentLevel;

    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 80;

    createEnemies();
    update();
}

// Restart game
function restartGame() {
    startGame();
}

// Main game loop
function update() {
    if (!gameRunning || paused) return;

    // Screen shake offset
    let shakeX = 0, shakeY = 0;
    if (shakeMagnitude > 0) {
        shakeX = (Math.random() - 0.5) * shakeMagnitude;
        shakeY = (Math.random() - 0.5) * shakeMagnitude;
        shakeMagnitude *= 0.85;
        if (shakeMagnitude < 0.5) shakeMagnitude = 0;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Background + stars
    updateNebulae();
    drawBackground();
    updateStars();
    drawStars();

    movePlayer();
    handleFiring();
    updateBullets();
    updateEnemyBullets();
    updateEnemies();
    checkCollisions();
    updateParticles();

    // Enemy shooting timer
    enemyShootTimer++;
    if (enemyShootTimer >= enemyShootInterval) {
        enemyShoot();
        enemyShootTimer = 0;
    }

    drawPlayer();
    bullets.forEach(drawBullet);
    enemyBullets.forEach(drawEnemyBullet);
    enemies.forEach(drawEnemy);
    drawParticles();

    ctx.restore();

    gameLoop = requestAnimationFrame(update);
}
