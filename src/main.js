import Matter from 'matter-js';
import Arm from './Arm.js';

const Engine = Matter.Engine,
    Events = Matter.Events,
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

const arm = new Arm({});
World.add(world, arm.getComposite());

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

let yForce = 0;
let xOffset = 0;

window.addEventListener('mousemove', (e) => {
    yForce = mapMouseYToHandForce(e.y, 0, window.innerHeight);
    xOffset = mapMouseXToArmXOffset(e.x, 0, window.innerWidth);
}, false)

Events.on(engine, "beforeUpdate", () => {
    arm.setHandYForce(-yForce);
    arm.setArmXOffset(-xOffset);
})

Engine.run(engine);
Render.run(render);
