/** @typedef {('TOP' | 'BOTTOM' | 'FRONT')[]} Token */

export default class PasswordRecorder {
  /** @type {Token[]} */
  currentPassword;

  /** @type {((newPassword: Token[]) => {})[]} */
  listeners = [];

  constructor() {
    this.currentPassword = [];
  }

  /** @param {Token} token */
  addToken(token) {
    this.currentPassword.push(token);
    this._callListeners(this.currentPassword);
  }

  resetPassword() {
    this.currentPassword = [];
    this._callListeners(this.currentPassword);
  }

  /** @param {Token} token */
  addListener(listener) {
    this.listeners.push(listener);

    return () => {
      this.listeners.splice(this.listeners.indexOf(listener), 1);
    };
  }

  _callListeners(password) {
    this.listeners.forEach((listener) => listener(password));
  }
}
