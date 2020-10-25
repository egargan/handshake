import Matter from 'matter-js';

export default Hand;

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

// TODO:
// * prevent fist passthrough - reduce force? increase hand density?
// * make top + bottom contacts span 'cover' the front contact, so it's less likely
//   two front contacts will collide when there's a 'grazing' top/bottom bump

class Hand {
    constructor({
        posX = 0,
        posY = 0,
        width,
        length,
        isPointingRight,
        bodyOptions,
    }) {
        const halfLength = length * 0.5;
        const halfWidth = width * 0.5;
        const contactWidth = 10;

        const contactCollisionGroup = Body.nextGroup(true);

        const hand = Bodies.rectangle(
            posX,
            posY,
            length,
            width,
            {
                ...bodyOptions,
                label: isPointingRight ? 'leftHand' : 'rightHand',
                collisionFilter: {
                    category: HAND_COLLISION_CATEGORY,
                    group: contactCollisionGroup,
                    mask: HAND_COLLISION_MASK,
                }
            },
        );

        const topContact = Bodies.rectangle(
            posX,
            posY - halfWidth,
            length,
            contactWidth,
            {
                ...bodyOptions,
                label: isPointingRight ? 'leftTopContact' : 'rightTopContact',
                collisionFilter: {
                    category: TOP_COLLISION_CATEGORY,
                    group: contactCollisionGroup,
                    mask: TOP_COLLISION_MASK,
                }
            },
        );

        const frontContact = Bodies.rectangle(
            posX + halfLength,
            posY,
            contactWidth,
            width,
            {
                ...bodyOptions,
                label: isPointingRight ? 'leftFrontContact' : 'rightFrontContact',
                collisionFilter: {
                    category: FRONT_COLLISION_CATEGORY,
                    group: contactCollisionGroup,
                    mask: FRONT_COLLISION_MASK,
                }
            },
        );

        const bottomContact = Bodies.rectangle(
            posX,
            posY + halfWidth,
            length,
            contactWidth,
            {
                ...bodyOptions,
                label: isPointingRight ? 'leftBottomContact' : 'rightBottomContact',
                collisionFilter: {
                    category: BOTTOM_COLLISION_CATEGORY,
                    group: contactCollisionGroup,
                    mask: BOTTOM_COLLISION_MASK,
                }
            },
        );

        const commonConstraintArgs = {
            bodyA: hand,
            stiffness: 0.5,
            render: {
                strokeStyle: '#888'
            }
        }

        const topContactLeftConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: topContact,
            pointA: { x: -halfLength, y: -halfWidth },
            pointB: { x: -halfLength, y: 0 },
        };

        const topContactRightConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: topContact,
            pointA: { x: halfLength, y: -halfWidth },
            pointB: { x: halfLength, y: 0 },
        };

        const frontContactTopConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: frontContact,
            pointA: { x: halfLength, y: -halfWidth },
            pointB: { x: 0, y: -halfWidth },
        };

        const frontContactBottomConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: frontContact,
            pointA: { x: halfLength, y: halfWidth },
            pointB: { x: 0, y: halfWidth },
        };

        const bottomContactLeftConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: bottomContact,
            pointA: { x: -halfLength, y: halfWidth },
            pointB: { x: -halfLength, y: 0 },
        };

        const bottomContactRightConstraintArgs = {
            ...commonConstraintArgs,
            bodyB: bottomContact,
            pointA: { x: halfLength, y: halfWidth },
            pointB: { x: halfLength, y: 0 },
        };

        const handComposite = Composite.create();

        Composite.add(handComposite, [
            hand,
            topContact,
            frontContact,
            bottomContact,
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
