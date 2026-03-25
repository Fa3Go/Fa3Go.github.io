const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let score = 0;
let lives = 3;
let gameLoop;
let currentLevel = 1;

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0
};

// Bullets
let bullets = [];
const bulletSpeed = 7;
const bulletWidth = 4;
const bulletHeight = 15;

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
const enemyShootInterval = 120; // Shoot every 2 seconds at 60fps

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

// Stars background
let stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        speed: Math.random() * 0.5 + 0.2
    });
}

// Keyboard state
const keys = {};

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ' && gameRunning) {
        e.preventDefault();
        shootBullet();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

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
                    active: true
                });
            }
        }
    }

    enemySpeed = level.speed;
}

// Draw player spaceship (pixel style)
function drawPlayer() {
    const px = Math.floor(player.x);
    const py = Math.floor(player.y);
    const size = 8;

    // Ship body (green blocks)
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(px + size * 2, py, size, size); // top
    ctx.fillRect(px + size, py + size, size * 3, size); // middle row
    ctx.fillRect(px, py + size * 2, size * 5, size * 2); // bottom wide
    ctx.fillRect(px + size, py + size * 4, size * 3, size); // bottom narrow

    // Cockpit (cyan)
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(px + size * 2, py + size, size, size);

    // Wings (darker green)
    ctx.fillStyle = '#00aa00';
    ctx.fillRect(px, py + size * 2, size, size);
    ctx.fillRect(px + size * 4, py + size * 2, size, size);
}

// Draw enemy (pixel style)
function drawEnemy(enemy) {
    if (!enemy.active) return;

    const ex = Math.floor(enemy.x);
    const ey = Math.floor(enemy.y);
    const size = 6;

    // Enemy body (red invader style)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(ex + size, ey, size * 4, size); // top row
    ctx.fillRect(ex, ey + size, size * 6, size); // second row
    ctx.fillRect(ex, ey + size * 2, size * 6, size); // third row
    ctx.fillRect(ex + size, ey + size * 3, size, size); // bottom left
    ctx.fillRect(ex + size * 4, ey + size * 3, size, size); // bottom right

    // Enemy eyes (yellow)
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(ex + size, ey + size, size, size);
    ctx.fillRect(ex + size * 4, ey + size, size, size);
}

// Draw bullet (pixel style)
function drawBullet(bullet) {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(Math.floor(bullet.x), Math.floor(bullet.y), bullet.width, bullet.height);
}

// Draw enemy bullet (pixel style)
function drawEnemyBullet(bullet) {
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(Math.floor(bullet.x), Math.floor(bullet.y), bullet.width, bullet.height);
}

// Draw stars (pixel style)
function drawStars() {
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        const size = Math.floor(star.radius) + 1;
        ctx.fillRect(Math.floor(star.x), Math.floor(star.y), size, size);
    });
}

// Update stars
function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// Move player
function movePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
}

// Shoot bullet
function shootBullet() {
    bullets.push({
        x: player.x + player.width / 2 - bulletWidth / 2,
        y: player.y,
        width: bulletWidth,
        height: bulletHeight
    });
}

// Update bullets
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;

        // Remove bullet if off screen
        if (bullet.y + bullet.height < 0) {
            bullets.splice(index, 1);
        }
    });
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
    enemyBullets.forEach((bullet, index) => {
        bullet.y += enemyBulletSpeed;

        // Remove bullet if off screen
        if (bullet.y > canvas.height) {
            enemyBullets.splice(index, 1);
        }
    });
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
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (enemy.active &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {

                // Remove bullet and enemy
                bullets.splice(bulletIndex, 1);
                enemy.active = false;
                score += 10;
                document.getElementById('score').textContent = score;

                // Check if all enemies destroyed
                if (enemies.every(e => !e.active)) {
                    levelUp();
                }
            }
        });
    });

    // Enemy bullets hit player
    enemyBullets.forEach((bullet, bulletIndex) => {
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {

            // Remove bullet and reduce life
            enemyBullets.splice(bulletIndex, 1);
            lives--;
            document.getElementById('lives').textContent = lives;

            if (lives <= 0) {
                gameOver();
            }
        }
    });

    // Check if enemy reached player
    enemies.forEach(enemy => {
        if (enemy.active && enemy.y + enemy.height >= player.y) {
            gameOver();
        }
    });
}

// Level up
function levelUp() {
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
    document.getElementById('finalScoreComplete').textContent = score;
    document.getElementById('gameComplete').style.display = 'block';
}

// Game over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(gameLoop);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

// Start game
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('gameComplete').style.display = 'none';
    document.getElementById('levelComplete').style.display = 'none';

    gameRunning = true;
    score = 0;
    lives = 3;
    currentLevel = 1;
    bullets = [];
    enemyBullets = [];
    enemyShootTimer = 0;

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
    if (!gameRunning) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw
    updateStars();
    drawStars();

    movePlayer();
    updateBullets();
    updateEnemyBullets();
    updateEnemies();
    checkCollisions();

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

    gameLoop = requestAnimationFrame(update);
}
