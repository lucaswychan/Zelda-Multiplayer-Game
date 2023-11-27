const game = (function () {
    // $("#game-canvas").css('opacity', '0.1');

    const playerScores = [
        $("#player1-score"),
        $("#player2-score")
    ];
    const playerFinalScores = [
        $("#game-over-player1-score"),
        $("#game-over-player2-score")
    ];
    let PlayerScores = [0, 0];    //Play Score
    let swordDamage = [0,0];
    let gem;
    let sword;
    let attackMonsterData = {x: null, y: null, monsterID: null};
    let endGame = false;
    const totalGameTime = 20;
    const gemScore = 20;

    const cv = $("canvas").get(0);
    const context = cv.getContext("2d");
    let roleID = -1;

    const gameArea = BoundingBox(context, 60, 60, 700, 800);
    const players = [];
    players[0] = Player(context, 60, 250, gameArea, 1);
    players[1] = Player(context, 800, 360, gameArea, 2);
    let monsters = [Monster(context, 125, 235, gameArea, 1),
        Monster(context, 700, 400, gameArea, 2)]
    gem = Gem(context, 427, 350, "green");        // The gem
    const fires = [
        Fire(context, 60, 180),  // top-left
        Fire(context, 60, 430),  // bottom-left
        Fire(context, 800, 180), // top-right
        Fire(context, 800, 430)  // bottom-right
    ];
    sword = Sword(context, 427, 240);
    const attackEffect = AttackEffect(context, fires[0].getXY().x + 10, fires[0].getXY().y + 10);

    

    const start = () => {
        endGame = false;
        // const monsterMoveDuration = [500, 300];
        // const monsterStopDuration = [1500, 1000];
        // let MonsterToMoveAge = [monsterMoveDuration[0], monsterMoveDuration[1]]; // The time monsters need to move

        let monsterScore = 100;
        let attackTime = null;

        // Clear Data first
        $("#time-remaining").text(totalGameTime);

        playerFinalScores.forEach((playerFinalScore, index) => {
            PlayerScores[index] = 0;
            playerScores[index].text(0);
            playerFinalScore.text(0); // Update the score to 0
        });

        players.forEach(player => {
            player.resetAttackScore();
        });

        gameStartTime = 0;

        /* Create the sprites in the game */
        console.log("player: ", players)

        /* The main processing of the game */
        function doFrame(now) {
            sounds.battle.play();
            /* TODO */
            /* Handle the game over situation here */
            if (endGame) {
                Socket.endGame(PlayerScores);
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
            

            if (players[roleID].getBoundingBox().isPointInBox(gem.getXY().x, gem.getXY().y)) {
                console.log(roleID + " collected the gem");
                sounds.collect.currentTime = 0;
                sounds.collect.play();
                PlayerScores[roleID] += gemScore;
                playerScores[roleID].text(PlayerScores[roleID]);
                Socket.postBehaviour("collect gem", PlayerScores[roleID]);
            }

            if (players[roleID].getBoundingBox().isPointInBox(sword.getXY().x, sword.getXY().y)) {
                console.log("Successfully get the sword");
                sword.randomize(gameArea);
                players[roleID].incrementAttackScore();
                sounds.sword.currentTime = 0;
                sounds.sword.play();
                swordDamage[roleID] += 50;
                Socket.postBehaviour("pick up sword", swordDamage[roleID]);
            }


            // Draw the attack effect starting from now
            if (attackMonsterData.x != null && attackMonsterData.y != null) {
                attackTime = now;
                attackEffect.setXY(attackMonsterData.x, attackMonsterData.y);
                if (attackMonsterData.target === "monster") {
                    monsters[attackMonsterData.id].randomize(gameArea);
                }
                attackMonsterData.x = null;
                attackMonsterData.y = null;
                // else if (attackMonsterData.target === "player") {
                //
                // }
            }

            /* Clear the screen */
            context.clearRect(0, 0, cv.width, cv.height);

            /* Draw the sprites */
            for (const fire of fires) fire.draw();
            sword.draw();
            gem.draw();
            // draw the attack effect for a fixed time duration for enough time to display
            if (attackTime != null) {
                if (Math.ceil((now - attackTime) / 1000) <= 1) attackEffect.draw();
                else attackTime = null;
            }

            players.forEach(player => {
                player.draw();
            });
            monsters.forEach(monster => {
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
                    Socket.postBehaviour("move", 1);
                    break;
                case 38:
                    Socket.postBehaviour("move", 2);
                    break;
                case 39:
                    Socket.postBehaviour("move", 3);
                    break;
                case 40:
                    Socket.postBehaviour("move", 4);
                    break;
                case 32:
                    Socket.postBehaviour("cheat mode", null);
                    break;
                case 90:  // Z
                    Socket.postBehaviour("attack", null);
                    break;
            }
        });

        /* Handle the keyup of arrow keys and spacebar */
        $(document).on("keyup", function (event) {

            /* TODO */
            /* Handle the key up */
            switch (event.keyCode) {
                case 37:
                    Socket.postBehaviour("stop", 1);
                    break;
                case 38:
                    Socket.postBehaviour("stop", 2);
                    break;
                case 39:
                    Socket.postBehaviour("stop", 3);
                    break;
                case 40:
                    Socket.postBehaviour("stop", 4);
                    break;
                case 32:
                    Socket.postBehaviour("end cheat mode", null);
                    break;
                case 90:  // Z
                    break;
            }
        });

        /* Start the game */
        requestAnimationFrame(doFrame);
    }

    const playerBehaviour = function (playerID, behaviour, direction) {
        const gemScore = 20;
        if (behaviour === "move") {
            players[playerID].move(direction);
        } else if (behaviour === "stop") {
            players[playerID].stop(direction);
        } else if (behaviour === "cheat mode") {
            players[playerID].cheat();
        } else if (behaviour === "collect gem") {
            if(playerID !== roleID){
                PlayerScores[playerID] = direction;
                playerScores[playerID].text(direction);
            }
        } else if(behaviour === "pick up sword") {
            if(playerID !== roleID){
                swordDamage[playerID] = direction;
            }
        }
        else if (behaviour === "end cheat mode") {
            players[playerID].endCheat();
        } else if (behaviour === "attack") {
            attackMonsterData = players[playerID].attack(monsters, players[(playerID + 1) % 2]);
        } else if (behaviour === "kill monster") {
            console.log("kill the monsters!!!!")
            PlayerScores[playerID] += players[playerID].getAttackScore();
            playerScores[playerID].text(PlayerScores[playerID]);
        } else if (behaviour === "hit player") {
            let otherPlayer = (playerID + 1) % 2
            if (PlayerScores[otherPlayer] > 50) {
                PlayerScores[otherPlayer] -= 50;
                playerScores[otherPlayer].text(PlayerScores[otherPlayer]);
            }
            PlayerScores[playerID] += 50;
            console.log("The updated score after hitting other player = ", PlayerScores[playerID]);
            playerScores[playerID].text(PlayerScores[playerID]);
        }
    }

    const gameControl = function (gameEvent, value) {
        if(gameEvent === "startGame"){
            players[0] = Player(context, 60, 250, gameArea, 1);
            players[1] = Player(context, 800, 360, gameArea, 2);
            monsters = [Monster(context, 125, 235, gameArea, 1),
                Monster(context, 700, 400, gameArea, 2)]
            endGame = false;
        }
        if (gameEvent === "updateTimer") {
            $("#time-remaining").text(value);
        }
        if(gameEvent === "endGame"){
            playerFinalScores.forEach((scoreElement, index) => {
                scoreElement.text(PlayerScores[index]);
            });
            endGame = true;
        }
        if (gameEvent === "randomGem") {
            gem = Gem(context, value.x, value.y, value.color);
        }
        if (gameEvent === "randomSword") {
            sword = Sword(context, value.x, value.y);
        }
        if(gameEvent === "MonsterStop") {
            monsters[value].stop(monsters[value].getDir());
        }
        if(gameEvent === "MonsterMove"){
            monsters[value.index].move(value.direction);
        }
    }

    const setUpRole = function (gameID) {
        roleID = gameID;
    }

    return {start, playerBehaviour, gameControl, setUpRole};
})();
//End of games

