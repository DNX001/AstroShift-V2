import { useState } from "react";
import { fetchBlinkData } from "../services/astroshiftApi";

function getImageSource(value) {
  if (typeof value !== "string" || !value) {
    return "";
  }

  return value.startsWith("data:image/")
    ? value
    : `data:image/png;base64,${value}`;
}

function formatFileSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FitsUploadPanel({ onResult }) {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function handleFileSelection(event, setFile, frameName) {
    const selectedFile = event.target.files?.[0] ?? null;

    // Clear previous results when either file selection changes.
    setResult(null);
    onResult?.(null);

    if (!selectedFile) {
      setFile(null);
      setError("");
      return;
    }

    if (!/\.(fits?|fts)$/i.test(selectedFile.name)) {
      setFile(null);
      setError(
        `${frameName} must be a FITS file (.fits, .fit, or .fts).`
      );
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!fileA || !fileB) {
      setError("Please select both Frame A and Frame B.");
      return;
    }

    setIsUploading(true);
    setError("");
    setResult(null);
    onResult?.(null);

    try {
      const data = await fetchBlinkData(fileA, fileB);

      // Keep the existing preview and notify the parent component.
      setResult(data);
      onResult?.(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "FITS processing failed. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="w-full rounded-2xl border border-cyan-500/30 bg-slate-900 p-5 text-white shadow-xl sm:p-7">
      <header className="mb-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400">
          IMAGE REGISTRATION // SCIENCE ENGINE
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-wide">
          FITS Image Comparator
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Upload two FITS observations. AstroShift will process
          the frames and return Frame B aligned to Frame A.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-950 p-4">
            <label
              htmlFor="fits-frame-a"
              className="block text-xs font-bold tracking-wider text-cyan-300"
            >
              FRAME A · REFERENCE
            </label>

            <input
              id="fits-frame-a"
              type="file"
              accept=".fits,.fit,.fts"
              disabled={isUploading}
              onChange={(event) =>
                handleFileSelection(event, setFileA, "Frame A")
              }
              className="mt-4 block w-full min-w-0 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-cyan-300 disabled:opacity-50"
            />

            {fileA && (
              <div className="mt-3 break-words text-xs text-slate-400">
                <p>{fileA.name}</p>
                <p className="mt-1">{formatFileSize(fileA.size)}</p>
              </div>
            )}
          </div>

          <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-950 p-4">
            <label
              htmlFor="fits-frame-b"
              className="block text-xs font-bold tracking-wider text-cyan-300"
            >
              FRAME B · TO ALIGN
            </label>

            <input
              id="fits-frame-b"
              type="file"
              accept=".fits,.fit,.fts"
              disabled={isUploading}
              onChange={(event) =>
                handleFileSelection(event, setFileB, "Frame B")
              }
              className="mt-4 block w-full min-w-0 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-cyan-300 disabled:opacity-50"
            />

            {fileB && (
              <div className="mt-3 break-words text-xs text-slate-400">
                <p>{fileB.name}</p>
                <p className="mt-1">{formatFileSize(fileB.size)}</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading || !fileA || !fileB}
          className="w-full rounded-lg bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isUploading
            ? "PROCESSING FITS FRAMES..."
            : "UPLOAD & ALIGN FRAMES"}
        </button>

        <p className="text-xs leading-relaxed text-slate-500">
          Both files will be uploaded to the configured AstroShift
          backend for processing. Large files may take some time.
        </p>
      </form>

      {isUploading && (
        <p
          role="status"
          className="mt-5 animate-pulse text-sm text-cyan-300"
        >
          Uploading observations and aligning the star fields...
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-500/30 bg-red-950/30 p-4"
        >
          <p className="text-xs font-bold tracking-wider text-red-300">
            PROCESSING FAILED
          </p>

          <p className="mt-2 break-words text-sm text-red-200">
            {error}
          </p>
        </div>
      )}

      {result && (
        <div className="mt-7 border-t border-cyan-500/20 pt-6">
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-300">
            ALIGNMENT RESPONSE RECEIVED
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Reference Frame A and aligned Frame B are returned
            by the backend.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <figure className="min-w-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-3">
              <figcaption className="mb-3 text-xs font-bold tracking-wider text-cyan-300">
                FRAME A · REFERENCE
              </figcaption>

              <img
                src={getImageSource(result.frame_a_b64)}
                alt="Reference FITS frame A"
                className="aspect-square w-full rounded-lg bg-black object-contain"
              />

              <p className="mt-3 break-words text-xs text-slate-400">
                {result.metadata_a?.target_name || fileA.name}
              </p>
            </figure>

            <figure className="min-w-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-3">
              <figcaption className="mb-3 text-xs font-bold tracking-wider text-emerald-300">
                FRAME B · ALIGNED
              </figcaption>

              <img
                src={getImageSource(result.frame_b_aligned_b64)}
                alt="FITS frame B aligned to frame A"
                className="aspect-square w-full rounded-lg bg-black object-contain"
              />

              <p className="mt-3 break-words text-xs text-slate-400">
                {result.metadata_b?.target_name || fileB.name}
              </p>
            </figure>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            These images show the returned reference and aligned
            frames. Successful image delivery does not by itself
            validate the scientific quality of the alignment.
          </p>
        </div>
      )}
    </section>
  );
}