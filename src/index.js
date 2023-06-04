import Matter from "matter-js";
import Arm from "./Arm.js";
import ArmController from "./ArmController.js";
import { signedPow } from "./Utils.js";
import BumpListener, { BUMP_TYPE } from "./BumpListener.js";

const { Engine, Render, World } = Matter;

/**
 * @param {HTMLElement} container
 * @param {string} assetsPath
 */
export default function run(container, assetsPath) {
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  const engine = Engine.create();
  engine.world.gravity.y = 0;

  // Defining these as absolute values lets us avoid faffing around with window
  // size edge cases
  // TODO: take these from container
  const canvasHeight = 400;
  const canvasWidth = 600;

  const render = Render.create({
    canvas,
    engine: engine,
    options: {
      wireframes: false,
      background: "#fff",
      height: canvasHeight,
      width: canvasWidth,
    },
  });

  // These values are a bit magic, but given that our canvas is a fixed size, we
  // can afford to just lay these down without worrying about what they're relative to
  const armLength = 240;
  const armWidth = 60;
  const leftArmElbowPosX = 50;
  const rightArmElbowPosX = 550;
  const leftArmElbowPosY = canvasHeight * 0.5;
  const rightArmElbowPosY = canvasHeight * 0.5;

  const leftArm = new Arm({
    length: armLength,
    width: armWidth,
    elbowPosX: leftArmElbowPosX,
    elbowPosY: leftArmElbowPosY,
    isLeftHand: true,
    assetsPath,
  });

  const rightArm = new Arm({
    length: armLength,
    width: armWidth,
    elbowPosX: rightArmElbowPosX,
    elbowPosY: rightArmElbowPosY,
    isLeftHand: false,
    assetsPath,
  });

  // The size of the area in which the mouse can control the arm,
  // outside of which the 'maximum force' is applied in that direction
  const mouseAreaDimens = {
    height: canvasHeight * 0.6,
    width: canvasWidth * 0.6,
  };

  const leftArmController = new ArmController({
    arm: leftArm,
    engine: engine,
    canvas: render.canvas,
    mouseAreaDimens: mouseAreaDimens,
    // These two formulae define how much horizontal and vertical force is
    // applied to the arm as a function of mouse position
    yForceFormula: (y) => signedPow(y, 2) * 0.12,
    xForceFormula: (x) => x * -0.2,
  });

  const rightArmController = new ArmController({
    arm: rightArm,
    engine: engine,
    canvas: render.canvas,
    mouseAreaDimens: mouseAreaDimens,
    yForceFormula: (y) => signedPow(y, 2) * -0.04,
    xForceFormula: (x) => x * 0.1,
  });

  // We expect our canvas to be in a flex div that handles horizontally
  // and vertically centering it, so tell the arm controllers when the window
  // is resized so it can update its mouse positioning maths
  const resizeListener = () => {
    // TODO: scale canvas if small enough?
    leftArmController.canvasDimensChanged(render.canvas, mouseAreaDimens);
    rightArmController.canvasDimensChanged(render.canvas, mouseAreaDimens);
  };
  window.addEventListener("resize", resizeListener);

  World.add(engine.world, leftArm.getComposite());
  World.add(engine.world, rightArm.getComposite());

  Engine.run(engine);
  Render.run(render);

  // TODO: use this to cap framerate?
  // Events.on(runner, 'tick',() => {
  //   runner.deltaMin = runner.fps > 60 ? 1000 / runner.fps : 1000 / 60;
  // })

  const bumpListener = new BumpListener(engine);

  bumpListener.subscribe((bumpEvent) => {
    if (bumpEvent.type == BUMP_TYPE.TOP) {
      console.log("top!");
    } else if (bumpEvent.type == BUMP_TYPE.FRONT) {
      console.log("front!");
    } else if (bumpEvent.type == BUMP_TYPE.BOTTOM) {
      console.log("bottom!");
    }
  });

  return () => {
    window.removeEventListener("resize", resizeListener);

    bumpListener.destroy();
    leftArmController.destroy();
    rightArmController.destroy();

    Render.stop(render);
    World.clear(engine.world, leftArm.getComposite());
    World.clear(engine.world, rightArm.getComposite());
    Engine.clear(engine);
  };
}
