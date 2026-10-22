import { useEffect, useRef, useState } from "react";
import { sendAstroBotMessage } from "../services/astroshiftApi";
import AstroBotMarkdown from "./AstroBotMarkdown";

// --------------------------------------------------
// WELCOME MESSAGE
// --------------------------------------------------

const welcomeMessage = {
  role: "assistant",
  content:
    "Welcome aboard AstroShift! I'm AstroBot, your AI astronomy companion. Ask me about SPHEREx, celestial objects, or the science behind our mission.",
};

export default function AstroBotDrawer() {
  // --------------------------------------------------
  // COMPONENT STATE
  // --------------------------------------------------

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [error, setError] = useState("");
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const sendingRef = useRef(false);

  // --------------------------------------------------
  // AUTO-FOCUS MESSAGE INPUT WHEN DRAWER OPENS
  // --------------------------------------------------

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // --------------------------------------------------
  // AUTO-SCROLL
  // --------------------------------------------------

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, isTyping, error, isOpen]);

  // --------------------------------------------------
  // CLOSE DRAWER WITH ESCAPE
  // --------------------------------------------------

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // --------------------------------------------------
  // SEND MESSAGE TO ASTROSHIFT BACKEND
  // --------------------------------------------------

  async function handleSubmit(event) {
    event.preventDefault();

    const question = input.trim();

    if (!question || sendingRef.current) return;

    sendingRef.current = true;

    setIsTyping(true);
    setConnectionStatus("loading");
    setError("");
    setInput("");
    setCopiedMessageIndex(null);

    // The welcome message is UI-only.
    // Send only actual conversation history.

    const history = messages
      .slice(1)
      .filter(
        (message) =>
          message.role === "user" ||
          message.role === "assistant"
      )
      .slice(-12);

    // Display the user's question immediately.

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: question,
      },
    ]);

    try {
      const reply = await sendAstroBotMessage(
        question,
        history
      );

      // Add the reply from the live FastAPI backend.

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: reply,
        },
      ]);

      setConnectionStatus("success");
    } catch (requestError) {
      console.error(
        "AstroBot request failed:",
        requestError
      );

      setConnectionStatus("error");

      setError(
        "AstroBot could not generate a response. " +
          "The backend or its AI provider may be unavailable. " +
          "Please try again."
      );
    } finally {
      sendingRef.current = false;
      setIsTyping(false);
    }
  }

  // --------------------------------------------------
  // RETRY LAST FAILED ASTROBOT RESPONSE
  // --------------------------------------------------

  async function handleRetry() {
    // Prevent duplicate requests.
    if (sendingRef.current) return;

    // The last message must be an unanswered question.
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
    setCopiedMessageIndex(null);

    // Exclude the welcome message and unanswered
    // question from the previous conversation history.

    const history = messages
      .slice(1, -1)
      .filter(
        (message) =>
          message.role === "user" ||
          message.role === "assistant"
      )
      .slice(-12);

    try {
      // Retry the original question without adding
      // a duplicate user message to the interface.

      const reply = await sendAstroBotMessage(
        lastMessage.content,
        history
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: reply,
        },
      ]);

      setConnectionStatus("success");
    } catch (requestError) {
      console.error(
        "AstroBot retry failed:",
        requestError
      );

      setConnectionStatus("error");

      setError(
        "AstroBot is still unavailable. " +
          "Please try again later."
      );
    } finally {
      sendingRef.current = false;
      setIsTyping(false);
    }
  }

  // --------------------------------------------------
  // CLEAR CHAT
  // --------------------------------------------------

  function handleClearChat() {
    // Never reset the conversation during an active request.
    if (sendingRef.current) return;

    setMessages([welcomeMessage]);
    setInput("");
    setError("");
    setConnectionStatus("idle");
    setCopiedMessageIndex(null);
  }

  // --------------------------------------------------
  // COPY ASTROBOT ANSWER
  // --------------------------------------------------

  async function handleCopyAnswer(content, index) {
    try {
      // Copy the complete original AI response.
      await navigator.clipboard.writeText(content);

      // Show confirmation for the copied response.
      setCopiedMessageIndex(index);
    } catch (copyError) {
      console.error(
        "Unable to copy AstroBot answer:",
        copyError
      );

      setCopiedMessageIndex(null);

      window.alert(
        "Could not copy the answer. Please try again."
      );
    }
  }

  // --------------------------------------------------
  // CONNECTION STATUS
  // --------------------------------------------------

  const statusConfig = {
    idle: {
      label: "API MODE",
      style: "border-cyan-500/40 text-cyan-300",
    },
    loading: {
      label: "REQUESTING",
      style: "border-amber-500/40 text-amber-300",
    },
    success: {
      label: "REPLY RECEIVED",
      style: "border-green-500/40 text-green-400",
    },
    error: {
      label: "UNAVAILABLE",
      style: "border-red-500/40 text-red-400",
    },
  };

  const currentStatus = statusConfig[connectionStatus];

  const isChatEmpty =
    messages.length === 1 &&
    !input &&
    !error &&
    connectionStatus === "idle";

  const canRetry =
    connectionStatus === "error" &&
    messages[messages.length - 1]?.role === "user";

  // --------------------------------------------------
  // ASTROBOT INTERFACE
  // --------------------------------------------------

  return (
    <>
      {/* Floating AstroBot launcher */}

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-controls="astrobot-panel"
        className="fixed bottom-5 right-5 z-50 rounded-full border border-cyan-400/40 bg-cyan-400 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300"
      >
        {isOpen ? "Close AstroBot" : "✦ AstroBot"}
      </button>

      {/* AstroBot chat drawer */}

      {isOpen && (
        <section
          id="astrobot-panel"
          aria-label="AstroBot chat"
          className="fixed bottom-20 left-4 right-4 z-50 flex h-[min(70vh,560px)] flex-col overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950 text-white shadow-2xl shadow-cyan-950/40 sm:left-auto sm:right-5 sm:w-[390px]"
        >
          {/* ----------------------------------------
              CHAT HEADER
          ---------------------------------------- */}

          <header className="border-b border-cyan-500/20 bg-slate-900 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-wider text-cyan-400">
                  ✦ ASTROBOT
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  ASTROSHIFT // MISSION ASSISTANT
                </p>
              </div>

              <span
                role="status"
                className={`rounded-full border px-2 py-1 text-[10px] ${currentStatus.style}`}
              >
                {currentStatus.label}
              </span>
            </div>

            {/* Clear Chat button */}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleClearChat}
                disabled={isTyping || isChatEmpty}
                title="Start a new conversation"
                aria-label="Clear AstroBot conversation"
                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↺ Clear Chat
              </button>
            </div>
          </header>

          {/* ----------------------------------------
              CHAT MESSAGES
          ---------------------------------------- */}

          <div
            aria-live="polite"
            className="astrobot-scroll flex-1 space-y-4 overflow-y-auto p-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`min-w-0 max-w-[85%] break-words rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-cyan-500 text-slate-950"
                      : "border border-slate-700 bg-slate-800 text-slate-200"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <>
                      {/* Markdown-formatted AI answer */}

                      <AstroBotMarkdown
                        content={message.content}
                      />

                      {/* Copy Answer: hidden for welcome message */}

                      {index > 0 && (
                        <div className="mt-3 flex justify-end border-t border-slate-700 pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyAnswer(
                                message.content,
                                index
                              )
                            }
                            aria-label="Copy AstroBot answer"
                            className="rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-cyan-300"
                          >
                            {copiedMessageIndex === index
                              ? "✓ Copied"
                              : "⧉ Copy Answer"}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* User messages remain plain text */

                    <span className="whitespace-pre-wrap">
                      {message.content}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* ----------------------------------------
                AI LOADING INDICATOR
            ---------------------------------------- */}

            {isTyping && (
              <p
                role="status"
                className="animate-pulse text-xs text-cyan-400"
              >
                AstroBot is contacting mission control...
              </p>
            )}

            {/* ----------------------------------------
                ERROR MESSAGE + RETRY BUTTON
            ---------------------------------------- */}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs leading-relaxed text-red-300"
              >
                <p>⚠ {error}</p>

                {canRetry && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isTyping}
                    aria-label="Retry failed AstroBot response"
                    className="mt-3 rounded-md border border-red-400/40 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-900/40 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↻ Retry Response
                  </button>
                )}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ----------------------------------------
              MESSAGE INPUT
          ---------------------------------------- */}

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-cyan-500/20 bg-slate-900 p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about the universe..."
              aria-label="Message AstroBot"
              maxLength={2000}
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isTyping ? "..." : "Send"}
            </button>
          </form>
        </section>
      )}
    </>
  );
}
