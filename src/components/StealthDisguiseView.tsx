import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  Calculator as CalcIcon,
  Eye,
  Search,
  Lock,
  Unlock,
  Delete,
  RotateCcw,
  Sparkles,
  Info,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const StealthDisguiseView: React.FC = () => {
  const { unhideApp } = useTracker();
  const [calcInput, setCalcInput] = useState('0');
  const [history, setHistory] = useState<string>('');
  const [unlockedNotice, setUnlockedNotice] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [activeTab, setActiveTab] = useState<'calc' | 'search'>('calc');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto check for passcode 1475
  const checkPasscode = (inputStr: string): boolean => {
    // If exact 1475 or contains 1475 sequence
    if (inputStr === '1475' || inputStr.endsWith('1475')) {
      triggerUnlock();
      return true;
    }
    return false;
  };

  const triggerUnlock = () => {
    setUnlockedNotice(true);
    setTimeout(() => {
      unhideApp();
    }, 400);
  };

  // Keyboard support: user can type 1475 directly on hardware keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      if (key >= '0' && key <= '9') {
        handleCalcButton(key);
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        handleCalcButton(key === '*' ? '×' : key === '/' ? '÷' : key);
      } else if (key === '.' || key === ',') {
        handleCalcButton('.');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleCalcButton('=');
      } else if (key === 'Backspace') {
        handleCalcButton('DEL');
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        handleCalcButton('C');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calcInput]);

  const handleCalcButton = (val: string) => {
    if (val === 'C') {
      setCalcInput('0');
      setHistory('');
      return;
    }

    if (val === 'DEL') {
      setCalcInput((prev) => {
        if (prev.length <= 1 || prev === 'Error') return '0';
        return prev.slice(0, -1);
      });
      return;
    }

    if (val === '=') {
      // Check secret code 1475
      if (calcInput === '1475' || calcInput.endsWith('1475') || calcInput === '7788' || calcInput === '007') {
        triggerUnlock();
        return;
      }

      try {
        const sanitized = calcInput
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/[^0-9+\-*/.]/g, '');
        // Safe evaluation
        const res = Function(`'use strict'; return (${sanitized})`)();
        setHistory(calcInput + ' =');
        setCalcInput(String(res));
      } catch {
        setCalcInput('Error');
      }
      return;
    }

    // Number or operator input
    setCalcInput((prev) => {
      let nextStr = '';
      if (prev === '0' || prev === 'Error') {
        nextStr = val;
      } else {
        nextStr = prev + val;
      }

      // Check if user just typed 1475
      if (nextStr === '1475' || nextStr.endsWith('1475')) {
        setTimeout(() => triggerUnlock(), 250);
      }

      return nextStr;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (q === '1475' || q === 'open' || q === 'activity' || q.length > 0) {
      unhideApp();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none animate-in fade-in duration-200">
      {/* Top Disguise Status Bar: Looks like a system calculator app */}
      <header className="border-b border-slate-900 bg-slate-950/90 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-300">
            <CalcIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-300">
            Calculator
          </span>
          <span className="text-[10px] text-slate-600 font-mono">v4.2.0</span>
        </div>

        {/* Subtle quick unhide button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab((prev) => (prev === 'calc' ? 'search' : 'calc'))}
            className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            {activeTab === 'calc' ? 'Search Mode' : 'Calculator Mode'}
          </button>
          <button
            onClick={() => unhideApp()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-md transition-all"
            title="Unhide PhonePulse Tracker"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unhide</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {activeTab === 'calc' ? (
          <div className="w-full max-w-xs sm:max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
            {/* Top Bar inside calculator */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
              <span className="font-mono text-[11px] text-slate-500">DEG</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500">STANDARD</span>
                {unlockedNotice ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 animate-pulse">
                    <Unlock className="w-3 h-3" /> Unlocked!
                  </span>
                ) : (
                  <Lock className="w-3 h-3 text-slate-600" />
                )}
              </div>
            </div>

            {/* LCD Display */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-end min-h-[96px] text-right transition-colors">
              <div className="text-xs font-mono text-slate-500 h-5 truncate select-text">
                {history}
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-semibold text-white tracking-wider truncate select-text">
                {calcInput}
              </div>
            </div>

            {/* Keypad Grid (Standard 4x5 Calculator layout) */}
            <div className="grid grid-cols-4 gap-2.5 text-base font-semibold">
              {/* Row 1 */}
              <button
                onClick={() => handleCalcButton('C')}
                className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-rose-400 transition-all font-mono"
              >
                C
              </button>
              <button
                onClick={() => handleCalcButton('DEL')}
                className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-amber-400 transition-all flex items-center justify-center"
                title="Backspace"
              >
                <Delete className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCalcButton('%')}
                className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-indigo-400 transition-all font-mono"
              >
                %
              </button>
              <button
                onClick={() => handleCalcButton('÷')}
                className="py-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/60 active:scale-95 text-indigo-300 transition-all font-mono text-lg"
              >
                ÷
              </button>

              {/* Row 2 */}
              <button
                onClick={() => handleCalcButton('7')}
                className="py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-800 transition-all font-mono text-lg"
              >
                7
              </button>
              <button
                onClick={() => handleCalcButton('8')}
                className="py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-800 transition-all font-mono text-lg"
              >
                8
              </button>
              <button
                onClick={() => handleCalcButton('9')}
                className="py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-800 transition-all font-mono text-lg"
              >
                9
              </button>
              <button
                onClick={() => handleCalcButton('×')}
                className="py-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/60 active:scale-95 text-indigo-300 transition-all font-mono text-lg"
              >
                ×
              </button>

              {/* Row 3 */}
              <button
                onClick={() => handleCalcButton('4')}
                className="py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-800 transition-all font-mono text-lg"
              >
                4
              </button>
              <button
                onClick={() => handleCalcButton('5')}
                className="py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-800 transition-all font-mono text-lg"
              >
                5
              </button>
              <button
                onClick={() => handleCalcButton('6')}
                className="py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-800 transition-all font-mono text-lg"
              >
                6
              </button>
              <button
                onClick={() => handleCalcButton('-')}
                className="py-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/60 active:scale-95 text-indigo-300 transition-all font-mono text-lg"
              >
                -
              </button>

              {/* Row 4 */}
              <button
                onClick={() => handleCalcButton('1')}
                className="py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-800 transition-all font-mono text-lg"
              >
                1
              </button>
              <button
                onClick={() => handleCalcButton('2')}
                className="py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-800 transition-all font-mono text-lg"
              >
                2
              </button>
              <button
                onClick={() => handleCalcButton('3')}
                className="py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-800 transition-all font-mono text-lg"
              >
                3
              </button>
              <button
                onClick={() => handleCalcButton('+')}
                className="py-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/60 active:scale-95 text-indigo-300 transition-all font-mono text-lg"
              >
                +
              </button>

              {/* Row 5 */}
              <button
                onClick={() => handleCalcButton('0')}
                className="py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-800 transition-all font-mono text-lg"
              >
                0
              </button>
              <button
                onClick={() => handleCalcButton('.')}
                className="py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800 active:scale-95 text-slate-100 border border-slate-800 transition-all font-mono text-lg"
              >
                .
              </button>
              <button
                onClick={() => handleCalcButton('=')}
                className="col-span-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold transition-all shadow-md shadow-indigo-600/30 text-lg flex items-center justify-center gap-1"
              >
                <span>=</span>
              </button>
            </div>

            {/* Secret Passcode Helper / Instruction */}
            <div className="pt-2 border-t border-slate-800/80 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <span>Secret Passcode:</span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  1475
                </span>
                <span className="text-slate-500">type in keypad or keyboard</span>
              </div>
            </div>
          </div>
        ) : (
          /* Alternate Search Disguise */
          <div className="w-full max-w-lg space-y-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 mb-1">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Search Portal</h2>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or type 1475 to unhide..."
                autoFocus
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Search
              </button>
            </form>
            <div className="text-xs text-slate-500">
              Type <strong className="text-emerald-400 font-mono">1475</strong> to reopen Activity Tracker
            </div>
          </div>
        )}
      </main>

      {/* Discreet Bottom Bar */}
      <footer className="border-t border-slate-900 py-3 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-400">Calculator Vault Mode</span>
          <span className="text-slate-600">·</span>
          <span>Screen disguised as a working calculator</span>
        </div>

        <button
          onClick={() => unhideApp()}
          className="text-slate-400 hover:text-white transition-colors underline text-[11px]"
        >
          Click here to unhide Activity Tracker dashboard
        </button>
      </footer>
    </div>
  );
};
