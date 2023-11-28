// This function defines the Monster module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the monster
// - `y` - The initial y position of the monster
// - `gameArea` - The bounding box of the game area
const Monster = function(ctx, x, y, gameArea, MonsterID) {

    // This is the sprite sequences of the monster facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    const sequencesForMonster1 = {
        /* Idling sprite sequences for facing different directions */
        idleDown:  { x: 1, y: 19, width: 30, height: 37, count: 8, timing: 300, loop: true },
        idleRight: { x: 1, y: 57, width: 29, height: 40, count: 8, timing: 300, loop: true },
        idleUp:    { x: 1, y: 98, width: 29, height: 37, count: 8, timing: 300, loop: true },
        idleLeft:  { x: 1, y: 136, width: 29, height: 40, count: 8, timing: 300, loop: true },

        /* Moving sprite sequences for facing different directions */
        moveDown:  { x: 365, y: 19, width: 25, height: 38, count: 6, timing: 50, loop: true },
        moveRight: { x: 365, y: 58, width: 29, height: 37, count: 6, timing: 50, loop: true },
        moveUp:    { x: 365, y: 96, width: 25, height: 38, count: 6, timing: 50, loop: true },
        moveLeft:  { x: 365, y: 136, width: 29, height: 37, count: 6, timing: 50, loop: true },
    };

    const sequencesForMonster2 = {
        /* Idling sprite sequences for facing different directions */
        idleDown:  { x: 1, y: 19, width: 30, height: 37, count: 8, timing: 500, loop: true },
        idleRight: { x: 1, y: 57, width: 29, height: 40, count: 8, timing: 500, loop: true },
        idleUp:    { x: 1, y: 98, width: 29, height: 37, count: 8, timing: 500, loop: true },
        idleLeft:  { x: 1, y: 136, width: 29, height: 40, count: 8, timing: 500, loop: true },

        /* Moving sprite sequences for facing different directions */
        moveDown:  { x: 365, y: 19, width: 25, height: 38, count: 6, timing: 50, loop: true },
        moveRight: { x: 365, y: 58, width: 29, height: 37, count: 6, timing: 50, loop: true },
        moveUp:    { x: 365, y: 96, width: 25, height: 38, count: 6, timing: 50, loop: true },
        moveLeft:  { x: 365, y: 136, width: 29, height: 37, count: 6, timing: 50, loop: true },
    };

    // This is the sprite object of the monster created from the Sprite module.
    const sprite = Sprite(ctx, x, y);
    const sequences = MonsterID === 1 ? sequencesForMonster1 : sequencesForMonster2;
    const spriteSheet = MonsterID === 1 ? "./images/monster1.png" : "./images/monster2.png";
    const stopProbability = 0.7;

    // The sprite object is configured for the monster sprite here.
    sprite
        .setSequence(sequences.idleDown)
        .setScale(2)
        .setShadowScale({ x: 0.75, y: 0.20 })
        .useSheet(spriteSheet);

    let birthTime = performance.now();
    // This is the moving direction, which can be a number from 0 to 4:
    // - `0` - not moving
    // - `1` - moving to the left
    // - `2` - moving up
    // - `3` - moving to the right
    // - `4` - moving down
    let direction = 0;

    // This is the moving speed (pixels per second) of the monster
    let speed = 50;

    // This function sets the monster's moving direction.
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

    // This function stops the monster from moving.
    // - `dir` - the moving direction when the monster is stopped (1: Left, 2: Up, 3: Right, 4: Down)
    const stop = function(dir) {
        if (direction === dir) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.idleLeft); break;
                case 2: sprite.setSequence(sequences.idleUp); break;
                case 3: sprite.setSequence(sequences.idleRight); break;
                case 4: sprite.setSequence(sequences.idleDown); break;
            }
            direction = 0;
        }
    };

    // This function speeds up the monster.
    const speedUp = function() {
        speed = 250;
    };

    // This function slows down the monster.
    const slowDown = function() {
        speed = 150;
    };

    // This function updates the monster depending on his movement.
    // - `time` - The timestamp when this function is called
    const update = function(time) {
        /* Update the monster if the monster is moving */
        if (direction != 0) {
            let { x, y } = sprite.getXY();

            /* Move the monster */
            switch (direction) {
                case 1: x -= speed / 60; break;
                case 2: y -= speed / 60; break;
                case 3: x += speed / 60; break;
                case 4: y += speed / 60; break;
            }

            /* Set the new position if it is within the game area */
            if (gameArea.isPointInBox(x, y)) {
                sprite.setXY(x, y);
            }
        }

        /* Update the sprite object */
        sprite.update(time);
    };

    const getMoveAge = function(now) {
        return now - birthTime;
    };

    const randomMove = function() {
        const directions = [1, 2, 3, 4]; // 1: down, 2: right, 3: up, 4: left
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];

        switch (randomDirection) {
            case 1:
                move(1);
                break;
            case 2:
                move(2);
                break;
            case 3:
                move(3);
                break;
            case 4:
                move(4);
                break;
        }
        birthTime = performance.now();
    };

    const getDir = function() {
        return direction;
    };

    function randomStop() {
        return Math.random() < stopProbability;
    }

    const randomize = (area) => {
        const {x, y} = area.randomPoint();
        sprite.setXY(x, y);
    }

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getDir: getDir,
        move: move,
        stop: stop,
        speedUp: speedUp,
        slowDown: slowDown,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: update,
        getMoveAge:getMoveAge,
        randomMove:randomMove,
        randomStop:randomStop,
        randomize: randomize,
    };
};
