import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for full offline and Android WebAPK install support
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);

