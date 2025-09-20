import { Link } from "react-router-dom";
import { authService } from "../../services/api";

const Navigation = ({ isAuthenticated, onLogout }) => {
  const handleLogout = () => {
    authService.removeAuthToken();
    if (onLogout) {
      onLogout();
    }
  };

  const userInfo = authService.getUserInfo();

  return (
    <nav className="sticky top-0 z-10 bg-white shadow-md px-4 py-3 flex flex-wrap items-center justify-between">
      <div className="text-xl font-bold">
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          URL Shortener
        </Link>
      </div>

      <div className="flex flex-col md:flex-row w-full md:w-auto md:ml-4">
        {isAuthenticated ? (
          <>
            <div className="flex flex-col md:flex-row gap-2 md:gap-5 py-2">
              <Link
                to="/"
                className="px-3 py-2 text-gray-700 hover:text-blue-500 hover:bg-gray-100 rounded-md font-medium"
              >
                Home
              </Link>
              <Link
                to="/shorten"
                className="px-3 py-2 text-gray-700 hover:text-blue-500 hover:bg-gray-100 rounded-md font-medium"
              >
                Shorten URL
              </Link>
              <Link
                to="/stats"
                className="px-3 py-2 text-gray-700 hover:text-blue-500 hover:bg-gray-100 rounded-md font-medium"
              >
                URL Statistics
              </Link>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-3 mt-3 md:mt-0 md:ml-auto">
              {userInfo && (
                <div className="text-sm text-gray-600">
                  <span>Welcome, {userInfo.name}</span>
                </div>
              )}
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="flex justify-center md:justify-end w-full md:ml-auto mt-3 md:mt-0">
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
