import run from "../lib/index.js";

const container = document.querySelector("[data-handshake-container]");

if (!container) {
  throw new Error(
    "document does not contain element with 'data-handshake-container' attribute"
  );
}

const [controller] = run(container, "assets");

controller.setPassword(["TOP", "TOP", "BOTTOM"]);

document.onkeydown = (event) => {
  if (event.key === "Enter") {
    if (controller.confirm()) {
      window.alert("Correct!");
    }
  } else if (event.key === "Backspace") {
    controller.reset();
  }
};
