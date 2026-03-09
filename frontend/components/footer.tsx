"use client";

import Link from "next/link";
import { Github, Mail, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto px-2 py-3 md:px-4 md:py-4">
      <div className="skeuo-panel skeuo-gloss mx-auto w-full max-w-[1200px] rounded-2xl px-4 py-8 md:px-8 md:py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight text-primary">DebAI</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Structured debate practice with transparent scoring, low-latency judging, and real-time match flow.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Link href="/contact" className="rounded-full border border-border p-2 transition-colors hover:text-primary" aria-label="Contact">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="rounded-full border border-border p-2 transition-colors hover:text-primary" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="rounded-full border border-border p-2 transition-colors hover:text-primary" aria-label="Mail">
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/debates" className="hover:text-primary">Browse Debates</Link></li>
              <li><Link href="/tournaments" className="hover:text-primary">Tournaments</Link></li>
              <li><Link href="/leaderboard" className="hover:text-primary">Leaderboard</Link></li>
              <li><Link href="/analytics" className="hover:text-primary">Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary">How It Works</Link></li>
              <li><Link href="/about" className="hover:text-primary">Guidelines</Link></li>
              <li><Link href="/about" className="hover:text-primary">Scoring System</Link></li>
              <li><Link href="/about" className="hover:text-primary">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary">About</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground md:flex md:items-center md:justify-between">
          <p>© 2026 DebAI. All rights reserved.</p>
          <div className="mt-2 flex items-center gap-4 md:mt-0">
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/about" className="hover:text-primary">Company</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}