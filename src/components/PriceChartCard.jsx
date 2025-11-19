import React, { useState } from "react";

const PriceChartCard = ({ data }) => {
  if (!data) return null;

  const [showFull, setShowFull] = useState(false);

  const {
    product,
    category,
    llm_summary,
    svg_base64,
    thumb_base64,
    predictions,
    history
  } = data;

  console.log("Data in chart is ",data)

  return (
    <div className="p-4 mt-4 border rounded-xl bg-white dark:bg-gray-900 shadow">
      
      {/* Product Title */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {product} — Price Trend
      </h2>

      {/* Category */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Category: <span className="font-medium">{category}</span>
      </p>

      {/* Thumbnail Chart */}
      {thumb_base64 && (
        <div className="flex justify-center mb-3">
          <img
            src={`data:image/png;base64,${thumb_base64}`}
            alt="Price Chart"
            className="w-72 border rounded-lg cursor-pointer hover:scale-105 transition"
            onClick={() => setShowFull(true)}
          />
        </div>
      )}

      {/* LLM Summary */}
      {llm_summary && (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mt-2">
          {llm_summary}
        </p>
      )}

      {/* Predictions list (optional) */}
      {predictions && predictions.length > 0 && (
        <div className="mt-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Price Predictions (Next {predictions.length} days)
          </h3>

          <div className="max-h-40 overflow-y-auto text-sm space-y-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
            {predictions.slice(0, 15).map((p, i) => (
              <div key={i} className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>{p.date}</span>
                <span>₹{p.predicted_price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔍 Full SVG Chart Modal */}
      {showFull && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl max-w-3xl shadow-xl max-h-screen overflow-auto">

            <h2 className="text-lg font-bold mb-2">
              Full Price Chart — {product}
            </h2>

            <img
              src={`data:image/svg+xml;base64,${svg_base64}`}
              alt="Full Chart"
              className="w-full h-auto"
            />

            <button
              onClick={() => setShowFull(false)}
              className="mt-4 w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium">
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PriceChartCard;
