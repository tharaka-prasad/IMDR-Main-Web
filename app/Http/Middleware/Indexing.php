<?php

namespace App\Http\Middleware;

use App\Support\SeoMetadata;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Indexing
{
    public function handle(Request $request, Closure $next): Response
    {
        // Use the raw path so /index.php is recognized even when PHP treats it as the script name.
        $rawPath = explode('?', $request->getRequestUri(), 2)[0];
        $path = preg_replace('~^/index\.php(?=/|$)~', '', $rawPath);
        $path = '/'.trim($path, '/');
        $isPublic = isset(SeoMetadata::PAGES[$path]) || isset(SeoMetadata::LISTINGS[ltrim($path, '/')])
            || preg_match('~^/(courses|posts)/[^/]+$~', $path)
            || in_array($path, ['/robots.txt', '/sitemap.xml'], true);
        $isSensitive = $request->has('signature') || $request->has('expires')
            || ($path === '/verify' && $request->has('number'));

        if (in_array($request->method(), ['GET', 'HEAD'], true) && $isPublic && ! $isSensitive) {
            $canonicalHost = parse_url(config('seo.url'), PHP_URL_HOST);
            $redirectHost = config('seo.redirect_canonical_host')
                && in_array($request->getHost(), config('seo.redirect_hosts'), true)
                && $request->getHost() !== $canonicalHost;
            if ($redirectHost || $rawPath !== $path) {
                $query = $request->server('QUERY_STRING');
                // A full origin avoids Laravel adding /index.php back through the request's base URL.
                $target = ($redirectHost ? rtrim(config('seo.url'), '/') : $request->getSchemeAndHttpHost())
                    .$path.($query ? '?'.$query : '');

                return redirect($target, 301);
            }
        }

        $response = $next($request);
        $seo = $request->attributes->get('seo', SeoMetadata::excluded());
        if ($response->getStatusCode() >= 400 || ($path !== '/sitemap.xml' && str_starts_with($seo['robots'], 'noindex'))) {
            $response->headers->set('X-Robots-Tag', 'noindex, follow');
        }

        return $response;
    }
}
