import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import PortalLayout from './Layouts/PortalLayout';
import PublicLayout from './Layouts/PublicLayout';

const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });

const publicPages = new Set(['Home', 'About', 'Courses/Index', 'Courses/Show', 'Posts/Index', 'Posts/Show', 'Contact', 'Apply', 'Verify', 'Auth/Login', 'Error']);
const barePages = new Set(['Receipt', 'Payment/Redirect', 'Certificates/Print']);

createInertiaApp({
    title: (title) => (title ? `${title} | IMDR` : 'IMDR | Institute of Media Development and Research'),
    resolve: (name) => {
        const page = pages[`./Pages/${name}.jsx`];

        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        // Every page gets the right frame without repeating it in each file.
        page.default.layout ??= barePages.has(name)
            ? (node) => node
            : publicPages.has(name)
              ? (node) => <PublicLayout>{node}</PublicLayout>
              : (node) => <PortalLayout>{node}</PortalLayout>;

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: '#F5A623' },
});
