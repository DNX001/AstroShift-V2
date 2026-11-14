import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileImage,
  FileUp,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

import { fetchBlinkData } from "../services/astroshiftApi";

const ACCEPTED_FITS = /\.(fits?|fts)$/i;

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getImageSource(value) {
  if (typeof value !== "string" || !value) return "";
  return value.startsWith("data:image/")
    ? value
    : `data:image/png;base64,${value}`;
}

function displayValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") {
    return "Not supplied";
  }
  return `${value}${suffix}`;
}

function MetadataList({ metadata }) {
  if (!metadata) {
    return (
      <p className="text-xs text-[#8193a0]">
        The backend did not return metadata for this frame.
      </p>
    );
  }

  const rows = [
    ["Target", metadata.target_name],
    ["Observed", metadata.date_obs],
    ["Telescope", metadata.telescope],
    ["Instrument", metadata.instrument],
    ["Filter", metadata.filter],
    [
      "Exposure",
      Number.isFinite(Number(metadata.exposure_time)) && metadata.exposure_time !== null
        ? `${metadata.exposure_time} s`
        : "Not supplied",
    ],
    [
      "Centre RA",
      Number.isFinite(metadata.ra_center)
        ? `${metadata.ra_center.toFixed(5)}°`
        : "Not supplied",
    ],
    [
      "Centre Dec",
      Number.isFinite(metadata.dec_center)
        ? `${metadata.dec_center.toFixed(5)}°`
        : "Not supplied",
    ],
    [
      "Dimensions",
      Array.isArray(metadata.dimensions) && metadata.dimensions.length
        ? metadata.dimensions.join(" × ")
        : "Not supplied",
    ],
  ];

  return (
    <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="font-mono text-[9px] tracking-[0.14em] text-[#708692]">
            {label.toUpperCase()}
          </dt>
          <dd className="mt-1 break-words text-xs leading-5 text-[#c2d0d7]">
            {displayValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function FileDropCard({
  frame,
  title,
  description,
  file,
  disabled,
  dragging,
  inputId,
  onDragChange,
  onFile,
  onRemove,
}) {
  return (
    <div
      className={`relative rounded-2xl border p-4 transition sm:p-5 ${
        dragging
          ? "border-cyan-200/60 bg-cyan-200/[0.09]"
          : file
            ? "border-emerald-300/25 bg-emerald-300/[0.035]"
            : "border-white/[0.09] bg-[#080f17] hover:border-cyan-200/25"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) onDragChange(true);
      }}
      onDragLeave={() => onDragChange(false)}
      onDrop={(event) => {
        event.preventDefault();
        onDragChange(false);
        if (!disabled) onFile(event.dataTransfer.files?.[0] ?? null);
      }}
    >
      <input
        id={inputId}
        type="file"
        accept=".fits,.fit,.fts"
        disabled={disabled}
        onChange={(event) => {
          onFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
        className="sr-only"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-200/10 bg-cyan-200/[0.055] text-[#8ce7f5]">
          <FileImage size={19} />
        </div>
        <span className="rounded-md border border-white/[0.08] px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-[#91a6b2]">
          FRAME {frame}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-[#edf4f7]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#8193a0]">{description}</p>
      </div>

      {file ? (
        <div className="mt-5 flex min-w-0 items-center gap-3 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.045] p-3">
          <CheckCircle2 size={17} className="shrink-0 text-emerald-300" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[#d9e8e4]" title={file.name}>
              {file.name}
            </p>
            <p className="mt-1 font-mono text-[10px] text-[#8ca49e]">
              {formatFileSize(file.size)} · READY
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove Frame ${frame}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9ab0b8] transition hover:bg-white/[0.07] hover:text-white disabled:opacity-40"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`mt-5 flex min-h-[112px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition ${
            disabled
              ? "cursor-not-allowed border-white/[0.05] opacity-50"
              : "border-cyan-200/20 bg-cyan-200/[0.025] hover:border-cyan-200/40 hover:bg-cyan-200/[0.055]"
          }`}
        >
          <UploadCloud size={22} className="text-[#8ce7f5]" />
          <span className="mt-2 text-xs font-semibold text-[#dce8ed]">
            {dragging ? "Drop FITS file here" : "Choose a FITS file"}
          </span>
          <span className="mt-1 text-[10px] text-[#8296a2]">
            Browse or drag and drop · .fits / .fit / .fts
          </span>
        </label>
      )}
    </div>
  );
}

function ResultFrame({ title, subtitle, image, metadata, accent = "cyan" }) {
  const accentText = accent === "emerald" ? "text-emerald-300" : "text-[#8ce7f5]";

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080f17]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
        <div className="min-w-0">
          <p className={`font-mono text-[9px] tracking-[0.16em] ${accentText}`}>
            {title}
          </p>
          <p className="mt-1 truncate text-xs text-[#9aabb7]">{subtitle}</p>
        </div>
        <ShieldCheck size={17} className="shrink-0 text-[#8197a2]" />
      </div>

      <div className="flex aspect-[4/3] items-center justify-center bg-black p-3">
        {image ? (
          <img
            src={getImageSource(image)}
            alt={subtitle}
            className="h-full w-full rounded-lg object-contain"
            loading="lazy"
          />
        ) : (
          <p className="text-xs text-[#8193a0]">Preview not returned.</p>
        )}
      </div>

      <div className="border-t border-white/[0.07] p-4">
        <MetadataList metadata={metadata} />
      </div>
    </article>
  );
}

export default function FitsUploadPanel({ onResult }) {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [draggingFrame, setDraggingFrame] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function clearPreviousResult() {
    setResult(null);
    onResult?.(null);
  }

  function acceptFile(file, setFile, frameName) {
    clearPreviousResult();

    if (!file) {
      setFile(null);
      setError("");
      return;
    }

    if (!ACCEPTED_FITS.test(file.name)) {
      setFile(null);
      setError(`${frameName} must be a FITS file (.fits, .fit or .fts).`);
      return;
    }

    if (file.size === 0) {
      setFile(null);
      setError(`${frameName} is empty. Choose a valid FITS file.`);
      return;
    }

    setFile(file);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!fileA || !fileB) {
      setError("Choose both observation frames before starting registration.");
      return;
    }

    setIsUploading(true);
    setError("");
    clearPreviousResult();

    try {
      const data = await fetchBlinkData(fileA, fileB);
      const sessionResult = {
        data,
        files: {
          frameA: { name: fileA.name, size: fileA.size },
          frameB: { name: fileB.name, size: fileB.size },
        },
        receivedAt: new Date().toISOString(),
      };

      setResult(data);
      onResult?.(sessionResult);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "FITS registration failed. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  }

  function removeFile(setFile) {
    setFile(null);
    setError("");
    clearPreviousResult();
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c141d] shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
      <header className="border-b border-white/[0.07] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-200/10 bg-cyan-200/[0.055] text-[#8ce7f5]">
              <FileUp size={20} />
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] text-[#8ce7f5]">
                IMAGE REGISTRATION / INPUT
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-[#edf4f7] sm:text-2xl">
                Load observation pair
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-6 text-[#91a4af]">
                Provide two FITS observations. The backend uses Frame A as the reference and attempts to register Frame B against it.
              </p>
            </div>
          </div>

          <span className="rounded-md border border-cyan-200/15 bg-cyan-200/[0.045] px-2.5 py-1.5 font-mono text-[9px] tracking-[0.12em] text-[#a5dce5]">
            FITS · 2 INPUTS
          </span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FileDropCard
            frame="A"
            title="Reference observation"
            description="The coordinate and image reference for registration."
            file={fileA}
            disabled={isUploading}
            dragging={draggingFrame === "A"}
            inputId="fits-frame-a"
            onDragChange={(active) => setDraggingFrame(active ? "A" : null)}
            onFile={(file) => acceptFile(file, setFileA, "Frame A")}
            onRemove={() => removeFile(setFileA)}
          />

          <FileDropCard
            frame="B"
            title="Observation to align"
            description="The second epoch or observation to register against Frame A."
            file={fileB}
            disabled={isUploading}
            dragging={draggingFrame === "B"}
            inputId="fits-frame-b"
            onDragChange={(active) => setDraggingFrame(active ? "B" : null)}
            onFile={(file) => acceptFile(file, setFileB, "Frame B")}
            onRemove={() => removeFile(setFileB)}
          />
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-300/20 bg-rose-300/[0.055] p-4">
            <AlertCircle size={17} className="mt-0.5 shrink-0 text-rose-300" />
            <div className="min-w-0">
              <p className="font-mono text-[9px] tracking-[0.15em] text-rose-200">
                REGISTRATION COULD NOT COMPLETE
              </p>
              <p className="mt-1 break-words text-xs leading-5 text-[#e5c6c8]">
                {error}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-[11px] leading-5 text-[#8193a0]">
            Files are sent to the configured AstroShift backend for processing. No local pixel analysis is performed by this upload panel.
          </p>
          <button
            type="submit"
            disabled={isUploading || !fileA || !fileB}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#8ce7f5] px-5 py-3 text-xs font-bold tracking-[0.08em] text-[#061219] transition hover:bg-[#b7f1f8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isUploading ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                REGISTERING FRAMES...
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                UPLOAD & REGISTER
              </>
            )}
          </button>
        </div>

        {isUploading && (
          <div role="status" className="rounded-xl border border-cyan-200/15 bg-cyan-200/[0.04] p-4">
            <div className="flex items-center gap-3">
              <LoaderCircle size={17} className="animate-spin text-[#8ce7f5]" />
              <div>
                <p className="text-xs font-semibold text-[#d8edf2]">Processing observation pair</p>
                <p className="mt-1 text-[11px] text-[#8da3ae]">
                  Uploading FITS files and registering Frame B to Frame A. The server does not provide a progress percentage.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>

      {result && (
        <div className="border-t border-white/[0.07] p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-300" />
                <p className="font-mono text-[9px] tracking-[0.17em] text-emerald-200">
                  REGISTRATION RESPONSE RECEIVED
                </p>
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold text-[#edf4f7]">
                Returned observation previews
              </h3>
            </div>
            <span className="rounded-md border border-emerald-300/15 bg-emerald-300/[0.045] px-2.5 py-1.5 font-mono text-[9px] tracking-[0.12em] text-emerald-200">
              FRAME B → FRAME A
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ResultFrame
              title="FRAME A / REFERENCE"
              subtitle={result.metadata_a?.target_name || fileA?.name || "Reference frame"}
              image={result.frame_a_b64 || result.image_a}
              metadata={result.metadata_a}
            />
            <ResultFrame
              title="FRAME B / REGISTERED"
              subtitle={result.metadata_b?.target_name || fileB?.name || "Aligned frame"}
              image={result.frame_b_aligned_b64 || result.image_b}
              metadata={result.metadata_b}
              accent="emerald"
            />
          </div>

          <div className="mt-4 rounded-xl border border-amber-200/15 bg-amber-200/[0.035] p-4">
            <p className="font-mono text-[9px] tracking-[0.15em] text-amber-100">
              INTERPRETATION LIMIT
            </p>
            <p className="mt-2 text-xs leading-6 text-[#b9b4a3]">
              These are the backend's returned reference and registered previews. Registration alone does not establish a transient, anomaly or discovery. Continue to Science Lab for visual comparison and the current analysis-availability notes.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
