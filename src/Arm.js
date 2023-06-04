import Matter from "matter-js";
import { translateCompositeWithConstraints } from "./Utils.js";
import Hand from "./Hand.js";

const Body = Matter.Body,
  Composite = Matter.Composite,
  Constraint = Matter.Constraint,
  Bodies = Matter.Bodies;

// TODO: this is duplicated in Hand.js - move to common file?
// Controls how bodies are rendered when the 'debug' argument is set.
//
// Should be set as the 'render' property in the options object given to Body
// factory functions (e.g. 'Body.rectangle').
const debugBodyRender = {
  fillStyle: "transparent",
  lineWidth: 1,
};

export default class Arm {
  constructor({
    elbowPosX,
    elbowPosY,
    length = 240,
    width = 60,
    isLeftHand = true,
    debug = false,
    assetsPath,
  }) {
    const collisionGroup = Body.nextGroup(true);

    const nonCollidingFilter = {
      group: collisionGroup,
      mask: 0,
    };

    const forearmLength = 0.8 * (isLeftHand ? length : -length);
    const forearmWidth = 0.9 * width;

    const handLength = 0.25 * (isLeftHand ? length : -length);
    const handWidth = width;

    // The length of the overlapping area between the hand and forearm
    const handForearmOverlap = handLength * 0.2;

    const arm = Composite.create();

    const bodyRenderOptions = {
      ...debugBodyRender,
      visible: debug,
    };

    // Elbow is a *static* body, meaning it's essentially fixed in space
    const elbowBody = Bodies.circle(0, 0, width * 0.5, {
      collisionFilter: nonCollidingFilter,
      render: bodyRenderOptions,
    });

    const forearmBody = Bodies.rectangle(
      forearmLength * 0.5,
      0,
      forearmLength,
      forearmWidth,
      {
        collisionFilter: nonCollidingFilter,
        render: getArmRenderOptions(debug, isLeftHand, assetsPath),
      }
    );

    const hand = new Hand({
      posX: forearmLength + handLength * 0.5 - handForearmOverlap,
      width: handWidth,
      length: handLength,
      isLeftHand: isLeftHand,
      debug,
      assetsPath,
    });

    const handBody = hand.getMainBody();
    const handComposite = hand.getComposite();

    Composite.add(arm, [elbowBody, forearmBody, handComposite]);

    const commonConstraintArgs = {
      render: {
        strokeStyle: "#aaa",
        visible: debug,
      },
    };

    // Constrain forearm to elbow
    Composite.add(
      arm,
      Constraint.create({
        ...commonConstraintArgs,
        bodyA: elbowBody,
        bodyB: forearmBody,
        pointA: { x: 0, y: 0 },
        pointB: { x: -forearmLength * 0.5, y: 0 },
        stiffness: 0.9,
      })
    );

    // Determines the height of the two constraints that attach the hand
    // to the forearm, relative to the centre of the arm
    const wristHeightOffset = forearmWidth * 0.4;

    const topWristConstraintArgs = {
      ...commonConstraintArgs,
      bodyA: forearmBody,
      bodyB: handBody,
      pointA: {
        x: forearmLength * 0.5 - handForearmOverlap * 0.5,
        y: wristHeightOffset,
      },
      pointB: {
        x: -handLength * 0.5 + handForearmOverlap * 0.5,
        y: wristHeightOffset,
      },
      stiffness: 0.4,
    };

    const bottomWristConstraintArgs = {
      ...topWristConstraintArgs,
      pointA: {
        ...topWristConstraintArgs.pointA,
        y: -wristHeightOffset,
      },
      pointB: {
        ...topWristConstraintArgs.pointB,
        y: -wristHeightOffset,
      },
    };

    // Add two point constraints that fix the hand to the forearm
    Composite.add(arm, [
      Constraint.create(topWristConstraintArgs),
      Constraint.create(bottomWristConstraintArgs),
    ]);

    // How far along the forearm these spring constraints are attached to
    const forearmConstraintOffset = forearmLength * 0.8;

    const topForearmConstraintArgs = {
      ...commonConstraintArgs,
      bodyB: forearmBody,
      pointB: { x: forearmConstraintOffset - forearmLength * 0.5, y: 0 },
      pointA: { x: forearmConstraintOffset, y: width * 3 },
      stiffness: 0.005,
      damping: 0.1,
    };

    const bottomForearmConstraintArgs = {
      ...topForearmConstraintArgs,
      pointB: { x: forearmConstraintOffset - forearmLength * 0.5, y: 0 },
      pointA: { x: forearmConstraintOffset, y: width * -3 },
    };

    // Add 'spring' constraints above and below forearm so it rests at
    // a horizontal position
    Composite.add(arm, [
      Constraint.create(topForearmConstraintArgs),
      Constraint.create(bottomForearmConstraintArgs),
    ]);

    const commonElbowConstraintArgs = {
      ...commonConstraintArgs,
      bodyB: elbowBody,
      pointB: { x: 0, y: 0 },
      damping: 0.5,
    };

    const leftElbowConstraintArgs = {
      ...commonElbowConstraintArgs,
      pointA: { x: -150, y: 0 },
      stiffness: 0.005,
    };

    const rightElbowConstraintArgs = {
      ...leftElbowConstraintArgs,
      pointA: { x: 150, y: 0 },
    };

    const topElbowConstraintArgs = {
      ...commonElbowConstraintArgs,
      pointA: { x: 0, y: -80 },
      stiffness: 0.15,
    };

    const bottomElbowConstraintArgs = {
      ...topElbowConstraintArgs,
      pointA: { x: 0, y: 80 },
    };

    Composite.add(arm, [
      Constraint.create(leftElbowConstraintArgs),
      Constraint.create(rightElbowConstraintArgs),
      Constraint.create(topElbowConstraintArgs),
      Constraint.create(bottomElbowConstraintArgs),
    ]);

    // Move all bodies and world-fixed constraints to given position coords
    translateCompositeWithConstraints(
      arm,
      Matter.Vector.create(elbowPosX, elbowPosY)
    );

    this.composite = arm;
    this.elbowBody = elbowBody;
    this.forearmBody = forearmBody;

    this.hand = hand;
    this.handBody = handBody;

    this.elbowRestPosX = elbowPosX;
  }

  setHandYForce(force) {
    this.handBody.force.y = force;
  }

  setElbowXForce(force) {
    this.elbowBody.force.x = force;
  }

  getComposite() {
    return this.composite;
  }

  getHandController() {
    return this.handController;
  }
}

function getArmRenderOptions(debug, isLeftHand, assetsPath) {
  if (debug) {
    return {
      ...debugBodyRender,
    };
  } else {
    return {
      sprite: {
        texture: isLeftHand
          ? `${assetsPath}/left_arm.png`
          : `${assetsPath}/right_arm.png`,
        xOffset: isLeftHand ? 0.07 : -0.07,
        xScale: 0.24,
        yScale: 0.24,
      },
    };
  }
}
