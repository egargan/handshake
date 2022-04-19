import run from '../index.js';

const containerDiv = document.getElementById('handshake-container');

if (containerDiv == null) {
  throw new Error('document does not contain container div with id \'handshake-container\'');
}

run(containerDiv);
