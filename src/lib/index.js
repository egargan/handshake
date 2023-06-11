import Matter from "matter-js";
import Arm from "./Arm.js";
import ArmController from "./ArmController.js";
import { signedPow } from "./Utils.js";
import BumpListener from "./BumpListener.js";
import PasswordRecorder from "./PasswordRecorder.js";
import HandshakeController from "./HandshakeController.js";

const { Engine, Render, World, Runner } = Matter;

/**
 * @param {HTMLElement} container
 * @param {string} assetsPath
 * @param {boolean} debug
 * @returns {[typeof HandshakeController, () => {}]} a tuple containing the controller used to
 * interact with the handshake system, and a cleanup function
 */
export default function run(container, assetsPath, debug = false) {
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
      showCollisions: debug,
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
    debug,
  });

  const rightArm = new Arm({
    length: armLength,
    width: armWidth,
    elbowPosX: rightArmElbowPosX,
    elbowPosY: rightArmElbowPosY,
    isLeftHand: false,
    assetsPath,
    debug,
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

  Render.run(render);

  // Use a fixed delta slightly beneath the default (16.6*) to avoid the arms moving too
  // quickly on high refresh rate screens
  const runner = Runner.create({ isFixed: true, delta: 12 });
  Runner.run(runner, engine);

  const bumpListener = new BumpListener(engine);
  const passwordRecorder = new PasswordRecorder();

  bumpListener.subscribe((bumpEvent) => {
    passwordRecorder.addToken(bumpEvent.type);
  });

  const handshakeController = new HandshakeController(passwordRecorder);

  const cleanup = () => {
    window.removeEventListener("resize", resizeListener);

    bumpListener.destroy();
    leftArmController.destroy();
    rightArmController.destroy();

    Render.stop(render);
    World.clear(engine.world, leftArm.getComposite());
    World.clear(engine.world, rightArm.getComposite());
    Engine.clear(engine);
  };

  return [handshakeController, cleanup];
}
