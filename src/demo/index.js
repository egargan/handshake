import run from "../index.js";

const container = document.querySelector("[data-handshake-container]");

if (!container) {
  throw new Error(
    "document does not contain element with 'data-handshake-container' attribute"
  );
}

run(container, "assets");
