'use client';

import React, { useState } from 'react';
import { 
  X, 
  Minus, 
  Square, 
  Copy, 
  Check, 
  Send, 
  ArrowUpRight, 
  Sparkles,
  Mail,
  MessageSquare,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface MacContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MacContactModal({ isOpen, onClose }: MacContactModalProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'UI/UX Design',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const emailAddress = 'gading@patosser.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    }, 1000);
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* macOS Window Card */}
      <div 
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border transition-all duration-300 transform scale-100 ${
          isDark 
            ? 'bg-[#0f172a]/95 border-slate-700/60 text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.8)]' 
            : 'bg-white/95 border-slate-200/80 text-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.25)]'
        }`}
      >
        {/* macOS Window Top Bar */}
        <div className={`flex items-center justify-between px-4 py-3 border-b select-none ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100/90 border-slate-200'
        }`}>
          {/* Traffic Lights (Window Controls) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] hover:bg-[#e0443e] flex items-center justify-center text-transparent hover:text-slate-900 transition-colors shadow-sm"
              title="Close"
            >
              <X size={9} strokeWidth={3} />
            </button>
            <button
              className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] hover:bg-[#dea123] flex items-center justify-center text-transparent hover:text-slate-900 transition-colors shadow-sm"
              title="Minimize"
            >
              <Minus size={9} strokeWidth={3} />
            </button>
            <button
              className="w-3.5 h-3.5 rounded-full bg-[#27c93f] hover:bg-[#1aab2f] flex items-center justify-center text-transparent hover:text-slate-900 transition-colors shadow-sm"
              title="Maximize"
            >
              <Square size={7} strokeWidth={3} />
            </button>
          </div>

          {/* Browser Address Bar Pill */}
          <div className={`flex items-center gap-2 px-4 py-1 rounded-full text-xs font-mono border ${
            isDark 
              ? 'bg-slate-950/60 border-slate-800 text-slate-400' 
              : 'bg-white border-slate-300 text-slate-600 shadow-inner'
          }`}>
            <Globe size={12} className="text-emerald-500" />
            <span>https://creatie.gading.design/contact</span>
          </div>

          {/* Action icon */}
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-slate-500/20 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {/* Header text */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                Let&apos;s collaborate
              </span>
              <span className="text-xs text-slate-400">Response time ~ 2-4 hours</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Start a Project or Say Hi 👋
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Have an exciting web app, brand system, or UI/UX project in mind? Drop a message or copy my email directly.
            </p>
          </div>

          {/* Quick Copy Email Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 ${
            isDark 
              ? 'bg-slate-900/60 border-slate-800' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Direct Email</p>
                <p className="font-mono text-sm sm:text-base font-bold">{emailAddress}</p>
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>

          {/* Contact Form */}
          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col items-center gap-3 my-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                <Check size={24} />
              </div>
              <h4 className="text-xl font-bold text-emerald-500">Message Received!</h4>
              <p className="text-sm text-slate-400 max-w-md">
                Thank you for reaching out! I&apos;ll get back to your inbox as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                      isDark 
                        ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Your Email</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                      isDark 
                        ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Project Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['UI/UX Design', 'Web Development', 'Brand & 3D', 'Meta Ads'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, projectType: type })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                        formData.projectType === type
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : isDark
                          ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Tell me about your project</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Goals, timeline, deliverables, or just say hi..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                    isDark 
                      ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {/* Social icons */}
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-500/10 transition-colors"
                    title="GitHub"
                  >
                    <Github size={16} />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-500/10 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-500/10 transition-colors"
                    title="X / Twitter"
                  >
                    <Twitter size={16} />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-500/10 transition-colors"
                    title="Instagram"
                  >
                    <Instagram size={16} />
                  </a>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Proposal</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
