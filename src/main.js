import Matter from 'matter-js';
import Arm from './Arm.js';
import { initArmController } from './ArmController.js'

const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World;

const engine = Engine.create();

const world = engine.world;
world.gravity.y = 0;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        background: '#fff'
    }
});

const arm = new Arm({ posX: 200, posY: 300 });
World.add(world, arm.getComposite());

initArmController(arm, engine)

Engine.run(engine);
Render.run(render);
