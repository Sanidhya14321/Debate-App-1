"use client";

import Link from "next/link";
import { Github, Mail, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-zinc-900/30 border-t border-[#ff6b35]/20 mt-auto">
            <div className="sm:px-18 sm:py-16 px-2 py-6 ">
                <div className="grid grid-cols-9 sm:grid-rows-none grid-rows-2 md:grid-cols-4 gap-4 justify-items-center-safe">
                    {/* Brand Section */}
                    <div className="space-y-6 col-span-9 sm:col-span-1">
                        <h1 className="text-2xl font-bold text-[#ff6b35] px-2">DebAI</h1>
                        <p className="text-zinc-400 px-2 leading-relaxed">
                            Elevate your debate skills with AI-powered feedback and real-time scoring.
                            Join the future of competitive debating.
                        </p>
                        <div className="flex space-x-4 px-2">
                            <Link
                                href="/contact"
                                className="text-zinc-400 hover:text-[#ff6b35] transition-colors duration-200"
                                aria-label="Contact Us"
                            >
                                <Twitter className="w-6 h-6" />
                            </Link>
                            <Link
                                href="/contact"
                                className="text-zinc-400 hover:text-[#ff6b35] transition-colors duration-200"
                                aria-label="Contact Us"
                            >
                                <Github className="w-6 h-6" />
                            </Link>
                            <Link
                                href="/contact"
                                className="text-zinc-400 hover:text-[#ff6b35] transition-colors duration-200"
                                aria-label="Contact Us"
                            >
                                <Mail className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div className="space-y-2 col-span-3 sm:col-span-1 md:col-span-1">
                        <h4 className="text-lg font-semibold text-white">Platform</h4>
                        <ul className="space-y-1">
                            <li>
                                <Link href="/debates" className="text-zinc-400 hover:text-[#00ff88] transition-colors duration-200">
                                    Browse Debates
                                </Link>
                            </li>
                            <li>
                                <Link href="/tournaments" className="text-zinc-400 hover:text-[#00ff88] transition-colors duration-200">
                                    Tournaments
                                </Link>
                            </li>
                            <li>
                                <Link href="/leaderboard" className="text-zinc-400 hover:text-[#00ff88] transition-colors duration-200">
                                    Leaderboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/analytics" className="text-zinc-400 hover:text-[#00ff88] transition-colors duration-200">
                                    Analytics
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div className="space-y-2 col-span-4 sm:col-span-1 md:col-span-1">
                        <h4 className="text-lg font-semibold text-white">Resources</h4>
                        <ul className="space-y-1">
                            <li>
                                <Link href="/about" className="text-zinc-400 hover:text-[#00ff88] transition-colors duration-200">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-zinc-400 hover:text-[#00ff88] transition-colors duration-200">
                                    Debate Guidelines
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-zinc-400 hover:text-[#00ff88] transition-colors duration-200">
                                    Scoring System
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-zinc-400 hover:text-[#00ff88] transition-colors duration-200">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="space-y-2 col-span-2 sm:col-span-1 md:col-span-1">
                        <h4 className="text-lg font-semibold text-white">Company</h4>
                        <ul className="space-y-1">
                            <li>
                                <Link href="/about" className="text-zinc-400 hover:text-[#00ff88] transition-colors duration-200">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-zinc-400 hover:text-[#00ff88] transition-colors duration-200">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-zinc-400 text-sm">
                        © 2024 DebAI. All rights reserved.
                    </p>
                    <div className="flex space-x-6 text-sm">
                        <Link href="/about" className="text-zinc-400 hover:text-[#ff6b35] transition-colors duration-200">
                            About
                        </Link>
                        <Link href="/contact" className="text-zinc-400 hover:text-[#ff6b35] transition-colors duration-200">
                            Contact
                        </Link>
                        <Link href="/about" className="text-zinc-400 hover:text-[#ff6b35] transition-colors duration-200">
                            Company
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}