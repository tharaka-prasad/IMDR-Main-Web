import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { formatTitle, resolvePage } from './resolvePage';

createInertiaApp({
    title: formatTitle,
    resolve: resolvePage,
    setup({ el, App, props }) {
        if (el.hasChildNodes()) {
            hydrateRoot(el, <App {...props} />);
        } else {
            createRoot(el).render(<App {...props} />);
        }
    },
    progress: { color: '#F5A623' },
});
