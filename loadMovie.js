const url = 'https://ophim1.com/danh-sach/phim-moi-cap-nhat';
const imgUrl = 'https://img.ophim.live/uploads/movies/';
const apiDetailurl = "https://ophim1.com/phim/"
const container = document.querySelector('.container');
const searchInput = document.getElementById('search-input');
const detailContainer = document.getElementById('detail-movie');
const params = new URLSearchParams(window.location.search);
const movieSlug = params.get('slug');
const btnToTop = document.getElementById('btn-toTop');

let currentPage = 1;
let totalPage = 1;
let isLoading = true;

const isDetailPage = window.location.pathname.endsWith('detail.html');

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./service_worker.js')
            .then(function (registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function (err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

let webWorker;
if (window.Worker) {
    webWorker = new Worker('./webWorker.js');
}

webWorker.onmessage = function (event) {
    if (event.data.type === 'MOVIES_RESULT') {
        renderMovies(event.data.items);

        totalPage = event.data.totalPages;
    } else if (event.data.type === 'MOVIES_ERROR') {
        console.error('Worker fetch error:', event.data.error);
    }
};

async function fetchData(page, movieSlug = null) {
    try {
        let apiUrl = `https://ophim1.com/phim/${movieSlug}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const dataJson = await response.json();

        if (!movieSlug && page == 1) {
            totalPage = dataJson.pagination.totalPages;
        }
        return dataJson;

    } catch (error) {
        console.error('Error fetching data:', error);
        if (movieSlug) {
            try {
                const apiCache = await caches.open('api-cache-v5');
                const cached = await apiCache.match(`https://ophim1.com/phim/${movieSlug}`);

                if (cached) return await cached.json();
            } catch (cacheError) {
                console.error('Cache error:', cacheError);
            }
        }
    }
}

function renderMovies(items) {
    const fragment = document.createDocumentFragment();

    items.forEach(item => {
        const a = document.createElement('a');
        a.href = `detail.html?slug=${item.slug}`;
        a.className = "movie";

        a.addEventListener('click', function (e) {
            e.preventDefault();

            cacheMovieDetail(item.slug);

            if ('caches' in window) {
                const detailUrl = `https://ophim1.com/phim/${item.slug}`;

                caches.open('api-cache-v5').then(async (cache) => {
                    const cachedResponse = await cache.match(detailUrl);

                    if (!cachedResponse && Notification.permission === "granted") {
                        new Notification("Phim đã được cache", {
                            body: item.name,
                            icon: "./asset/40MovieLogos_28-removebg-preview.png"
                        });
                    }
                });
            }

            setTimeout(() => {
                window.location.href = `detail.html?slug=${item.slug}`;
            }, 500);
        });

        const img = document.createElement('img');
        img.src = 'asset/soft-clear-blurred-background_1034-596.avif';

        const realImg = new Image();
        realImg.src = imgUrl + item.poster_url;
        realImg.onload = () => {
            img.src = realImg.src;
        };

        a.innerHTML = `
            <div class="movie-poster" loading="lazy"></div>
            <div class="movie-name">
                <p>${item.name}</p>
            </div>
        `;
        a.querySelector('.movie-poster').appendChild(img);
        container.appendChild(a);
    });

    container.appendChild(fragment);
}

if (searchInput) {
    searchInput.addEventListener('input', debounce(async function () {
        const data = await fetchData(currentPage);
        if (data === null) return;

        const suggestions = document.getElementById('search-suggestions');
        const keyword = this.value.trim().toLowerCase();
        suggestions.innerHTML = '';

        if (keyword !== '') {
            const filteredMovies = data.items.filter(movie =>
                movie.name.toLowerCase().includes(keyword)
            );
            filteredMovies.forEach(movie => {
                const li = document.createElement('li');
                li.className = 'suggestion-item';
                li.innerHTML = `
                            <div class="small-poster">
                                <img src="${imgUrl}${movie.poster_url}" alt="">
                            </div>
                            <div class="small-name">
                                <p>${movie.name}</p>
                            </div>
                        `;
                li.onclick = function () {
                    window.location.href = `detail.html?slug=${movie.slug}`;
                };
                suggestions.appendChild(li);
            });
        }

        document.addEventListener('click', () => {
            suggestions.innerHTML = '';
        });
    }, 200));
}

async function cacheMovieDetail(slug) {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            if (registration.active) {
                registration.active.postMessage({
                    type: 'CACHE_DETAIL',
                    slug: slug
                });
            }
        } catch (error) {
            console.error('Lỗi gửi message cache detail:', error);
        }
    }
}

async function loadDetailMovie() {
    const skeletonDiv = document.createElement('div');
    skeletonDiv.className = 'skeleton-detail-container';
    skeletonDiv.innerHTML = `
        <div class="placeholder content"></div>
        <div class="detail-info">
            <div class="placeholder title" style="width: 80%;"></div>
            <div class="placeholder title" style="width: 30%;"></div>
            <div class="placeholder title" style="width: 70%;"></div>
            <div class="placeholder title" style="width: 20%;"></div>
        </div>
    `;
    detailContainer.appendChild(skeletonDiv);

    const data = await fetchData(null, movieSlug);
    skeletonDiv.remove();

    const fragment = document.createDocumentFragment();

    const div = document.createElement('div');
    div.className = 'detail-container';

    const img = document.createElement('img');
    img.src = './asset/soft-clear-blurred-background_1034-596.avif';
    img.alt = data.movie.name;
    img.className = 'progressive-img';

    const realImg = new Image();
    realImg.src = data.movie.poster_url;
    realImg.onload = () => {
        img.src = realImg.src;
        img.classList.add('loaded'); 
    };

    div.innerHTML = `
        <div class="detail-poster"></div>
        <div class="detail-info">
            <h2>${data.movie.name}</h2>
            <p><strong>Năm:</strong> ${data.movie.year}</p>
            <p><strong>Mô tả:</strong> ${data.movie.content}</p>
            <p><strong>Thời lượng:</strong> ${data.movie.time}</p>
        </div>
    `;
    div.querySelector('.detail-poster').appendChild(img);

    fragment.appendChild(div);
    detailContainer.appendChild(fragment);
}


if (btnToTop) {
    btnToTop.addEventListener("click", function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });
}

const menuToggle = document.getElementById('menu-toggle');
const menu = document.querySelector('.menu');
if (menuToggle && menu) {
    menuToggle.addEventListener('click', function () {
        menu.classList.toggle('active');
    });
    document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
            menu.classList.remove('active');
        }
    });
}

function throttle(func, delay) {
    let lastExecuted = 0
    return function (...args) {
        const now = Date.now()
        if (now - lastExecuted >= delay) {
            func.apply(this, args)
            lastExecuted = now
        }
    }
}

function debounce(fn, ms) {
    let timer;
    return function () {
        const args = arguments;
        const context = this;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(context, args);
        }, ms)
    }
}

if (!isDetailPage) {
    webWorker.postMessage({ type: 'FETCH_MOVIES', page: currentPage });

    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 200) {
            if (currentPage < totalPage) {
                currentPage++;
                webWorker.postMessage({ type: 'FETCH_MOVIES', page: currentPage });
            }
        }
    }, 300));
}
