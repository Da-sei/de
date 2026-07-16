export type LanguageCode = "ja" | "en" | "zh" | "ko" | "es" | "it" | "fr";

export interface LanguageContent {
  code: LanguageCode;
  nativeName: string;
  botReply: string;
  onboarding: string;
  inputPlaceholder: string;
  send: string;
  reset: string;
  language: string;
  appearance: string;
  appearanceLight: string;
  appearanceDark: string;
  appearanceSystem: string;
  typingLabel: string;
}

export const LANGUAGES: LanguageContent[] = [
  {
    code: "ja",
    nativeName: "日本語",
    botReply: "で？",
    onboarding:
      "なんでも書いてみてください。ここには、ただ「で？」と聞き返す相手がいるだけです。",
    inputPlaceholder: "書いてみる",
    send: "送信",
    reset: "会話をリセット",
    language: "言語",
    appearance: "表示モード",
    appearanceLight: "ライト",
    appearanceDark: "ダーク",
    appearanceSystem: "自動",
    typingLabel: "入力中",
  },
  {
    code: "en",
    nativeName: "English",
    botReply: "So?",
    onboarding:
      'Write anything. There’s no one here but someone who keeps asking, "So?"',
    inputPlaceholder: "Start writing",
    send: "Send",
    reset: "Reset conversation",
    language: "Language",
    appearance: "Appearance",
    appearanceLight: "Light",
    appearanceDark: "Dark",
    appearanceSystem: "Auto",
    typingLabel: "Typing",
  },
  {
    code: "zh",
    nativeName: "中文",
    botReply: "所以呢？",
    onboarding: "写点什么吧。这里只有一个人，会不停地问你「所以呢？」。",
    inputPlaceholder: "开始写",
    send: "发送",
    reset: "重置对话",
    language: "语言",
    appearance: "外观",
    appearanceLight: "浅色",
    appearanceDark: "深色",
    appearanceSystem: "自动",
    typingLabel: "输入中",
  },
  {
    code: "ko",
    nativeName: "한국어",
    botReply: "그래서?",
    onboarding:
      '무엇이든 적어보세요. 여기에는 그저 "그래서?"라고 되묻는 상대만 있습니다.',
    inputPlaceholder: "적어보기",
    send: "보내기",
    reset: "대화 초기화",
    language: "언어",
    appearance: "화면 모드",
    appearanceLight: "라이트",
    appearanceDark: "다크",
    appearanceSystem: "자동",
    typingLabel: "입력 중",
  },
  {
    code: "es",
    nativeName: "Español",
    botReply: "¿Y qué?",
    onboarding:
      'Escribe lo que sea. Aquí solo hay alguien que sigue preguntando "¿Y qué?".',
    inputPlaceholder: "Empieza a escribir",
    send: "Enviar",
    reset: "Reiniciar conversación",
    language: "Idioma",
    appearance: "Apariencia",
    appearanceLight: "Claro",
    appearanceDark: "Oscuro",
    appearanceSystem: "Auto",
    typingLabel: "Escribiendo",
  },
  {
    code: "it",
    nativeName: "Italiano",
    botReply: "E allora?",
    onboarding:
      'Scrivi quello che vuoi. Qui c’è solo qualcuno che continua a chiedere "E allora?".',
    inputPlaceholder: "Inizia a scrivere",
    send: "Invia",
    reset: "Reimposta conversazione",
    language: "Lingua",
    appearance: "Aspetto",
    appearanceLight: "Chiaro",
    appearanceDark: "Scuro",
    appearanceSystem: "Auto",
    typingLabel: "Sta scrivendo",
  },
  {
    code: "fr",
    nativeName: "Français",
    botReply: "Et alors?",
    onboarding:
      "Écris ce que tu veux. Il n’y a ici que quelqu’un qui continue de demander « Et alors ? ».",
    inputPlaceholder: "Commence à écrire",
    send: "Envoyer",
    reset: "Réinitialiser la conversation",
    language: "Langue",
    appearance: "Apparence",
    appearanceLight: "Clair",
    appearanceDark: "Sombre",
    appearanceSystem: "Auto",
    typingLabel: "En train d’écrire",
  },
];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function getLanguageContent(code: LanguageCode): LanguageContent {
  return LANGUAGES.find((lang) => lang.code === code) ?? LANGUAGES[1];
}

/** Maps a browser locale (e.g. "zh-TW", "ja-JP") to a supported language, falling back to English. */
export function detectLanguage(locales: readonly string[]): LanguageCode {
  for (const locale of locales) {
    const primary = locale.toLowerCase().split("-")[0];
    const match = LANGUAGES.find((lang) => lang.code === primary);
    if (match) return match.code;
  }
  return DEFAULT_LANGUAGE;
}
