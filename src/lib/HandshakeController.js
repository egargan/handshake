export default class HandshakeController {
  /** @type {import("./PasswordRecorder").default} */
  passwordRecorder;

  /** @type {import("./BumpListener").default} */
  bumpListener;

  /** @type {('TOP'|'BOTTOM'|'FRONT')[]} */
  controlPassword;

  /** @type {import("./ArmController").default} */
  leftArm;

  /** @type {import("./ArmController").default} */
  rightArm;

  /** @type {import("matter-js").Render} */
  render;

  constructor(passwordRecorder, bumpListener, leftArm, rightArm, render) {
    this.passwordRecorder = passwordRecorder;
    this.bumpListener = bumpListener;
    this.leftArm = leftArm;
    this.rightArm = rightArm;
    this.render = render;

    this.debug = false;
  }

  /** @param {('TOP'|'BOTTOM'|'FRONT')[]} password */
  setPassword(password) {
    this.controlPassword = password;
  }

  reset() {
    this.passwordRecorder.resetPassword();
  }

  /**
   * @type {((newPassword: Token[], newToken: Token) => {})[]}
   * @returns {() => {}}
   */
  onPasswordChanged(callback) {
    return this.passwordRecorder.addListener(callback);
  }

  confirm() {
    if (!this.controlPassword) {
      throw new Error(
        "control password is not set, use `controller.setPassword()`"
      );
    }

    if (
      this.controlPassword.length !==
      this.passwordRecorder.currentPassword.length
    ) {
      return false;
    }

    if (
      this.passwordRecorder.currentPassword.some(
        (token, index) => token !== this.controlPassword[index]
      )
    ) {
      return false;
    }

    return true;
  }

  pauseInput() {
    this.bumpListener.pause();
  }

  resumeInput() {
    this.bumpListener.resume();
  }

  toggleDebugView() {
    this.setDebugView(!this.debug);
  }

  setDebugView(debug) {
    this.debug = debug;
    this.leftArm.setDebugView(debug);
    this.rightArm.setDebugView(debug);
    this.render.options.showCollisions = debug;
  }
}
