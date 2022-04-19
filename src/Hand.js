import Matter from 'matter-js';

export const LH_PREFIX = 'LH';
export const LH_BODY = LH_PREFIX + '_BODY';
export const LH_TOP_CONTACT = LH_PREFIX + '_TOP_CONTACT';
export const LH_FRONT_CONTACT = LH_PREFIX + '_FRONT_CONTACT';
export const LH_BOTTOM_CONTACT = LH_PREFIX + '_BOTTOM_CONTACT';

export const RH_PREFIX = 'RH';
export const RH_BODY = RH_PREFIX + '_BODY';
export const RH_TOP_CONTACT = RH_PREFIX + '_TOP_CONTACT';
export const RH_FRONT_CONTACT = RH_PREFIX + '_FRONT_CONTACT';
export const RH_BOTTOM_CONTACT = RH_PREFIX + '_BOTTOM_CONTACT';

const Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint;

const HAND_COLLISION_CATEGORY = Body.nextCategory();
const TOP_COLLISION_CATEGORY = Body.nextCategory();
const FRONT_COLLISION_CATEGORY = Body.nextCategory();
const BOTTOM_COLLISION_CATEGORY = Body.nextCategory();

const HAND_COLLISION_MASK = TOP_COLLISION_CATEGORY | FRONT_COLLISION_CATEGORY
  | BOTTOM_COLLISION_CATEGORY | HAND_COLLISION_CATEGORY;
const TOP_COLLISION_MASK = BOTTOM_COLLISION_CATEGORY | HAND_COLLISION_CATEGORY;
const FRONT_COLLISION_MASK = FRONT_COLLISION_CATEGORY | HAND_COLLISION_CATEGORY;
const BOTTOM_COLLISION_MASK = TOP_COLLISION_CATEGORY | HAND_COLLISION_CATEGORY;

// Controls how bodies are rendered when the 'debug' argument is set.
//
// Should be set as the 'render' property in the options object given to Body
// factory functions (e.g. 'Body.rectangle').
const debugBodyRender = {
    fillStyle: 'transparent',
    lineWidth: 1,
}

// TODO:
// * prevent fist passthrough - reduce force? increase hand density?

export default class Hand {
    constructor({
        posX = 0,
        posY = 0,
        debug = false,
        width,
        length,
        isLeftHand,
        bodyOptions,
        assetsPath,
    }) {
        const halfLength = length * 0.5;
        const halfWidth = width * 0.5;

        const contactLengthSf = 0.75;
        const sideContactLength = length * contactLengthSf;
        const frontContactLength = width * contactLengthSf;
        const contactWidth = 10;

        const contactCollisionGroup = Body.nextGroup(true);

        const contactRenderOptions = {
            ...debugBodyRender,
            visible: debug,
        };

        const hand = Bodies.rectangle(
            posX,
            posY,
            length,
            width,
            {
                ...bodyOptions,
                label: isLeftHand ? LH_BODY : RH_BODY,
                collisionFilter: {
                    category: HAND_COLLISION_CATEGORY,
                    group: contactCollisionGroup,
                    mask: HAND_COLLISION_MASK,
                },
                render: getHandRenderOptions(debug, isLeftHand, assetsPath),
            },
        );

        const topContact = Bodies.rectangle(
            posX,
            posY - halfWidth,
            sideContactLength,
            contactWidth,
            {
                label: isLeftHand ? LH_TOP_CONTACT : RH_TOP_CONTACT,
                collisionFilter: {
                    category: TOP_COLLISION_CATEGORY,
                    group: contactCollisionGroup,
                    mask: TOP_COLLISION_MASK,
                },
                render: contactRenderOptions,
            },
        );

        const frontContact = Bodies.rectangle(
            posX + halfLength,
            posY,
            contactWidth,
            frontContactLength,
            {
                label: isLeftHand ? LH_FRONT_CONTACT : RH_FRONT_CONTACT,
                collisionFilter: {
                    category: FRONT_COLLISION_CATEGORY,
                    group: contactCollisionGroup,
                    mask: FRONT_COLLISION_MASK,
                },
                render: contactRenderOptions,
            },
        );

        const bottomContact = Bodies.rectangle(
            posX,
            posY + halfWidth,
            sideContactLength,
            contactWidth,
            {
                label: isLeftHand ? LH_BOTTOM_CONTACT : RH_BOTTOM_CONTACT,
                collisionFilter: {
                    category: BOTTOM_COLLISION_CATEGORY,
                    group: contactCollisionGroup,
                    mask: BOTTOM_COLLISION_MASK,
                },
                render: contactRenderOptions,
            },
        );

        const commonConstraintArgs = {
            bodyA: hand,
            stiffness: 0.5,
            render: {
                strokeStyle: '#aaa',
                visible: debug,
            },
        }

        const topContactLeftConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: topContact,
            pointA: { x: -halfLength * contactLengthSf, y: -halfWidth },
            pointB: { x: -halfLength * contactLengthSf, y: 0 },
        };

        const topContactRightConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: topContact,
            pointA: { x: halfLength * contactLengthSf, y: -halfWidth },
            pointB: { x: halfLength * contactLengthSf, y: 0 },
        };

        const frontContactTopConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: frontContact,
            pointA: { x: halfLength, y: -halfWidth * contactLengthSf },
            pointB: { x: 0, y: -halfWidth * contactLengthSf },
        };

        const frontContactBottomConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: frontContact,
            pointA: { x: halfLength, y: halfWidth * contactLengthSf },
            pointB: { x: 0, y: halfWidth * contactLengthSf },
        };

        const bottomContactLeftConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: bottomContact,
            pointA: { x: -halfLength * contactLengthSf, y: halfWidth },
            pointB: { x: -halfLength * contactLengthSf, y: 0 },
        };

        const bottomContactRightConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: bottomContact,
            pointA: { x: halfLength * contactLengthSf, y: halfWidth },
            pointB: { x: halfLength * contactLengthSf, y: 0 },
        };

        const handComposite = Composite.create();

        Composite.add(handComposite, [
            topContact,
            frontContact,
            bottomContact,
            hand,
            Constraint.create(topContactLeftConstraintArgs),
            Constraint.create(topContactRightConstraintArgs),
            Constraint.create(frontContactTopConstraintArgs),
            Constraint.create(frontContactBottomConstraintArgs),
            Constraint.create(bottomContactLeftConstraintArgs),
            Constraint.create(bottomContactRightConstraintArgs),
        ]);

        this.composite = handComposite;
        this.body = hand;
    }

    getMainBody() {
        return this.body;
    }

    getComposite() {
        return this.composite;
    }
}

function getHandRenderOptions(debug, isLeftHand, assetsPath) {
    if (debug) {
        return {
            ...debugBodyRender,
        };
    }
    else {
        return {
            sprite: {
                texture: isLeftHand ?
                    `${assetsPath}/left_hand.png` :
                    `${assetsPath}/right_hand.png`,
                yOffset: 0.04,
                xScale: 0.30,
                yScale: 0.30,
            }
        };
    }
}
