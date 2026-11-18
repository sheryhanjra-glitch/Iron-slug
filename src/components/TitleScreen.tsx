import { useState } from 'react';
import { Play, Keyboard } from 'lucide-react';
import { MISSIONS } from '../game/levels';
import { Difficulty } from '../game/types';

interface TitleScreenProps {
  difficulty: Difficulty;
  selectedMission: number;
  highScore: number;
  onSelectDifficulty: (d: Difficulty) => void;
  onSelectMission: (idx: number) => void;
  onStart: () => void;
  onOpenControls: () => void;
}

const TITLE_ART_URL = '/src/assets/images/iron_slug_title_art_1795033650031.jpg';

export function TitleScreen({
  difficulty,
  selectedMission,
  highScore,
  onSelectDifficulty,
  onSelectMission,
  onStart,
  onOpenControls,
}: TitleScreenProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative w-full aspect-video overflow-hidden bg-[#0F141D] flex flex-col justify-end p-6 sm:p-10">
      {/* Pixel Art Key Illustration Backdrop */}
      {!imgError ? (
        <img
          src={TITLE_ART_URL}
          alt="Iron Slug retro pixel-art commando, armored mini-tank, and hovering gunship boss"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center pixelated"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950" />
      )}

      {/* Measured Scrim for Guaranteed Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E13] via-[#0B0E13]/80 to-[#0B0E13]/35" />

      <div className="relative z-10 flex flex-col gap-5 max-w-3xl">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium tracking-wide">
            <span>16-Bit Side-Scrolling Action</span>
            <span aria-hidden="true">·</span>
            <span>3 Missions</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">High Score {highScore.toLocaleString()}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white leading-none">
            IRON SLUG
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            Storm fortified warzones with heavy weapons, rescue captive POWs, commandeer the armored mini-tank, and dismantle three multi-phase war machines.
          </p>
        </div>

        {/* Mission & Difficulty Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-slate-400">Starting Mission</span>
            <div className="flex items-center gap-1 p-1 bg-slate-950/90 border border-slate-800 rounded-lg">
              {MISSIONS.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMission(idx)}
                  className={`flex-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate focus-visible:outline-2 focus-visible:outline-amber-400 ${
                    selectedMission === idx
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  {m.id}. {m.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-slate-400">Difficulty</span>
            <div className="flex items-center gap-1 p-1 bg-slate-950/90 border border-slate-800 rounded-lg">
              {(
                [
                  { id: 'recruit', label: 'Recruit' },
                  { id: 'veteran', label: 'Veteran' },
                  { id: 'arcade', label: 'Arcade Hard' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectDifficulty(opt.id)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber-400 ${
                    difficulty === opt.id
                      ? 'bg-slate-100 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 active:translate-y-px rounded-lg transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-300 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Mission
          </button>

          <button
            type="button"
            onClick={onOpenControls}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 cursor-pointer"
          >
            <Keyboard className="w-4 h-4" />
            Controls
          </button>
        </div>
      </div>
    </div>
  );
}
