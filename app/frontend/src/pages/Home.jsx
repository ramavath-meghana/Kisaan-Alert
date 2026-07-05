import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Sprout,
  Camera,
  Cloud,
  Shield,
  Phone,
  MessageSquare,
  ChevronRight,
  Star,
  Users,
  MapPin,
  Languages,
  ArrowRight,
  Play,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Link } from "react-router-dom";
import { useT } from "../lib/i18n";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="p-6 rounded-3xl border-stone-200 bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group h-full">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#166534]/10 to-[#166534]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-7 h-7 text-[#166534]" />
      </div>
      <h3 className="font-display text-xl font-semibold text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-600 leading-relaxed">{description}</p>
    </Card>
  </motion.div>
);

const StatCard = ({ value, label, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="text-center"
  >
    <div className="text-4xl sm:text-5xl font-display font-bold text-[#166534] mb-1">{value}</div>
    <div className="text-stone-600 flex items-center justify-center gap-1">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </div>
  </motion.div>
);

export default function Home() {
  const t = useT("en");
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Camera,
      title: t.featureDiagnose,
      description: t.featureDiagnoseDesc,
    },
    {
      icon: Cloud,
      title: t.featureWeather,
      description: t.featureWeatherDesc,
    },
    {
      icon: Shield,
      title: t.featureSchemes,
      description: t.featureSchemesDesc,
    },
    {
      icon: Phone,
      title: t.featureVoice,
      description: t.featureVoiceDesc,
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#166534]/5 via-white to-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#166534]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl" />

          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 left-[10%] w-12 h-12 bg-[#166534]/20 rounded-full"
            animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 right-[15%] w-8 h-8 bg-[#F59E0B]/30 rounded-full"
            animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-40 left-[20%] w-16 h-16 bg-emerald-200/40 rounded-full"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#166534]/10 text-[#166534] text-sm font-medium mb-8"
          >
            <Sprout className="w-4 h-4" />
            Google Cloud Hackathon 2025
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl md:text-8xl font-bold text-stone-900 tracking-tight leading-[1.1] mb-6"
          >
            {t.heroTitle}
            <br />
            <span className="bg-gradient-to-r from-[#166534] to-[#15803d] bg-clip-text text-transparent">
              {t.heroTitleHighlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl sm:text-2xl text-stone-600 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            {t.heroSub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link to="/diagnose">
              <Button
                size="lg"
                className="h-16 px-10 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all group"
              >
                {t.heroCTA}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="h-16 px-10 rounded-2xl border-2 border-stone-200 text-stone-700 text-lg font-semibold hover:bg-stone-50"
            >
              <Play className="w-5 h-5 mr-2" />
              {t.heroDemo}
            </Button>
          </motion.div>

          {/* Language badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center justify-center gap-4 text-sm text-stone-500"
          >
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              <span>Available in:</span>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">English</span>
              <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">తెలుగు</span>
              <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">हिंदी</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-stone-300 flex items-start justify-center p-1"
          >
            <div className="w-1.5 h-2.5 bg-stone-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-white to-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <StatCard value="12,480+" label={t.farmersServed} icon={Users} />
            <StatCard value="14" label={t.districts} icon={MapPin} />
            <StatCard value="3" label={t.languages} icon={Languages} />
            <StatCard value="98%" label={t.satisfactionRate} icon={Star} />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              One platform for all your farming needs — from crop diagnosis to government scheme matching.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Get expert advisory in 3 simple steps — no tech expertise needed.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Snap or Speak",
                description: "Take a photo of your crop, or simply record your question in your language.",
                icon: Camera,
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our Gemini-powered AI analyzes your crop and matches it against thousands of disease patterns.",
                icon: Sprout,
              },
              {
                step: "03",
                title: "Get Advisory",
                description: "Receive actionable advice in your language via SMS, voice call, or the app.",
                icon: MessageSquare,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                <div className="absolute -top-4 -left-4 text-7xl font-display font-bold text-[#166534]/10">
                  {item.step}
                </div>
                <Card className="p-8 rounded-3xl border-stone-200 bg-gradient-to-b from-white to-stone-50/50 h-full pt-12">
                  <div className="w-12 h-12 rounded-2xl bg-[#166534] text-white flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-stone-600">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="py-20 bg-[#166534]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" />
              ))}
            </div>
            <blockquote className="text-2xl sm:text-3xl text-white font-medium max-w-3xl mx-auto mb-8 leading-relaxed">
              "Kisan Alert saved my paddy crop from leaf blight. The AI diagnosed it in seconds and sent me the treatment via SMS in Telugu. Amazing!"
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                RS
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">Rama Subbaiah</div>
                <div className="text-emerald-200 text-sm">Farmer, Guntur District</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sprout className="w-16 h-16 text-[#166534] mx-auto mb-6" />
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
              Start your smart farming journey
            </h2>
            <p className="text-lg text-stone-600 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who are already using AI to protect their crops and maximize their yields.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button className="h-14 px-10 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-white text-lg font-semibold shadow-lg">
                  {t.createAccount}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/diagnose">
                <Button variant="outline" className="h-14 px-10 rounded-2xl border-2 border-stone-200 text-lg font-semibold">
                  Try without login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-stone-900 text-stone-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#166534] flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-display font-bold">{t.appName}</div>
                <div className="text-sm">{t.footerTagline}</div>
              </div>
            </div>
            <div className="text-sm text-stone-500">
              {t.footerMadeWith} · {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
