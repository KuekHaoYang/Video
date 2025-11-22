import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        // Beijing IP address to simulate request from China
        const chinaIP = '113.204.79.230';

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'X-Forwarded-For': chinaIP,
                'Client-IP': chinaIP,
                'Referer': new URL(url).origin,
            },
        });

        const contentType = response.headers.get('Content-Type');

        // Handle m3u8 playlists: rewrite URLs to go through proxy
        if (contentType && (contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('application/x-mpegurl') || url.endsWith('.m3u8'))) {
            const text = await response.text();
            const baseUrl = new URL(url);

            const modifiedText = text.split('\n').map(line => {
                // Skip comments and empty lines
                if (line.trim().startsWith('#') || !line.trim()) {
                    return line;
                }

                // Resolve relative URLs
                try {
                    const absoluteUrl = new URL(line.trim(), baseUrl).toString();
                    // Wrap in proxy
                    return `${request.nextUrl.origin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                } catch (e) {
                    return line;
                }
            }).join('\n');

            return new NextResponse(modifiedText, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            });
        }

        // For non-m3u8 content (segments, mp4, etc.), stream directly
        const newResponse = new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers(response.headers),
        });

        // Add CORS headers to allow playback
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return newResponse;
    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse('Proxy failed', { status: 500 });
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
