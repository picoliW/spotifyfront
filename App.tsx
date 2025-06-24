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

  useEffect(() => {
    // Verifica se há tokens na URL (vindo do redirecionamento)
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
      <h1 className="text-2xl font-bold mb-6">Preference Questions</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="bg-white p-4 rounded shadow">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              {question.question}
            </label>

            {question.type === "number" ? (
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
                      type={
                        question.id === "favoriteGenres" ? "checkbox" : "radio"
                      }
                      value={option}
                      onChange={() => {
                        if (question.id === "favoriteGenres") {
                          const current = answers[question.id] || [];
                          const newValue = current.includes(option)
                            ? current.filter((item: string) => item !== option)
                            : [...current, option];
                          handleAnswerChange(question.id, newValue);
                        } else {
                          handleAnswerChange(question.id, option);
                        }
                      }}
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
          <h2 className="text-xl font-semibold mb-4">Recommended Tracks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.tracks.map((track: any) => (
              <div key={track.id} className="bg-white p-4 rounded shadow">
                {/* Adicione a imagem do álbum */}
                {track.album_image && (
                  <div className="mb-3">
                    <img
                      src={track.album_image}
                      alt={`Capa do álbum ${track.album}`}
                      className="w-full h-auto rounded"
                    />
                  </div>
                )}
                <h3 className="font-medium">{track.name}</h3>
                <p className="text-gray-600 text-sm">
                  {track.artists.join(", ")}
                </p>
                <p className="text-gray-500 text-xs mt-1">{track.album}</p>
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
            ))}
          </div>
        </div>
      )}

      {recommendations.artists && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recommended Artists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.artists.map((artist: any) => (
              <div key={artist.id} className="bg-white p-4 rounded shadow">
                {artist.image && (
                  <div className="mb-3">
                    <img
                      src={artist.image}
                      alt={`Imagem de ${artist.name}`}
                      className="w-full h-auto rounded-full"
                    />
                  </div>
                )}
                <h3 className="font-medium">{artist.name}</h3>
                <p className="text-gray-600 text-sm">
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
