import Matter from "matter-js";

const Events = Matter.Events;

export default class ArmController {
  constructor({
    arm,
    engine,
    canvas,
    mouseAreaDimens,
    yForceFormula,
    xForceFormula,
  }) {
    this.arm = arm;
    this.engine = engine;

    // Set initial force to push hands away from each other
    this.xForce = xForceFormula(-1);
    this.yForce = 0;

    // Apply initial forces
    this.applyArmForces();

    this.xForceFormula = xForceFormula;
    this.yForceFormula = yForceFormula;

    this._boundUpdateArmForces = this.updateArmForces.bind(this);
    this._boundApplyArmForces = this.applyArmForces.bind(this);

    // Initialise controller when mouse enters the canvas, avoids hands jolting towards the mouse
    // when the page loads
    canvas.addEventListener("mouseenter", () => {
      this.canvasDimensChanged(canvas, mouseAreaDimens);
      window.addEventListener("mousemove", this._boundUpdateArmForces, false);
    });

    Events.on(this.engine, "beforeUpdate", this._boundApplyArmForces);
  }

  updateArmForces({ x, y }) {
    let unitVec = getRelativeUnitVec({ x, y }, this.mouseAreaBounds);
    unitVec = limitVec(unitVec, 1);

    this.yForce = this.yForceFormula(unitVec.y);
    this.xForce = this.xForceFormula(unitVec.x);
  }

  applyArmForces() {
    this.arm.setHandYForce(this.yForce);
    this.arm.setElbowXForce(-this.xForce);
  }

  // Updates the controller's 'mouseAreaDimens', which makes sure mouse position
  // is made relative to the canvas when used in the position-to-force calculations
  canvasDimensChanged(canvas, newMouseAreaDimens) {
    this.mouseAreaBounds = getMouseAreaBounds(canvas, newMouseAreaDimens);
  }

  destroy() {
    window.removeEventListener("mousemove", this._boundUpdateArmForces, false);
    Events.off(this.engine, "beforeUpdate", this._boundApplyArmForces);
  }
}

function getMouseAreaBounds(canvas, mouseAreaDimens) {
  const canvasBoundingRect = canvas.getBoundingClientRect();

  const mouseAreaWidthOffset =
    (canvasBoundingRect.width - mouseAreaDimens.width) * 0.5;
  const mouseAreaHeightOffset =
    (canvasBoundingRect.height - mouseAreaDimens.height) * 0.5;

  return {
    left: canvasBoundingRect.left + mouseAreaWidthOffset,
    right: canvasBoundingRect.right - mouseAreaWidthOffset,
    top: canvasBoundingRect.top + mouseAreaHeightOffset,
    bottom: canvasBoundingRect.bottom - mouseAreaHeightOffset,
  };
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

  const areaOriginX = area.left + areaWidth * 0.5;
  const areaOriginY = area.top + areaHeight * 0.5;

  const vecRelativeX = vec.x - areaOriginX;
  const vecRelativeY = vec.y - areaOriginY;

  const vecRelativeXUnit = vecRelativeX / (areaWidth * 0.5);
  const vecRelativeYUnit = vecRelativeY / (areaHeight * 0.5);

  return { x: vecRelativeXUnit, y: vecRelativeYUnit };
}

// Limit the provided vector's X and/or Y component to the given maximum value
function limitVec(vec, max) {
  if (vec.x > max) {
    vec.x = max;
  } else if (vec.x < -max) {
    vec.x = -max;
  }

  if (vec.y > max) {
    vec.y = max;
  } else if (vec.y < -max) {
    vec.y = -max;
  }

  return vec;
}
