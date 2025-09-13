"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Instagram, 
  Linkedin, 
  Github,
  MessageSquare,
  ExternalLink
} from "lucide-react";

export default function ContactPage() {
  const contactMethods = [
    {
      name: "Email",
      description: "Send us an email for support, partnerships, or general inquiries",
      icon: Mail,
      href: "mailto:hello@debai.com",
      label: "hello@debai.com",
      color: "#ff6b35"
    },
    {
      name: "Instagram",
      description: "Follow us for updates, tips, and behind-the-scenes content",
      icon: Instagram,
      href: "https://instagram.com/debai",
      label: "@debai",
      color: "#E4405F"
    },
    {
      name: "LinkedIn",
      description: "Connect with us professionally and see our latest company updates",
      icon: Linkedin,
      href: "https://linkedin.com/company/debai",
      label: "DebAI Company",
      color: "#0077B5"
    },
    {
      name: "GitHub",
      description: "Check out our open-source contributions and technical updates",
      icon: Github,
      href: "https://github.com/debai",
      label: "@debai",
      color: "#00ff88"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-8 py-16 space-y-20">
        
        {/* Header */}
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Get In <span className="text-[#ff6b35]">Touch</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            We&apos;d love to hear from you! Whether you have questions, feedback, or just want to connect, 
            reach out to us through any of our channels.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-12"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#ff6b35]/20 border border-[#ff6b35]/30 mb-6">
              <MessageSquare className="w-5 h-5 text-[#ff6b35]" />
              <span className="text-[#ff6b35] font-medium">Connect With Us</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">Choose Your Platform</h2>
            <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
              We&apos;re active on multiple platforms to make it easy for you to reach us wherever you are.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <motion.div
                  key={method.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-zinc-900/80 border-zinc-800 hover:border-[#ff6b35]/50 transition-all duration-300 h-full">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${method.color}20` }}
                        >
                          <IconComponent 
                            className="w-7 h-7" 
                            style={{ color: method.color }}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">{method.name}</CardTitle>
                          <p className="text-zinc-400 text-sm mt-1">{method.label}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-zinc-300 leading-relaxed">
                        {method.description}
                      </p>
                      <Button
                        asChild
                        className="w-full bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-[#ff6b35]/50 hover:text-white transition-all duration-200"
                      >
                        <a
                          href={method.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <span>Connect on {method.name}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Quick Contact Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-zinc-900/80 border-[#00ff88]/30 text-center">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Quick Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-zinc-300">
                For urgent matters or general inquiries, email is usually the fastest way to reach us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-black font-semibold"
                >
                  <a
                    href="mailto:hello@debai.com"
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Send Email
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88]/10"
                >
                  <a
                    href="https://github.com/debai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Github className="w-5 h-5" />
                    View GitHub
                  </a>
                </Button>
              </div>
              <p className="text-sm text-zinc-400">
                We typically respond within 24 hours during business days.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Response Times */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-8">Expected Response Times</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Mail className="w-8 h-8 text-[#ff6b35] mx-auto mb-3" />
              <div className="text-lg font-semibold text-white">Email</div>
              <div className="text-sm text-zinc-400">24 hours</div>
            </div>
            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Instagram className="w-8 h-8 text-[#E4405F] mx-auto mb-3" />
              <div className="text-lg font-semibold text-white">Instagram</div>
              <div className="text-sm text-zinc-400">1-2 days</div>
            </div>
            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Linkedin className="w-8 h-8 text-[#0077B5] mx-auto mb-3" />
              <div className="text-lg font-semibold text-white">LinkedIn</div>
              <div className="text-sm text-zinc-400">1-3 days</div>
            </div>
            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Github className="w-8 h-8 text-[#00ff88] mx-auto mb-3" />
              <div className="text-lg font-semibold text-white">GitHub</div>
              <div className="text-sm text-zinc-400">Issues only</div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}