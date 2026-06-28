import axios from "axios";
import Movie from "../models/movie.js";
import Show from "../models/show.js";


// Utility function to retry axios requests
const axiosWithRetry = async (url, options, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url, options);
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Retrying... attempt ${i + 2}`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    try {
        const { data } = await axiosWithRetry('https://api.themoviedb.org/3/movie/now_playing', {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
        });

        const movies = data.results;
        res.json({ success: true, movies });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};
// export const getNowPlayingMovies = async (req, res) => {
//     try {
//         const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
//             headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
//         });

//         const movies = data.results;
//         res.json({ success: true, movies });

//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// API to add a new show to the database
export const addShow = async (req, res) => {
    try {
        const { movieID, showsInput, showPrice } = req.body;


        let movie = await Movie.findById(movieID);

        if (!movie) {
            // Fetch movie details and credits from TMDB API in parallel

            const headers = { Authorization: `Bearer ${process.env.TMDB_API_KEY}` };

            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axiosWithRetry(`https://api.themoviedb.org/3/movie/${movieID}`, { headers }),
                axiosWithRetry(`https://api.themoviedb.org/3/movie/${movieID}/credits`, { headers })
            ]);
            // const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
            //     axios.get(`https://api.themoviedb.org/3/movie/${movieID}`, {
            //         headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
            //     }),
            //     axios.get(`https://api.themoviedb.org/3/movie/${movieID}/credits`, {
            //         headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
            //     })
            // ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

            const movieDetails = {
                _id: movieID,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,   // ✅ fixed: was movieApiData.casts
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime
            };

            // Add movie to database
            movie = await Movie.create(movieDetails);
        }

        // Build shows array from dates and times
        const showsToCreate = [];
        showsInput.forEach((show) => {
            const showDate = show.date;
            show.time.forEach((time) => {
                const dateTimeString = `${showDate}T${time}`;
                showsToCreate.push({
                    movie: movieID,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                });
            });
        });

        if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }

        res.json({ success: true, message: "Show Added Successfully." });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get shows from the database
export const getShows = async (req, res) => {
    try {
        const shows = await Show.find({ showDateTime: { $gte: new Date() } })
            .populate('movie')
            .sort({ showDateTime: 1 });

        // Filter unique movies from shows
        const uniqueMoviesMap = new Map(shows.map((show) => [show.movie._id.toString(), show.movie]));
        const uniqueShows = Array.from(uniqueMoviesMap.values());

        res.json({ success: true, shows: uniqueShows });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get a single show from the database
export const getShow = async (req, res) => {
    try {
        const { movieId } = req.params;

        // Get all upcoming shows for the movie
        const shows = await Show.find({
            movie: movieId,
            showDateTime: { $gte: new Date() }
        });

        const movie = await Movie.findById(movieId);

        const dateTime = {};
        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if (!dateTime[date]) {
                dateTime[date] = [];
            }
            dateTime[date].push({ time: show.showDateTime, showId: show._id });
        });

        res.json({ success: true, movie, dateTime });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};