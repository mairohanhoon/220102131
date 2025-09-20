import { useState } from "react";
import { authService } from "../../services/api";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    rollNo: "",
    accessCode: "",
    clientID: "",
    clientSecret: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(formData);

      // Store the token and user info
      authService.setAuthToken(response.data.token);
      authService.setUserInfo({
        name: formData.name,
        email: formData.email,
        rollNo: formData.rollNo,
      });

      // Notify parent component about successful login
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(
        err.message || "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>
        {error && (
          <div className="p-3 mb-4 text-center text-red-800 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block mb-1 font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block mb-1 font-medium text-gray-700"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block mb-1 font-medium text-gray-700"
              htmlFor="rollNo"
            >
              Roll Number
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="rollNo"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block mb-1 font-medium text-gray-700"
              htmlFor="accessCode"
            >
              Access Code
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="accessCode"
              name="accessCode"
              value={formData.accessCode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block mb-1 font-medium text-gray-700"
              htmlFor="clientID"
            >
              Client ID
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="clientID"
              name="clientID"
              value={formData.clientID}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block mb-1 font-medium text-gray-700"
              htmlFor="clientSecret"
            >
              Client Secret
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="clientSecret"
              name="clientSecret"
              value={formData.clientSecret}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
