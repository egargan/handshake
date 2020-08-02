import Matter from 'matter-js';
import Arm from './Arm.js';
import { initArmController } from './ArmController.js'

const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World;

const engine = Engine.create();
engine.world.gravity.y = 0;

const containerDiv = document.getElementById('handshake-container');

if (containerDiv == null) {
    console.error('Document does not contain container div with id \'handshake-container\'');
}

// TODO: this can make for really thing/stocky arms which look weird and don't
// behave consistently - need to fix the canvas' aspect ratio!
const canvasHeight = containerDiv.getBoundingClientRect().height;
const canvasWidth = containerDiv.getBoundingClientRect().width;

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

const armLength = canvasWidth / 3;
const leftArmElbowPos = canvasWidth / 6;
const rightArmElbowPos = canvasWidth * (5 / 6);

const leftArm = new Arm({
    length: armLength,
    elbowPosX: leftArmElbowPos,
    elbowPosY: canvasHeight * 0.5,
    isPointingRight: true,
});

const rightArm = new Arm({
    length: armLength,
    elbowPosX: rightArmElbowPos,
    elbowPosY: canvasHeight * 0.5,
    isPointingRight: false,
});

// The size of the area in which the mouse can control the arm,
// outside of which the 'maximum force' is applied in that direction
const mouseAreaDimens = {
    height: canvasHeight * 0.4,
    width: canvasWidth * 0.8,
}

initArmController(leftArm, engine, render.canvas, mouseAreaDimens);

World.add(engine.world, leftArm.getComposite());
World.add(engine.world, rightArm.getComposite());

Engine.run(engine);
Render.run(render);
