
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
  const headers = new Headers(options.headers ?? {});

  // Add JSON headers only when sending a JSON string.
  // This also keeps future FormData uploads compatible.
  if (
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `AstroShift API returned HTTP ${response.status}`
    );
  }

  return response.json();
}

// Check whether Sneha's FastAPI backend is running.
export async function checkBackendHealth() {
  return apiRequest("/api/health");
}

// Send a message to AstroBot.
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

  if (/astrobot telemetry offline/i.test(data.reply)) {
    throw new Error(
      "The AstroBot AI provider is currently unavailable."
    );
  }

  return data.reply;
}

// Search for a celestial target by name.
// Backend contract: GET /api/search?query=<target name>
export async function searchCelestialTarget(query) {
  const targetName =
    typeof query === "string" ? query.trim() : "";

  if (!targetName) {
    throw new Error(
      "Enter a celestial target name to search."
    );
  }

  const response = await apiRequest(
    `/api/search?query=${encodeURIComponent(targetName)}`
  );

  const target = response?.data;

  if (
    response?.status !== "success" ||
    !target ||
    typeof target.query !== "string" ||
    typeof target.ra !== "number" ||
    !Number.isFinite(target.ra) ||
    typeof target.dec !== "number" ||
    !Number.isFinite(target.dec) ||
    typeof target.formatted !== "string"
  ) {
    throw new Error(
      "The backend returned an invalid celestial search response."
    );
  }

  return target;
}

// Legacy image-pair helper.
// Pending alignment with Sneha's new FITS-upload API.
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
