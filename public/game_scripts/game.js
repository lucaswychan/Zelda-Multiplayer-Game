const game = (function () {
    // $("#game-canvas").css('opacity', '0.1');

    const start = () => {
        const cv = $("canvas").get(0);
        const context = cv.getContext("2d");

        const gameArea = BoundingBox(context, 165, 60, 420, 800);

        const totalGameTime = 20;   // Total game time in seconds
        const gemMaxAge = 3000;     // The maximum age of the gems in milliseconds
        const swordMaxAge = 3000;
        const gemScore = 20; 

        let gameStartTime = 0;      // The timestamp when the game starts
        let collectedGems = 0;      // The number of gems collected in the game

        let player1Score = 0;
        let player2Score = 0;

        let player1SwordDamage = 100;
        let player2SwordDamage = 100;

        // Clear Data first
        $("#time-remaining").text(totalGameTime);
        $("#final-gems").text(collectedGems);
        $("#player1-score").text(0);
        $("#player2-score").text(0);
        $("#player1-monster-score").text(player1SwordDamage);
        $("#player2-monster-score").text(player1SwordDamage);    

        /* Create the sprites in the game */
        const player1 = Player1(context, 427, 240, gameArea); // The player
        const player2 = Player2(context, 400, 200, gameArea); // The player
        const gem = Gem(context, 427, 350, "green");        // The gem
        const fires = [
            Fire(context, 60, 180),  // top-left
            Fire(context, 60, 430),  // bottom-left
            Fire(context, 800, 180), // top-right
            Fire(context, 800, 430)  // bottom-right
        ];
        const sword = Sword(context, 427, 240);

        /* The main processing of the game */
        function doFrame(now) {
            if (gameStartTime == 0) gameStartTime = now;

            /* Update the time remaining */
            const gameTimeSoFar = now - gameStartTime;
            const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);

            // set displaye data in  game page abd game over page
            $("#time-remaining").text(timeRemaining);
                  

            sounds.background.play();
            /* TODO */
            /* Handle the game over situation here */
            if (timeRemaining === 0) {

                // Game over page result
                $("#game-over-player1-score").text(player1Score);
                $("#game-over-player2-score").text(player2Score);

                if(player1Score>player2Score){
                    $("#player1-game-result").text('Winner');
                    $("#player2-game-result").text('Loser');
                }else if(player1Score<player2Score){
                    $("#player1-game-result").text('Loser');
                    $("#player2-game-result").text('Winner');
                }else{
                    $("#player1-game-result").text('Draw');
                    $("#player2-game-result").text('Draw');
                }

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
            player1.update(now);
            player2.update(now);

            /* TODO */
            /* Randomize the gem and collect the gem here */
            if (gem.getAge(now) >= gemMaxAge) gem.randomize(gameArea);
            if (sword.getAge(now) >= swordMaxAge) sword.randomize(gameArea);

            if (player1.getBoundingBox().isPointInBox(sword.getXY().x, sword.getXY().y)) {
             
                sword.randomize(gameArea);
                sounds.collect.currentTime = 0;
                sounds.collect.play();
                player1SwordDamage += 50

                $("#player1-monster-score").text(player1SwordDamage);
            
            }


            if (player2.getBoundingBox().isPointInBox(sword.getXY().x, sword.getXY().y)) {
                
                sword.randomize(gameArea);
                sounds.collect.currentTime = 0;
                sounds.collect.play();
                player2SwordDamage += 50

                $("#player1-monster-score").text(player2SwordDamage);
            
            }

            const {x, y} = gem.getXY();
            // console.log("Gem.x = ", x, "  Gem.y = ", y);
            if (player1.getBoundingBox().isPointInBox(x, y)) {
                console.log("Player 1 Successfully get the gem");
                gem.randomize(gameArea);
                sounds.collect.currentTime = 0;
                sounds.collect.play();
                player1Score += gemScore;

           
                $("#player1-score").text(player1Score);

            }

            if (player2.getBoundingBox().isPointInBox(x, y)) {
                console.log("Player 2 Successfully get the gem");
                gem.randomize(gameArea);
                sounds.collect.currentTime = 0;
                sounds.collect.play();
                player2Score += gemScore;
                $("#player2-score").text(player2Score);
            }


            /* Clear the screen */
            context.clearRect(0, 0, cv.width, cv.height);
            /* Draw the sprites */
            for (const fire of fires) fire.draw();
            sword.draw();
            gem.draw();
            player1.draw();
            player2.draw();

            /* Process the next frame */
            requestAnimationFrame(doFrame);
        }


        /* Handle the keydown of arrow keys and spacebar */
        $(document).on("keydown", function (event) {

            /* TODO */
            /* Handle the key down */
            // Left, Up, Right, Down
            // W: keyCode 87
            // A: keyCode 65
            // S: keyCode 83
            // D: keyCode 68
            switch (event.keyCode) {
              
                //Player 1    
                case 37:
                    player1.move(1);
                    break;
                case 38:
                    player1.move(2);
                    break;
                case 39:
                    player1.move(3);
                    break;
                case 40:
                    player1.move(4);
                    break;
                case 32: //cheat Mode for Player1
                    player1.speedUp();
                    break;
                //Player 2    
                case 65:
                    player2.move(1);
                    break;
                case 87:
                    player2.move(2);
                    break;
                case 68:
                    player2.move(3);
                    break;
                case 83:
                    player2.move(4);
                    break;
                
            }
        });

        /* Handle the keyup of arrow keys and spacebar */
        $(document).on("keyup", function (event) {

            /* TODO */
            /* Handle the key up */
            switch (event.keyCode) {
                case 37:
                    player1.stop(1);
                    break;
                case 38:
                    player1.stop(2);
                    break;
                case 39:
                    player1.stop(3);
                    break;
                case 40:
                    player1.stop(4);
                    break;
                case 32:
                    player1.slowDown();
                    break;
                
                //Player 2    
                case 65:
                    player2.stop(1);
                    break;
                case 87:
                    player2.stop(2);
                    break;
                case 68:
                    player2.stop(3);
                    break;
                case 83:
                    player2.stop(4);
                    break;
            }
        });

        /* Start the game */
        requestAnimationFrame(doFrame);
    }
    return {start};
})();
//End of games

