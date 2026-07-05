import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sprout, Mail, Lock, User, Phone, MapPin, LandPlot, Wheat, ArrowRight, Loader2, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { useAuth } from "../lib/AuthContext";
import { useT } from "../lib/i18n";

const INDIAN_STATES = [
  "Andhra Pradesh", "Telangana", "Maharashtra", "Punjab", "Haryana", "Gujarat",
  "Karnataka", "Tamil Nadu", "Kerala", "Uttar Pradesh", "Madhya Pradesh",
  "Rajasthan", "West Bengal", "Bihar", "Odisha", "Chhattisgarh", "Other"
];

const CROP_OPTIONS = [
  "Rice (Paddy)", "Wheat", "Cotton", "Groundnut", "Maize", "Sugarcane",
  "Turmeric", "Chillies", "Tomato", "Onion", "Other"
];

const SOIL_TYPES = [
  "Alluvial", "Black (Regur)", "Red", "Laterite", "Sandy", "Clay", "Loamy"
];

export default function Register() {
  const t = useT("en");
  const { signUp, createProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    state: "",
    district: "",
    village: "",
    landSize: "",
    mainCrops: [],
    soilType: "",
    preferredLanguage: "en",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCropToggle = (crop) => {
    setFormData((prev) => ({
      ...prev,
      mainCrops: prev.mainCrops.includes(crop)
        ? prev.mainCrops.filter((c) => c !== crop)
        : [...prev.mainCrops, crop],
    }));
  };

  const handleStep1 = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setStep(2);
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (!formData.state || !formData.district) {
      toast.error("Please fill in your location details");
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sign up the user
      const { user } = await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
      });

      if (!user) {
        toast.error("Registration failed. Please try again.");
        return;
      }

      // Create farmer profile
      await createProfile({
        name: formData.name,
        phone: formData.phone,
        state: formData.state,
        district: formData.district,
        village: formData.village || null,
        land_size_acres: parseFloat(formData.landSize) || 0,
        main_crops: formData.mainCrops,
        preferred_language: formData.preferredLanguage,
      });

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      if (error.message?.includes("already registered")) {
        toast.error("This email is already registered. Please login instead.");
      } else {
        toast.error(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#166534]/5 via-white to-white flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#166534]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#166534] text-white flex items-center justify-center shadow-lg">
              <Sprout className="w-7 h-7" />
            </div>
            <span className="font-display text-2xl font-bold text-stone-900">{t.appName}</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">{t.register}</h1>
          <p className="text-stone-600">{t.registerSubtitle}</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  s <= step
                    ? "bg-[#166534] text-white"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 mx-1 rounded-full ${s < step ? "bg-[#166534]" : "bg-stone-200"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="p-8 rounded-3xl border-stone-200 bg-white shadow-xl">
          {/* Step 1: Account */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Rama Subbaiah"
                    className="pl-11 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="farmer@example.com"
                    className="pl-11 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="pl-11 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white font-semibold">
                Continue
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </form>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="state">{t.state}</Label>
                <Select value={formData.state} onValueChange={(v) => handleChange("state", v)}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">{t.district}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleChange("district", e.target.value)}
                    placeholder="Guntur"
                    className="pl-11 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">{t.village}</Label>
                <Input
                  id="village"
                  value={formData.village}
                  onChange={(e) => handleChange("village", e.target.value)}
                  placeholder="Village name (optional)"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landSize">{t.landSize}</Label>
                <div className="relative">
                  <LandPlot className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="landSize"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.landSize}
                    onChange={(e) => handleChange("landSize", e.target.value)}
                    placeholder="2.5"
                    className="pl-11 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">
                  Back
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white font-semibold">
                  Continue
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Crops & Preferences */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>{t.mainCrops}</Label>
                <div className="flex flex-wrap gap-2">
                  {CROP_OPTIONS.map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleCropToggle(crop)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.mainCrops.includes(crop)
                          ? "bg-[#166534] text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.soilType}</Label>
                <Select value={formData.soilType} onValueChange={(v) => handleChange("soilType", v)}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select soil type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOIL_TYPES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t.preferredLanguage}</Label>
                <Select value={formData.preferredLanguage} onValueChange={(v) => handleChange("preferredLanguage", v)}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 rounded-xl">
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t.createAccount}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-stone-600">
            {t.alreadyHaveAccount}{" "}
            <Link to="/login" className="text-[#166534] font-semibold hover:underline">
              {t.login}
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
