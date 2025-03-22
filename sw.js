const CACHE_NAME = 'v1';
const urlsToCache = [
    '/',
    '*.html',
    '*.css',
    '/images/*.(png|jpg|jpeg|gif|svg|webp)'
];

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if(response) {
                    return response;
                }

                return fetch(event.request).then(fetchResponse => {
                    const responseClone = fetchResponse.clone();

                    if (shouldCache(event.request.url)) {
                        caches.open(CACHE_NAME).then(cache =>  cache.put(event.request, responseClone));
                    }

                    return fetchResponse;
                });
            })
    );
});

function shouldCache(url) {
    if (!url.startsWith('http')) {
        return false;
    }
    let urlHost;
    try {
        urlHost = new URL(url).host;
    } catch (e) {
        console.error("Error parsing URL:", url, e);
        return false;
    }

    // If the host is different from the current location, skip caching
    if (urlHost !== location.host) {
        return false;
    }


    return urlsToCache.some(pattern => {
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(regexPattern);

        return regex.test(url);
    });
}
