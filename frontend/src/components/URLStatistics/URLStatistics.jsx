import { useState } from "react";
import { urlService } from "../../services/api";

const URLStatistics = () => {
  const [shortcode, setShortcode] = useState("");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setShortcode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStats(null);
    setLoading(true);

    try {
      // Extract shortcode from full URL if needed
      let code = shortcode.trim();
      if (code.includes("/")) {
        const parts = code.split("/");
        code = parts[parts.length - 1];
      }

      const response = await urlService.getUrlStatistics(code);
      setStats(response);
    } catch (err) {
      setError(
        err.message ||
          "Failed to fetch URL statistics. Please check the shortcode."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          URL Statistics
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
              htmlFor="shortcode"
            >
              Enter Shortcode or URL
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="shortcode"
              value={shortcode}
              onChange={handleChange}
              placeholder="Enter shortcode (e.g., 'abc123' or full URL)"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Get Statistics"}
          </button>
        </form>

        {stats && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
              Statistics for: {stats.shortcode}
            </h3>

            <div className="mb-4">
              <div className="mb-2 flex flex-wrap">
                <span className="font-semibold w-32 text-gray-700">
                  Total Clicks:
                </span>
                <span className="flex-1 text-gray-900">
                  {stats.totalClicks}
                </span>
              </div>

              <div className="mb-2 flex flex-wrap">
                <span className="font-semibold w-32 text-gray-700">
                  Original URL:
                </span>
                <span className="flex-1 text-gray-900 break-all font-mono text-sm bg-gray-100 p-1 rounded">
                  {stats.originalUrl}
                </span>
              </div>

              <div className="mb-2 flex flex-wrap">
                <span className="font-semibold w-32 text-gray-700">
                  Created:
                </span>
                <span className="flex-1 text-gray-900">
                  {formatDate(stats.createdAt)}
                </span>
              </div>

              <div className="mb-2 flex flex-wrap">
                <span className="font-semibold w-32 text-gray-700">
                  Expires:
                </span>
                <span className="flex-1 text-gray-900">
                  {formatDate(stats.expiry)}
                </span>
              </div>
            </div>

            {stats.totalClicks > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2 mb-3">
                  Click History
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 border border-gray-200 text-left">
                          Time
                        </th>
                        <th className="py-2 px-3 border border-gray-200 text-left">
                          Referrer
                        </th>
                        <th className="py-2 px-3 border border-gray-200 text-left">
                          User Agent
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.clickData.map((click, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }
                        >
                          <td className="py-2 px-3 border border-gray-200">
                            {formatDate(click.timestamp)}
                          </td>
                          <td className="py-2 px-3 border border-gray-200">
                            {click.referrer}
                          </td>
                          <td className="py-2 px-3 border border-gray-200 text-xs max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {click.userAgent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default URLStatistics;
