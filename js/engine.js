/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas element's height/width and add it to the DOM.
     */

    /* some global variable for logging game state */
    let timer = '';
    let gameEnded = false;

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* Adding new HTML elements to the body of the page to make a score card, lives counter, timer etc*/

    function createStatsTable() {
        let newDiv = document.createElement('div');
        newDiv.setAttribute("id","Stats");
        document.body.appendChild(newDiv);

        let newHeaderElement = document.createElement("h2");
        let newHeaderContent = document.createTextNode("FROGGER?");
        newHeaderElement.appendChild(newHeaderContent);
        newDiv.appendChild(newHeaderElement);

        let newInstructionsElement = document.createElement("p");
        let newInstructionsContent = document.createTextNode("Welcome! Get past the bugs to get points. Watch out for extra lives and gems. Each gem gives you 10 points and you can carry up to 10 lives. Reach 50 points to win. You lose if you lose all your lives");
        newInstructionsElement.setAttribute("class","instructions");
        newInstructionsElement.appendChild(newInstructionsContent);
        newDiv.appendChild(newInstructionsElement);

        let newScoreElement = document.createElement("p");
        let newScoreContent = document.createTextNode("Score:");
        newScoreElement.setAttribute("class","score");
        newScoreElement.appendChild(newScoreContent);
        newDiv.appendChild(newScoreElement)

        let newLivesElement = document.createElement("p");
        let newLivesContent = document.createTextNode("Number of lives: 5");
        newLivesElement.setAttribute("class","lives");
        newLivesElement.appendChild(newLivesContent);
        newDiv.appendChild(newLivesElement);

        let newGemsElement = document.createElement("p");
        let newGemsContent = document.createTextNode("Number of Gems Collected: 0");
        newGemsElement.setAttribute("class","gems");
        newGemsElement.appendChild(newGemsContent);
        newDiv.appendChild(newGemsElement);

        let newTimerElement = document.createElement("p");
        let newTimerContent = document.createTextNode("Timer:");
        newTimerElement.setAttribute("class","timer");
        newTimerElement.appendChild(newTimerContent);
        newDiv.appendChild(newTimerElement);
    }

    createStatsTable();

    startTimer();

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        if (!gameEnded) {
            updateEntities(dt);
            checkCollisions();
            if ((player.score > 10 && player.score % 5 === 0) && player.lives < 10) {
                collectHearts();
            }
            if (player.score > 10 && isPrime(player.score)) {
                collectGems();
            }
            checkWinningCondition();
        }
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt); // update enemy position
        });
        player.update(); // update player state
        updateScore();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        ctx.drawImage(Resources.get('images/Selector.png'), 404, 321);

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        player.render();
        if ((player.score > 10 && player.score % 5 === 0) && player.lives < 10) {
            heart.render();
        }
        if (player.score > 10 && isPrime(player.score)) {
            gem.render(); // Idea is that gems only appear when the player's score is a prime number to give an appearance of randomness?
        }
    }

    /* Writing a collision checking function using the enemy and player objects*/
    function checkCollisions() {
        if (player.y < 321) {
            allEnemies.forEach(function(enemy) {
                if ((player.x > enemy.x) && (player.x - enemy.x -81 <=0) && (player.y === enemy.y)) {
                    player.revert();
                    loseLives();
                } else if((enemy.x > player.x) && (enemy.x - player.x - 70 <=0) && (player.y === enemy.y)) {
                    player.revert();
                    loseLives();
                }
            });
        }
    }

    /* This function is to handle losing a life upon collisions */
    function loseLives() {
        player.lives--;
        updateLives();
        if (player.lives === 0) {
            gameEnded = true;
            reset();
        }
    }

    function collectHearts() {
        if (player.x === heart.x && player.y === heart.y) {
            player.lives++;
            updateLives();
            heart.update();
        }
    }

    function collectGems() {
        if (player.x === gem.x && player.y === gem.y) {
            player.gems++;
            player.score += 10;
            updateScore();
            updateGemCount();
            gem.update();
        }
    }

    function updateLives() {
        let lifeCounterHTML = document.querySelector(".lives");
        lifeCounterHTML.textContent = "Number of lives: " + player.lives.toString();
    }

    function updateScore() {
        let scoreCounterHTML = document.querySelector(".score"); // update game score
        scoreCounterHTML.textContent = "Score: " + player.score.toString();
    }

    function updateGemCount() {
        let gemCounterHTML = document.querySelector(".gems"); // update game score
        gemCounterHTML.textContent = "Number of Gems Collected: " + player.gems.toString();
    }

    function checkWinningCondition() {
        if (player.score >= 50) {
            gameEnded = true;
            reset();
        }
    }

    // Timer to measure the amount of time taken to finish the game in MM:SS
    function startTimer() {
        let seconds = 0;
        let secondsCalc = '';
        let minutesCalc = '';
        timer = setInterval(function() {
            seconds++;
            secondsCalc = (seconds%60).toString();
            if (secondsCalc<10) {
                secondsCalc = "0" + secondsCalc;
            }
            minutesCalc = (Math.floor(seconds/60)).toString();
            if (minutesCalc<10) {
                minutesCalc = "0" + minutesCalc;
            }
            totalTime = minutesCalc + " : " + secondsCalc;
            document.querySelector(".timer").textContent = "Timer: " + totalTime;
        },1000);
    }

    // Function to stop and clear the timer when the game ends and upon reset
    function stopTimer() {
        clearInterval(timer);
    }

    function isPrime(n) {
        for(let q=2;q<n;q++) {
            if(n % q === 0) {
                return false
            }
        }
        return true;
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        stopTimer();
        player.revert();
        document.removeEventListener('keyup',playerMovementCallback);
        let finalScore = player.score;
        let finalLives = player.lives;
        let replyMessage = "Yay! You Win";
        if (finalLives === 0) {
            replyMessage = "OOPS! You Lost!"
        }
        // Using modal from Bootstrap
        let replyHeader = replyMessage;
        let modalHeaderHTML = document.querySelector(".modal-title");
        modalHeaderHTML.innerHTML = replyHeader;
        let reply = `Time taken: ${totalTime} <br>
                 Score: ${finalScore} <br>
                 Lives: ${finalLives} <br><br>
                 Would you like to play again?`;
        let modalMessageHTML = document.querySelector(".modal-message");
        modalMessageHTML.innerHTML = reply;
        $('#myModal').modal();
        let playAgain = document.querySelector("#play-again");
        playAgain.addEventListener('click',function(){
            document.location.reload(true);//init();
            $('#myModal').modal('hide');
        });
        let playCancel = document.querySelector("#stop-playing");
        playCancel.addEventListener('click', function() {
            $('#myModal').modal('hide');
        });
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/Heart.png',
        'images/Selector.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
