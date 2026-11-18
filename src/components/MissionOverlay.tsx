import { RotateCcw, Play, ArrowRight, Home } from 'lucide-react';
import { GameScreenState, MissionStats } from '../game/types';

interface MissionOverlayProps {
  screen: Extract<GameScreenState, 'PAUSED' | 'MISSION_CLEAR' | 'CAMPAIGN_VICTORY' | 'GAME_OVER'>;
  stats: MissionStats | null;
  highScore: number;
  onResume: () => void;
  onNextMission: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function MissionOverlay({
  screen,
  stats,
  highScore,
  onResume,
  onNextMission,
  onRestart,
  onMainMenu,
}: MissionOverlayProps) {
  const accuracy =
    stats && stats.shotsFired > 0
      ? Math.min(100, Math.round((stats.shotsHit / stats.shotsFired) * 100))
      : 0;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0B0E13]/85 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-md bg-[#121721] border border-slate-700 rounded-xl p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-amber-400">
            {screen === 'PAUSED'
              ? 'Game Paused'
              : screen === 'MISSION_CLEAR'
                ? 'Objective Complete'
                : screen === 'CAMPAIGN_VICTORY'
                  ? 'All Missions Cleared'
                  : 'Out of Lives'}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            {screen === 'PAUSED'
              ? 'Mission Paused'
              : screen === 'MISSION_CLEAR'
                ? `Mission ${stats?.missionId ?? 1} Clear`
                : screen === 'CAMPAIGN_VICTORY'
                  ? 'Campaign Victory'
                  : 'Mission Failed'}
          </h2>
        </div>

        {stats && screen !== 'PAUSED' && (
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-sm">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Final Score</span>
              <span className="font-mono-tabular text-lg font-bold text-amber-400">
                {stats.score.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">High Score</span>
              <span className="font-mono-tabular text-lg font-bold text-white">
                {highScore.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Enemies Defeated</span>
              <span className="font-mono-tabular font-semibold text-slate-200">
                {stats.enemiesDefeated}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">POWs Rescued</span>
              <span className="font-mono-tabular font-semibold text-slate-200">
                {stats.powsRescued} / {stats.totalPows}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Time Bonus</span>
              <span className="font-mono-tabular font-semibold text-slate-200">
                {stats.timeRemaining}s × 25
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Shot Accuracy</span>
              <span className="font-mono-tabular font-semibold text-slate-200">{accuracy}%</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          {screen === 'PAUSED' && (
            <button
              type="button"
              onClick={onResume}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Resume
            </button>
          )}

          {screen === 'MISSION_CLEAR' && (
            <button
              type="button"
              onClick={onNextMission}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Next Mission
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {(screen === 'GAME_OVER' || screen === 'CAMPAIGN_VICTORY' || screen === 'PAUSED') && (
            <button
              type="button"
              onClick={onRestart}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {screen === 'PAUSED' ? 'Restart' : 'Play Again'}
            </button>
          )}

          <button
            type="button"
            onClick={onMainMenu}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
