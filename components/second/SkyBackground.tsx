'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export function SkyBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Night Canvas for Twinkling Stars & Shooting Stars
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Stars collection
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.75),
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
      color: Math.random() > 0.4 ? '#ffffff' : Math.random() > 0.5 ? '#c7d2fe' : '#fef08a',
    }));

    const shootingStars: {
      x: number;
      y: number;
      len: number;
      speed: number;
      angle: number;
      alpha: number;
      active: boolean;
    }[] = [];

    const spawnShootingStar = () => {
      if (Math.random() < 0.02 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.35,
          len: Math.random() * 90 + 60,
          speed: Math.random() * 9 + 6,
          angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
          alpha: 1,
          active: true,
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render stars
      stars.forEach((star) => {
        star.alpha += star.speed * star.twinkleDir;
        if (star.alpha > 0.95) {
          star.alpha = 0.95;
          star.twinkleDir = -1;
        } else if (star.alpha < 0.2) {
          star.alpha = 0.2;
          star.twinkleDir = 1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.shadowBlur = star.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = star.color;
        ctx.fill();
      });

      // Shooting stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        if (!s.active) continue;

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.lineWidth = 2;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - Math.cos(s.angle) * s.len,
          s.y - Math.sin(s.angle) * s.len
        );
        ctx.stroke();
        ctx.restore();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.016;

        if (s.alpha <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted]);

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      
      {/* ── DAY MEADOW & SKY ──────────────────────────────── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          !isDark ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, #5ba4e5 0%, #85c4f6 30%, #c4e4fb 60%, #e9f5fd 85%, #f4faf6 100%)',
        }}
      >
        {/* Soft Sun Ray Glow */}
        <div
          className="absolute top-[-100px] right-[10%] w-[450px] h-[450px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 248, 210, 0.8) 0%, rgba(255, 225, 130, 0.35) 45%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Sun Sphere */}
        <div className="absolute top-[50px] right-[16%] w-[72px] h-[72px] rounded-full bg-[#fef08a] shadow-[0_0_60px_rgba(253,224,71,0.8)] animate-pulse-slow">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#facc15] to-[#ffffff] opacity-90" />
        </div>

        {/* Fluffy SVG Clouds */}
        <div className="absolute top-[10%] left-[-40px] animate-drift-slow opacity-90">
          <svg width="260" height="110" viewBox="0 0 220 90" fill="none">
            <path
              d="M35 70C20 70 8 58 8 43C8 30 18 19 31 18C36 8 47 0 60 0C74 0 85 8 89 19C95 15 103 13 111 13C127 13 140 25 142 40C148 37 154 35 161 35C175 35 186 46 186 60C186 62 185 64 185 66C191 66 196 71 196 77C196 84 190 90 183 90H35C24 90 15 81 15 70H35Z"
              fill="#FFFFFF"
              filter="drop-shadow(0px 10px 24px rgba(0, 0, 0, 0.07))"
            />
          </svg>
        </div>

        <div className="absolute top-[6%] right-[24%] animate-drift-medium opacity-85">
          <svg width="190" height="85" viewBox="0 0 170 70" fill="none">
            <path
              d="M25 55C14 55 5 46 5 35C5 25 13 16 23 15C27 7 35 1 45 1C56 1 65 7 68 16C73 13 79 11 85 11C97 11 108 20 109 32C114 29 119 28 124 28C135 28 144 37 144 48C144 49 144 51 143 52C148 52 152 56 152 61C152 66 147 70 142 70H25Z"
              fill="#FFFFFF"
              filter="drop-shadow(0px 8px 18px rgba(0, 0, 0, 0.05))"
            />
          </svg>
        </div>

        {/* Realistic Sunny Rolling Hills (Windows Bliss / Creatie Meadow) */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-[62vh] overflow-hidden">
          {/* Back Distant Hill with Gold-Green tint */}
          <svg
            className="absolute bottom-0 left-[-4%] w-[108%] h-[50vh]"
            viewBox="0 0 1440 450"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,210 C320,100 580,260 880,140 C1140,40 1320,180 1440,130 L1440,450 L0,450 Z"
              fill="url(#dayBackHills)"
            />
            <defs>
              <linearGradient id="dayBackHills" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a3e635" />
                <stop offset="40%" stopColor="#65a30d" />
                <stop offset="100%" stopColor="#4d7c0f" />
              </linearGradient>
            </defs>
          </svg>

          {/* Middle Hill with lush yellow-green texture */}
          <svg
            className="absolute bottom-0 left-[-2%] w-[104%] h-[42vh]"
            viewBox="0 0 1440 380"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,160 C280,240 540,80 840,180 C1100,260 1300,120 1440,170 L1440,380 L0,380 Z"
              fill="url(#dayMidHills)"
            />
            <defs>
              <linearGradient id="dayMidHills" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#84cc16" />
                <stop offset="50%" stopColor="#4d7c0f" />
                <stop offset="100%" stopColor="#365314" />
              </linearGradient>
            </defs>
          </svg>

          {/* Foreground Meadow Hill */}
          <svg
            className="absolute bottom-0 left-0 w-full h-[32vh]"
            viewBox="0 0 1440 300"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,130 C360,30 720,200 1080,90 C1260,30 1380,100 1440,80 L1440,300 L0,300 Z"
              fill="url(#dayFrontHills)"
            />
            <defs>
              <linearGradient id="dayFrontHills" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#65a30d" />
                <stop offset="100%" stopColor="#1a2e05" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ── NIGHT MEADOW & STARRY COSMOS ──────────────────── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, #030712 0%, #080e28 35%, #0f173d 68%, #0a112c 88%, #050a1c 100%)',
        }}
      >
        {/* Canvas Stars */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Ambient Moon Corona */}
        <div
          className="absolute top-[20px] right-[14%] w-[380px] h-[380px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(199, 210, 254, 0.3) 0%, rgba(129, 140, 248, 0.12) 45%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Full Glowing Moon */}
        <div className="absolute top-[60px] right-[18%] w-[68px] h-[68px] rounded-full bg-[#f8fafc] shadow-[0_0_50px_rgba(224,231,255,0.85)]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#cbd5e1] via-[#f1f5f9] to-[#ffffff]" />
          <div className="absolute top-[18px] left-[14px] w-[12px] h-[12px] rounded-full bg-[#94a3b8] opacity-25" />
          <div className="absolute top-[36px] left-[28px] w-[15px] h-[15px] rounded-full bg-[#94a3b8] opacity-20" />
          <div className="absolute top-[16px] left-[38px] w-[9px] h-[9px] rounded-full bg-[#94a3b8] opacity-20" />
        </div>

        {/* Night Rolling Hills with Rim Highlights */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-[62vh] overflow-hidden">
          {/* Back Night Hill */}
          <svg
            className="absolute bottom-0 left-[-4%] w-[108%] h-[50vh]"
            viewBox="0 0 1440 450"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,210 C320,100 580,260 880,140 C1140,40 1320,180 1440,130 L1440,450 L0,450 Z"
              fill="url(#nightBackHills)"
            />
            <defs>
              <linearGradient id="nightBackHills" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#070a18" />
              </linearGradient>
            </defs>
          </svg>

          {/* Middle Night Hill */}
          <svg
            className="absolute bottom-0 left-[-2%] w-[104%] h-[42vh]"
            viewBox="0 0 1440 380"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,160 C280,240 540,80 840,180 C1100,260 1300,120 1440,170 L1440,380 L0,380 Z"
              fill="url(#nightMidHills)"
            />
            <defs>
              <linearGradient id="nightMidHills" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#172554" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#04060f" />
              </linearGradient>
            </defs>
          </svg>

          {/* Foreground Night Hill */}
          <svg
            className="absolute bottom-0 left-0 w-full h-[32vh]"
            viewBox="0 0 1440 300"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,130 C360,30 720,200 1080,90 C1260,30 1380,100 1440,80 L1440,300 L0,300 Z"
              fill="url(#nightFrontHills)"
            />
            <defs>
              <linearGradient id="nightFrontHills" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Subtle Bottom Gradient */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[48vh] transition-opacity duration-1000 ${
          isDark
            ? 'bg-gradient-to-t from-[#040817] via-[#040817]/80 to-transparent'
            : 'bg-gradient-to-t from-[#f8faf7] via-[#f8faf7]/60 to-transparent'
        }`}
      />
    </div>
  );
}
