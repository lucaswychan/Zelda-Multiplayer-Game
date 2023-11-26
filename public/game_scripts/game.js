const game = (() => {
    // $("#game-canvas").css('opacity', '0.1');
    const totalGameTime = 20;   // Total game time in seconds
    const gemMaxAge = 3000;     // The maximum age of the gems in milliseconds
    let gameStartTime = 0;      // The timestamp when the game starts
    let collectedGems = 0;      // The number of gems collected in the game

    const start = () => {
        const cv = $("canvas").get(0);
        const context = cv.getContext("2d");

        const gameArea = BoundingBox(context, 165, 60, 420, 800);

        /* Create the sprites in the game */
        const player = Player(context, 427, 240, gameArea); // The player
        const gem = Gem(context, 427, 350, "green");        // The gem
        const fires = [
            Fire(context, 60, 180),  // top-left
            Fire(context, 60, 430),  // bottom-left
            Fire(context, 800, 180), // top-right
            Fire(context, 800, 430)  // bottom-right
        ];

        /* The main processing of the game */
        function doFrame(now) {
            if (gameStartTime == 0) gameStartTime = now;

            /* Update the time remaining */
            const gameTimeSoFar = now - gameStartTime;
            const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);
            $("#time-remaining").text(timeRemaining);

            sounds.background.play();
            /* TODO */
            /* Handle the game over situation here */
            if (timeRemaining == 0) {
                $("#final-gems").text(collectedGems);
                $("#game-over").show();
                console.log("Game is ended")
                // show the game over page
                GamePage.hide()
                GameOverPage.show()

                sounds.background.pause();
                sounds.gameOver.play();
                return;
            }


            /* Update the sprites */
            for (const fire of fires) fire.update(now);
            gem.update(now);
            player.update(now);

            /* TODO */
            /* Randomize the gem and collect the gem here */
            if (gem.getAge(now) >= gemMaxAge) gem.randomize(gameArea);

            const { x, y } = gem.getXY();
            if (player.getBoundingBox().isPointInBox(x, y)) {
                gem.randomize(gameArea);
                sounds.collect.currentTime = 0;
                sounds.collect.play();
                collectedGems++;
            }


            /* Clear the screen */
            context.clearRect(0, 0, cv.width, cv.height);

            /* Draw the sprites */
            for (const fire of fires) fire.draw();
            gem.draw();
            player.draw();

            /* Process the next frame */
            requestAnimationFrame(doFrame);
        }
            
          
            /* Handle the keydown of arrow keys and spacebar */
            $(document).on("keydown", function (event) {

                /* TODO */
                /* Handle the key down */
                switch (event.keyCode) {
                    case 37:
                        player.move(1);
                        break;
                    case 38:
                        player.move(2);
                        break;
                    case 39:
                        player.move(3);
                        break;
                    case 40:
                        player.move(4);
                        break;
                    case 32:
                        player.speedUp();
                        break;
                }
            });

            /* Handle the keyup of arrow keys and spacebar */
            $(document).on("keyup", function (event) {
            
                /* TODO */
                /* Handle the key up */
                switch (event.keyCode) {
                    case 37:
                        player.stop(1);
                        break;
                    case 38:
                        player.stop(2);
                        break;
                    case 39:
                        player.stop(3);
                        break;
                    case 40:
                        player.stop(4);
                        break;
                    case 32:
                        player.slowDown();
                        break;
                }
        });

           /* Start the game */
           requestAnimationFrame(doFrame);
    }
    return { start };
})();
//End of game

