import PortalLayout from './Layouts/PortalLayout';
import PublicLayout from './Layouts/PublicLayout';
import SeoHead from './Components/SeoHead';

const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
const publicPages = new Set(['Home', 'About', 'Courses/Index', 'Courses/Show', 'Posts/Index', 'Posts/Show', 'Contact', 'Apply', 'Verify', 'Auth/Login', 'Error']);
const barePages = new Set(['Receipt', 'Payment/Redirect', 'Certificates/Print']);

export const formatTitle = (title) => title ? `${title} | IMDR` : 'IMDR | Institute of Media Development and Research';

// Client and SSR use identical components, layouts and head management.
export function resolvePage(name) {
    const page = pages[`./Pages/${name}.jsx`];
    if (!page) throw new Error(`Page not found: ${name}`);

    page.default.layout ??= (node) => (
        <>
            <SeoHead />
            {barePages.has(name) ? node : publicPages.has(name) ? <PublicLayout>{node}</PublicLayout> : <PortalLayout>{node}</PortalLayout>}
        </>
    );
    return page;
}
