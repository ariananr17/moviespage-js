const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  params: {
    'api_key': API_KEY,
  },
});

function likedMoviesList() {

  const item = JSON.parse(localStorage.getItem('liked_movies'))
  let movies;

  if(item) {
    movies = item;
    likedMoviesListArticle.classList.remove('inactive')
  } else {
    movies = {}
    likedMoviesListArticle.classList.add('inactive')
  }

  return movies;
}

function likeMovie(movie) {
  const likedMovies = likedMoviesList()

  console.log(likedMovies)

  if(likedMovies[movie.id]) {
    likedMovies[movie.id] = undefined;
  } else {
    likedMovies[movie.id] = movie;
  }

  localStorage.setItem('liked_movies', JSON.stringify(likedMovies))
}


// Utils

const lazyLoader = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const url = entry.target.getAttribute('data-img')
      entry.target.setAttribute('src', url);
    }
  });
});

function createMovies(movies, container,  {
  lazyLoad = false,
  clean = true,
} = {},) {
  if (clean) {
    container.innerHTML = '';
  }

  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');
   

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt', movie.title);
    movieImg.setAttribute(
      lazyLoad ? 'data-img' : 'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path,
    );
    movieImg.addEventListener('click', () => {
      location.hash = '#movie=' + movie.id;
    });
    const movieBtn = document.createElement('button')
    movieBtn.classList.add('movie-btn')
    likedMoviesList()[movie.id] && movieBtn.classList.add('movie-btn--liked')
    movieBtn.addEventListener('click', () =>{
      movieBtn.classList.toggle('movie-btn--liked')
      likeMovie(movie)
    })

    if (lazyLoad) {
      lazyLoader.observe(movieImg);
    }

    movieContainer.appendChild(movieImg);
    movieContainer.appendChild(movieBtn);
    container.appendChild(movieContainer);
  });
}

function createCategories(categories, container) {
  container.innerHTML = "";


  categories.forEach(category => {  
    const categoryContainer = document.querySelector('.submenu');
    console.log(categoryContainer)

    const categoryTitle = document.createElement('li');
    console.log(categoryTitle)
    categoryTitle.setAttribute('id', 'id' + category.id);
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });
    const categoryTitleText = document.createTextNode(category.name);

    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
  });
}

// Llamados a la API

async function getThreeTrendingMovies() {
  const { data } = await api('movie/top_rated?language=en-US&page=1');
  const topThreeMovies = data.results.slice(0, 3);
  console.log(topThreeMovies)

  createMovies(topThreeMovies, topThreeMoviesPreviewList, true);
}

async function getTopRatedMovies() {
  const { data } = await api('movie/top_rated');
  const movies = data.results;
  maxPage = data.total_pages

  createMovies(
    movies,
    genericSection,
    { lazyLoad: true, clean: true }
  );

} 

async function getTrendingMoviesPreview() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;
  console.log(movies)

  createMovies(movies, trendingMoviesPreviewList, true);
}

async function getCategoriesPreview() {
  const { data } = await api('genre/movie/list');
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList)  ;
}

async function getMoviesByCategory(id) {
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id,
    },
  });
  const movies = data.results;
  maxPage = data.total_pages

  createMovies(movies, genericSection, { lazyLoad: true});
}

function getPaginatedMoviesByCategory(id) {
  return async function () {
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = document.documentElement
  
    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight-15)
  
    const pageIsNotMax = page < maxPage

    if (scrollIsBottom && pageIsNotMax) {
      page++
      const { data } = await api('discover/movie', {
        params: {
          with_genres: id,
          page
        },
      });
      const movies = data.results;
    
      createMovies(movies, genericSection, { lazyLoad: true, clean: false});
    }
  }
}


async function getMoviesBySearch(query) {
  const { data } = await api('search/movie', {
    params: {
      query,
    },
  });
  const movies = data.results;
  maxPage = data.total_pages

  createMovies(movies, genericSection);
}

function getPaginatedMoviesBySearch(query) {
  return async function () {
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = document.documentElement
  
    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight-15)
  
    const pageIsNotMax = page < maxPage

    if (scrollIsBottom && pageIsNotMax) {
      page++
      const { data } = await api('search/movie', {
        params: {
          query,
          page
        },
      });
      const movies = data.results;
    
      createMovies(movies, genericSection, { lazyLoad: true, clean: false});
    }

  }
}

async function getTrendingMovies() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;
  maxPage = data.total_pages

  createMovies(
    movies,
    genericSection,
    { lazyLoad: true, clean: true }
  );

} 




async function getPaginatedTrendingMovies() {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = document.documentElement

  const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight-15)

  const pageIsNotMax = page < maxPage

  if (scrollIsBottom && pageIsNotMax) {
    page++;
    const { data } = await api("trending/movie/day", {
      params: {
        page,
      },
    });
    const movies = data.results;

    createMovies(movies, genericSection, { lazyLoad: true, clean: false });
  }

}

async function getPaginatedTopMovies() {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = document.documentElement

  const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight-15)

  const pageIsNotMax = page < maxPage

  if (scrollIsBottom && pageIsNotMax) {
    page++;
    const { data } = await api("movie/top_rated", {
      params: {
        page,
      },
    });
    const movies = data.results;

    createMovies(movies, genericSection, { lazyLoad: true, clean: true });
  }

  
}


async function getMovieById(id) {
  const { data: movie } = await api('movie/' + id);

  const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
  console.log(movieImgUrl)
  headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImgUrl})
  `;
  
  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  createCategories(movie.genres, movieDetailCategoriesList);

  getRelatedMoviesId(id);
}

async function getRelatedMoviesId(id) {
  const { data } = await api(`movie/${id}/recommendations`);
  const relatedMovies = data.results;

  createMovies(relatedMovies, relatedMoviesContainer);
} 

function getLikedMovies() {
  const likedMovies = likedMoviesList();
  console.log(likedMovies)
  const moviesArray = Object.values(likedMovies)
  console.log(moviesArray)

  createMovies(moviesArray, likedMoviesListArticle,  {
    lazyLoad = false,
    clean = true,
  } = {})
}
