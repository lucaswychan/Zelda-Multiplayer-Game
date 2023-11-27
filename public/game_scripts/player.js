// This function defines the Player module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the player
// - `y` - The initial y position of the player
// - `gameArea` - The bounding box of the game area
const Player = function(ctx, x, y, gameArea, playerID) {

    // This is the sprite sequences of the player facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    const sequencesForPlayer1 = {
        /* Idling sprite sequences for facing different directions */
        idleDown:  { x: 0, y: 20, width: 25, height: 32, count: 4, timing: 500, loop: true },
        idleRight: { x: 0, y: 53, width: 22, height: 30, count: 4, timing: 500, loop: true },
        idleUp:    { x: 0, y: 86, width: 23, height: 30, count: 4, timing: 500, loop: true },
        idleLeft:  { x: 0, y: 119, width: 22, height: 30, count: 4, timing: 500, loop: true },

        /* Moving sprite sequences for facing different directions */
        moveDown:  { x: 324, y: 20, width: 23.83, height: 35, count: 6, timing: 50, loop: true },
        moveRight: { x: 326, y: 56, width: 24, height: 33, count: 6, timing: 50, loop: true },
        moveUp:    { x: 326, y: 90, width: 26.16, height: 36, count: 6, timing: 50, loop: true },
        moveLeft:  { x: 326, y: 127, width: 24, height: 33, count: 6, timing: 50, loop: true },
    };

    const sequencesForPlayer2 = {
        /* Idling sprite sequences for facing different directions */
        idleDown:  { x: 0, y: 19, width: 25, height: 33, count: 4, timing: 500, loop: true },
        idleRight: { x: 0, y: 53, width: 22, height: 32, count: 4, timing: 500, loop: true },
        idleUp:    { x: 0, y: 86, width: 23, height: 32, count: 4, timing: 500, loop: true },
        idleLeft:  { x: 0, y: 121, width: 22, height: 32, count: 4, timing: 500, loop: true },

        /* Moving sprite sequences for facing different directions */
        moveDown:  { x: 323, y: 19, width: 24, height: 35, count: 6, timing: 50, loop: true },
        moveRight: { x: 324, y: 55, width: 25, height: 33, count: 6, timing: 50, loop: true },
        moveUp:    { x: 326, y: 90, width: 26.16, height: 36, count: 6, timing: 50, loop: true },
        moveLeft:  { x: 324, y: 127, width: 25, height: 33, count: 6, timing: 50, loop: true },
    };

    // This is the sprite object of the player created from the Sprite module.
    const sprite = Sprite(ctx, x, y);
    const sequences = playerID === 1 ? sequencesForPlayer1 : sequencesForPlayer2;
    const spriteSheet = playerID === 1 ? "./images/player1.png" : "./images/player2.png";

    // The sprite object is configured for the player sprite here.
    sprite
        .setSequence(sequences.idleDown)
        .setScale(1)
        .setShadowScale({ x: 0.75, y: 0.20 })
        .useSheet(spriteSheet);

    // This is the moving direction, which can be a number from 0 to 4:
    // - `0` - not moving
    // - `1` - moving to the left
    // - `2` - moving up
    // - `3` - moving to the right
    // - `4` - moving down
    let direction = 0;

    // This is the moving speed (pixels per second) of the player
    let speed = 150;

    // This function sets the player's moving direction.
    // - `dir` - the moving direction (1: Left, 2: Up, 3: Right, 4: Down)
    const move = function(dir) {
        if (dir >= 1 && dir <= 4 && dir != direction) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.moveLeft); break;
                case 2: sprite.setSequence(sequences.moveUp); break;
                case 3: sprite.setSequence(sequences.moveRight); break;
                case 4: sprite.setSequence(sequences.moveDown); break;
            }
            direction = dir;
        }
    };

    // This function stops the player from moving.
    // - `dir` - the moving direction when the player is stopped (1: Left, 2: Up, 3: Right, 4: Down)
    const stop = function(dir) {
        if (direction == dir) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.idleLeft); break;
                case 2: sprite.setSequence(sequences.idleUp); break;
                case 3: sprite.setSequence(sequences.idleRight); break;
                case 4: sprite.setSequence(sequences.idleDown); break;
            }

            direction = 0;
        }
    };

    // This function speeds up the player.
    const speedUp = function() {
        speed = 450;
    };

    // This function slows down the player.
    const slowDown = function() {
        speed = 150;
    };

    // This function updates the player depending on his movement.
    // - `time` - The timestamp when this function is called
    const update = function(time) {
        /* Update the player if the player is moving */
        if (direction != 0) {
            let { x, y } = sprite.getXY();

            /* Move the player */
            switch (direction) {
                case 1: x -= speed / 60; break;
                case 2: y -= speed / 60; break;
                case 3: x += speed / 60; break;
                case 4: y += speed / 60; break;
            }

            /* Set the new position if it is within the game area */
            if (gameArea.isPointInBox(x, y))
                sprite.setXY(x, y);
        }

        /* Update the sprite object */
        sprite.update(time);
    };

    // The methods are returned as an object here.
    return {
        move: move,
        stop: stop,
        speedUp: speedUp,
        slowDown: slowDown,
        getBoundingBox: sprite.getBoundingBox,
        getXY: sprite.getXY,
        draw: sprite.draw,
        update: update
    };
};
