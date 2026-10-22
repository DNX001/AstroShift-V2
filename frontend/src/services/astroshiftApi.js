
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getApiUrl(path) {
  if (!API_BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL is missing from .env.local"
    );
  }

  return `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `AstroShift API returned HTTP ${response.status}`
    );
  }

  return response.json();
}

// Check whether Sneha's FastAPI server is running.
export async function checkBackendHealth() {
  return apiRequest("/api/health");
}

// Send a message to AstroBot.
// The AI provider's API keys remain on the backend.
export async function sendAstroBotMessage(
  message,
  history = [],
  options = {}
) {
  const body = {
    message,
    history,
  };

  if (options.imageBase64) {
    body.image_base64 = options.imageBase64;
  }

  if (options.datasetContext) {
    body.dataset_context = options.datasetContext;
  }

  const data = await apiRequest("/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (
    typeof data.reply !== "string" ||
    !data.reply.trim()
  ) {
    throw new Error("Invalid AstroBot response.");
  }

  // Current backend returns HTTP 200 even when Groq fails.
  // Treat its known fallback message as an AI failure.
  if (
    /astrobot telemetry offline/i.test(data.reply)
  ) {
    throw new Error(
      "The AstroBot AI provider is currently unavailable."
    );
  }

  return data.reply;
}

// Fetch the image-pair data for Trina's Blink Comparator.
export async function fetchBlinkData(
  datasetId = "spherex-01"
) {
  const data = await apiRequest("/api/blink-data", {
    method: "POST",
    body: JSON.stringify({
      dataset_id: datasetId,
    }),
  });

  if (
    typeof data.image_a !== "string" ||
    typeof data.image_b !== "string"
  ) {
    throw new Error(
      "The backend did not provide valid image references."
    );
  }

  return data;
}
