import React, { useState } from 'react';
import { Menu, X, Trophy } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'TEAMS', href: '#' },
    { label: 'MATCHES', href: '#' },
    { label: 'STANDINGS', href: '#' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black text-white backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop Viewport Layout */}
        <div className="relative flex h-16 items-center justify-between">
          
          {/* Left Side: Logo */}
          <div className="flex items-center gap-x-2">
            <Trophy className="h-6 w-6 text-emerald-500" />
            <span className="font-black tracking-widest text-xl">PITCHTRACK</span>
          </div>

          {/* Absolute Center: Navigation Items */}
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-x-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-semibold tracking-wider text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Side: Auth Buttons */}
          <div className="hidden items-center gap-x-4 md:flex">
            <a
              href="#"
              className="text-sm font-semibold tracking-wider text-zinc-400 transition-colors hover:text-white"
            >
              LOGIN
            </a>
            <a
              href="#"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold tracking-wider text-white transition-colors hover:bg-emerald-500"
            >
              REGISTER
            </a>
          </div>

          {/* Mobile Menu Button Trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {isOpen && (
        <div className="border-t border-zinc-900 bg-black px-4 py-4 md:hidden">
          <div className="flex flex-col gap-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium tracking-wide text-zinc-300 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-zinc-900" />
            <div className="flex flex-col gap-y-3">
              <a
                href="#"
                onClick={() => setIsOpen(false)}
                className="text-center text-base font-medium tracking-wide text-zinc-300 hover:text-white"
              >
                LOGIN
              </a>
              <a
                href="#"
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-emerald-600 py-2 text-center text-base font-semibold tracking-wide text-white hover:bg-emerald-500"
              >
                REGISTER
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}