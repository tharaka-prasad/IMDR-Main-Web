import { Head, usePage } from '@inertiajs/react';

export default function SeoHead() {
    const { seo } = usePage().props;
    if (!seo) return null;

    return (
        <Head>
            <meta head-key="description" name="description" content={seo.description} />
            <meta head-key="robots" name="robots" content={seo.robots} />
            {seo.canonical && <link head-key="canonical" rel="canonical" href={seo.canonical} />}
            {seo.canonical && <meta head-key="og:type" property="og:type" content={seo.type} />}
            {seo.canonical && <meta head-key="og:url" property="og:url" content={seo.canonical} />}
            {seo.canonical && <meta head-key="og:title" property="og:title" content={seo.title} />}
            {seo.canonical && <meta head-key="og:description" property="og:description" content={seo.description} />}
            {seo.canonical && <meta head-key="og:site_name" property="og:site_name" content="IMDR" />}
        </Head>
    );
}
