import Matter from 'matter-js';
import Arm from './Arm.js';
import { ArmController } from './ArmController.js';
import { signedPow } from './Utils.js';
import Hand from './Hand.js';
import BumpListener, { BUMP_TYPE } from './BumpListener.js';

const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World;

const engine = Engine.create();
engine.world.gravity.y = 0;

const containerDiv = document.getElementById('handshake-container');

if (containerDiv == null) {
    console.error('Document does not contain container div with id \'handshake-container\'');
}

// Defining these as absolute values lets us avoid faffing around with window
// size edge cases
const canvasHeight = 400;
const canvasWidth = 800;

const render = Render.create({
    element: containerDiv,
    engine: engine,
    options: {
        wireframes: false,
        background: '#fff',
        height: canvasHeight,
        width: canvasWidth,
    }
});

// These values are a bit magic, but given that our canvas is a fixed size, we
// can afford to just lay these down without worrying about what they're relative to
const armLength = 240;
const armWidth = 60;
const leftArmElbowPosX = 150;
const rightArmElbowPosX = 650;
const leftArmElbowPosY = canvasHeight * 0.5;
const rightArmElbowPosY = canvasHeight * 0.5;

const leftArm = new Arm({
    length: armLength,
    width: armWidth,
    elbowPosX: leftArmElbowPosX,
    elbowPosY: leftArmElbowPosY,
    isLeftHand: true,
});

const rightArm = new Arm({
    length: armLength,
    width: armWidth,
    elbowPosX: rightArmElbowPosX,
    elbowPosY: rightArmElbowPosY,
    isLeftHand: false,
});

// The size of the area in which the mouse can control the arm,
// outside of which the 'maximum force' is applied in that direction
const mouseAreaDimens = {
    height: canvasHeight * 0.6,
    width: canvasWidth * 0.6,
}

const leftArmController = new ArmController({
    arm: leftArm,
    engine: engine,
    canvas: render.canvas,
    mouseAreaDimens: mouseAreaDimens,
    // These two formulae define how much horizontal and vertical force is
    // applied to the arm as a function of mouse position
    yForceFormula: y => signedPow(y, 2) * 0.12,
    xForceFormula: x => x * -0.2,
});

const rightArmController = new ArmController({
    arm: rightArm,
    engine: engine,
    canvas: render.canvas,
    mouseAreaDimens: mouseAreaDimens,
    yForceFormula: y => signedPow(y, 2) * -0.04,
    xForceFormula: x => x * 0.1,
});

// We expect our canvas to be in a flex div that handles horizontally
// and vertically centering it, so tell the arm controllers when the window
// is resized so it can update its mouse positioning maths
window.addEventListener('resize', () => {
    // TODO: scale canvas if small enough?
    leftArmController.canvasDimensChanged(render.canvas, mouseAreaDimens);
    rightArmController.canvasDimensChanged(render.canvas, mouseAreaDimens);
});

World.add(engine.world, leftArm.getComposite());
World.add(engine.world, rightArm.getComposite());

Engine.run(engine);
Render.run(render);

const listener = new BumpListener(engine);

listener.subscribe((bumpEvent) => {
  if (bumpEvent.type == BUMP_TYPE.TOP) {
    console.log('top!');
  }
  else if (bumpEvent.type == BUMP_TYPE.FRONT) {
    console.log('front!');
  }
  else if (bumpEvent.type == BUMP_TYPE.BOTTOM) {
    console.log('bottom!');
  }
});
