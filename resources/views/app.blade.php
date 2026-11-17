<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="google-site-verification" content="QJh4dzZ3EW5RTigicgxmN58NdwAf9i8os-aufCzSGMw">
    <link rel="icon" type="image/jpeg" href="/images/logo.jpg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Instrument+Sans:wght@400;500;600;700&family=Noto+Sans+Sinhala:wght@400;600&display=swap" rel="stylesheet">
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    @inertiaHead
    {{-- Keep metadata available even if the SSR worker is temporarily unavailable. --}}
    @if (! $__inertiaSsrResponse)
        @php($seo = $page['props']['seo'] ?? \App\Support\SeoMetadata::excluded())
        <title inertia>{{ $seo['title'] }}</title>
        <meta inertia="description" name="description" content="{{ $seo['description'] }}">
        <meta inertia="robots" name="robots" content="{{ $seo['robots'] }}">
        @if ($seo['canonical'])
            <link inertia="canonical" rel="canonical" href="{{ $seo['canonical'] }}">
            <meta inertia="og:type" property="og:type" content="{{ $seo['type'] }}">
            <meta inertia="og:url" property="og:url" content="{{ $seo['canonical'] }}">
            <meta inertia="og:title" property="og:title" content="{{ $seo['title'] }}">
            <meta inertia="og:description" property="og:description" content="{{ $seo['description'] }}">
            <meta inertia="og:site_name" property="og:site_name" content="IMDR">
        @endif
    @endif
</head>
<body class="bg-paper text-navy antialiased">
    @inertia
</body>
</html>
