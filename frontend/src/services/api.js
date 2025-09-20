// API service for handling all backend requests

const API_BASE_URL = "http://localhost:3000";

/**
 * Authentication service
 */
export const authService = {
  // Login with credentials
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem("authToken") !== null;
  },

  // Store auth token
  setAuthToken: (token) => {
    localStorage.setItem("authToken", token);
  },

  // Get auth token
  getAuthToken: () => {
    return localStorage.getItem("authToken");
  },

  // Remove auth token (logout)
  removeAuthToken: () => {
    localStorage.removeItem("authToken");
  },

  // Get user info from localStorage
  getUserInfo: () => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // Store user info
  setUserInfo: (userInfo) => {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  },
};

/**
 * URL Shortener service
 */
export const urlService = {
  // Create a shortened URL
  shortenUrl: async (urlData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shorturls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getAuthToken()}`,
        },
        body: JSON.stringify(urlData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      return data;
    } catch (error) {
      console.error("URL shortening error:", error);
      throw error;
    }
  },

  // Get statistics for a shortened URL
  getUrlStatistics: async (shortcode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shorturls/${shortcode}`, {
        headers: {
          Authorization: `Bearer ${authService.getAuthToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get URL statistics");
      }

      return data;
    } catch (error) {
      console.error("Get URL statistics error:", error);
      throw error;
    }
  },
};
