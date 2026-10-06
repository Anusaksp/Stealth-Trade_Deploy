import '../css/app.css';
import '../css/stealth-trade.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

window.onerror = function(message, source, lineno, colno, error) {
    document.body.innerHTML = '<div style="color:red; padding:20px; font-family:monospace;"><h3>Runtime Error</h3><p>' + message + '</p><pre>' + (error ? error.stack : '') + '</pre></div>';
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#e91e90',
    },
});


