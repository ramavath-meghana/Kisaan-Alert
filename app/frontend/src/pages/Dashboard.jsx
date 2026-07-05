import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout, Camera, Mic, MicOff, Volume2, VolumeX, MessageSquare,
  Activity, Languages, Loader2, Send, ImagePlus, CheckCircle2,
  BarChart3, ArrowRight, Sparkles, Phone, Cloud, Shield, TrendingUp,
  MapPin, Clock, AlertTriangle, ExternalLink, LogOut, User,
  Wheat, Droplets, Sun, Wind, Store, Bell, ChevronDown, PhoneCall
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { toast } from "sonner";
import { useT } from "../lib/i18n";
import { useAuth } from "../lib/AuthContext";
import { createRecognizer, speak, stopSpeaking, speechSupported } from "../lib/speech";
import axios from "axios";
import supabase from "../lib/supabase";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const severityColor = (sev) => {
  const s = (sev || "").toLowerCase();
  if (s === "high") return "bg-rose-100 text-rose-700 border-rose-200";
  if (s === "medium") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
};

const LanguageToggle = ({ lang, setLang, t }) => (
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

// Weather Alerts Panel
const WeatherAlertsPanel = ({ alerts, t, lang }) => {
  const alertIcons = {
    dry_spell: Sun,
    rain: Cloud,
    wind: Wind,
    default: AlertTriangle,
  };

  if (!alerts?.length) {
    return (
      <Card className="p-6 rounded-2xl border-stone-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-5 h-5 text-[#166534]" />
          <span className="font-semibold text-stone-900">{t.weatherAlerts}</span>
        </div>
        <div className="text-stone-500 text-center py-4">{t.empty}</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-2xl border-stone-200 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-5 h-5 text-[#166534]" />
        <span className="font-semibold text-stone-900">{t.weatherAlerts}</span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.alert_type] || alertIcons.default;
          const title = lang === "te" ? alert.title_te : lang === "hi" ? alert.title_hi : alert.title_en;
          const desc = lang === "te" ? alert.description_te : lang === "hi" ? alert.description_hi : alert.description_en;
          return (
            <div key={alert.id} className="p-4 rounded-xl bg-stone-50 border border-stone-100">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  alert.severity === "high" ? "bg-rose-100" : alert.severity === "warning" ? "bg-amber-100" : "bg-emerald-100"
                }`}>
                  <Icon className={`w-5 h-5 ${
                    alert.severity === "high" ? "text-rose-600" : alert.severity === "warning" ? "text-amber-600" : "text-emerald-600"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-stone-900">{title}</div>
                  <div className="text-sm text-stone-600 mt-1">{desc}</div>
                  <div className="text-xs text-stone-500 mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {alert.district}, {alert.state}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Market Prices Panel
const MarketPricesPanel = ({ prices, t, lang }) => {
  if (!prices?.length) {
    return (
      <Card className="p-6 rounded-2xl border-stone-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-5 h-5 text-[#166534]" />
          <span className="font-semibold text-stone-900">{t.marketPrices}</span>
        </div>
        <div className="text-stone-500 text-center py-4">{t.empty}</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-2xl border-stone-200 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Store className="w-5 h-5 text-[#166534]" />
        <span className="font-semibold text-stone-900">{t.marketPrices}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-stone-500 text-left border-b border-stone-100">
              <th className="pb-2">{t.cropName}</th>
              <th className="pb-2">{t.mandiName}</th>
              <th className="pb-2 text-right">{t.modalPrice}</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p, i) => {
              const name = lang === "te" ? p.crop_name_te : lang === "hi" ? p.crop_name_hi : p.crop_name;
              return (
                <tr key={p.id} className="border-b border-stone-50 last:border-0">
                  <td className="py-3 font-medium text-stone-900">{name}</td>
                  <td className="py-3 text-stone-600">{p.mandi_name}</td>
                  <td className="py-3 text-right font-semibold text-[#166534]">₹{p.modal_price?.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Govt Schemes Panel
const GovtSchemesPanel = ({ schemes, t, lang, profile }) => {
  if (!schemes?.length) {
    return (
      <Card className="p-6 rounded-2xl border-stone-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-[#166534]" />
          <span className="font-semibold text-stone-900">{t.govtSchemes}</span>
        </div>
        <div className="text-stone-500 text-center py-4">{t.empty}</div>
      </Card>
    );
  }

  const isEligible = (scheme) => {
    if (!profile) return null;
    if (scheme.eligible_states?.length && !scheme.eligible_states.includes("All States") && !scheme.eligible_states.includes(profile.state)) {
      return false;
    }
    return true;
  };

  return (
    <Card className="p-6 rounded-2xl border-stone-200 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-[#166534]" />
        <span className="font-semibold text-stone-900">{t.govtSchemes}</span>
      </div>
      <div className="space-y-4">
        {schemes.map((scheme) => {
          const name = lang === "te" ? scheme.name_te : lang === "hi" ? scheme.name_hi : scheme.name;
          const desc = lang === "te" ? scheme.description_te : lang === "hi" ? scheme.description_hi : scheme.description;
          const eligible = isEligible(scheme);

          return (
            <div key={scheme.id} className="p-4 rounded-xl bg-stone-50 border border-stone-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-stone-900">{name}</div>
                  <div className="text-sm text-stone-600 mt-1">{desc}</div>
                  <div className="text-xs text-stone-500 mt-2">{t.schemeBenefit}: {scheme.benefit_amount}</div>
                </div>
                {profile && (
                  <Badge className={eligible ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"}>
                    {eligible ? t.eligible : t.notEligible}
                  </Badge>
                )}
              </div>
              {scheme.application_url && (
                <Button variant="outline" size="sm" asChild className="mt-3 h-9">
                  <a href={scheme.application_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {t.applyNow}
                  </a>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Crop Recommendation Panel
const CropRecommendationPanel = ({ t, lang, profile }) => {
  const [soilType, setSoilType] = useState("");
  const [season, setSeason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const getRecommendation = async () => {
    if (!soilType || !season) {
      toast.error(t.enterYourDetails);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("crop_recommendations")
        .insert({
          user_id: profile?.id,
          state: profile?.state || "Unknown",
          district: profile?.district || "Unknown",
          soil_type: soilType,
          season: season,
          recommended_crops: [
            { crop: "Rice", confidence: 92, reason: "Ideal for alluvial soil in Kharif season" },
            { crop: "Maize", confidence: 85, reason: "Good alternative with proper irrigation" },
            { crop: "Groundnut", confidence: 78, reason: "Suitable for rainfed conditions" },
          ],
        })
        .select()
        .single();

      if (error) throw error;
      setResult(data);
    } catch (err) {
      console.error(err);
      toast.error(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 rounded-2xl border-stone-200 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Wheat className="w-5 h-5 text-[#166534]" />
        <span className="font-semibold text-stone-900">{t.cropRecommendation}</span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-stone-600 mb-1 block">{t.soilType}</label>
            <Select value={soilType} onValueChange={setSoilType}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["Alluvial", "Black", "Red", "Laterite", "Sandy", "Clay", "Loamy"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-stone-600 mb-1 block">{t.season}</label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["Kharif (Monsoon)", "Rabi (Winter)", "Zaid (Summer)"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={getRecommendation}
          disabled={loading || !soilType || !season}
          className="w-full h-10 rounded-lg bg-[#166534] hover:bg-[#14532D]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.getRecommendation}
        </Button>

        {result && (
          <div className="space-y-3 mt-4 pt-4 border-t border-stone-100">
            <div className="text-sm font-semibold text-stone-700">{t.recommendedCrops}:</div>
            {result.recommended_crops?.map((rec, i) => (
              <div key={i} className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-stone-900">{rec.crop}</span>
                  <Badge className="bg-emerald-100 text-emerald-700">{rec.confidence}% match</Badge>
                </div>
                <div className="text-xs text-stone-600 mt-1">{rec.reason}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

// RSK Panel
const RSKPanel = ({ kendras, t, onCall }) => {
  if (!kendras?.length) {
    return (
      <Card className="p-6 rounded-2xl border-stone-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-[#166534]" />
          <span className="font-semibold text-stone-900">{t.nearbyKendras}</span>
        </div>
        <div className="text-stone-500 text-center py-4">{t.empty}</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-2xl border-stone-200 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Phone className="w-5 h-5 text-[#166534]" />
        <span className="font-semibold text-stone-900">{t.nearbyKendras}</span>
      </div>
      <div className="space-y-4">
        {kendras.map((k) => (
          <div key={k.id} className="p-4 rounded-xl bg-stone-50 border border-stone-100">
            <div className="font-semibold text-stone-900">{k.name}</div>
            <div className="text-sm text-stone-600 mt-1">{k.address}</div>
            <div className="text-xs text-stone-500 mt-1">{k.contact_person}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {k.services_offered?.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white text-xs text-stone-600">{s}</span>
              ))}
            </div>
            <Button
              onClick={() => onCall(k)}
              className="mt-3 w-full h-10 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white"
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              {t.callNow}: {k.phone}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Voice Call Dialog
const VoiceCallDialog = ({ open, onOpenChange, kendra, t }) => {
  const [status, setStatus] = useState("connecting");
  const [transcript, setTranscript] = useState([]);

  useEffect(() => {
    if (!open) return;
    setStatus("connecting");
    setTranscript([]);

    const timer1 = setTimeout(() => {
      setStatus("connected");
      setTranscript([{ speaker: "agent", text: "నమస్కారం, రైతు సేవా కేంద్రం. మీకు ఎలా సహాయం చేయగలం?" }]);
    }, 2000);

    return () => clearTimeout(timer1);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            {t.voiceCallTitle}
          </DialogTitle>
          <DialogDescription>
            {kendra?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          {status === "connecting" ? (
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#166534]" />
              <p className="mt-3 text-stone-600">{t.connectingToExpert}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transcript.map((t, i) => (
                <div key={i} className={`flex ${t.speaker === "agent" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    t.speaker === "agent" ? "bg-stone-100 text-stone-900" : "bg-[#166534] text-white"
                  }`}>
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            End Call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [lang, setLang] = useState(profile?.preferred_language || "en");
  const t = useT(lang);

  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [govtSchemes, setGovtSchemes] = useState([]);
  const [rskKendras, setRskKendras] = useState([]);
  const [advisoryHistory, setAdvisoryHistory] = useState([]);

  const [activeTab, setActiveTab] = useState("diagnose");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [note, setNote] = useState("");
  const [question, setQuestion] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [advisory, setAdvisory] = useState(null);
  const [ttsPlaying, setTtsPlaying] = useState(false);

  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [selectedKendra, setSelectedKendra] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    if (!user) return;

    // Fetch weather alerts for user's district
    const fetchData = async () => {
      try {
        const [alerts, prices, schemes, kendras, history] = await Promise.all([
          supabase.from("weather_alerts").select("*").limit(5),
          supabase.from("market_prices").select("*").order("created_at", { ascending: false }).limit(10),
          supabase.from("government_schemes").select("*").eq("is_active", true),
          supabase.from("rythu_seva_kendras").select("*").limit(5),
          supabase.from("advisory_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        ]);

        if (alerts.data) setWeatherAlerts(alerts.data);
        if (prices.data) setMarketPrices(prices.data);
        if (schemes.data) setGovtSchemes(schemes.data);
        if (kendras.data) setRskKendras(kendras.data);
        if (history.data) setAdvisoryHistory(history.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [user]);

  // TTS handlers
  const handlePlay = () => {
    if (!advisory) return;
    const text = lang === "te" ? advisory.advisory_te : lang === "hi" ? advisory.advisory_hi : advisory.advisory_en;
    const langCode = lang === "te" ? "te-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    stopSpeaking();
    setTtsPlaying(true);
    const ok = speak(text, langCode, () => setTtsPlaying(false));
    if (!ok) {
      setTtsPlaying(false);
      toast.error(t.errorGeneric);
    }
  };

  const handleStopTTS = () => {
    stopSpeaking();
    setTtsPlaying(false);
  };

  // Image handling
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

  // Submit handlers
  const submitImage = async () => {
    if (!imageFile) {
      toast.error(lang === "te" ? "దయచేసి ఫోటో ఎంచుకోండి" : lang === "hi" ? "कृपया फोटो चुनें" : "Please choose a photo first");
      return;
    }
    setAnalysisLoading(true);
    setAdvisory(null);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      fd.append("description", note);
      const { data } = await axios.post(`${API}/diagnose`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setAdvisory(data);

      // Save to advisory history
      if (user) {
        await supabase.from("advisory_history").insert({
          user_id: user.id,
          kind: "image",
          input_summary: note || "Crop photo analysis",
          diagnosis: data.diagnosis,
          advisory_en: data.advisory_en,
          advisory_te: data.advisory_te,
          advisory_hi: data.advisory_hi || data.advisory_en,
          severity: data.severity,
          crop: data.crop,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || t.errorGeneric);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const submitQuestion = async () => {
    if (!question.trim()) {
      toast.error(lang === "te" ? "దయచేసి ప్రశ్న అడగండి" : lang === "hi" ? "कृपया प्रश्न पूछें" : "Please ask a question");
      return;
    }
    setAnalysisLoading(true);
    setAdvisory(null);
    try {
      const { data } = await axios.post(`${API}/ask`, { question, language: lang });
      setAdvisory(data);

      // Save to advisory history
      if (user) {
        await supabase.from("advisory_history").insert({
          user_id: user.id,
          kind: "text",
          input_summary: question,
          diagnosis: data.diagnosis,
          advisory_en: data.advisory_en,
          advisory_te: data.advisory_te,
          advisory_hi: data.advisory_hi || data.advisory_en,
          severity: data.severity,
          crop: data.crop,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || t.errorGeneric);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Voice input
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

  const handleRSKCall = (kendra) => {
    setSelectedKendra(kendra);
    setCallDialogOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(t.errorGeneric);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#166534]" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#166534] text-white flex items-center justify-center shadow-md">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-bold text-lg text-stone-900">{t.appName}</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageToggle lang={lang} setLang={setLang} t={t} />

            {profile && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100">
                <User className="w-4 h-4 text-stone-500" />
                <span className="text-sm font-medium text-stone-700">{profile.name}</span>
              </div>
            )}

            <Button variant="ghost" onClick={handleSignOut} className="text-stone-600">
              <LogOut className="w-4 h-4 mr-1" />
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome & Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">
            {t.dashboard}
          </h1>
          <p className="text-stone-600">
            {profile?.village && `${profile.village}, `}{profile?.district}, {profile?.state}
          </p>
        </motion.section>

        {/* Alert notification */}
        {weatherAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 rounded-2xl border-amber-200 bg-amber-50 flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-600" />
              <span className="text-amber-800 font-medium">
                {weatherAlerts.length} active weather alert{weatherAlerts.length > 1 ? "s" : ""} for your region
              </span>
            </Card>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Diagnosis */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 rounded-3xl border-stone-200 bg-white shadow-sm">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 rounded-full bg-stone-100 p-1 h-12">
                  <TabsTrigger value="diagnose" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Camera className="w-4 h-4 mr-2" /> {t.uploadPhoto}
                  </TabsTrigger>
                  <TabsTrigger value="ask" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <MessageSquare className="w-4 h-4 mr-2" /> {t.askQuestion}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="diagnose" className="mt-6 space-y-4">
                  <label htmlFor="crop-file" className="flex flex-col items-center justify-center gap-3 w-full min-h-[200px] rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 cursor-pointer transition-all p-4">
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="max-h-[180px] rounded-xl object-cover" />
                    ) : (
                      <>
                        <ImagePlus className="w-10 h-10 text-stone-400" />
                        <div className="text-stone-600 font-medium">{t.takePhoto}</div>
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
                    disabled={analysisLoading || !imageFile}
                    className="w-full h-14 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-white text-lg font-semibold shadow-md"
                  >
                    {analysisLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
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
                    disabled={analysisLoading || !question.trim()}
                    className="w-full h-14 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-white text-lg font-semibold shadow-md"
                  >
                    {analysisLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <Send className="w-5 h-5 mr-2" /> {t.submitQuestion}
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Advisory Result */}
            <AnimatePresence mode="wait">
              {analysisLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="p-8 rounded-3xl border-stone-200 shadow-sm bg-white flex flex-col items-center justify-center min-h-[200px] gap-4">
                    <Loader2 className="w-10 h-10 text-[#166534] animate-spin" />
                    <div className="text-lg text-stone-700">{t.processing}</div>
                  </Card>
                </motion.div>
              ) : advisory ? (
                <motion.div
                  key="advisory"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="p-6 rounded-3xl border-stone-200 bg-white shadow-sm">
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
                      <div className="text-base text-stone-800 leading-relaxed">{advisory.diagnosis}</div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.advisory}</div>
                      <div className="text-base text-stone-900 leading-relaxed font-medium">
                        {lang === "te" ? advisory.advisory_te : lang === "hi" ? (advisory.advisory_hi || advisory.advisory_en) : advisory.advisory_en}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {!ttsPlaying ? (
                        <Button onClick={handlePlay} className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-2xl h-12 px-5">
                          <Volume2 className="w-5 h-5 mr-2" /> {t.playVoice}
                        </Button>
                      ) : (
                        <Button onClick={handleStopTTS} variant="outline" className="rounded-2xl h-12 px-5">
                          <VolumeX className="w-5 h-5 mr-2" /> {t.stopVoice}
                        </Button>
                      )}

                      <Button
                        onClick={() => {
                          const k = rskKendras[0];
                          if (k) handleRSKCall(k);
                        }}
                        variant="outline"
                        className="rounded-2xl h-12 px-5"
                      >
                        <Phone className="w-5 h-5 mr-2" /> {t.escalateToRSK}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Advisory History */}
            {advisoryHistory.length > 0 && (
              <Card className="p-6 rounded-3xl border-stone-200 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#166534]" />
                  <span className="font-semibold text-stone-900">{t.myAdvisories}</span>
                </div>
                <div className="space-y-3 max-h-64 overflow-auto">
                  {advisoryHistory.slice(0, 5).map((h) => (
                    <div key={h.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-stone-900">{h.crop || "Unknown"}</div>
                        <Badge className={`${severityColor(h.severity)} text-xs`}>{h.severity}</Badge>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{new Date(h.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right: Info Panels */}
          <div className="lg:col-span-5 space-y-6">
            <WeatherAlertsPanel alerts={weatherAlerts} t={t} lang={lang} />
            <GovtSchemesPanel schemes={govtSchemes} t={t} lang={lang} profile={profile} />
            <MarketPricesPanel prices={marketPrices} t={t} lang={lang} />
            <CropRecommendationPanel t={t} lang={lang} profile={profile} />
            <RSKPanel kendras={rskKendras} t={t} onCall={handleRSKCall} />
          </div>
        </div>
      </main>

      <VoiceCallDialog open={callDialogOpen} onOpenChange={setCallDialogOpen} kendra={selectedKendra} t={t} />
    </div>
  );
}
