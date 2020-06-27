import Matter from 'matter-js';

const Engine = Matter.Engine,
    Events = Matter.Events,
    Render = Matter.Render,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    World = Matter.World,
    Bodies = Matter.Bodies;

class Arm {
    constructor({
        length = 240,
        width = 60,
        posX = 200,
        posY = 300,
    }) {
        const group = Body.nextGroup(true);

        const forearmLength = length * 0.85;
        const forearmWidth = width * 0.9;

        const handLength = length * 0.2;
        const handWidth = width;

        // The length of the overlapping area between the hand and forearm
        const handForearmOverlap = handLength * 0.2;

        const arm = Composite.create();

        const bodyRenderOptions = {
            fillStyle: 'transparent',
            lineWidth: 1,
        };

        // Elbow is a *static* body, meaning it's essentially fixed in space
        const elbow = Bodies.circle(
            posX,
            posY,
            width * 0.5,
            {
                collisionFilter: { group: group },
                isStatic: true,
                render: bodyRenderOptions,
            }
        );

        const forearm = Bodies.rectangle(
            posX + (forearmLength * 0.5),
            posY,
            forearmLength,
            forearmWidth,
            {
                collisionFilter: { group: group },
                render: bodyRenderOptions
            }
        );

        const hand = Bodies.rectangle(
            (posX + forearmLength + handLength * 0.5) - handForearmOverlap,
            posY,
            handLength,
            handWidth,
            {
                collisionFilter: { group: group },
                render: bodyRenderOptions,
            }
        );

        Composite.add(arm, [ elbow, forearm, hand ]);

        // Constrain forearm to elbow
        Composite.add(arm, Constraint.create({
            bodyA: elbow,
            bodyB: forearm,
            pointA: { x: 0, y: 0 },
            pointB: { x: -forearmLength * 0.5, y: 0 },
            stiffness: 0.9,
            render: {
                strokeStyle: '#888'
            }
        }));

        // How far along the forearm these spring constraints are attached to
        const forearmConstraintOffset = forearmLength * 0.8;

        const topForearmConstraintArgs = {
            bodyA: elbow,
            bodyB: forearm,
            pointB: { x: forearmConstraintOffset - (forearmLength * 0.5), y: 0 },
            pointA: { x: forearmConstraintOffset, y: width * 3 },
            stiffness: 0.005,
            damping: 0.1,
            render: {
                strokeStyle: '#888'
            }
        };

        const bottomForearmConstraintArgs = {
            ...topForearmConstraintArgs,
            pointB: { x: forearmConstraintOffset - (forearmLength * 0.5), y: 0 },
            pointA: { x: forearmConstraintOffset, y: width * -3 },
        };

        // Add 'spring' constraints above and below forearm so it rests at
        // a horizontal position
        Composite.add(arm,[
            Constraint.create(topForearmConstraintArgs),
            Constraint.create(bottomForearmConstraintArgs)
        ]);

        // Determines the height of the two constraints that attach the hand
        // to the forearm, relative to the centre of the arm
        const wristHeightOffset = forearmWidth * 0.4;

        const topWristConstraintArgs = {
            bodyA: forearm,
            bodyB: hand,
            pointA: {
                x: (forearmLength * 0.5) - (handForearmOverlap * 0.5),
                y: wristHeightOffset,
            },
            pointB: {
                x: (-handLength * 0.5) + (handForearmOverlap * 0.5),
                y: wristHeightOffset
            },
            stiffness: 0.5,
            render: {
                strokeStyle: '#888'
            }
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
            Constraint.create(bottomWristConstraintArgs)
        ]);

        this.composite = arm;

        this.elbow = elbow;
        this.forearm = forearm;
        this.hand = hand;

        this.restXPos = posX;
    }

    setHandYForce(force) {
        this.hand.force.y = force;
    }

    setArmXOffset(distanceOffset) {
        this.elbow.position.x = this.restXPos + distanceOffset;
    }

    getComposite() {
        return this.composite;
    }
}

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
