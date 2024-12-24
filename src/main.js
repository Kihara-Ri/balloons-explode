import main from './core.js';
import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="root">
    <h1>Canvas matter-js</h1>
    <div class="main-container"></div>
    <button id="toggle-gravity">启用重力</button>
  </div>
`;
main();