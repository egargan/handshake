import Matter from 'matter-js';

export { translateCompositeWithConstraints };

const Composite = Matter.Composite;

// Translates a composite's bodies and any world-space constraint coordinates
function translateCompositeWithConstraints(composite, vector) {
    Composite.translate(composite, vector, true);

    for (const constraint of composite.constraints) {
        translateConstraint(constraint, vector);
    }
}

// Translates a constraint's world-space fix points
//
// Constraints fixed to Bodies are not translated, as those coordinates
// are relative to the Body
function translateConstraint(constraint, vector) {
    if (!constraint.bodyB) {
        constraint.pointB.x += vector.x;
        constraint.pointB.y += vector.y;
    }

    if (!constraint.bodyA) {
        constraint.pointA.x += vector.x;
        constraint.pointA.y += vector.y;
    }
}
