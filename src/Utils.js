import Matter from 'matter-js';

const Composite = Matter.Composite;

// Translates a composite's bodies and any world-space constraint coordinates
export function translateCompositeWithConstraints(composite, vector) {
    Composite.translate(composite, vector, true);

    for (const constraint of composite.constraints) {
        translateConstraint(constraint, vector);
    }
}

// Translates a constraint's world-space fix points
//
// Constraints fixed to Bodies are not translated, as those coordinates
// are relative to the Body
export function translateConstraint(constraint, vector) {
    if (!constraint.bodyB) {
        constraint.pointB.x += vector.x;
        constraint.pointB.y += vector.y;
    }

    if (!constraint.bodyA) {
        constraint.pointA.x += vector.x;
        constraint.pointA.y += vector.y;
    }
}

// Performs a Math.pow() and ensures the values sign is preserved if 'pow' is even
export function signedPow(val, pow) {
    const needsNegating = val % 2 && val < 0;
    return needsNegating ? -Math.pow(val, pow) : Math.pow(val, pow);
}
