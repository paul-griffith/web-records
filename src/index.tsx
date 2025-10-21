/**
 * Application entry point
 * Mounts the Preact app to the DOM
 */

import { render } from 'preact';
import { App } from './components/App';

// Mount the app
const root = document.getElementById('app');
if (root) {
  render(<App />, root);
} else {
  console.error('Root element #app not found');
}
