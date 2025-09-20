import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { authService } from "./services/api";
import Navigation from "./components/Navigation/Navigation";
import Login from "./components/Login/Login";
import URLShortener from "./components/URLShortener/URLShortener";
import URLStatistics from "./components/URLStatistics/URLStatistics";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated on component mount
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Home page component
  const HomePage = () => {
    return (
      <div className="flex justify-center items-center px-5 py-10 min-h-[calc(100vh-200px)]">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to URL Shortener
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A simple and effective way to create shorter URLs
          </p>

          {isAuthenticated ? (
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <a
                href="/shorten"
                className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:-translate-y-1"
              >
                Shorten URL
              </a>
              <a
                href="/stats"
                className="inline-block px-6 py-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 transform hover:-translate-y-1"
              >
                URL Statistics
              </a>
            </div>
          ) : (
            <div className="flex justify-center mt-8">
              <a
                href="/login"
                className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:-translate-y-1"
              >
                Login to Get Started
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />

        <main className="flex-1 px-4 py-6 max-w-screen-xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            <Route
              path="/shorten"
              element={
                <ProtectedRoute>
                  <URLShortener />
                </ProtectedRoute>
              }
            />

            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <URLStatistics />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-white shadow-inner py-6 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} URL Shortener. All rights
            reserved.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
