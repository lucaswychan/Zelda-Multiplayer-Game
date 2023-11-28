const AttackEffect = (ctx, x, y) => {
    const sequences = {x: 128, y: 160, width: 16, height: 16, count: 8, timing: 100, loop: true};

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the fire sprite here.
    sprite.setSequence(sequences)
        .setScale(2)
        // .setShadowScale({x: 0.75, y: 0.2})
        .useSheet("./images/object_sprites.png");

    let birthTime = performance.now();

    const getAge = function(now) {
        return now - birthTime;
    };


    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update,
        getAge: getAge
    };
}