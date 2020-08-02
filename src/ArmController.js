import Matter from 'matter-js';

export { initArmController };

const Events = Matter.Events;

function initArmController(arm, engine, canvas, mouseAreaDimens) {
    const mouseAreaBounds = getMouseAreaBounds(canvas, mouseAreaDimens);

    let xForce = 0;
    let yForce = 0;

    window.addEventListener('mousemove', (event) => {
        let unitVec = getRelativeUnitVec(event, mouseAreaBounds);
        unitVec = limitVec(unitVec, 1);

        yForce = signedPow(unitVec.y, 2) * 0.12;
        xForce = unitVec.x * -0.2;
    }, false);

    Events.on(engine, "beforeUpdate", () => {
        arm.setHandYForce(yForce);
        arm.setElbowXForce(-xForce);
    })
}

function getMouseAreaBounds(canvas, mouseAreaDimens) {
    const canvasBoundingRect = canvas.getBoundingClientRect();

    const mouseAreaWidthOffset = (canvasBoundingRect.width - mouseAreaDimens.width) * 0.5;
    const mouseAreaHeightOffset = (canvasBoundingRect.height - mouseAreaDimens.height) * 0.5;

    return {
        left: canvasBoundingRect.left + mouseAreaWidthOffset,
        right: canvasBoundingRect.right - mouseAreaWidthOffset,
        top: canvasBoundingRect.top + mouseAreaHeightOffset,
        bottom: canvasBoundingRect.bottom - mouseAreaHeightOffset,
    };
}

// Performs a Math.pow() and ensures the values sign is preserved if 'pow' is even
function signedPow(val, pow) {
    const needsNegating = val % 2 && val < 0;
    return needsNegating ? -Math.pow(val, pow) : Math.pow(val, pow);
}

// Given a vector and an area on the screen described by a 'bounds' object
// (containing 'left', 'right', 'top', 'bottom'), returns a unit vector
// for 'vec's position inside the area, relative to its centre.
//
// If the given vector is outside 'area', the unit vector's absolute value
// will be greater than 1.
function getRelativeUnitVec(vec, area) {
    const areaWidth = area.right - area.left;
    const areaHeight = area.bottom - area.top;

    const areaOriginX = area.left + (areaWidth * 0.5);
    const areaOriginY = area.top + (areaHeight * 0.5);

    const vecRelativeX = vec.x - areaOriginX;
    const vecRelativeY = vec.y - areaOriginY;

    const vecRelativeXUnit = vecRelativeX / (areaWidth * 0.5);
    const vecRelativeYUnit = vecRelativeY / (areaHeight * 0.5);

    return { x: vecRelativeXUnit, y: vecRelativeYUnit };
}

// Limit the provided vector's X and/or Y component to the given maximum value
function limitVec(vec, max) {
    if (vec.x > max) {
        vec.x = max
    }
    else if (vec.x < -max) {
        vec.x = -max;
    }

    if (vec.y > max) {
        vec.y = max
    }
    else if (vec.y < -max) {
        vec.y = -max;
    }

    return vec;
}
