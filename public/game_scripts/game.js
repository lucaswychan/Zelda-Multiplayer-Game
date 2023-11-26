const game = (function () {
    // $("#game-canvas").css('opacity', '0.1');

    const start = () => {
        const cv = $("canvas").get(0);
        const context = cv.getContext("2d");

        const gameArea = BoundingBox(context, 60, 60, 700, 800);

        const totalGameTime = 20;   // Total game time in seconds
        const gemMaxAge = 3000;     // The maximum age of the gems in milliseconds
        const swordMaxAge = 3000;
        const attackRange = 15;

        let gameStartTime = 0;      // The timestamp when the game starts
        let collectedGems = 0;      // The number of gems collected in the game
        let swordDamage = 0;
        let attackTime = null;

        let isAttack = false;

        // Clear Data first
        $("#time-remaining").text(totalGameTime);
        $("#final-gems").text(collectedGems);

        /* Create the sprites in the game */
        const players = [Player(context, 60, 250, gameArea, 1),
            Player(context, 800, 360, gameArea, 2)]
        const gem = Gem(context, 427, 350, "green");        // The gem
        const fires = [
            Fire(context, 60, 180),  // top-left
            Fire(context, 60, 430),  // bottom-left
            Fire(context, 800, 180), // top-right
            Fire(context, 800, 430)  // bottom-right
        ];
        const sword = Sword(context, 427, 240);
        const attackEffect = AttackEffect(context, fires[0].getXY().x + 10, fires[0].getXY().y + 10);

        /* The main processing of the game */
        function doFrame(now) {
            if (gameStartTime === 0) gameStartTime = now;

            /* Update the time remaining */
            const gameTimeSoFar = now - gameStartTime;
            const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);
            $("#time-remaining").text(timeRemaining);

            sounds.background.play();
            /* TODO */
            /* Handle the game over situation here */
            if (timeRemaining === 0) {
                $("#final-gems").text(collectedGems);
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
            sword.update(now);
            gem.update(now);
            attackEffect.update(now);
            players.forEach(player => {
                player.update(now);
            });

            /* TODO */
            /* Randomize the gem and collect the gem here */
            if (gem.getAge(now) >= gemMaxAge) gem.randomize(gameArea);
            if (sword.getAge(now) >= swordMaxAge) sword.randomize(gameArea);

            players.forEach(player => {
                if (player.getBoundingBox().isPointInBox(gem.getXY().x, gem.getXY().y)) {
                    gem.randomize(gameArea);
                    sounds.collect.currentTime = 0;
                    sounds.collect.play();
                    collectedGems++;
                    $("#final-gems").text(collectedGems);
                }

                if (player.getBoundingBox().isPointInBox(sword.getXY().x, sword.getXY().y)) {
                    console.log("Successfully get the sword");
                    // sword.remove(x2, y2, 16, 16);
                    sword.randomize(gameArea);
                    sounds.collect.currentTime = 0;
                    sounds.collect.play();
                    swordDamage += 50
                }
                if (Math.abs(player.getXY().x - fires[0].getXY().x) <= attackRange && Math.abs(player.getXY().y - fires[0].getXY().y) <= attackRange && isAttack) {
                    console.log("Attacking the first fire !!!");
                    attackTime = now;
                    // attackEffect.setXY(0, 0);
                }
            });

            /* Clear the screen */
            context.clearRect(0, 0, cv.width, cv.height);

            /* Draw the sprites */
            for (const fire of fires) fire.draw();
            sword.draw();
            gem.draw();
            // draw the attack effect for a fixed time duration for enough time to display
            if (attackTime != null && Math.ceil((now - attackTime) / 1000) <= 1) attackEffect.draw();
            else {
                // console.log("The effect should not be displayed !!!");
                attackTime = null;
            }
            players.forEach(player => {
                player.draw();
            });

            /* Process the next frame */
            requestAnimationFrame(doFrame);
        }


        /* Handle the keydown of arrow keys and spacebar */
        /* Handle the keydown of arrow keys and spacebar */
        $(document).on("keydown", function (event) {

            /* TODO */
            /* Handle the key down */
            switch (event.keyCode) {
                case 37:
                    players.forEach(player => {
                        player.move(1);
                    });
                    break;
                case 38:
                    players.forEach(player => {
                        player.move(2);
                    });
                    break;
                case 39:
                    players.forEach(player => {
                        player.move(3);
                    });
                    break;
                case 40:
                    players.forEach(player => {
                        player.move(4);
                    });
                    break;
                case 32:
                    players.forEach(player => {
                        player.speedUp();
                    });
                    break;
                case 77:  //M
                    isAttack = true;
                    break;
            }
        });

        /* Handle the keyup of arrow keys and spacebar */
        $(document).on("keyup", function (event) {

            /* TODO */
            /* Handle the key up */
            switch (event.keyCode) {
                case 37:
                    players.forEach(player => {
                        player.stop(1);
                    });
                    break;
                case 38:
                    players.forEach(player => {
                        player.stop(2);
                    });
                    break;
                case 39:
                    players.forEach(player => {
                        player.stop(3);
                    });
                    break;
                case 40:
                    players.forEach(player => {
                        player.stop(4);
                    });
                    break;
                case 32:
                    players.forEach(player => {
                        player.slowDown();
                    });
                    break;
                case 77:  //M
                    isAttack = false;
                    break;
            }
        });

        /* Start the game */
        requestAnimationFrame(doFrame);
    }
    return {start};
})();
//End of games

