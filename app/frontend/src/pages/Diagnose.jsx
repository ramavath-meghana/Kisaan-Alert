import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sprout,
  MessageSquare,
  Languages,
  Loader2,
  Send,
  ImagePlus,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  User,
  LogIn,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { useT } from "../lib/i18n";
import { createRecognizer, speak, stopSpeaking, speechSupported } from "../lib/speech";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const severityColor = (sev) => {
  const s = (sev || "").toLowerCase();
  if (s === "high") return "bg-rose-100 text-rose-700 border-rose-200";
  if (s === "medium") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
};

const LanguageToggle = ({ lang, setLang }) => (
  <div className="inline-flex items-center gap-1 rounded-full bg-white border border-stone-200 p-1 shadow-sm">
    <Languages className="w-4 h-4 text-stone-500 ml-2" />
    {["en", "te", "hi"].map((l) => (
      <button
        key={l}
        onClick={() => setLang(l)}
        className={`px-3 py-1 text-sm rounded-full transition-all ${
          lang === l ? "bg-[#166534] text-white" : "text-stone-600 hover:bg-stone-50"
        }`}
      >
        {l === "en" ? "EN" : l === "te" ? "తె" : "हि"}
      </button>
    ))}
  </div>
);

const VoiceCallSimulation = ({ advisory, lang, t }) => {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer1 = setTimeout(() => setStep(1), 1500);
    const timer2 = setTimeout(() => setStep(2), 3000);
    const timer3 = setTimeout(() => setStep(3), 4500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [playing]);

  if (!playing) {
    return (
      <Button
        onClick={() => setPlaying(true)}
        variant="outline"
        className="w-full h-12 rounded-2xl"
      >
        <Phone className="w-5 h-5 mr-2" />
        {t.voiceCallTitle}
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-gradient-to-b from-stone-50 to-white border border-stone-200"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
        <span className="text-sm font-semibold text-stone-900">
          {step < 2 ? t.connectingToExpert : t.callConnected}
        </span>
      </div>

      {step >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex justify-start">
            <div className="max-w-[80%] px-3 py-2 rounded-xl bg-stone-100 text-sm text-stone-900">
              {lang === "te" ? "నమస్కారం! మీ పంట సమస్యను చూశాను. ఇది..." : lang === "hi" ? "नमस्ते! मैंने आपकी फसल की समस्या देखी। यह..." : "Hello! I've reviewed your crop issue. This appears to be..."}
            </div>
          </div>
          {step >= 3 && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-3 py-2 rounded-xl bg-stone-100 text-sm text-stone-900">
                {advisory?.diagnosis}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

const AdvisoryPanel = ({ advisory, lang, t, loading }) => {
  const [ttsPlaying, setTtsPlaying] = useState(false);

  const handlePlay = () => {
    if (!advisory) return;
    const text = lang === "te" ? advisory.advisory_te : lang === "hi" ? (advisory.advisory_hi || advisory.advisory_en) : advisory.advisory_en;
    const langCode = lang === "te" ? "te-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    stopSpeaking();
    setTtsPlaying(true);
    const ok = speak(text, langCode, () => setTtsPlaying(false));
    if (!ok) {
      setTtsPlaying(false);
      toast.error(t.errorGeneric);
    }
  };
  const handleStop = () => {
    stopSpeaking();
    setTtsPlaying(false);
  };

  useEffect(() => () => stopSpeaking(), []);

  if (loading) {
    return (
      <Card className="p-8 rounded-3xl border-stone-200 shadow-sm bg-white flex flex-col items-center justify-center min-h-[280px] gap-4">
        <Loader2 className="w-10 h-10 text-[#166534] animate-spin" />
        <div className="text-lg font-medium text-stone-700">{t.processing}</div>
        <div className="text-sm text-stone-500">{t.poweredBy}</div>
      </Card>
    );
  }

  if (!advisory) {
    return (
      <Card className="p-8 rounded-3xl border-dashed border-2 border-stone-200 bg-white/40 min-h-[280px] flex flex-col items-center justify-center gap-3">
        <Sparkles className="w-10 h-10 text-stone-300" />
        <div className="text-stone-500 text-center max-w-xs">
          {lang === "te" ? "మీ సలహా ఇక్కడ కనిపిస్తుంది" : lang === "hi" ? "आपकी सलाह यहाँ दिखेगी" : "Your advisory will appear here"}
        </div>
      </Card>
    );
  }

  const advisoryText = lang === "te" ? advisory.advisory_te : lang === "hi" ? (advisory.advisory_hi || advisory.advisory_en) : advisory.advisory_en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <Card className="p-6 sm:p-8 rounded-3xl border-stone-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#166534]/10 flex items-center justify-center">
              <Sprout className="w-6 h-6 text-[#166534]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold">{t.crop}</div>
              <div className="text-lg font-semibold text-stone-900">{advisory.crop || "—"}</div>
            </div>
          </div>
          <Badge className={`${severityColor(advisory.severity)} border font-semibold px-3 py-1 rounded-full`}>
            {t.severity}: {advisory.severity}
          </Badge>
        </div>

        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.diagnosis}</div>
          <div className="text-base sm:text-lg text-stone-800 leading-relaxed">{advisory.diagnosis}</div>
        </div>

        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.advisory}</div>
          <div className="text-base sm:text-lg text-stone-900 leading-relaxed font-medium">{advisoryText}</div>
        </div>

        <div className="flex flex-wrap gap-3">
          {!ttsPlaying ? (
            <Button onClick={handlePlay} className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-2xl h-12 px-5 font-semibold">
              <Volume2 className="w-5 h-5 mr-2" /> {t.playVoice}
            </Button>
          ) : (
            <Button onClick={handleStop} variant="outline" className="rounded-2xl h-12 px-5 font-semibold">
              <VolumeX className="w-5 h-5 mr-2" /> {t.stopVoice}
            </Button>
          )}
        </div>
      </Card>

      {/* SMS Preview */}
      <Card className="p-4 sm:p-6 rounded-3xl border-stone-200 bg-gradient-to-b from-stone-50 to-white">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-200">
          <div className="w-8 h-8 rounded-full bg-[#166534] text-white flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-stone-900">Kisan Alert SMS</div>
            <div className="text-xs text-stone-500">{t.demoNumber}</div>
          </div>
          <div className="ml-auto text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {t.smsPreview}
          </div>
        </div>
        <div className="relative">
          <div className="relative bg-[#DCF8C6] text-stone-900 rounded-2xl rounded-bl-none p-4 shadow-sm max-w-[95%] border border-[#BDE4A3] sms-bubble-tail">
            <div className="text-sm font-semibold mb-1">KISAN ALERT · {advisory.crop}</div>
            <div className="text-sm leading-relaxed">{advisoryText}</div>
            <div className="text-[10px] text-stone-500 mt-2">Reply STOP to opt out</div>
          </div>
        </div>
      </Card>

      {/* Voice Call Simulation */}
      <VoiceCallSimulation advisory={advisory} lang={lang} t={t} />
    </motion.div>
  );
};

export default function Diagnose() {
  const [lang, setLang] = useState("en");
  const t = useT(lang);
  const [tab, setTab] = useState("photo");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [note, setNote] = useState("");

  const [question, setQuestion] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      toast.error("Only JPEG, PNG or WEBP images supported");
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const submitImage = async () => {
    if (!imageFile) {
      toast.error(lang === "te" ? "దయచేసి ఫోటో ఎంచుకోండి" : lang === "hi" ? "कृपया फोटो चुनें" : "Please choose a photo first");
      return;
    }
    setLoading(true);
    setAdvisory(null);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      fd.append("description", note);
      const { data } = await axios.post(`${API}/diagnose`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setAdvisory(data);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const submitQuestion = async () => {
    if (!question.trim()) {
      toast.error(lang === "te" ? "దయచేసి ప్రశ్న అడగండి" : lang === "hi" ? "कृपया प्रश्न पूछें" : "Please ask a question");
      return;
    }
    setLoading(true);
    setAdvisory(null);
    try {
      const { data } = await axios.post(`${API}/ask`, { question, language: lang });
      setAdvisory(data);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const toggleListen = () => {
    if (!speechSupported()) {
      toast.error(t.noSpeech);
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const langCode = lang === "te" ? "te-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    const rec = createRecognizer(langCode);
    if (!rec) {
      toast.error(t.noSpeech);
      return;
    }
    recRef.current = rec;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setQuestion(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#166534] text-white flex items-center justify-center shadow-md">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-bold text-lg text-stone-900">{t.appName}</div>
              <div className="text-xs text-stone-500">{t.tagline}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle lang={lang} setLang={setLang} />
            <Link to="/login">
              <Button variant="ghost" className="h-10">
                <LogIn className="w-4 h-4 mr-1" /> {t.login}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight mb-3">
            {t.heroTitle}
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">{t.heroSub}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Input side */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="p-6 sm:p-8 rounded-3xl border-stone-200 bg-white shadow-sm">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="grid grid-cols-2 rounded-full bg-stone-100 p-1 h-12">
                  <TabsTrigger value="photo" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold">
                    <Camera className="w-4 h-4 mr-2" /> {t.uploadPhoto}
                  </TabsTrigger>
                  <TabsTrigger value="ask" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold">
                    <MessageSquare className="w-4 h-4 mr-2" /> {t.askQuestion}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="photo" className="mt-6 space-y-4">
                  <label
                    htmlFor="crop-file"
                    className="flex flex-col items-center justify-center gap-3 w-full min-h-[200px] rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 cursor-pointer transition-all p-4"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="max-h-[180px] rounded-xl object-cover" />
                    ) : (
                      <>
                        <ImagePlus className="w-10 h-10 text-stone-400" />
                        <div className="text-stone-600 font-medium">{t.takePhoto}</div>
                        <div className="text-xs text-stone-400">JPEG · PNG · WEBP</div>
                      </>
                    )}
                  </label>
                  <input id="crop-file" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFile} className="hidden" />

                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t.optionalNote}
                    className="rounded-2xl min-h-[80px] resize-none border-stone-200"
                  />

                  <Button
                    onClick={submitImage}
                    disabled={loading || !imageFile}
                    className="w-full h-14 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-white text-lg font-semibold shadow-md"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" /> {t.analyze}
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="ask" className="mt-6 space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={toggleListen}
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                        listening ? "bg-rose-500" : "bg-[#F59E0B] hover:bg-[#D97706]"
                      }`}
                    >
                      {listening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                    <div className="text-sm text-stone-600">
                      {listening ? t.listening : t.speakNow}
                    </div>
                  </div>

                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={t.typeQuestion}
                    className="rounded-2xl min-h-[100px] border-stone-200"
                  />

                  <Button
                    onClick={submitQuestion}
                    disabled={loading || !question.trim()}
                    className="w-full h-14 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-white text-lg font-semibold shadow-md"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <Send className="w-5 h-5 mr-2" /> {t.submitQuestion}
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </Card>

            <div className="text-xs text-stone-500 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" /> {t.poweredBy}
            </div>

            {/* CTA for login */}
            <Card className="p-6 rounded-2xl border-stone-200 bg-gradient-to-b from-stone-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#166534]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#166534]" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-stone-900">Get personalized alerts</div>
                  <div className="text-sm text-stone-600">Create an account for weather alerts, scheme matching, and advisory history.</div>
                </div>
              </div>
              <Link to="/register" className="block mt-4">
                <Button className="w-full h-12 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white">
                  {t.createAccount}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>

          {/* Output side */}
          <div className="lg:col-span-7">
            <AdvisoryPanel advisory={advisory} lang={lang} t={t} loading={loading} />
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-stone-400">
        Kisan Alert · Google Cloud Hackathon · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
