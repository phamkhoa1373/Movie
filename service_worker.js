const CACHE_NAME = 'infinite-scroll-cache-v5';
const API_CACHE_NAME = 'api-cache-v5';
const urlsToCache = [
    './',
    './index.html',
    './detail.html',
    './style.css',
    './webWorker.js',
    './loadMovie.js',
    './loadMovieWithLib.js',
    './asset/40MovieLogos_28-removebg-preview.png',
    './asset/icons8-loading.gif',
    './asset/Loading_icon.gif',
];
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.allSettled(
                cacheNames.filter(name => name !== CACHE_NAME && name !== API_CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});
const apiList = 'https://ophim1.com/danh-sach/phim-moi-cap-nhat';
const apiDetail = 'https://ophim1.com/phim/';
const imgBaseUrl = 'https://img.ophim.live/uploads/movies/';
self.addEventListener('fetch', event => {
    const url = event.request.url;
    if (url.startsWith(apiList)) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const resClone = response.clone();
                    caches.open(API_CACHE_NAME).then(cache => {
                        setTimeout(() => {
                            cache.put(event.request, resClone);
                        }, 5000)
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    }
    else if (url.startsWith(apiDetail)) {
        // Nếu request từ Web Worker (header), bỏ qua và để trình duyệt tự fetch
        if (event.request.headers.get('x-from-webworker') === 'true') {
            return; 
        }

        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    if (cachedResponse) return cachedResponse;

                    return fetch(event.request).catch(() => {
                        return new Response(JSON.stringify({
                            error: "Không thể fetch chi tiết phim và không có trong cache."
                        }), {
                            headers: { 'Content-Type': 'application/json' },
                            status: 504
                        });
                    });
                })
        );
    }

    else if (url.startsWith(imgBaseUrl)) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const resClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        setTimeout(() => {
                            cache.put(event.request, resClone);
                        }, 5000)
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    }
    else {
        event.respondWith(
            caches.match(event.request, { ignoreSearch: true })
                .then(response => response || fetch(event.request))
        );
    }
});

// Message listener để cache chi tiết phim khi user click
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CACHE_DETAIL') {
        const { slug } = event.data;
        const detailUrl = `https://ophim1.com/phim/${slug}`;

        caches.open(API_CACHE_NAME).then(cache => {
            cache.match(detailUrl).then(existingResponse => {
                if (!existingResponse) {
                    fetch(detailUrl)
                        .then(response => {
                            if (response.ok) {
                                const responseClone = response.clone();
                                return cache.put(detailUrl, responseClone);
                            }
                            return response;
                        })
                        .catch(error => {
                            console.error('Error caching detail:', error);
                        });
                }
            });
        });
    }
});

