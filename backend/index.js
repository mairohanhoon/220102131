import express from "express";
import { nanoid } from "nanoid";
import cors from "cors";
import e from "express";
import loggingMiddleware from "../logging/logging.middleware.js";
import { console } from "inspector";

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

// Middleware
app.use(express.json());
app.use(cors());
app.use(loggingMiddleware);

// In-memory storage for shortened URLs
const urlDatabase = new Map();

// Function to record click data
const recordClick = (shortcode, req) => {
  if (!urlDatabase.has(shortcode)) {
    return false;
  }

  const urlData = urlDatabase.get(shortcode);

  // Create clicks array if it doesn't exist
  if (!urlData.clicks) {
    urlData.clicks = [];
  }

  // Record click data
  urlData.clicks.push({
    timestamp: new Date().toISOString(),
    referrer: req.get("Referrer") || "Direct",
    userAgent: req.get("User-Agent"),
  });

  // Update the data in the database
  urlDatabase.set(shortcode, urlData);

  return true;
};

// Generate a unique shortcode or use the provided one
const generateShortcode = (customCode) => {
  if (customCode) {
    if (urlDatabase.has(customCode)) {
      return null; // Custom code already exists
    }
    return customCode;
  }

  // Generate a random 5-character shortcode
  let shortcode;
  do {
    shortcode = nanoid(5); // Generate a 5-character ID
  } while (urlDatabase.has(shortcode));

  return shortcode;
};

// Endpoint to create a shortened URL
app.post("/shorturls", async (req, res) => {
  const { url, validity, shortcode } = req.body;

  // Validate the URL
  if (!url) {
    await req.logger(
      "backend",
      "error",
      "url-shortener",
      "URL creation failed: Missing URL parameter"
    );
    return res.status(400).json({ error: "URL is required" });
  }

  // Generate or validate shortcode
  const generatedShortcode = generateShortcode(shortcode);

  if (shortcode && !generatedShortcode) {
    return res
      .status(409)
      .json({ error: "Requested shortcode is already in use" });
  }

  // Set expiry time
  const validityMinutes = validity || 30; // Default to 30 minutes
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + validityMinutes);

  // Store the URL data
  urlDatabase.set(generatedShortcode, {
    originalUrl: url,
    expiry: expiryDate,
    createdAt: new Date().toISOString(),
    clicks: [],
  });

  // Construct the shortened URL
  const shortLink = `http://${HOST}:${PORT}/${generatedShortcode}`;

  // Log the URL creation
  await req.logger(
    "backend",
    "info",
    "url-shortener",
    `Created short URL ${shortLink} for ${url}`
  );

  // Return the response
  res.status(201).json({
    shortLink,
    expiry: expiryDate.toISOString(),
  });
});

// Redirect endpoint for short URLs
app.get("/:shortcode", async (req, res) => {
  const { shortcode } = req.params;

  // Check if shortcode exists
  if (!urlDatabase.has(shortcode)) {
    await req.logger(
      "backend",
      "warn",
      "url-shortener",
      `Invalid shortcode accessed: ${shortcode}`
    );
    return res.status(404).json({ error: "Short link not found" });
  }

  const urlData = urlDatabase.get(shortcode);

  // Check if link has expired
  if (new Date() > new Date(urlData.expiry)) {
    urlDatabase.delete(shortcode); // Clean up expired link
    return res.status(410).json({ error: "Short link has expired" });
  }

  // Record this click
  recordClick(shortcode, req);

  // Log the redirect
  await req.logger(
    "backend",
    "debug",
    "url-shortener",
    `Redirecting ${shortcode} to ${urlData.originalUrl}`
  );

  // Redirect to original URL
  res.redirect(urlData.originalUrl);
});

// Statistics endpoint for short URLs
app.get("/shorturls/:shortcode", async (req, res) => {
  const { shortcode } = req.params;

  // Check if shortcode exists
  if (!urlDatabase.has(shortcode)) {
    return res.status(404).json({ error: "Short link not found" });
  }

  const urlData = urlDatabase.get(shortcode);

  // Check if link has expired
  if (new Date() > new Date(urlData.expiry)) {
    urlDatabase.delete(shortcode); // Clean up expired link
    return res.status(410).json({ error: "Short link has expired" });
  }

  // Prepare statistics response
  const stats = {
    shortcode,
    totalClicks: urlData.clicks ? urlData.clicks.length : 0,
    originalUrl: urlData.originalUrl,
    createdAt: urlData.createdAt,
    expiry: urlData.expiry,
    clickData: urlData.clicks || [],
  };

  // Log statistics access
  await req.logger(
    "backend",
    "info",
    "url-shortener",
    `Statistics accessed for ${shortcode}: ${stats.totalClicks} total clicks`
  );

  // Return statistics
  res.json(stats);
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("URL Shortener API");
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, name, rollNo, accessCode, clientID, clientSecret } = req.body;

  // Validate required parameters
  const requiredParams = {
    email,
    name,
    rollNo,
    accessCode,
    clientID,
    clientSecret,
  };
  const missingParams = Object.entries(requiredParams)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingParams.length > 0) {
    await req.logger(
      "backend",
      "warn",
      "auth",
      `Login attempt failed: Missing parameters: ${missingParams.join(", ")}`
    );
    return res.status(400).json({
      error: "Missing required parameters",
      missingParams,
    });
  }

  try {
    // Log the authentication attempt
    await req.logger(
      "backend",
      "info",
      "auth",
      `Authentication attempt for user: ${email}, name: ${name}, rollNo: ${rollNo}`
    );

    // Make the API call to the authentication service
    const response = await fetch(
      "http://20.244.56.144/evaluation-service/auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          rollNo,
          accessCode,
          clientID,
          clientSecret,
        }),
      }
    );

    // Get the response data
    const data = await response.json();
    // Check the response status
    
    if (data.token_type === "Bearer") {
      // Successful authentication
      await req.logger(
        "backend",
        "info",
        "auth",
        `Authentication successful for user: ${email}`
      );

      return res.status(200).json({
        success: true,
        message: "Authentication successful",
        data,
      });
    } else {
      // Failed authentication
      await req.logger(
        "backend",
        "error",
        "auth",
        `Authentication failed for user: ${email}, status: ${response.status}`
      );

      return res.status(401).json({
        success: false,
        message: "Authentication failed: Invalid credentials",
        error: data.error || "Unknown error",
      });
    }
  } catch (error) {
    // Error during authentication process
    await req.logger(
      "backend",
      "error",
      "auth",
      `Authentication error: ${error.message}`
    );

    return res.status(500).json({
      success: false,
      message: "Authentication service unavailable",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
