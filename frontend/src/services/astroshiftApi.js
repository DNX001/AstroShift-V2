const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class AstroShiftApiError extends Error {
  constructor(message, { status = null, code = "api_error", detail = null } = {}) {
    super(message);
    this.name = "AstroShiftApiError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

function getApiUrl(path) {
  if (!API_BASE_URL) {
    throw new AstroShiftApiError(
      "The AstroShift API address is not configured. Check frontend/.env.local.",
      { code: "configuration" }
    );
  }

  return `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
}

function getDetail(payload) {
  const detail = payload?.detail ?? payload?.message ?? payload?.error;

  if (typeof detail === "string") {
    return detail;
  }

  if (detail && typeof detail === "object") {
    return JSON.stringify(detail);
  }

  return typeof payload === "string" ? payload : "";
}

function getFriendlyError(path, status, detail) {
  const normalized = String(detail ?? "").toLowerCase();

  if (
    status === 429 ||
    /rate_limit_exceeded|output tokens per minute|error code:\s*429|too many requests/.test(normalized)
  ) {
    return {
      code: "provider_rate_limit",
      message:
        "AstroBot's AI provider has temporarily reached its generation limit. The AstroShift API is reachable, but it cannot generate a reply right now. Please wait a little and try again.",
    };
  }

  if (status === 413) {
    return {
      code: "payload_too_large",
      message:
        "The upload is larger than the server accepts. Try a smaller FITS file or ask the backend team to confirm its upload limit.",
    };
  }

  if (status === 400 && /fits|file|matrix|dimension|empty/.test(normalized)) {
    return {
      code: "invalid_input",
      message:
        detail.length <= 220
          ? detail
          : "The backend rejected the supplied data. Check the FITS files and try again.",
    };
  }

  if (status === 404 && path.startsWith("/api/search")) {
    return {
      code: "target_not_resolved",
      message:
        detail.length <= 220
          ? detail
          : "The target could not be resolved. Check its name and try again.",
    };
  }

  if (path.startsWith("/api/blink-data") && status >= 500) {
    return {
      code: "fits_processing_failed",
      message:
        "The backend could not complete FITS registration. Check that both files are valid and try again. If the problem persists, the processing service may need attention.",
    };
  }

  if (status >= 500) {
    return {
      code: "server_error",
      message:
        "The AstroShift server encountered an internal error. Please try again later. If it continues, share the time of the request with the backend team.",
    };
  }

  if (status === 401 || status === 403) {
    return {
      code: "access_denied",
      message:
        "The AstroShift service denied this request. The backend team may need to check its access configuration.",
    };
  }

  if (detail && detail.length <= 220 && !/traceback|org_[a-z0-9]+|api[_ -]?key/i.test(detail)) {
    return { code: "request_rejected", message: detail };
  }

  return {
    code: "request_failed",
    message: `The AstroShift API returned HTTP ${status}. Please try again.`,
  };
}

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers ?? {});

  // FormData uploads must let the browser set the multipart boundary.
  if (
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const url = getApiUrl(path);
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    throw new AstroShiftApiError(
      "Could not reach the AstroShift backend. Check your internet connection and try again.",
      { code: "network_error" }
    );
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    const detail = getDetail(payload);
    const friendly = getFriendlyError(path, response.status, detail);

    throw new AstroShiftApiError(friendly.message, {
      status: response.status,
      code: friendly.code,
      detail,
    });
  }

  return response.json();
}

// A healthy response confirms API reachability, not AI-provider availability.
export async function checkBackendHealth() {
  return apiRequest("/api/health");
}

// Send a message to AstroBot. The backend accepts optional observation metadata.
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

  const reply = [data?.response, data?.reply].find(
    (value) =>
      typeof value === "string" && value.trim().length > 0
  );

  if (!reply) {
    throw new AstroShiftApiError(
      "AstroBot received an empty or unsupported response from the backend.",
      { code: "invalid_chat_response" }
    );
  }

  if (/astrobot telemetry offline/i.test(reply)) {
    throw new AstroShiftApiError(
      "The AstroBot AI provider is currently unavailable. Please try again later.",
      { code: "provider_unavailable" }
    );
  }

  return reply;
}

// Resolve a celestial target by name using the existing backend route.
export async function searchCelestialTarget(query) {
  const targetName =
    typeof query === "string" ? query.trim() : "";

  if (!targetName) {
    throw new AstroShiftApiError(
      "Enter a celestial target name to search.",
      { code: "empty_query" }
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
    throw new AstroShiftApiError(
      "The backend returned an invalid celestial search response.",
      { code: "invalid_target_response" }
    );
  }

  return target;
}

// Upload two FITS files for registration. The backend returns rendered previews
// and metadata; it does not currently return the raw pixel matrices.
export async function fetchBlinkData(fileA, fileB) {
  if (
    !fileA ||
    typeof fileA.arrayBuffer !== "function" ||
    !fileB ||
    typeof fileB.arrayBuffer !== "function"
  ) {
    throw new AstroShiftApiError(
      "Please provide both Frame A and Frame B FITS files.",
      { code: "missing_files" }
    );
  }

  const formData = new FormData();
  formData.append("file_a", fileA);
  formData.append("file_b", fileB);

  const data = await apiRequest("/api/blink-data", {
    method: "POST",
    body: formData,
  });

  const frameA = data?.frame_a_b64 ?? data?.image_a;
  const frameB = data?.frame_b_aligned_b64 ?? data?.image_b;

  if (
    data?.status !== "success" ||
    typeof frameA !== "string" ||
    !frameA ||
    typeof frameB !== "string" ||
    !frameB
  ) {
    throw new AstroShiftApiError(
      "The backend did not return both registered image previews.",
      { code: "invalid_blink_response" }
    );
  }

  return {
    ...data,
    frame_a_b64: frameA,
    frame_b_aligned_b64: frameB,
  };
}
