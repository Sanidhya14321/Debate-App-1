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
    <div className="min-h-screen scroll-smooth">
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
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6">
              About <span className="text-primary">the platform</span>
            </h1>
          </motion.div>

          <motion.p
            className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            This platform is designed to make structured debate practice easier. It scores arguments in a consistent way
            and gives clear feedback so people can focus on improving how they explain and defend their ideas.
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
                className="border-none bg-transparent cursor-pointer text-muted-foreground hover:bg-accent/20 hover:text-primary transition-all duration-300"
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
            <ChevronDown className="w-6 h-6 text-muted-foreground mx-auto animate-bounce" />
          </motion.div>
        </motion.div>

        {/* Mission Statement */}
        <AnimatedSection id="mission" className="text-center" variants={fadeInUp}>
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <motion.div
                className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Heart className="w-10 h-10 text-primary" />
              </motion.div>
              <CardTitle className="text-4xl text-foreground">Our mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                The goal is to make debate practice easy to access and simple to understand. Scores and feedback are
                presented in a straightforward way so people can see what is working and what is not in their arguments.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {[
                  { icon: Brain, label: "Measured", desc: "Arguments are reviewed against clear criteria" },
                  { icon: Globe, label: "Accessible", desc: "Works in the browser on common devices" },
                  { icon: TrendingUp, label: "Practice-focused", desc: "Built around steady improvement through use" }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.label}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
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
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/20 border border-primary/30 mb-8"
              variants={scaleIn}
            >
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">How it works</span>
            </motion.div>
              <motion.h2
              className="text-5xl font-bold text-foreground mb-8"
              variants={fadeInUp}
            >
              What the system does
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              The system checks arguments against a small set of scoring categories, records results, and shows progress
              over time. It is meant to support practice, not replace human judgement.
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
                colorClass: "text-primary",
                bgClass: "bg-primary/20"
              },
              {
                icon: Zap,
                title: "2. Argue & Analyze",
                desc: "Submit your arguments and see scores for clarity, logic, vocabulary, and tone as you go.",
                colorClass: "text-accent",
                bgClass: "bg-accent/20"
              },
              {
                icon: Trophy,
                title: "3. Learn & Improve",
                desc: "Review feedback, compare scores across debates, and track how your results change over time.",
                colorClass: "text-primary",
                bgClass: "bg-primary/20"
              }
            ].map((step) => (
              <motion.div
                key={step.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-border hover:border-primary/50 transition-all duration-500 h-full">
                  <CardHeader>
                    <motion.div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${step.bgClass}`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <step.icon className={`w-8 h-8 ${step.colorClass}`} />
                    </motion.div>
                    <CardTitle className="text-foreground text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
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
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-accent/20 border border-accent/30 mb-8"
              variants={scaleIn}
            >
              <Target className="w-5 h-5 text-accent" />
              <span className="text-accent font-medium">Debate Guidelines</span>
            </motion.div>
            <motion.h2
              className="text-5xl font-bold text-foreground mb-8"
              variants={fadeInUp}
            >
              Rules for fair and productive debates
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              Follow these guidelines to ensure respectful, engaging, and high-quality debates that everyone can learn from.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-3 text-2xl">
                    <CheckCircle className="w-8 h-8 text-accent" />
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
                        <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-3 text-2xl">
                    <Target className="w-8 h-8 text-primary" />
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
                        <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
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
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/20 border border-primary/30 mb-8"
              variants={scaleIn}
            >
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">Scoring System</span>
            </motion.div>
            <motion.h2
              className="text-5xl font-bold text-foreground mb-8"
              variants={fadeInUp}
            >
              Understanding your argument scores
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              Arguments are checked across several dimensions so scoring stays consistent from one debate to the next.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            variants={staggerContainer}
          >
            {[
              { icon: MessageSquare, title: "Clarity", desc: "How clear and understandable your argument is", weight: "25%", colorClass: "text-primary", bgClass: "bg-primary/20" },
              { icon: Brain, title: "Logic", desc: "Logical reasoning and evidence quality", weight: "30%", colorClass: "text-accent", bgClass: "bg-accent/20" },
              { icon: Star, title: "Vocabulary", desc: "Richness and appropriateness of language", weight: "20%", colorClass: "text-primary", bgClass: "bg-primary/20" },
              { icon: Award, title: "Sentiment", desc: "Professional tone and respectful discourse", weight: "25%", colorClass: "text-accent", bgClass: "bg-accent/20" }
            ].map((metric) => (
              <motion.div
                key={metric.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="text-center hover:border-primary/50 transition-all duration-300 h-full">
                  <CardHeader>
                    <motion.div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${metric.bgClass}`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <metric.icon className={`w-8 h-8 ${metric.colorClass}`} />
                    </motion.div>
                    <CardTitle className="text-foreground text-xl">{metric.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{metric.desc}</p>
                    <Badge
                      className={`border-0 font-semibold ${metric.colorClass} ${metric.bgClass}`}
                    >
                      {metric.weight}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground text-center text-2xl">Score Interpretation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  {[
                    { range: "0-40", label: "Needs Improvement", color: "#ef4444" },
                    { range: "40-60", label: "Good Effort", color: "#eab308" },
                    { range: "60-80", label: "Strong Argument", color: "hsl(var(--primary))" },
                    { range: "80-100", label: "Exceptional", color: "hsl(var(--accent))" }
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
              className="text-5xl font-bold text-foreground mb-8"
              variants={fadeInUp}
            >
              Our values
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              The principles that guide how the platform is built and improved over time.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            variants={staggerContainer}
          >
            {[
              {
                icon: Brain,
                title: "Clarity",
                desc: "The interface and feedback are kept simple so people can understand what scores mean without extra explanation.",
                colorClass: "text-primary",
                bgClass: "bg-primary/20"
              },
              {
                icon: Globe,
                title: "Accessibility",
                desc: "Quality debate education should be available to everyone, regardless of location, background, or financial circumstances.",
                colorClass: "text-accent",
                bgClass: "bg-accent/20"
              },
              {
                icon: Users,
                title: "Community",
                desc: "We foster a supportive environment where debaters can learn from each other and grow together through respectful discourse.",
                colorClass: "text-primary",
                bgClass: "bg-primary/20"
              },
              {
                icon: Lightbulb,
                title: "Consistency",
                desc: "Scoring rules stay stable so people can compare different debates and see genuine change in their results.",
                colorClass: "text-accent",
                bgClass: "bg-accent/20"
              },
              {
                icon: Award,
                title: "Care",
                desc: "Changes are made carefully so existing users are not surprised by sudden shifts in behaviour or layout.",
                colorClass: "text-primary",
                bgClass: "bg-primary/20"
              },
              {
                icon: MessageSquare,
                title: "Respect",
                desc: "The system is designed to support calm, structured discussion, even when topics are difficult.",
                colorClass: "text-accent",
                bgClass: "bg-accent/20"
              }
            ].map((value) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:border-primary/50 transition-all duration-500 h-full">
                  <CardHeader>
                    <motion.div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${value.bgClass}`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <value.icon className={`w-8 h-8 ${value.colorClass}`} />
                    </motion.div>
                    <CardTitle className="text-foreground text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
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
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-accent/20 border border-accent/30 mb-8"
              variants={scaleIn}
            >
              <HelpCircle className="w-5 h-5 text-accent" />
              <span className="text-accent font-medium">Frequently asked questions</span>
            </motion.div>
            <motion.h2
              className="text-5xl font-bold text-foreground mb-8"
              variants={fadeInUp}
            >
              Common questions
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-4xl mx-auto"
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
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <motion.div
                className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <TrendingUp className="w-10 h-10 text-accent" />
              </motion.div>
            <CardTitle className="text-4xl text-foreground">Our vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                The aim is for more people to feel comfortable taking part in structured discussion. By making practice
                simple, the hope is that good habits in listening and explaining carry over into other settings.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  size="lg"
                  className="bg-primary hover:opacity-90 text-primary-foreground font-semibold text-lg px-8 py-4"
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