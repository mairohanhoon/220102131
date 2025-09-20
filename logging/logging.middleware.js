// URL for the logs API
const EVALUATION_SERVICE_URL = "http://20.244.56.144/evaluation-service/logs";

// Middleware that handles logging
const loggingMiddleware = (req, res, next) => {

  req.logger = async (stack, level, packageName, message) => {
    try {
      const requestBody = {
        stack,
        level,
        package: packageName,
        message,
      };

      const response = await fetch(EVALUATION_SERVICE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Log request failed: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`Log sent. ID: ${responseData.logID}`);

      return responseData;
    } catch (error) {
      console.error("Log error:", error.message);
      return {
        logID: null,
        message: "Failed to log message",
        error: error.message,
      };
    }
  };

  next();
};

export default loggingMiddleware;
