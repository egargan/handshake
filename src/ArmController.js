import Matter from 'matter-js';

export { initArmController };

const Events = Matter.Events;

function initArmController(arm, engine, canvas, mouseAreaDimens) {
    const canvasBoundingRect = canvas.getBoundingClientRect();

    const mouseAreaWidthOffset = (canvasBoundingRect.width - mouseAreaDimens.width) * 0.5;
    const mouseAreaHeightOffset = (canvasBoundingRect.height - mouseAreaDimens.height) * 0.5;

    const mouseAreaMinX = canvasBoundingRect.left + mouseAreaWidthOffset
    const mouseAreaMaxX = canvasBoundingRect.right - mouseAreaWidthOffset;
    const mouseAreaMinY = canvasBoundingRect.top + mouseAreaHeightOffset;
    const mouseAreaMaxY = canvasBoundingRect.bottom - mouseAreaHeightOffset;

    let xForce = 0;
    let yForce = 0;

    window.addEventListener('mousemove', (event) => {
        yForce = mapMouseYToHandForce(event.y, mouseAreaMinY, mouseAreaMaxY);
        xForce = mapMouseXToElbowForce(event.x, mouseAreaMinX, mouseAreaMaxX);
    }, false);

    Events.on(engine, "beforeUpdate", () => {
        arm.setHandYForce(yForce);
        arm.setElbowXForce(-xForce);
    })
}

function mapMouseYToHandForce(mouseY, minY, maxY) {
    const halfAreaHeight = (maxY - minY) / 2;
    const maxYForce = 0.12;

    let workingMouseY = mouseY;

    workingMouseY = Math.max(Math.min(mouseY, maxY), minY);
    workingMouseY = workingMouseY - minY - halfAreaHeight;
    workingMouseY = workingMouseY / halfAreaHeight;

    // y = rt(x) makes bumpbing difficult, not a fan
    // const isNegative = workingMouseY < 0;
    // workingMouseY = Math.sqrt(Math.abs(workingMouseY));
    // workingMouseY = isNegative ? -workingMouseY : workingMouseY;

    // y = x^3 works pretty well!
    const isNegative = workingMouseY < 0;
    workingMouseY = workingMouseY * workingMouseY * workingMouseY;

    return workingMouseY * maxYForce;
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
