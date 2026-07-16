"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  LANGUAGES,
  detectLanguage,
  getLanguageContent,
  type LanguageCode,
} from "./dictionary";

const MAX_LENGTH = 500;
const TYPING_DELAY_MS = [500, 1000] as const;

type Sender = "user" | "bot";
type BotVariant = "onboarding" | "reply";

interface Message {
  id: string;
  sender: Sender;
  variant?: BotVariant;
  text: string;
}

type ThemeMode = "system" | "light" | "dark";

function randomTypingDelay() {
  const [min, max] = TYPING_DELAY_MS;
  return min + Math.random() * (max - min);
}

function createId() {
  return Math.random().toString(36).slice(2);
}

// Detects the browser's language once on mount; falls back to English for
// unsupported locales per the design spec. Only ever called client-side
// (this component is rendered with ssr: false), so navigator is available.
function detectInitialLanguage(): LanguageCode {
  const locales = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  return detectLanguage(locales);
}

export default function ChatApp() {
  const [language, setLanguage] = useState<LanguageCode>(detectInitialLanguage);
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: createId(),
      sender: "bot",
      variant: "onboarding",
      text: getLanguageContent(language).onboarding,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isComposingRef = useRef(false);
  const compositionEndedAtRef = useRef(0);
  const inputId = useId();

  const content = getLanguageContent(language);

  // Reflect the manual appearance override on <html>; "system" removes the
  // override so prefers-color-scheme takes back over.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isTyping]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: createId(), sender: "user", text: trimmed },
    ]);
    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          sender: "bot",
          variant: "reply",
          text: content.botReply,
        },
      ]);
    }, randomTypingDelay());
  }

  function handleReset() {
    setMessages([
      {
        id: createId(),
        sender: "bot",
        variant: "onboarding",
        text: content.onboarding,
      },
    ]);
    setInput("");
    setIsTyping(false);
  }

  const remaining = MAX_LENGTH - input.length;
  const showCounter = remaining <= MAX_LENGTH * 0.2;

  return (
    <div className="flex min-h-dvh justify-center bg-background text-foreground">
      <div className="flex w-full max-w-[640px] flex-col">
        <header className="flex items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold tracking-tight">
            で？
            <span className="ml-1.5 text-sm font-normal text-muted">
              So What?
            </span>
          </span>
          <div className="flex items-center gap-1.5">
            <LanguageSelect
              value={language}
              onChange={setLanguage}
              label={content.language}
            />
            <ThemeToggle value={theme} onChange={setTheme} content={content} />
            <IconButton label={content.reset} onClick={handleReset}>
              <ResetIcon />
            </IconButton>
          </div>
        </header>

        <main className="flex flex-1 flex-col px-6">
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto py-4"
            aria-live="polite"
          >
            {messages.map((message) => (
              <Bubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator label={content.typingLabel} />}
          </div>
        </main>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:border-accent/60">
            <label htmlFor={inputId} className="sr-only">
              {content.inputPlaceholder}
            </label>
            <textarea
              id={inputId}
              value={input}
              onChange={(event) =>
                setInput(event.target.value.slice(0, MAX_LENGTH))
              }
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                isComposingRef.current = false;
                compositionEndedAtRef.current = Date.now();
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || event.shiftKey) return;
                // Guard against IME conversion-confirm Enter keys, which
                // must not trigger a send. Browsers disagree on whether
                // isComposing is still true on that keydown, so also
                // ignore an Enter that lands right after compositionend.
                const isImeEnter =
                  isComposingRef.current ||
                  event.nativeEvent.isComposing ||
                  event.keyCode === 229 ||
                  Date.now() - compositionEndedAtRef.current < 50;
                if (isImeEnter) return;
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }}
              placeholder={content.inputPlaceholder}
              rows={1}
              maxLength={MAX_LENGTH}
              className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-relaxed placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              aria-label={content.send}
              disabled={!input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-background transition-opacity disabled:opacity-30"
            >
              <SendIcon />
            </button>
          </div>
          {showCounter && (
            <div className="pt-1.5 text-right text-xs text-muted">
              {input.length} / {MAX_LENGTH}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  if (message.sender === "user") {
    return (
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-bubble-user px-4 py-2.5 text-[15px] leading-relaxed">
        {message.text}
      </div>
    );
  }

  if (message.variant === "onboarding") {
    return (
      <div className="mr-auto max-w-[85%] rounded-xl border border-border px-4 py-2.5 text-sm italic leading-relaxed text-muted">
        {message.text}
      </div>
    );
  }

  return (
    <div className="mr-auto max-w-[80%] rounded-xl rounded-bl-sm border border-accent/40 px-4 py-2.5 text-lg font-semibold text-accent">
      {message.text}
    </div>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div
      className="mr-auto flex items-center gap-1 rounded-xl rounded-bl-sm border border-accent/40 px-4 py-3"
      role="status"
      aria-label={label}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

function LanguageSelect({
  value,
  onChange,
  label,
}: {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
  label: string;
}) {
  return (
    <div className="flex items-center">
      <span className="sr-only">{label}</span>
      <GlobeIcon />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as LanguageCode)}
        aria-label={label}
        className="cursor-pointer rounded-full bg-transparent px-1.5 py-1.5 text-sm text-foreground focus:outline-none"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}

function ThemeToggle({
  value,
  onChange,
  content,
}: {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  content: { appearance: string; appearanceLight: string; appearanceDark: string; appearanceSystem: string };
}) {
  const order: ThemeMode[] = ["system", "light", "dark"];
  const labels: Record<ThemeMode, string> = {
    system: content.appearanceSystem,
    light: content.appearanceLight,
    dark: content.appearanceDark,
  };

  function cycle() {
    const next = order[(order.indexOf(value) + 1) % order.length];
    onChange(next);
  }

  return (
    <IconButton
      label={`${content.appearance}: ${labels[value]}`}
      onClick={cycle}
    >
      {value === "dark" ? <MoonIcon /> : value === "light" ? <SunIcon /> : <AutoIcon />}
    </IconButton>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-border/50 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 6 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-6-3.8-9s1.3-6.3 3.8-9Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

function AutoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
