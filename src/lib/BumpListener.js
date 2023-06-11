import Matter from "matter-js";

import {
  LH_PREFIX,
  LH_TOP_CONTACT,
  LH_FRONT_CONTACT,
  LH_BOTTOM_CONTACT,
  RH_PREFIX,
  RH_TOP_CONTACT,
  RH_FRONT_CONTACT,
  RH_BOTTOM_CONTACT,
} from "./Hand.js";

const Events = Matter.Events;

const TOP_BOTTOM_VEL_THRESHOLD = 2;
const FRONT_VEL_THRESHOLD = 4;
const DEBOUNCE_TIME = 200;

export const BUMP_TYPE = {
  TOP: "TOP",
  BOTTOM: "BOTTOM",
  FRONT: "FRONT",
};

export default class BumpListener {
  constructor(engine) {
    this.subscriptions = [];
    this.engine = engine;
    this.ignoreEvent = false;

    Events.on(engine, "collisionStart", (event) => {
      if (this.ignoreEvent) {
        return;
      }

      let leftBody, rightBody;

      const sensorPair = event.pairs.find(
        (pair) => pair.bodyA.isSensor && pair.bodyB.isSensor
      );

      if (!sensorPair) {
        return;
      }

      const { bodyA, bodyB } = sensorPair;

      if (
        bodyA.label.startsWith(LH_PREFIX) &&
        bodyB.label.startsWith(RH_PREFIX)
      ) {
        leftBody = bodyA;
        rightBody = bodyB;
      } else if (
        bodyA.label.startsWith(RH_PREFIX) &&
        bodyB.label.startsWith(LH_PREFIX)
      ) {
        leftBody = bodyB;
        rightBody = bodyA;
      } else {
        return;
      }

      const bump = detectBump(leftBody, rightBody);

      if (bump) {
        for (let callback of this.subscriptions) {
          callback({ type: bump });
        }

        this.ignoreEvent = true;

        clearTimeout(this.debounceTimeout);

        this.debounceTimeout = setTimeout(
          () => (this.ignoreEvent = false),
          DEBOUNCE_TIME
        );
      }
    });
  }

  subscribe(callback) {
    this.subscriptions.push(callback);
  }

  destroy() {
    // TODO: have this remove just the above callback
    Events.off(this.engine, "collisionStart");
  }
}

function detectBump(leftBody, rightBody) {
  if (
    leftBody.label == LH_TOP_CONTACT &&
    rightBody.label == RH_BOTTOM_CONTACT
  ) {
    if (leftBody.velocity.y < -TOP_BOTTOM_VEL_THRESHOLD) {
      return BUMP_TYPE.BOTTOM;
    }
  }
  if (
    leftBody.label == LH_BOTTOM_CONTACT &&
    rightBody.label == RH_TOP_CONTACT
  ) {
    if (leftBody.velocity.y > TOP_BOTTOM_VEL_THRESHOLD) {
      return BUMP_TYPE.TOP;
    }
  }
  if (
    leftBody.label == LH_FRONT_CONTACT &&
    rightBody.label == RH_FRONT_CONTACT
  ) {
    if (leftBody.velocity.x > FRONT_VEL_THRESHOLD) {
      return BUMP_TYPE.FRONT;
    }
  }
}
