import run from '../index.js';

const canvas = document.getElementById('handshake-canvas');

if (canvas == null) {
  throw new Error('document does not contain canvas with id \'handshake-canvas\'');
}

run(canvas, 'assets');
