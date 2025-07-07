// movie-app/src/api/tmdbApi.js

const API_KEY = '8635a035220d7254334115b63891956b';  

const API_BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// --- FUNÇÃO DE DESCOBERTA ATUALIZADA ---
// Agora aceita um objeto de filtros
export const discoverMovies = async (filters = {}) => {
  const { genreId, rating, ageRating, page = 1 } = filters;
  let queryParams = `api_key=${API_KEY}&language=pt-BR&page=${page}&sort_by=popularity.desc`;

  if (genreId) queryParams += `&with_genres=${genreId}`;
  if (rating) queryParams += `&vote_average.gte=${rating}`;
  if (ageRating) queryParams += `&certification_country=BR&certification.lte=${ageRating}`;

  try {
    const url = `${API_BASE_URL}/discover/movie?${queryParams}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erro ao buscar filmes por filtro:', error);
    return [];
  }
};

export const searchMovies = async (query, page = 1) => {
    if (!query) return [];
    try {
        const url = `${API_BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        return [];
    }
};

export const getGenres = async () => {
    try {
        const url = `${API_BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`;
        const response = await fetch(url);
        const data = await response.json();
        return data.genres;
    } catch (error) {
        console.error('Erro ao buscar géneros:', error);
        return [];
    }
};

export const getMovieDetails = async (movieId) => {
    try {
        const url = `${API_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=pt-BR`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar detalhes do filme:', error);
        return null;
    }
};

export const getMovieVideos = async (movieId) => {
    try {
        const url = `${API_BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=pt-BR`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        return trailer ? trailer.key : null;
    } catch (error) {
        console.error('Erro ao buscar vídeos do filme:', error);
        return null;
    }
};

export const getWatchProviders = async (movieId) => {
    try {
        const url = `${API_BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        return data.results.BR || null;
    } catch (error) {
        console.error('Erro ao buscar provedores:', error);
        return null;
    }
};
