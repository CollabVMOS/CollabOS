import { html, render } from './lighterhtml';
import './index.css';

function tick() {
	// implicit invoke through template literals
	return html`
    <div>
      <h1 id="asdf">Hello, world!</h1>
      <!-- dynamic content defined via interpolations -->
      <h2>It is ${new Date().toLocaleTimeString()}.</h2>
    </div>
  `;
}

// update the time each second
setInterval(render.bind(null, document.body, tick), 1000);
//render(document.body, tick);