import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sprout,
  MessageSquare,
  Activity,
  Languages,
  Loader2,
  Send,
  ImagePlus,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Sparkles,
  Phone,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { useT } from "../lib/i18n";
import { createRecognizer, speak, stopSpeaking, isSpeaking, speechSupported } from "../lib/speech";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const severityColor = (sev) => {
  const s = (sev || "").toLowerCase();
  if (s === "high") return "bg-rose-100 text-rose-700 border-rose-200";
  if (s === "medium") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
};

const LanguageToggle = ({ lang, setLang, t }) => (
  <div className="inline-flex items-center gap-2 rounded-full bg-white border border-stone-200 p-1 shadow-sm" data-testid="lang-toggle">
    <Languages className="w-4 h-4 text-stone-500 ml-2" />
    <button
      data-testid="lang-en-btn"
      onClick={() => setLang("en")}
      className={`px-4 py-1.5 text-sm rounded-full transition-all ${lang === "en" ? "bg-[#166534] text-white" : "text-stone-600"}`}
    >
      EN
    </button>
    <button
      data-testid="lang-te-btn"
      onClick={() => setLang("te")}
      className={`px-4 py-1.5 text-sm rounded-full transition-all ${lang === "te" ? "bg-[#166534] text-white" : "text-stone-600"}`}
    >
      తెలుగు
    </button>
  </div>
);

const PipelineSteps = ({ active, t }) => {
  const steps = [t.stepInput, t.stepProcess, t.stepOutput, t.stepSMS];
  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap" data-testid="pipeline-steps">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 sm:gap-3">
          <div
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all ${
              i <= active ? "bg-[#166534] text-white border-[#166534]" : "bg-white text-stone-500 border-stone-200"
            }`}
          >
            {s}
          </div>
          {i < steps.length - 1 && <ArrowRight className={`w-4 h-4 ${i < active ? "text-[#166534]" : "text-stone-300"}`} />}
        </div>
      ))}
    </div>
  );
};

const AdvisoryPanel = ({ advisory, lang, t, loading }) => {
  const [ttsPlaying, setTtsPlaying] = useState(false);

  const handlePlay = () => {
    if (!advisory) return;
    const text = lang === "te" ? advisory.advisory_te : advisory.advisory_en;
    const langCode = lang === "te" ? "te-IN" : "en-IN";
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
      <Card className="p-8 rounded-3xl border-stone-200 shadow-sm bg-white flex flex-col items-center justify-center min-h-[280px] gap-4" data-testid="advisory-loading">
        <Loader2 className="w-10 h-10 text-[#166534] animate-spin" />
        <div className="text-lg font-medium text-stone-700">{t.processing}</div>
        <div className="text-sm text-stone-500">{t.poweredBy}</div>
      </Card>
    );
  }

  if (!advisory) {
    return (
      <Card className="p-8 rounded-3xl border-dashed border-2 border-stone-200 bg-white/40 min-h-[280px] flex flex-col items-center justify-center gap-3" data-testid="advisory-empty">
        <Sparkles className="w-10 h-10 text-stone-300" />
        <div className="text-stone-500 text-center max-w-xs">
          {lang === "te" ? "మీ సలహా ఇక్కడ కనిపిస్తుంది" : "Your advisory will appear here"}
        </div>
      </Card>
    );
  }

  const advisoryText = lang === "te" ? advisory.advisory_te : advisory.advisory_en;

  return (
    <div className="flex flex-col gap-4 fade-up">
      <Card className="p-6 sm:p-8 rounded-3xl border-stone-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]" data-testid="advisory-card">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#166534]/10 flex items-center justify-center">
              <Sprout className="w-6 h-6 text-[#166534]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold">{t.crop}</div>
              <div className="text-lg font-semibold text-stone-900" data-testid="advisory-crop">{advisory.crop || "—"}</div>
            </div>
          </div>
          <Badge className={`${severityColor(advisory.severity)} border font-semibold px-3 py-1 rounded-full`} data-testid="advisory-severity">
            {t.severity}: {advisory.severity}
          </Badge>
        </div>

        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.diagnosis}</div>
          <div className="text-base sm:text-lg text-stone-800 leading-relaxed" data-testid="advisory-diagnosis">
            {advisory.diagnosis}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.advisory}</div>
          <div className="text-base sm:text-lg text-stone-900 leading-relaxed font-medium" data-testid="advisory-text">
            {advisoryText}
          </div>
        </div>

        <div className="flex gap-3">
          {!ttsPlaying ? (
            <Button
              data-testid="play-voice-btn"
              onClick={handlePlay}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-2xl h-12 px-5 font-semibold"
            >
              <Volume2 className="w-5 h-5 mr-2" /> {t.playVoice}
            </Button>
          ) : (
            <Button
              data-testid="stop-voice-btn"
              onClick={handleStop}
              variant="outline"
              className="rounded-2xl h-12 px-5 font-semibold"
            >
              <VolumeX className="w-5 h-5 mr-2" /> {t.stopVoice}
            </Button>
          )}
        </div>
      </Card>

      {/* Simulated SMS bubble */}
      <Card className="p-4 sm:p-6 rounded-3xl border-stone-200 bg-gradient-to-b from-stone-50 to-white" data-testid="sms-preview">
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
          <div
            className="relative bg-[#DCF8C6] text-stone-900 rounded-2xl rounded-bl-none p-4 shadow-sm max-w-[95%] border border-[#BDE4A3] sms-bubble-tail"
            data-testid="sms-bubble"
          >
            <div className="text-sm font-semibold mb-1">KISAN ALERT · {advisory.crop}</div>
            <div className="text-sm leading-relaxed">{advisoryText}</div>
            <div className="text-[10px] text-stone-500 mt-2">Reply STOP to opt out</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const AdminDashboard = ({ t }) => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    axios.get(`${API}/stats`).then((r) => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center py-16" data-testid="admin-loading">
        <Loader2 className="w-8 h-8 text-[#166534] animate-spin" />
      </div>
    );
  }

  const totalServed = stats.sample.farmers_served_baseline + stats.live.total_advisories;

  return (
    <div className="flex flex-col gap-6" data-testid="admin-dashboard">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl border-stone-200 bg-white" data-testid="metric-farmers">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.farmersServed}</div>
          <div className="text-3xl font-bold text-[#166534]">{totalServed.toLocaleString()}</div>
        </Card>
        <Card className="p-5 rounded-2xl border-stone-200 bg-white" data-testid="metric-districts">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.districts}</div>
          <div className="text-3xl font-bold text-stone-900">{stats.sample.districts_covered}</div>
        </Card>
        <Card className="p-5 rounded-2xl border-stone-200 bg-white" data-testid="metric-languages">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.languages}</div>
          <div className="text-3xl font-bold text-stone-900">{stats.sample.languages_supported}</div>
        </Card>
        <Card className="p-5 rounded-2xl border-stone-200 bg-white" data-testid="metric-live">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.liveAdvisories}</div>
          <div className="text-3xl font-bold text-[#F59E0B]">{stats.live.total_advisories}</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-3xl border-stone-200 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#166534]" />
            <div className="font-semibold text-stone-900">{t.topIssues}</div>
          </div>
          <div className="space-y-3">
            {stats.sample.top_issues_sample.map((it) => {
              const max = stats.sample.top_issues_sample[0].count;
              const w = Math.max(6, Math.round((it.count / max) * 100));
              return (
                <div key={it.issue}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-700">{it.issue}</span>
                    <span className="text-stone-500 font-mono">{it.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-[#166534] rounded-full" style={{ width: `${w}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-stone-200 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#F59E0B]" />
            <div className="font-semibold text-stone-900">{t.recent}</div>
          </div>
          {stats.live.recent.length === 0 ? (
            <div className="text-stone-500 text-sm py-6 text-center">{t.empty}</div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-auto pr-1">
              {stats.live.recent.map((r) => (
                <div key={r.id} className="border border-stone-100 rounded-2xl p-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-semibold text-stone-900">{r.crop}</div>
                    <Badge className={`${severityColor(r.severity)} border text-xs`}>{r.severity}</Badge>
                  </div>
                  <div className="text-xs text-stone-600 line-clamp-2">{r.diagnosis}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default function KisanAlert() {
  const [lang, setLang] = useState("en");
  const t = useT(lang);
  const [mode, setMode] = useState("farmer"); // farmer | admin
  const [tab, setTab] = useState("photo");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [note, setNote] = useState("");

  const [question, setQuestion] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState(null);
  const [step, setStep] = useState(0);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      toast.error("Only JPEG, PNG or WEBP images supported");
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setStep(0);
  };

  const submitImage = async () => {
    if (!imageFile) {
      toast.error(lang === "te" ? "దయచేసి ఫోటో ఎంచుకోండి" : "Please choose a photo first");
      return;
    }
    setLoading(true);
    setAdvisory(null);
    setStep(1);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      fd.append("description", note);
      const { data } = await axios.post(`${API}/diagnose`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setAdvisory(data);
      setStep(3);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || t.errorGeneric);
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const submitQuestion = async () => {
    if (!question.trim()) {
      toast.error(lang === "te" ? "దయచేసి ప్రశ్న అడగండి" : "Please ask a question");
      return;
    }
    setLoading(true);
    setAdvisory(null);
    setStep(1);
    try {
      const { data } = await axios.post(`${API}/ask`, { question, language: lang });
      setAdvisory(data);
      setStep(3);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || t.errorGeneric);
      setStep(0);
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
    const rec = createRecognizer(lang === "te" ? "te-IN" : "en-IN");
    if (!rec) {
      toast.error(t.noSpeech);
      return;
    }
    recRef.current = rec;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setQuestion(text);
    };
    rec.onerror = (e) => {
      setListening(false);
      toast.error("Voice error: " + (e.error || "unknown"));
    };
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#166534] text-white flex items-center justify-center shadow-md">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-tight text-stone-900" data-testid="app-title">
                {t.appName}
              </div>
              <div className="text-xs text-stone-500">{t.tagline}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle lang={lang} setLang={setLang} t={t} />
            <Button
              data-testid="toggle-view-btn"
              onClick={() => setMode(mode === "farmer" ? "admin" : "farmer")}
              variant="outline"
              className="rounded-full border-stone-300 hidden sm:inline-flex h-10"
            >
              {mode === "farmer" ? (<><BarChart3 className="w-4 h-4 mr-2" /> {t.adminView}</>) : (<><Sprout className="w-4 h-4 mr-2" /> {t.farmerView}</>)}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Hero */}
        <section className="mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-tight" data-testid="hero-title">
                {t.heroTitle}
              </h1>
              <p className="mt-3 text-lg text-stone-600 max-w-2xl">{t.heroSub}</p>
            </div>
            <div className="sm:hidden">
              <Button data-testid="toggle-view-btn-mobile" onClick={() => setMode(mode === "farmer" ? "admin" : "farmer")} variant="outline" className="rounded-full border-stone-300 h-10">
                {mode === "farmer" ? t.adminView : t.farmerView}
              </Button>
            </div>
          </div>
          <PipelineSteps active={step} t={t} />
        </section>

        {mode === "admin" ? (
          <AdminDashboard t={t} />
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Input side */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Card className="p-6 sm:p-8 rounded-3xl border-stone-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]" data-testid="input-card">
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="grid grid-cols-2 rounded-full bg-stone-100 p-1 h-12">
                    <TabsTrigger data-testid="tab-photo" value="photo" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold">
                      <Camera className="w-4 h-4 mr-2" /> {t.uploadPhoto}
                    </TabsTrigger>
                    <TabsTrigger data-testid="tab-ask" value="ask" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold">
                      <MessageSquare className="w-4 h-4 mr-2" /> {t.askQuestion}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="photo" className="mt-6 space-y-4">
                    <label
                      htmlFor="crop-file"
                      data-testid="photo-dropzone"
                      className="flex flex-col items-center justify-center gap-3 w-full min-h-[220px] rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 cursor-pointer transition-all p-4"
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" className="max-h-[200px] rounded-xl object-cover" data-testid="photo-preview" />
                      ) : (
                        <>
                          <ImagePlus className="w-10 h-10 text-stone-400" />
                          <div className="text-stone-600 font-medium">{t.takePhoto}</div>
                          <div className="text-xs text-stone-400">JPEG · PNG · WEBP</div>
                        </>
                      )}
                    </label>
                    <input id="crop-file" data-testid="photo-input" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFile} className="hidden" />

                    <Textarea
                      data-testid="photo-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t.optionalNote}
                      className="rounded-2xl min-h-[80px] resize-none border-stone-200"
                    />

                    <Button
                      data-testid="analyze-btn"
                      onClick={submitImage}
                      disabled={loading || !imageFile}
                      className="w-full h-16 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-white text-lg font-semibold shadow-md active:scale-[0.98] transition-all"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (<><Sparkles className="w-5 h-5 mr-2" /> {t.analyze}</>)}
                    </Button>
                  </TabsContent>

                  <TabsContent value="ask" className="mt-6 space-y-4">
                    <div className="flex flex-col items-center gap-3">
                      <button
                        data-testid="mic-btn"
                        onClick={toggleListen}
                        className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 ${
                          listening ? "bg-rose-500 recording-pulse" : "bg-[#F59E0B] hover:bg-[#D97706]"
                        }`}
                      >
                        {listening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                      </button>
                      <div className="text-sm font-medium text-stone-600">
                        {listening ? t.listening : t.speakNow}
                      </div>
                    </div>

                    <Textarea
                      data-testid="question-input"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={t.typeQuestion}
                      className="rounded-2xl min-h-[120px] text-base border-stone-200"
                    />

                    <Button
                      data-testid="ask-btn"
                      onClick={submitQuestion}
                      disabled={loading || !question.trim()}
                      className="w-full h-16 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-white text-lg font-semibold shadow-md active:scale-[0.98] transition-all"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (<><Send className="w-5 h-5 mr-2" /> {t.submitQuestion}</>)}
                    </Button>
                  </TabsContent>
                </Tabs>
              </Card>

              <div className="text-xs text-stone-500 text-center flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3" /> {t.poweredBy}
              </div>
            </div>

            {/* Output side */}
            <div className="lg:col-span-7">
              <AdvisoryPanel advisory={advisory} lang={lang} t={t} loading={loading} />
            </div>
          </section>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-stone-400">
        Kisan Alert · Google Cloud Hackathon Prototype · {new Date().getFullYear()}
      </footer>
    </div>
  );
}