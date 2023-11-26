// This function defines the Sword module.
const Sword = function (ctx, x, y) {

    const sequences = {x: 112, y: 0, width: 16, height: 16, count: 1, timing: 200, loop: false};

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the fire sprite here.
    sprite.setSequence(sequences)
        .setScale(2)
        .setShadowScale({x: 0.75, y: 0.2})
        .useSheet("./images/object_sprites.png");

    let birthTime = performance.now();

    const getAge = function (now) {
        return now - birthTime;
    };

    const randomize = function (area) {
        /* Randomize the position */
        console.log("Sword randomize");
        // sprite.setSequence(sequences);
        birthTime = performance.now();
        const {x, y} = area.randomPoint();
        sprite.setXY(x, y);
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update,
        getAge: getAge,
        randomize: randomize
    };
};
