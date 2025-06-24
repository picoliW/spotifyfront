import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recommendations" element={<RecommendationPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSpotifyLogin = async () => {
    setIsLoading(true);
    try {
      // Verifique se o redirecionamento está funcionando
      console.log("Redirecionando para Spotify login...");
      window.location.href = "http://localhost:3000/auth/login";
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  // Verifique se há código de retorno do Spotify
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    console.log("Code from URL:", code);

    if (code) {
      const exchangeCodeForToken = async () => {
        try {
          console.log("Exchanging code for token...");
          const response = await axios.get(
            `http://localhost:3000/auth/callback?code=${code}`
          );

          localStorage.setItem(
            "spotifyAccessToken",
            response.data.access_token
          );
          localStorage.setItem(
            "spotifyRefreshToken",
            response.data.refresh_token
          );

          console.log("Token received, navigating to questions...");
          navigate("/questions");
        } catch (error) {
          console.error("Error exchanging code for token:", error);
        }
      };

      exchangeCodeForToken();
    }
  }, [navigate]);

  return (
    <div className="home-page">
      <div className="login-card">
        <h1 className="login-title">Spotify Recommendations</h1>
        <p className="login-description">
          Conecte-se ao Spotify para receber recomendações personalizadas
          baseadas em suas preferências.
        </p>
        <button
          onClick={handleSpotifyLogin}
          className={`login-button ${isLoading ? "disabled" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="spinner"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Conectando...
            </span>
          ) : (
            <span className="flex items-center">
              <svg
                className="icon"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-5.464a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0zM9 10a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Conectar com Spotify
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

const QuestionsPage = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const genreData = [
    {
      name: "brazil",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/1200px-Flag_of_Brazil.svg.png",
    },
    {
      name: "rock",
      image:
        "https://img.freepik.com/vetores-premium/rock-n-roll-mao_43623-110.jpg?w=360",
    },
    {
      name: "anime",
      image:
        "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2022/03/Featured---Generic-Shonen-Anime-that-are-Good.jpg",
    },
    {
      name: "ambient",
      image:
        "https://treesforall.nl/app/uploads/2022/03/Bos-Nederland-Epe-e1719389547661-0x1400-c-default.webp",
    },
    { name: "funk", image: "https://img.vagalume.fm/1470154922349875/bg" },
    {
      name: "chill",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvkfBZW6N3TL1qBaphNR_FtYgDY4ydoK713g&s",
    },
    {
      name: "k-pop",
      image:
        "https://s1.static.brasilescola.uol.com.br/be/2022/11/1-bandeira-da-coreia-do-sul.jpg",
    },
    {
      name: "indie",
      image:
        "https://images.squarespace-cdn.com/content/v1/5c292bfdc258b4b91b8021a5/1587833888867-28W7VRQBVPEGUPAQWP24/LostIndieClassicsVol1.2.jpg",
    },
    {
      name: "pop",
      image: "https://i.scdn.co/image/ab67616d0000b2730325b8604725202da6cbbf93",
    },
    {
      name: "hip-hop",
      image:
        "https://img.freepik.com/vetores-premium/ilustracao-vetorial-de-hip-hop-t-shirt-ou-arte-de-parede-legal-em-estilo-graffiti_675911-519.jpg?semt=ais_hybrid&w=740",
    },
    {
      name: "sertanejo",
      image:
        "https://violaobrasil.com.br/wp-content/uploads/2024/11/O-violao-no-sertanejo-1.jpg",
    },
  ];

  const activityData = [
    {
      name: "Trabalhando",
      emoji: "💼",
      description: "Trabalhando",
    },
    {
      name: "Estudando",
      emoji: "📚",
      description: "Estudando",
    },
    {
      name: "Exercitando",
      emoji: "🏋️",
      description: "Exercitando",
    },
    {
      name: "Relaxando",
      emoji: "🧘",
      description: "Relaxando",
    },
    {
      name: "Socializando",
      emoji: "👥",
      description: "Socializando",
    },
  ];

  const moodData = [
    {
      name: "Feliz",
      emoji: "😊",
      description: "Feliz",
    },
    {
      name: "Triste",
      emoji: "😢",
      description: "Triste",
    },
    {
      name: "Motivado",
      emoji: "💪",
      description: "Motivado",
    },
    {
      name: "Cansado",
      emoji: "😴",
      description: "Cansado",
    },
    {
      name: "Ansioso",
      emoji: "😰",
      description: "Ansioso",
    },
  ];

  const locationData = [
    {
      name: "Em casa",
      emoji: "🏠",
      description: "Em casa",
    },
    {
      name: "Na rua",
      emoji: "🚶",
      description: "Na rua",
    },
    {
      name: "Na academia",
      emoji: "🏋️",
      description: "Na academia",
    },
    {
      name: "No transporte",
      emoji: "🚌",
      description: "No transporte",
    },
    {
      name: "Com amigos",
      emoji: "👥",
      description: "Com amigos",
    },
  ];

  const handleLocationSelect = (location: string) => {
    setAnswers((prev) => ({
      ...prev,
      environment: location,
    }));
  };

  const handleMoodSelect = (mood: string) => {
    setAnswers((prev) => ({
      ...prev,
      mood: mood,
    }));
  };

  const handleActivitySelect = (activity: string) => {
    setAnswers((prev) => ({
      ...prev,
      currentActivity: activity,
    }));
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");

    if (accessToken && refreshToken) {
      localStorage.setItem("spotifyAccessToken", accessToken);
      localStorage.setItem("spotifyRefreshToken", refreshToken);

      // Limpa os parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem("spotifyAccessToken");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/questions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setQuestions(response.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load questions");
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [navigate]);

  const handleGenreSelect = (genre: string) => {
    setAnswers((prev) => {
      const currentGenres = prev.favoriteGenres || [];
      const newGenres = currentGenres.includes(genre)
        ? currentGenres.filter((g) => g !== genre)
        : [...currentGenres, genre];

      return {
        ...prev,
        favoriteGenres: newGenres,
      };
    });
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("spotifyAccessToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/api/recommend",
        answers,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/recommendations", {
        state: { recommendations: response.data },
      });
    } catch (err) {
      setError("Failed to submit preferences");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded shadow-md">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Preference Questions
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="bg-white p-4 rounded shadow">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              {question.question}
            </label>

            {question.id === "favoriteGenres" ? (
              <div className="genre-grid">
                {genreData.map((genre) => (
                  <div
                    key={genre.name}
                    className={`genre-card ${
                      answers.favoriteGenres?.includes(genre.name)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleGenreSelect(genre.name)}
                  >
                    <img
                      src={genre.image}
                      alt={genre.name}
                      className="genre-image"
                    />
                    <span className="genre-name">{genre.name}</span>
                  </div>
                ))}
              </div>
            ) : question.id === "currentActivity" ? (
              <div className="activity-grid">
                {activityData.map((activity) => (
                  <div
                    key={activity.name}
                    className={`activity-card ${
                      answers.currentActivity === activity.name
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleActivitySelect(activity.name)}
                  >
                    <span className="activity-emoji">{activity.emoji}</span>
                    <span className="activity-name">
                      {activity.description}
                    </span>
                  </div>
                ))}
              </div>
            ) : question.id === "environment" ? (
              <div className="location-grid">
                {locationData.map((location) => (
                  <div
                    key={location.name}
                    className={`location-card ${
                      answers.environment === location.name ? "selected" : ""
                    }`}
                    onClick={() => handleLocationSelect(location.name)}
                  >
                    <span className="location-emoji">{location.emoji}</span>
                    <span className="location-name">
                      {location.description}
                    </span>
                  </div>
                ))}
              </div>
            ) : question.id === "mood" ? (
              <div className="mood-grid">
                {moodData.map((mood) => (
                  <div
                    key={mood.name}
                    className={`mood-card ${
                      answers.mood === mood.name ? "selected" : ""
                    }`}
                    onClick={() => handleMoodSelect(mood.name)}
                  >
                    <span className="mood-emoji">{mood.emoji}</span>
                    <span className="mood-name">{mood.description}</span>
                  </div>
                ))}
              </div>
            ) : question.type === "number" ? (
              <input
                type="number"
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder={question.optional ? "(Optional)" : ""}
              />
            ) : (
              <div className="space-y-2 mt-2">
                {question.options.map((option: string) => (
                  <div key={option} className="flex items-center">
                    <input
                      id={`${question.id}-${option}`}
                      name={question.id}
                      type="radio"
                      value={option}
                      onChange={() => handleAnswerChange(question.id, option)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label
                      htmlFor={`${question.id}-${option}`}
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Processing..." : "Get Recommendations"}
          </button>
        </div>
      </form>
    </div>
  );
};

const RecommendationPage = () => {
  const [recommendations, setRecommendations] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const state = (window.history.state as any)?.usr?.recommendations;
    if (state) {
      setRecommendations(state);
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (!recommendations) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Recommendations</h1>
      <p className="mb-6 text-lg">{recommendations.message}</p>

      {recommendations.tracks && (
        <div>
          <h2 className="text-recommended">Recommended Tracks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.tracks.map((track: any) => (
              <div key={track.id} className="track-card">
                {track.album_image && (
                  <img
                    src={track.album_image}
                    alt={`Capa do álbum ${track.album}`}
                    className="track-image"
                  />
                )}
                <div className="track-content">
                  <h3 className="font-medium truncate">{track.name}</h3>
                  <p className="text-gray-600 text-sm truncate">
                    {track.artists.join(", ")}
                  </p>
                  <p className="text-gray-500 text-xs mt-1 truncate">
                    {track.album}
                  </p>
                  {track.preview_url && (
                    <audio controls className="w-full mt-2">
                      <source src={track.preview_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  <a
                    href={track.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-green-600 hover:text-green-800"
                  >
                    Open in Spotify
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.artists && (
        <div className="mt-8">
          <h2 className="text-recommended">Recommended Artists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.artists.map((artist: any) => (
              <div key={artist.id} className="artist-card">
                {artist.image && (
                  <img
                    src={artist.image}
                    alt={`Imagem de ${artist.name}`}
                    className="artist-image"
                  />
                )}
                <div className="artist-content">
                  <h3 className="font-medium truncate">{artist.name}</h3>
                  <p className="text-gray-600 text-sm truncate">
                    Genres: {artist.genres.slice(0, 3).join(", ")}
                  </p>
                  <a
                    href={artist.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-green-600 hover:text-green-800"
                  >
                    Open in Spotify
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/questions")}
        className="mt-8 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Try Different Preferences
      </button>
    </div>
  );
};

export default App;
