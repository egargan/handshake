import Matter from "matter-js";
const { Engine } = Matter;

export default class StableRunner {
  /** @type {number} */
  frameRequestId;

  constructor(engine) {
    this.engine = engine;

    this._runLoop = function () {
      const { delta, correction } = getDeltaCorrection();
      Engine.update(this.engine, delta, correction);
      this.frameRequestId = requestAnimationFrame(this._runLoop);
    };

    this._runLoop = this._runLoop.bind(this);
  }

  /** @param {import('matter-js').Engine} engine */
  run() {
    requestAnimationFrame(this._runLoop);
  }

  stop() {
    cancelAnimationFrame(this.frameRequestId);
  }
}

let last_run = 0;
let last_delta = 0;

// This code was taken from the following matter-js PR, which provides a consistent,
// refresh-rate independent tick loop.
// https//github.com/liabru/matter-js/issues/818
function getDeltaCorrection() {
  let delta = 1000 / 60;
  let correction = 1.0;

  if (last_run == 0) {
    //first run -> no delta, no correction
    const this_run = Date.now();
    last_run = this_run;
  } else {
    if (last_delta == 0) {
      //second run -> first delta but no correction yet
      const this_run = Date.now();
      delta = this_run - last_run;
      if (delta > 100) {
        //avoids instabilities after pause (window in background) or with slow cpu
        delta = 100;
      }
      last_run = this_run;
      last_delta = delta;
    } else {
      //run > 2 => delta + correction
      const this_run = Date.now();
      delta = this_run - last_run;
      if (delta > 100) {
        //avoids instabilities after pause (window in background) or with slow cpu
        delta = 100;
      }
      correction = delta / last_delta;
      last_run = this_run;
      last_delta = delta;
    }
  }
  return { delta: delta, correction: correction };
}
