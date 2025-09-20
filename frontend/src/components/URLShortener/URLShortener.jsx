import { useState } from "react";
import { urlService } from "../../services/api";

const URLShortener = () => {
  const [urlData, setUrlData] = useState({
    url: "",
    validity: 30,
    shortcode: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUrlData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setCopied(false);
    setLoading(true);

    try {
      // Only send shortcode if it's not empty
      const dataToSend = {
        url: urlData.url,
        validity: urlData.validity,
      };

      if (urlData.shortcode.trim()) {
        dataToSend.shortcode = urlData.shortcode.trim();
      }

      const response = await urlService.shortenUrl(dataToSend);
      setResult(response);
    } catch (err) {
      setError(err.message || "Failed to shorten URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;

    navigator.clipboard
      .writeText(result.shortLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Shorten URL
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
              htmlFor="url"
            >
              URL to Shorten
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="url"
              id="url"
              name="url"
              value={urlData.url}
              onChange={handleChange}
              placeholder="https://example.com/very-long-url"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block mb-1 font-medium text-gray-700"
              htmlFor="validity"
            >
              Validity (minutes)
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              id="validity"
              name="validity"
              value={urlData.validity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block mb-1 font-medium text-gray-700"
              htmlFor="shortcode"
            >
              Custom Shortcode (optional)
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="shortcode"
              name="shortcode"
              value={urlData.shortcode}
              onChange={handleChange}
              placeholder="Leave empty for auto-generation"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Processing..." : "Shorten URL"}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-green-50 rounded-md border border-green-100">
            <h3 className="text-lg font-semibold text-green-800 text-center mb-3">
              Your Shortened URL
            </h3>
            <div className="flex mb-3">
              <input
                type="text"
                value={result.shortLink}
                readOnly
                className="flex-grow px-3 py-2 border border-green-200 rounded-l-md bg-green-50 text-base"
              />
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                onClick={copyToClipboard}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-center text-gray-600 text-sm">
              Expires: {new Date(result.expiry).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default URLShortener;
