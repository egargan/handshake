export default class PasswordDisplayer {
  /** @type {PasswordRecorder} */
  recorder;
  /** @type {HTMLDivElement} */
  container;
  /** @type {string} */
  assetsPath;

  constructor(recorder, assetsPath) {
    this.recorder = recorder;

    this.recorder.addListener((newPassword) => {
      this.displayPassword(newPassword);
    });

    this.assetsPath = assetsPath;

    this.container = this._buildPasswordDisplayElement();
  }

  getDisplayContainer() {
    return this.container;
  }

  displayPassword(password) {
    const tokenElements = [];

    for (let token of password) {
      const tokenImage = document.createElement("img");
      tokenImage.style.width = "30px";
      tokenImage.style.height = "30px";

      if (token === "TOP") {
        tokenImage.src = `${this.assetsPath}/arrow_down.svg`;
      } else if (token === "BOTTOM") {
        tokenImage.src = `${this.assetsPath}/arrow_up.svg`;
      } else if (token === "FRONT") {
        tokenImage.src = `${this.assetsPath}/arrow_right.svg`;
      } else {
        tokenImage.src = `${this.assetsPath}/question_mark.svg`;
      }

      tokenElements.push(tokenImage);
    }

    this.container.replaceChildren(...tokenElements);
  }

  _buildPasswordDisplayElement() {
    const container = document.createElement("div");

    container.style.display = "flex";
    // This assumes the container has relative or absolute positioning!
    container.style.position = "absolute";
    container.style.bottom = "48px";
    container.style.width = "100%";
    container.style.minHeight = "20px";
    container.style.flexWrap = "wrap";
    container.style.gap = "2px";

    return container;
  }
}
