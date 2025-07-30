// const url = 'https://ophim1.com/danh-sach/phim-moi-cap-nhat';
// const imgUrl = 'https://img.ophim.live/uploads/movies/';
// const container = document.querySelector('.container');
// const searchInput = document.getElementById('search-input');
// const detailContainer = document.getElementById('detail-movie');
// const params = new URLSearchParams(window.location.search);

// const { elementOpen, elementClose, text, patch, elementVoid } = IncrementalDOM;

// let currentPage = 1;
// let totalPage = 1;
// let Movies = [];

// const isDetailPage = window.location.pathname.endsWith('detail.html');

// async function fetchData(page, movieSlug = null) {
//     try {
//         let apiUrl;
//         if (movieSlug) {
//             apiUrl = `https://ophim1.com/phim/${movieSlug}`;
//         } else {
//             apiUrl = `${url}?page=${page}`;
//         }

//         const response = await fetch(apiUrl, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const dataJson = await response.json();

//         if (!movieSlug && page == 1) {
//             totalPage = dataJson.pagination.totalPages;
//         }
//         return dataJson;

//     } catch (error) {
//         console.error('Error fetching data:', error);
//         return null;
//     }
// }

// function render(data) {
//     if (data === null) return;
//     for (let i = 0; i < data.items.length; i++) {
//         elementOpen('a', data.items[i].id, null, 'class', 'movie', 'href', `detail.html?slug=${data.items[i].slug}`);
//         elementOpen('div', null, null, 'class', 'movie-poster');
//         elementVoid('img', null, null, 'src', imgUrl + data.items[i].poster_url);
//         elementClose('div');
//         elementOpen('div', null, null, 'class', 'movie-name');
//         elementOpen('p');
//         text(data.items[i].name);
//         elementClose('p');
//         elementClose('div');
//         elementClose('a');
//     }
// }

// async function loadMovie(page) {
//     const data = await fetchData(page);
//     Movies = Movies.concat(data.items);
//     patch(container, () => render({ items: Movies }));
// }

// // async function loadMovie(page) {
// //     const data = await fetchData(page);
// //     if (data === null) return;

// //     let fragment = document.createDocumentFragment();
// //     data.items.map(function (item) {
// //         const a = document.createElement('a');
// //         a.className = "movie";
// //         a.innerHTML = `
// //                         <div class="movie-poster">
// //                             <img src="${imgUrl}${item.poster_url}" alt="">
// //                         </div>
// //                         <div class="movie-name">
// //                             <p>${item.name}</p>
// //                         </div>
// //                     `;
// //         fragment.append(a);
// //     })
// //     container.appendChild(fragment);
// // }

// function renderDetail(data) {
//     elementOpen('div', null, null, 'class', 'detail-container');
//     elementOpen('div', null, null, 'class', 'detail-poster');
//     elementVoid('img', null, null, 'src', data.movie.poster_url);
//     elementClose('div');
//     elementOpen('div', null, null, 'class', 'detail-info');
//     elementOpen('h2'); text(data.movie.name);
//     elementClose('h2');
//     elementOpen('p'); text('Năm: ' + data.movie.year);
//     elementClose('p');
//     elementOpen('p'); text('Mô tả: ' + data.movie.content);
//     elementClose('p');
//     elementOpen('p'); text('Thời lượng: ' + data.movie.time);
//     elementClose('p');
//     elementClose('div');
//     elementClose('div');
// }

// async function loadDetailMovie() {
//     const movieSlug = params.get('slug');
//     const data = await fetchData(null, movieSlug);
//     patch(detailContainer, () => renderDetail(data));
// }

// if (searchInput) {
//     searchInput.addEventListener('input', function () {
//         const keyword = this.value.trim().toLowerCase();
//         let filteredMovies = Movies;

//         if (keyword !== '') {
//             filteredMovies = Movies.filter(movie =>
//                 movie.name.toLowerCase().includes(keyword)
//             );
//         }

//         patch(container, () => render({ items: filteredMovies }));
//     });
// }
// // async function loadMovie(page) {
// //     const data = await fetchData(page);
// //     if (data === null) return;

// //     for (let i = 0; i < data.items.length; i++) {
// //         const div = document.createElement('div');
// //         div.className = "movie";
// //         div.innerHTML = `
// //             <div class="movie-poster">
// //                 <img src="${imgUrl}${data.items[i].poster_url}" alt="">
// //             </div>
// //             <div class="movie-name">
// //                 <p>${data.items[i].name}</p>
// //             </div>
// //         `;
// //         container.append(div);
// //     }
// // }

// // async function loadMovie2(page) {
// //     const data = await fetchData(page);
// //     if (data === null) return null;

// //     const movieList = data.items.map(function (item) {
// //         const div = document.createElement('div');
// //         div.className = "movie";
// //         div.innerHTML = `
// //                 <div class="movie-poster">
// //                     <img src="${imgUrl}${item.poster_url}" alt="">
// //                 </div>
// //                 <div class="movie-name">
// //                     <p>${item.name}</p>
// //                 </div>
// //             `;
// //         return div;
// //     })
// //     container.append(...movieList);
// // }

// // async function loadMovie3(page) {
// //     const data = await fetchData(page);
// //     if (data === null) return;

// //     const arr = [];
// //     for (let i = 0; i < data.items.length; i++) {
// //         const div = document.createElement('div');
// //         div.className = "movie";
// //         div.innerHTML = `
// //                 <div class="movie-poster">
// //                     <img src="${imgUrl}${data.items[i].poster_url}" alt="">
// //                 </div>
// //                 <div class="movie-name">
// //                     <p>${data.items[i].name}</p>
// //                 </div>
// //             `;
// //         arr.push(div);
// //     }
// //     container.append(...arr);
// // }
// // loadMovie(currentPage);
// // if (!isDetailPage) {
// //     const btnMore = document.getElementById('btn-more');
// //     btnMore.addEventListener('click', () => {
// //         currentPage++;
// //         loadMovie(currentPage);
// //     });
// // } else {
// //     loadDetailMovie();
// // }
// if (!isDetailPage) {
//     if (window.scrollY == 0) {
//         console.time('loadMovie');
//         loadMovie(currentPage);
//         console.timeEnd('loadMovie');

//     }
//     window.addEventListener('scroll', () => {
//         if (window.scrollY + window.innerHeight >= 0.95 * document.documentElement.scrollHeight) {
//             if (currentPage < totalPage) {
//                 ++currentPage;
//                 console.time('loadMovie');
//                 loadMovie(currentPage);
//                 console.timeEnd('loadMovie');
//             }
//         }
//     });
// } else {
//     loadDetailMovie();
// }

