// Enemies our player must avoid
let Enemy = function (x, y, s) {
    // letiables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = x;
    this.y = y;
    this.speed = s;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (this.x > 505) {
        this.x = -100;
        this.speed = Math.floor(Math.random() * 150) + 5;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

let Player = function (x, y) {
    this.sprite = 'images/char-boy.png'; /// we can write a function that allows players to select a sprite later
    this.x = x;
    this.y = y;
    this.score = 0;
    this.lives = 5;
    this.gems = 0
    this.spriteIndex = 0;
}

Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.update = function () {
    if (this.y === -11) {
        this.score++;
        this.revert();
    }
};

Player.prototype.revert = function () {
    this.x = 202;
    this.y = 404;
};

Player.prototype.select = function () {
    if (this.x === 404 && this.y === 321) {
        let charArray = ['images/char-boy.png',
            'images/char-cat-girl.png',
            'images/char-horn-girl.png',
            'images/char-pink-girl.png',
            'images/char-princess-girl.png'];
        this.spriteIndex++;
        if (this.spriteIndex > 4) {
            this.spriteIndex = 0;
        }
        this.sprite = charArray[this.spriteIndex];
    }
};

Player.prototype.handleInput = function (keyCode) {
    switch (keyCode) {
        case 'left':
            (this.x - 101 < 0) ? this.x : this.x -= 101;
            break;
        case 'right':
            (this.x + 101 > 405) ? this.x : this.x += 101;
            break;
        case 'up':
            (this.y - 83 < -11) ? this.y : this.y -= 83;
            break;
        case 'down':
            (this.y + 83 > 404) ? this.y : this.y += 83;
            break;
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a letiable called player
let player = new Player(202, 404);

let xPosEnemies = [0, 0, 0];
let yPosEnemies = [72, 155, 238];
let allEnemies = [];

for (let i = 0; i < 3; i++) {
    const speed = Math.floor(Math.random()) + 5;
    allEnemies[i] = new Enemy(xPosEnemies[i], yPosEnemies[i], (Math.floor(Math.random() * 150) + 5));
}

// In order to disable key input after the final modal is flashed.
document.addEventListener('keyup', playerMovementCallback);

function playerMovementCallback(e) {
    let allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
}

// modified version for toggling characters
document.addEventListener('keyup', function (e) {
    let allowedKeys = {
        32: 'space'
    };

    player.select(allowedKeys[e.keyCode]);
});

// creating a constructor for hearts
let Heart = function (x, y) {
    this.x = x;
    this.y = y;
    this.sprite = 'images/Heart.png';
};

Heart.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Heart.prototype.update = function () {
    let updatedPositions = generateRandomPosition();
    this.x = updatedPositions[0];
    this.y = updatedPositions[1];
};

let heartStartingPosition = generateRandomPosition();
let heart = new Heart(heartStartingPosition[0], heartStartingPosition[1]);

function generateRandomPosition() {
    const gridPosX = [0, 101, 202, 303, 404];
    const gridPosY = [72, 155, 238, 321, 404];
    let xHeart = gridPosX[Math.floor(Math.random() * gridPosX.length)];
    let yHeart = gridPosY[Math.floor(Math.random() * gridPosY.length)];
    while (xHeart === 404 && yHeart === 321) {
        let updatedAgain = generateRandomPosition();
        xHeart = updatedAgain[0];
        yHeart = updatedAgain[1];
    }
    return [xHeart, yHeart];
}

let Gem = function (x, y, sprite) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
};

Gem.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Gem.prototype.update = function () {
    let updatedGem = generateRandomGem();
    let updatedPositions = generateRandomPosition();
    this.x = updatedPositions[0];
    this.y = updatedPositions[1];
    this.sprite = updatedGem;
};

function generateRandomGem() {
    const gems = [
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png'
    ];
    return gems[Math.floor(Math.random() * gems.length)];
}

let gemStartingSprite = generateRandomGem();
let gemStartingPosition = generateRandomPosition();

let gem = new Gem(gemStartingPosition[0], gemStartingPosition[1], gemStartingSprite);
