import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  Check,
  Clipboard,
  Database,
  LoaderCircle,
  Send,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import { useObservation } from "../context/useObservation";
import { checkBackendHealth, sendAstroBotMessage } from "../services/astroshiftApi";
import AstroBotMarkdown from "./AstroBotMarkdown";

const welcomeMessage = {
  role: "assistant",
  content:
    "Welcome aboard AstroShift. I'm AstroBot, your astronomy companion. Ask me about SPHEREx, celestial objects, image registration or the science behind a changing sky. I'll distinguish what the data shows from what still needs to be verified.",
};

function buildDatasetContext(observation) {
  if (!observation?.data) return null;

  return {
    source: "AstroShift Observatory",
    context_type: "FITS image-registration result metadata",
    registration: "The backend returned Frame B aligned to Frame A.",
    frame_a: observation.data.metadata_a ?? null,
    frame_b: observation.data.metadata_b ?? null,
    source_files: observation.files ?? null,
    result_received_at: observation.receivedAt ?? null,
    interpretation_limit:
      "Only rendered preview images and metadata are attached. Raw pixel matrices, a calculated difference map and validated candidate detections are not included.",
  };
}

export default function AstroBotDrawer({
  mode = "drawer",
  draft = "",
  onDraftChange = () => {},
}) {
  const isWorkspace = mode === "workspace";
  const { observation } = useObservation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [error, setError] = useState("");
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [copyError, setCopyError] = useState("");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const sendingRef = useRef(false);

  const datasetContext = useMemo(
    () => buildDatasetContext(observation),
    [observation]
  );

  useEffect(() => {
    if (isWorkspace || isOpen) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen, isWorkspace]);

  useEffect(() => {
    let isActive = true;

    checkBackendHealth()
      .then((health) => {
        if (!isActive) return;

        const healthStatus = String(health?.status ?? "").toLowerCase();
        setBackendStatus(
          healthStatus === "healthy" || healthStatus === "ok"
            ? "online"
            : "offline"
        );
      })
      .catch((healthError) => {
        if (!isActive) return;
        console.error("AstroShift API health check failed:", healthError);
        setBackendStatus("offline");
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (isWorkspace || isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, error, isOpen, isWorkspace]);

  useEffect(() => {
    if (isWorkspace) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isWorkspace]);

  async function handleSubmit(event) {
    event.preventDefault();

    const question = draft.trim();
    if (!question || sendingRef.current) return;

    sendingRef.current = true;
    setIsTyping(true);
    setConnectionStatus("loading");
    setError("");
    setCopyError("");
    setCopiedMessageIndex(null);
    onDraftChange("");

    const history = messages
      .slice(1)
      .filter(
        (message) =>
          message.role === "user" || message.role === "assistant"
      )
      .slice(-12);

    setMessages((previous) => [
      ...previous,
      { role: "user", content: question },
    ]);

    try {
      const reply = await sendAstroBotMessage(question, history, {
        datasetContext: datasetContext ?? undefined,
      });

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: reply },
      ]);
      setConnectionStatus("success");
    } catch (requestError) {
      console.error("AstroBot request failed:", requestError);
      setConnectionStatus("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AstroBot could not generate a response. Please try again."
      );
    } finally {
      sendingRef.current = false;
      setIsTyping(false);
    }
  }

  async function handleRetry() {
    if (sendingRef.current) return;

    const lastMessage = messages[messages.length - 1];
    if (
      !lastMessage ||
      lastMessage.role !== "user" ||
      connectionStatus !== "error"
    ) {
      return;
    }

    sendingRef.current = true;
    setIsTyping(true);
    setConnectionStatus("loading");
    setError("");
    setCopyError("");

    const history = messages
      .slice(1, -1)
      .filter(
        (message) =>
          message.role === "user" || message.role === "assistant"
      )
      .slice(-12);

    try {
      const reply = await sendAstroBotMessage(
        lastMessage.content,
        history,
        { datasetContext: datasetContext ?? undefined }
      );

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: reply },
      ]);
      setConnectionStatus("success");
    } catch (requestError) {
      console.error("AstroBot retry failed:", requestError);
      setConnectionStatus("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AstroBot is still unavailable. Please try again later."
      );
    } finally {
      sendingRef.current = false;
      setIsTyping(false);
    }
  }

  function handleClearChat() {
    if (sendingRef.current) return;

    setMessages([welcomeMessage]);
    onDraftChange("");
    setError("");
    setCopyError("");
    setConnectionStatus("idle");
    setCopiedMessageIndex(null);
  }

  async function handleCopyAnswer(content, index) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageIndex(index);
      setCopyError("");
    } catch (copyFailure) {
      console.error("Unable to copy AstroBot answer:", copyFailure);
      setCopiedMessageIndex(null);
      setCopyError("Clipboard access is unavailable in this browser context.");
    }
  }

  const statusConfig = {
    idle: { label: "READY", className: "border-cyan-200/15 text-[#9fdde6]" },
    loading: { label: "GENERATING", className: "border-amber-200/20 text-amber-100" },
    success: { label: "RESPONSE RECEIVED", className: "border-emerald-200/20 text-emerald-200" },
    error: { label: "REQUEST FAILED", className: "border-rose-200/20 text-rose-200" },
  };

  const currentStatus = statusConfig[connectionStatus];
  const isChatEmpty =
    messages.length === 1 && !draft && !error && connectionStatus === "idle";
  const canRetry =
    connectionStatus === "error" &&
    messages[messages.length - 1]?.role === "user";

  const panelClassName = isWorkspace
    ? "relative z-0 flex h-[min(76vh,820px)] min-h-[520px] w-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b141d] text-white shadow-2xl shadow-black/25"
    : "fixed bottom-20 left-4 right-4 z-50 flex h-[min(72vh,640px)] min-h-[440px] flex-col overflow-hidden rounded-2xl border border-cyan-200/20 bg-[#0b141d] text-white shadow-2xl shadow-black/50 sm:left-auto sm:right-5 sm:w-[420px]";

  return (
    <>
      {!isWorkspace && (
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-controls="astrobot-panel"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-cyan-100/30 bg-[#8ce7f5] px-5 py-3 text-xs font-bold text-[#061219] shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-[#b7f1f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
        >
          <Bot size={16} />
          {isOpen ? "Close AstroBot" : "Ask AstroBot"}
        </button>
      )}

      {(isWorkspace || isOpen) && (
        <section
          id={isWorkspace ? "astrobot-workspace-panel" : "astrobot-panel"}
          aria-label={isWorkspace ? "AstroBot workspace" : "AstroBot chat"}
          className={panelClassName}
        >
          <header className="border-b border-white/[0.07] bg-[#0d1923] px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-200/15 bg-cyan-200/[0.06] text-[#8ce7f5]">
                  <Bot size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-base font-semibold tracking-wide text-[#edf4f7]">AstroBot</h2>
                  <p className="mt-0.5 font-mono text-[8px] tracking-[0.14em] text-[#8195a1]">ASTROSHIFT / SCIENCE COMPANION</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono text-[8px] tracking-[0.1em] ${backendStatus === "online" ? "border-emerald-200/15 text-emerald-200" : backendStatus === "offline" ? "border-rose-200/15 text-rose-200" : "border-amber-200/15 text-amber-100"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${backendStatus === "online" ? "bg-emerald-300" : backendStatus === "offline" ? "bg-rose-300" : "animate-pulse bg-amber-200"}`} />
                  {backendStatus === "online" ? "API ONLINE" : backendStatus === "offline" ? "API OFFLINE" : "CHECKING API"}
                </span>
                <span role="status" className={`rounded-full border px-2.5 py-1.5 font-mono text-[8px] tracking-[0.08em] ${currentStatus.className}`}>
                  {currentStatus.label}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] text-[#758b97]">
                {datasetContext ? "Current observation metadata will accompany your next question." : "Ask general astronomy or AstroShift questions."}
              </p>
              <button
                type="button"
                onClick={handleClearChat}
                disabled={isTyping || isChatEmpty}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[9px] font-medium text-[#a3b3bc] transition hover:border-rose-200/20 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Trash2 size={12} /> Clear conversation
              </button>
            </div>
          </header>

          {datasetContext && (
            <div className="flex items-start gap-2 border-b border-cyan-200/10 bg-cyan-200/[0.035] px-4 py-2.5 sm:px-5">
              <Database size={13} className="mt-0.5 shrink-0 text-[#8ce7f5]" />
              <p className="text-[10px] leading-5 text-[#9bb5bd]">
                Observation context attached · metadata only. Raw image pixels are not sent with this chat request.
              </p>
            </div>
          )}

          <div
            aria-live="polite"
            className="astrobot-scroll flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(29,76,91,0.12),transparent_55%)] p-4 sm:p-5"
          >
            {messages.map((message, index) => {
              const isUser = message.role === "user";

              return (
                <div key={`${message.role}-${index}`} className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-200/10 bg-cyan-200/[0.05] text-[#8ce7f5]">
                      <Bot size={14} />
                    </span>
                  )}

                  <div className={`min-w-0 max-w-[90%] sm:max-w-[720px] rounded-2xl px-4 py-3 text-xs leading-6 ${isUser ? "rounded-tr-md bg-cyan-200 text-[#07141a]" : "rounded-tl-md border border-white/[0.08] bg-[#111e29] text-[#d3dfe4]"}`}>
                    {isUser ? (
                      <div className="flex items-start gap-2">
                        <UserRound size={13} className="mt-1 shrink-0 opacity-65" />
                        <span className="whitespace-pre-wrap break-words">{message.content}</span>
                      </div>
                    ) : (
                      <>
                        <AstroBotMarkdown content={message.content} />
                        {index > 0 && (
                          <div className="mt-3 flex justify-end border-t border-white/[0.07] pt-2">
                            <button
                              type="button"
                              onClick={() => handleCopyAnswer(message.content, index)}
                              aria-label="Copy AstroBot answer"
                              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[9px] text-[#8297a3] transition hover:bg-white/[0.05] hover:text-[#b9eaf0]"
                            >
                              {copiedMessageIndex === index ? <Check size={12} /> : <Clipboard size={12} />}
                              {copiedMessageIndex === index ? "Copied" : "Copy answer"}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {isUser && (
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.045] text-[#a9bac2]">
                      <UserRound size={14} />
                    </span>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div role="status" className="flex items-center gap-2.5 text-[11px] text-[#8ce7f5]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-200/10 bg-cyan-200/[0.05]">
                  <LoaderCircle size={14} className="animate-spin" />
                </span>
                AstroBot is preparing a response...
              </div>
            )}

            {error && (
              <div role="alert" className="rounded-xl border border-rose-200/15 bg-rose-300/[0.045] p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-200" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-rose-100">AstroBot could not complete that request</p>
                    <p className="mt-1 break-words text-[11px] leading-5 text-[#d8bfc3]">{error}</p>
                    {canRetry && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        disabled={isTyping}
                        className="mt-3 rounded-lg border border-rose-200/20 px-3 py-2 text-[10px] font-semibold text-rose-100 transition hover:bg-rose-200/[0.06] disabled:opacity-40"
                      >
                        Retry response
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {copyError && <p role="status" className="text-[10px] text-amber-100">{copyError}</p>}
            <div ref={bottomRef} />
          </div>

          <footer className="border-t border-white/[0.07] bg-[#0d1923] p-3 sm:p-4">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <label htmlFor="astrobot-message-input" className="sr-only">Message AstroBot</label>
              <input
                id="astrobot-message-input"
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                placeholder="Ask about astronomy, SPHEREx or your observation..."
                maxLength={2000}
                disabled={isTyping}
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/[0.09] bg-[#070e15] px-4 py-3 text-xs text-[#edf4f7] outline-none placeholder:text-[#617681] transition focus:border-cyan-200/35 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isTyping}
                aria-label="Send message to AstroBot"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8ce7f5] text-[#061219] transition hover:bg-[#b7f1f8] disabled:cursor-not-allowed disabled:opacity-35"
              >
                {isTyping ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-[9px] text-[#6f838f]">Enter to send · Up to 2,000 characters</p>
              <p className="inline-flex items-center gap-1 text-[9px] text-[#6f838f]">
                <ShieldCheck size={10} /> Verify scientific interpretations against evidence
              </p>
            </div>
          </footer>
        </section>
      )}
    </>
  );
}
