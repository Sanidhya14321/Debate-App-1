/* eslint-disable @typescript-eslint/no-explicit-any*/
"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FAQ from "@/components/faq";
import { 
  Brain, 
  Target, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Trophy, 
  Zap,
  CheckCircle,
  Star,
  Award,
  HelpCircle,
  Heart,
  Lightbulb,
  Globe,
  TrendingUp,
  ArrowRight,
  ChevronDown
} from "lucide-react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  variants?: any;
  id?: string;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: "easeOut" }
};

// Intersection Observer Hook Component
function AnimatedSection({ children, className = "", variants, id, ...motionProps }: AnimatedSectionProps & any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      className={className}
      variants={variants}
      id={id}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black scroll-smooth">
      <div className="max-w-6xl mx-auto px-8 py-16 space-y-32">
        
        {/* Hero Header */}
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              About <span className="text-[#ff6b35]">DebAI</span>
            </h1>
          </motion.div>
          
          <motion.p
            className="text-xl text-zinc-400 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover how our AI-powered platform revolutionizes debate practice, empowers critical thinking, 
            and helps you become a master debater through intelligent feedback and personalized learning.
          </motion.p>

          {/* Navigation Pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {[
              { label: "Our Mission", id: "mission" },
              { label: "How It Works", id: "how-it-works" },
              { label: "Guidelines", id: "guidelines" },
              { label: "Scoring", id: "scoring" },
              { label: "FAQ", id: "faq" }
            ].map((item) => (
              <Button
                key={item.id}
                variant="outline"
                className="border-none bg-transparent cursor-pointer text-zinc-300 hover:bg-[#ff6b35]/20 hover:text-[#ff6b35] transition-all duration-300"
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <ChevronDown className="w-6 h-6 text-zinc-400 mx-auto animate-bounce" />
          </motion.div>
        </motion.div>

        {/* Mission Statement */}
        <AnimatedSection id="mission" className="text-center" variants={fadeInUp}>
          <Card className="bg-zinc-900/80 border-[#ff6b35]/30 max-w-5xl mx-auto">
            <CardHeader>
              <motion.div
                className="w-20 h-20 bg-[#ff6b35]/20 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Heart className="w-10 h-10 text-[#ff6b35]" />
              </motion.div>
              <CardTitle className="text-4xl text-white">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl text-zinc-300 leading-relaxed mb-8">
                To democratize access to high-quality debate education by leveraging artificial intelligence to provide 
                instant, personalized feedback that helps individuals develop critical thinking, argumentation skills, 
                and the confidence to engage in meaningful discourse on important topics.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {[
                  { icon: Brain, label: "AI-Powered", desc: "Advanced algorithms analyze your arguments" },
                  { icon: Globe, label: "Accessible", desc: "Available to everyone, everywhere" },
                  { icon: TrendingUp, label: "Growth-Focused", desc: "Continuous improvement through practice" }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-16 h-16 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-[#00ff88]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.label}</h3>
                    <p className="text-zinc-400">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* How It Works Section */}
        <AnimatedSection id="how-it-works" variants={staggerContainer}>
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#ff6b35]/20 border border-[#ff6b35]/30 mb-8"
              variants={scaleIn}
            >
              <Brain className="w-5 h-5 text-[#ff6b35]" />
              <span className="text-[#ff6b35] font-medium">How It Works</span>
            </motion.div>
            <motion.h2
              className="text-5xl font-bold text-white mb-8"
              variants={fadeInUp}
            >
              Powered by Advanced AI
            </motion.h2>
            <motion.p
              className="text-xl text-zinc-400 max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              Our platform uses cutting-edge artificial intelligence to analyze, score, and provide feedback 
              on your debate arguments in real-time, helping you improve with every interaction.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            variants={staggerContainer}
          >
            {[
              {
                icon: MessageSquare,
                title: "1. Create or Join",
                desc: "Start a new debate on any topic or join an existing one. Choose between public debates or private sessions with friends.",
                color: "#ff6b35"
              },
              {
                icon: Zap,
                title: "2. Argue & Analyze",
                desc: "Submit your arguments and watch as our AI instantly analyzes clarity, logic, vocabulary, and sentiment in real-time.",
                color: "#00ff88"
              },
              {
                icon: Trophy,
                title: "3. Learn & Improve",
                desc: "Receive detailed feedback, see your scores, and track your improvement over time through our comprehensive analytics.",
                color: "#ff6b35"
              }
            ].map((step) => (
              <motion.div
                key={step.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-zinc-900/80 border-zinc-800 hover:border-[#ff6b35]/50 transition-all duration-500 h-full">
                  <CardHeader>
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${step.color}20` }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <step.icon className="w-8 h-8" style={{ color: step.color }} />
                    </motion.div>
                    <CardTitle className="text-white text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>

        {/* Debate Guidelines Section */}
        <AnimatedSection id="guidelines" variants={staggerContainer}>
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/30 mb-8"
              variants={scaleIn}
            >
              <Target className="w-5 h-5 text-[#00ff88]" />
              <span className="text-[#00ff88] font-medium">Debate Guidelines</span>
            </motion.div>
            <motion.h2
              className="text-5xl font-bold text-white mb-8"
              variants={fadeInUp}
            >
              Rules for Fair & Productive Debates
            </motion.h2>
            <motion.p
              className="text-xl text-zinc-400 max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              Follow these guidelines to ensure respectful, engaging, and high-quality debates that everyone can learn from.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div variants={fadeInUp}>
              <Card className="bg-zinc-900/80 border-zinc-800 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3 text-2xl">
                    <CheckCircle className="w-8 h-8 text-[#00ff88]" />
                    Do&apos;s
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {[
                      "Stay on topic and address the debate question directly",
                      "Provide evidence and logical reasoning for your arguments",
                      "Respect opposing viewpoints and respond constructively",
                      "Use clear, professional language and proper grammar",
                      "Engage with counterarguments and acknowledge valid points"
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="w-3 h-3 bg-[#00ff88] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-zinc-300 leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-zinc-900/80 border-zinc-800 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3 text-2xl">
                    <Target className="w-8 h-8 text-[#ff6b35]" />
                    Don&apos;ts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {[
                      "Use personal attacks or offensive language",
                      "Go off-topic or introduce irrelevant information",
                      "Submit plagiarized content or false information",
                      "Ignore opposing arguments or be dismissive",
                      "Spam short, low-effort arguments for quantity"
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="w-3 h-3 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-zinc-300 leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Scoring System Section */}
        <AnimatedSection id="scoring" variants={staggerContainer}>
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#ff6b35]/20 border border-[#ff6b35]/30 mb-8"
              variants={scaleIn}
            >
              <BarChart3 className="w-5 h-5 text-[#ff6b35]" />
              <span className="text-[#ff6b35] font-medium">Scoring System</span>
            </motion.div>
            <motion.h2
              className="text-5xl font-bold text-white mb-8"
              variants={fadeInUp}
            >
              Understanding Your Argument Scores
            </motion.h2>
            <motion.p
              className="text-xl text-zinc-400 max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              Our AI evaluates your arguments across multiple dimensions to provide comprehensive feedback and fair scoring.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            variants={staggerContainer}
          >
            {[
              { icon: MessageSquare, title: "Clarity", desc: "How clear and understandable your argument is", weight: "25%", color: "#ff6b35" },
              { icon: Brain, title: "Logic", desc: "Logical reasoning and evidence quality", weight: "30%", color: "#00ff88" },
              { icon: Star, title: "Vocabulary", desc: "Richness and appropriateness of language", weight: "20%", color: "#ff6b35" },
              { icon: Award, title: "Sentiment", desc: "Professional tone and respectful discourse", weight: "25%", color: "#00ff88" }
            ].map((metric) => (
              <motion.div
                key={metric.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-zinc-900/80 border-zinc-800 text-center hover:border-[#ff6b35]/50 transition-all duration-300 h-full">
                  <CardHeader>
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${metric.color}20` }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <metric.icon className="w-8 h-8" style={{ color: metric.color }} />
                    </motion.div>
                    <CardTitle className="text-white text-xl">{metric.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{metric.desc}</p>
                    <Badge 
                      className="border-0 text-white font-semibold"
                      style={{ backgroundColor: `${metric.color}30`, color: metric.color }}
                    >
                      {metric.weight}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-zinc-900/80 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-center text-2xl">Score Interpretation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  {[
                    { range: "0-40", label: "Needs Improvement", color: "#ef4444" },
                    { range: "40-60", label: "Good Effort", color: "#eab308" },
                    { range: "60-80", label: "Strong Argument", color: "#ff6b35" },
                    { range: "80-100", label: "Exceptional", color: "#00ff88" }
                  ].map((score, index) => (
                    <motion.div
                      key={score.range}
                      className="p-6 rounded-lg border transition-all duration-300"
                      style={{ 
                        backgroundColor: `${score.color}20`, 
                        borderColor: `${score.color}30` 
                      }}
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="text-3xl font-bold mb-2" style={{ color: score.color }}>
                        {score.range}
                      </div>
                      <div className="text-sm font-medium" style={{ color: score.color }}>
                        {score.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatedSection>

        {/* Our Values Section */}
        <AnimatedSection variants={staggerContainer}>
          <div className="text-center mb-16">
            <motion.h2
              className="text-5xl font-bold text-white mb-8"
              variants={fadeInUp}
            >
              Our Values
            </motion.h2>
            <motion.p
              className="text-xl text-zinc-400 max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              The principles that guide everything we do at DebAI.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            variants={staggerContainer}
          >
            {[
              {
                icon: Brain,
                title: "Intelligence",
                desc: "We leverage cutting-edge AI to provide the most accurate and helpful feedback possible, continuously improving our algorithms.",
                color: "#ff6b35"
              },
              {
                icon: Globe,
                title: "Accessibility",
                desc: "Quality debate education should be available to everyone, regardless of location, background, or financial circumstances.",
                color: "#00ff88"
              },
              {
                icon: Users,
                title: "Community",
                desc: "We foster a supportive environment where debaters can learn from each other and grow together through respectful discourse.",
                color: "#ff6b35"
              },
              {
                icon: Lightbulb,
                title: "Innovation",
                desc: "We constantly push the boundaries of what's possible in educational technology to create better learning experiences.",
                color: "#00ff88"
              },
              {
                icon: Award,
                title: "Excellence",
                desc: "We strive for the highest quality in everything we build, from our AI algorithms to our user experience design.",
                color: "#ff6b35"
              },
              {
                icon: MessageSquare,
                title: "Respect",
                desc: "We believe in the power of civil discourse and encourage respectful dialogue even on controversial topics.",
                color: "#00ff88"
              }
            ].map((value) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-zinc-900/80 border-zinc-800 hover:border-[#ff6b35]/50 transition-all duration-500 h-full">
                  <CardHeader>
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${value.color}20` }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <value.icon className="w-8 h-8" style={{ color: value.color }} />
                    </motion.div>
                    <CardTitle className="text-white text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-400 leading-relaxed">{value.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>

        {/* FAQ Section */}
        <AnimatedSection id="faq" variants={staggerContainer}>
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/30 mb-8"
              variants={scaleIn}
            >
              <HelpCircle className="w-5 h-5 text-[#00ff88]" />
              <span className="text-[#00ff88] font-medium">Frequently Asked Questions</span>
            </motion.div>
            <motion.h2
              className="text-5xl font-bold text-white mb-8"
              variants={fadeInUp}
            >
              Got Questions? We&apos;ve Got Answers
            </motion.h2>
            <motion.p
              className="text-xl text-zinc-400 max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              Find answers to common questions about using DebAI and improving your debate skills.
            </motion.p>
          </div>

          <motion.div
            className="max-w-4xl mx-auto"
            variants={fadeInUp}
          >
            <FAQ />
          </motion.div>
        </AnimatedSection>

        {/* Vision for the Future */}
        <AnimatedSection className="text-center" variants={fadeInUp}>
          <Card className="bg-zinc-900/80 border-[#00ff88]/30 max-w-5xl mx-auto">
            <CardHeader>
              <motion.div
                className="w-20 h-20 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <TrendingUp className="w-10 h-10 text-[#00ff88]" />
              </motion.div>
              <CardTitle className="text-4xl text-white">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl text-zinc-300 leading-relaxed mb-8">
                We envision a world where critical thinking and effective communication are fundamental skills that 
                everyone can develop. Through AI-powered education, we&apos;re building a future where thoughtful discourse 
                replaces polarization, and where every voice can be heard and respected.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  size="lg"
                  className="bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-black font-semibold text-lg px-8 py-4"
                >
                  Join us in shaping the future
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </AnimatedSection>

      </div>
    </div>
  );
}