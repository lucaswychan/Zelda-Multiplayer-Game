const game = (() => {

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
        const fires = [Fire(context, 60, 420), Fire(context, 800, 420), Fire(context, 60, 165), Fire(context, 800, 165),]

        /* The main processing of the game */
        function doFrame(now) {
            if (gameStartTime === 0) gameStartTime = now;

            /* Update the time remaining */
            const gameTimeSoFar = now - gameStartTime;
            const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);
            $("#time-remaining").text(timeRemaining);


            /* TODO */
            /* Handle the game over situation here */
            if (timeRemaining <= 0) {
                sounds.background.pause();
                sounds.collect.pause();
                sounds.gameover.play();
                $("#final-gems").text(collectedGems);
                $("#game-over").css("display", "block");
                return
            }


            /* Update the sprites */
            gem.update(now);
            player.update(now);
            for (const fire of fires) {
                fire.update(now);
            }

            /* TODO */
            /* Randomize the gem and collect the gem here */
            gemAge = gem.getAge(now)
            playerBox = player.getBoundingBox()
            gemPos = gem.getXY()
            isGemCollect = playerBox.isPointInBox(gemPos.x, gemPos.y)

            if (isGemCollect) {
                sounds.collect.currentTime = 0;
                sounds.collect.play();
                collectedGems++;
                gem.randomize(gameArea);
            }

            if (gemAge >= gemMaxAge) {
                gem.randomize(gameArea);
            }


            /* Clear the screen */
            context.clearRect(0, 0, cv.width, cv.height);

            /* Draw the sprites */
            gem.draw();
            player.draw();
            for (const fire of fires) {
                fire.draw();
            }

            /* Process the next frame */
            requestAnimationFrame(doFrame);
        }

        /* Handle the start of the game */
        $("#game-start").on("click", function () {
            gem.randomize(gameArea);

            sounds.background.play();
            /* Hide the start screen */
            $("#game-start").hide();

            /* Handle the keydown of arrow keys and spacebar */
            $(document).on("keydown", function (event) {
                /* TODO */
                /* Handle the key down */
                if (event.keyCode == 37) {
                    player.move(1)
                }
                if (event.keyCode == 38) {
                    player.move(2)
                }
                if (event.keyCode == 39) {
                    player.move(3)
                }
                if (event.keyCode == 40) {
                    player.move(4)
                }
                //speed up
                if (event.keyCode == 32) {
                    player.speedUp()
                }


            });

            /* Handle the keyup of arrow keys and spacebar */
            $(document).on("keyup", function (event) {

                /* TODO */
                /* Handle the key up */
                if (event.keyCode == 37) {
                    player.stop(1)
                }
                if (event.keyCode == 38) {
                    player.stop(2)
                }
                if (event.keyCode == 39) {
                    player.stop(3)
                }
                if (event.keyCode == 40) {
                    player.stop(4)
                }

                //speed up
                if (event.keyCode == 32) {
                    player.slowDown()
                }

            });
            /* Start the game */
            requestAnimationFrame(doFrame);
        });
    }
    return { start };
})();
//End of game

