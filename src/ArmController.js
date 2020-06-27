import Matter from 'matter-js';

export { initArmController };

const Events = Matter.Events;

let yForce = 0;
let xForce = 0;

const mouseArea = {
    minX: 100,
    maxX: window.innerWidth - 100,
    minY: 200,
    maxY: window.innerHeight - 200,
}

// TODO: can we avoid using 'window' in this module? Ideally we only want to
// assume 'window' exists in main.js, in case we're using this stuff
// in a non-browser environment

function initArmController(arm, engine) {
    window.addEventListener('mousemove', mouseListener, false);

    Events.on(engine, "beforeUpdate", () => {
        arm.setHandYForce(-yForce);
        arm.setElbowXForce(-xForce);
    })
}

function mouseListener(e) {
    yForce = mapMouseYToHandForce(e.y, mouseArea.minY, mouseArea.maxY);
    xForce = mapMouseXToElbowForce(e.x, mouseArea.minX, mouseArea.maxX);
}

function mapMouseYToHandForce(mouseY, minY, maxY) {
    const maxYForce = 0.12;

    const halfAreaHeight = (maxY - minY) * 0.5;
    let mouseYNormalised = (halfAreaHeight - mouseY + minY) / halfAreaHeight;

    if (mouseYNormalised > 1) {
        mouseYNormalised = 1;
    }
    else if (mouseYNormalised < -1) {
        mouseYNormalised = -1;
    }

    return mouseYNormalised * maxYForce;
}

function mapMouseXToElbowForce(mouseX, minX, maxX) {
    const maxXForce = 0.2;

    const halfAreaWidth = (maxX - minX) * 0.5;
    let mouseXNormalised = (halfAreaWidth - mouseX + minX) / halfAreaWidth;

    if (mouseXNormalised > 1) {
        mouseXNormalised = 1;
    }
    else if (mouseXNormalised < -1) {
        mouseXNormalised = -1;
    }

    return mouseXNormalised * maxXForce;
}
