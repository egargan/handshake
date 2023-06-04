export default class HandshakeController {
  /** @type {import("./PasswordRecorder").default} */
  passwordRecorder;

  /** @type {('TOP'|'BOTTOM'|'FRONT')[]} */
  controlPassword;

  constructor(passwordRecorder) {
    this.passwordRecorder = passwordRecorder;
  }

  /** @param {('TOP'|'BOTTOM'|'FRONT')[]} password */
  setPassword(password) {
    this.controlPassword = password;
  }

  reset() {
    this.passwordRecorder.resetPassword();
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
}
