const game = (function () {
    // $("#game-canvas").css('opacity', '0.1');

    const players =[];
    const playerScores = [
        $("#player1-score"),
        $("#player2-score")
    ];
    const playerFinalScores = [
        $("#game-over-player1-score"),
        $("#game-over-player2-score")
    ];
    let PlayerScores = [0,0];    //Play Score
    let gameStartTime = 0;      // The timestamp when the game starts
    let gameTimeSoFar;
    const totalGameTime = 20;   // Total game time in seconds
    let timeRemaining;
    let gem;

    const cv = $("canvas").get(0);
    const context = cv.getContext("2d");

    let attackEffectPosition = { x: null , y: null };

    const start = () => {

        const gameArea = BoundingBox(context, 60, 60, 700, 800);

        const gemMaxAge = 3000;     // The maximum age of the gems in milliseconds
        const monsterMoveDuration = [500,300];
        const monsterStopDuration = [1500,1000];
        let MonsterToMoveAge = [monsterMoveDuration[0],monsterMoveDuration[1]]; // The time monsters need to move
        const swordMaxAge = 3000;
        const attackRange = 15;


        let monsterScore = 100;
        let swordDamage = 0;
        let attackTime = null;

        let isAttack = false;

        // Clear Data first
        $("#time-remaining").text(totalGameTime);

        playerFinalScores.forEach((playerFinalScore, index) => {
            PlayerScores[index] = 0;
            playerScores[index].text(0);
            playerFinalScore.text(0); // Update the score to 0
        });

        gameStartTime = 0;

        /* Create the sprites in the game */
        console.log("player: ", players)
        players[0]=Player(context, 60, 250, gameArea, 1);
        players[1]=Player(context, 800, 360, gameArea, 2);
        // players.push(Player(context, 60, 250, gameArea, 1));
        // players.push(Player(context, 800, 360, gameArea, 2));
        const monsters = [Monster(context, 125, 235, gameArea,1),
            Monster(context, 700, 400, gameArea,2)]
        gem = Gem(context, 427, 350, "green");        // The gem
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
            gameTimeSoFar = now - gameStartTime;
            timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);
            Socket.postGameEvents("updateTimer", timeRemaining);

            sounds.battle.play();
            /* TODO */
            /* Handle the game over situation here */
            if (timeRemaining <= 0) {
                // $("#final-gems").text(playerScore);
                Socket.postBehaviour("release final score", null);
                console.log("Game is ended")

                // show the game over page
                GamePage.hide()
                GameOverPage.show()

                sounds.battle.pause();
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
            monsters.forEach(monster => {
                monster.update(now);
            });

            /* TODO */
            /* Randomize the gem and collect the gem here */
            if (gem.getAge(now) >= gemMaxAge) {
                gem.randomize(gameArea);
                console.log(gem);
                Socket.postGameEvents("randomGem", {x:gem.getXY().x, y:gem.getXY().y, color:gem.getColor()});
            }
            if (sword.getAge(now) >= swordMaxAge) sword.randomize(gameArea);
            monsters.forEach((monster, index) => {
                if (monster.getMoveAge(now) >= MonsterToMoveAge[index]) {
                    if (monster.randomStop()) {
                        MonsterToMoveAge[index] = monsterStopDuration[index];
                        monster.stop(monster.getDir());
                    } else {
                        MonsterToMoveAge[index] = monsterMoveDuration[index];
                        monster.randomMove();
                    }
                }
            });

            players.forEach(player => {
                if (player.getBoundingBox().isPointInBox(gem.getXY().x, gem.getXY().y)) {
                    gem.randomize(gameArea);
                    sounds.collect.currentTime = 0;
                    sounds.collect.play();
                    Socket.postBehaviour("increase score", null);
                }
                if (player.getBoundingBox().isPointInBox(sword.getXY().x, sword.getXY().y)) {
                    console.log("Successfully get the sword");
                    // sword.remove(x2, y2, 16, 16);
                    sword.randomize(gameArea);
                    sounds.sword.currentTime = 0;
                    sounds.sword.play();
                    swordDamage += 50
                }
            });

            if (attackEffectPosition.x != null && attackEffectPosition.y != null) {
                attackTime = now;
                attackEffect.setXY(attackEffectPosition.x, attackEffectPosition.y);
            }

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
            monsters.forEach(monster =>{
                monster.draw();
            })

            /* Process the next frame */
            requestAnimationFrame(doFrame);
        }


        /* Handle the keydown of arrow keys and spacebar */
        $(document).on("keydown", function (event) {

            /* TODO */
            /* Handle the key down */
            switch (event.keyCode) {
                case 37:
                    console.log("move")
                    Socket.postBehaviour("move", 1, null);
                    break;
                case 38:
                    console.log("move")
                    Socket.postBehaviour("move", 2, null);
                    break;
                case 39:
                    console.log("move")
                    Socket.postBehaviour("move", 3, null);
                    break;
                case 40:
                    console.log("move")
                    Socket.postBehaviour("move", 4, null);
                    break;
                case 32:
                    Socket.postBehaviour("speedUp", null, null);
                    break;
                case 77:  //M
                    Socket.postBehaviour("attack", null, monsters);
                    break;
            }
        });

        /* Handle the keyup of arrow keys and spacebar */
        $(document).on("keyup", function (event) {

            /* TODO */
            /* Handle the key up */
            switch (event.keyCode) {
                case 37:
                    Socket.postBehaviour("stop", 1, null);
                    break;
                case 38:
                    Socket.postBehaviour("stop", 2, null);
                    break;
                case 39:
                    Socket.postBehaviour("stop", 3, null);
                    break;
                case 40:
                    Socket.postBehaviour("stop", 4, null);
                    break;
                case 32:
                    Socket.postBehaviour("slowDown", null, null);
                    break;
                case 77:  //M
                    // Socket.postBehaviour("stop attack", null, monsters);
                    break;
            }
        });

        /* Start the game */
        requestAnimationFrame(doFrame);
    }

    const playerBehaviour = function(playerID, behaviour, direction, monsters){
        const gemScore =20;
        if(behaviour === "move"){
            players[playerID].move(direction);
        }
        else if (behaviour === "stop")
            players[playerID].stop(direction);

        else if (behaviour === "speedUp") {
            players[playerID].speedUp();
        }
        if(behaviour === "increase score"){
            console.log("player: " + playerID + " increase score!");
            PlayerScores[playerID] += gemScore;
            playerScores[playerID].text(PlayerScores[playerID]);
        }
        if(behaviour === "release final score"){
            playerFinalScores[playerID].text(PlayerScores[playerID]);
        }

        else if (behaviour === "slowDown") {
            players[playerID].slowDown();

        }

        else if (behaviour === "attack"){
            //TODO socketTODO
            //console.log("Attacking from socket");
            attackEffectPosition = players[playerID].attack(monsters);
            console.log("attackEffectPosition = ", attackEffectPosition);
        }
        // else if (behaviour === "stop attack") {
        //     console.log("Stop Attacking from socket");
        //     players[playerID].stopAttack();
        // }
    }

    const gameControl = function(gameEvent, value) {
        if(gameEvent === "updateTimer"){
            $("#time-remaining").text(value);
        }
        if(gameEvent === "randomGem") {
            console.log(value);
            gem = Gem(context,value.x,value.y,value.color);
        }
    }

    return {start, playerBehaviour, gameControl};
})();
//End of games

