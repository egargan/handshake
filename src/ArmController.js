import Matter from 'matter-js';

export { initArmController };

const Events = Matter.Events;

let yForce = 0;
let xOffset = 0;

// TODO: can we avoid using 'window' in this module? Ideally we only want to
// assume 'window' exists in main.js, in case we're using this stuff
// in a non-browser environment

function initArmController(arm, engine) {
    window.addEventListener('mousemove', mouseListener, false);

    Events.on(engine, "beforeUpdate", () => {
        arm.setHandYForce(-yForce);
        arm.setArmXOffset(-xOffset);
    })
}

function mouseListener(e) {
    yForce = mapMouseYToHandForce(e.y, 0, window.innerHeight);
    xOffset = mapMouseXToArmXOffset(e.x, 0, window.innerWidth);
}

function mapMouseYToHandForce(mouseY, minY, maxY) {
    const maxYForce = 0.13;

    const halfAreaHeight = (maxY - minY) * 0.5;
    const mouseYNormalised = (halfAreaHeight - mouseY - minY) / halfAreaHeight;

    return mouseYNormalised * maxYForce;
}

function mapMouseXToArmXOffset(mouseX, minX, maxX) {
    const maxOffset = 70;

    const halfAreaWidth = (maxX - minX) * 0.5;
    const mouseXNormalised = (halfAreaWidth - mouseX - minX) / halfAreaWidth;

    return mouseXNormalised * maxOffset;
}
