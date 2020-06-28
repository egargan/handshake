import Matter from 'matter-js';

export { initArmController };

const Events = Matter.Events;

function initArmController(arm, engine, window) {
    const mouseAreaMinX = 150;
    const mouseAreaMaxX = window.innerWidth - mouseAreaMinX;
    const mouseAreaMinY = 200;
    const mouseAreaMaxY = window.innerWidth - mouseAreaMinY;

    let xForce = 0;
    let yForce = 0;

    window.addEventListener('mousemove', (event) => {
        yForce = mapMouseYToHandForce(event.y, mouseAreaMinY, mouseAreaMaxY);
        xForce = mapMouseXToElbowForce(event.x, mouseAreaMinX, mouseAreaMaxX);
    }, false);

    Events.on(engine, "beforeUpdate", () => {
        arm.setHandYForce(-yForce);
        arm.setElbowXForce(-xForce);
    })
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
