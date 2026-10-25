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
  // FormData uploads must let the browser set Content-Type.
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
// Backend: GET /api/search?query=<target name>
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

// Upload two FITS files for Blink Comparator alignment.
// Backend fields: file_a, file_b
// Returns: frame_a_b64, frame_b_aligned_b64,
// plus image_a, image_b, and metadata.
export async function fetchBlinkData(fileA, fileB) {
  if (
    !fileA ||
    typeof fileA.arrayBuffer !== "function" ||
    !fileB ||
    typeof fileB.arrayBuffer !== "function"
  ) {
    throw new Error(
      "Please provide both Frame A and Frame B FITS files."
    );
  }

  const formData = new FormData();

  formData.append("file_a", fileA);
  formData.append("file_b", fileB);

  const data = await apiRequest("/api/blink-data", {
    method: "POST",
    body: formData,
  });

  if (
    data?.status !== "success" ||
    typeof data.frame_a_b64 !== "string" ||
    !data.frame_a_b64 ||
    typeof data.frame_b_aligned_b64 !== "string" ||
    !data.frame_b_aligned_b64
  ) {
    throw new Error(
      "The backend did not return valid aligned image frames."
    );
  }

  return data;
}