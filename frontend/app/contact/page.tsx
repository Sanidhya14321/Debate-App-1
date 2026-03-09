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
      colorClass: "text-primary"
    },
    {
      name: "Instagram",
      description: "Follow us for updates, tips, and behind-the-scenes content",
      icon: Instagram,
      href: "https://instagram.com/debai",
      label: "@debai",
      colorClass: "text-accent"
    },
    {
      name: "LinkedIn",
      description: "Connect with us professionally and see our latest company updates",
      icon: Linkedin,
      href: "https://linkedin.com/company/debai",
      label: "DebAI Company",
      colorClass: "text-primary"
    },
    {
      name: "GitHub",
      description: "Check out our open-source contributions and technical updates",
      icon: Github,
      href: "https://github.com/debai",
      label: "@debai",
      colorClass: "text-accent"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-8 py-16 space-y-20">
        
        {/* Header */}
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Get In <span className="text-primary">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
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
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">Connect With Us</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-6">Choose Your Platform</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
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
                  <Card className="border-border hover:border-primary/50 transition-all duration-300 h-full">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center skeuo-inset">
                          <IconComponent 
                            className={`w-7 h-7 ${method.colorClass}`}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-foreground text-xl">{method.name}</CardTitle>
                          <p className="text-muted-foreground text-sm mt-1">{method.label}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {method.description}
                      </p>
                      <Button
                        asChild
                        className="w-full bg-transparent border border-border text-foreground hover:bg-accent/12 transition-all duration-200"
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
          <Card className="text-center skeuo-gloss">
            <CardHeader>
              <CardTitle className="text-3xl text-foreground">Quick Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground">
                For urgent matters or general inquiries, email is usually the fastest way to reach us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:opacity-90 text-primary-foreground font-semibold"
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
                  className="border-primary text-primary hover:bg-primary/10"
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
              <p className="text-sm text-muted-foreground">
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
          <h3 className="text-2xl font-bold text-foreground mb-8">Expected Response Times</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg skeuo-panel">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-lg font-semibold text-foreground">Email</div>
              <div className="text-sm text-muted-foreground">24 hours</div>
            </div>
            <div className="p-6 rounded-lg skeuo-panel">
              <Instagram className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-lg font-semibold text-foreground">Instagram</div>
              <div className="text-sm text-muted-foreground">1-2 days</div>
            </div>
            <div className="p-6 rounded-lg skeuo-panel">
              <Linkedin className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-lg font-semibold text-foreground">LinkedIn</div>
              <div className="text-sm text-muted-foreground">1-3 days</div>
            </div>
            <div className="p-6 rounded-lg skeuo-panel">
              <Github className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-lg font-semibold text-foreground">GitHub</div>
              <div className="text-sm text-muted-foreground">Issues only</div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}