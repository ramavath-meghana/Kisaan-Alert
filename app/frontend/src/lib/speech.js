// Browser Web Speech API helpers (STT + TTS)

export const speechSupported = () => {
  return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
};

export const createRecognizer = (lang = "te-IN") => {
  if (!speechSupported()) return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.lang = lang;
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  return rec;
};

let currentUtterance = null;

export const speak = (text, lang = "te-IN", onEnd) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.95;
  utter.pitch = 1;
  // try to pick a matching voice
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  if (match) utter.voice = match;
  utter.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };
  currentUtterance = utter;
  window.speechSynthesis.speak(utter);
  return true;
};

export const stopSpeaking = () => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

export const isSpeaking = () => {
  return typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking;
};