import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { InputState } from '../game/types';

interface TouchControlsProps {
  onControlChange: (key: keyof InputState, active: boolean) => void;
  onPulseAction: (key: 'jumpJustPressed' | 'grenadeJustPressed' | 'tankToggleJustPressed') => void;
  tankAvailable: boolean;
}

export function TouchControls({
  onControlChange,
  onPulseAction,
  tankAvailable,
}: TouchControlsProps) {
  const bindHold = (key: keyof InputState, pulse?: 'jumpJustPressed' | 'grenadeJustPressed') => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      onControlChange(key, true);
      if (pulse) onPulseAction(pulse);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      onControlChange(key, false);
    },
    onPointerLeave: () => onControlChange(key, false),
    onPointerCancel: () => onControlChange(key, false),
  });

  return (
    <div className="flex items-center justify-between gap-4 pt-3 select-none">
      {/* Left D-Pad */}
      <div className="grid grid-cols-3 gap-1.5 w-36">
        <div />
        <button
          type="button"
          aria-label="Aim Up"
          {...bindHold('up')}
          className="h-11 bg-slate-800 active:bg-amber-500 active:text-slate-950 border border-slate-700 rounded-md flex items-center justify-center text-slate-200 cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />
        <button
          type="button"
          aria-label="Move Left"
          {...bindHold('left')}
          className="h-11 bg-slate-800 active:bg-amber-500 active:text-slate-950 border border-slate-700 rounded-md flex items-center justify-center text-slate-200 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Crouch"
          {...bindHold('down')}
          className="h-11 bg-slate-800 active:bg-amber-500 active:text-slate-950 border border-slate-700 rounded-md flex items-center justify-center text-slate-200 cursor-pointer"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Move Right"
          {...bindHold('right')}
          className="h-11 bg-slate-800 active:bg-amber-500 active:text-slate-950 border border-slate-700 rounded-md flex items-center justify-center text-slate-200 cursor-pointer"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-2">
        {tankAvailable && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onPulseAction('tankToggleJustPressed');
            }}
            className="h-12 px-3.5 bg-lime-600 active:bg-lime-400 text-slate-950 font-semibold text-xs rounded-lg whitespace-nowrap cursor-pointer"
          >
            Tank
          </button>
        )}
        <button
          type="button"
          {...bindHold('grenade', 'grenadeJustPressed')}
          className="h-12 px-4 bg-slate-800 active:bg-lime-500 active:text-slate-950 border border-slate-600 text-slate-100 font-semibold text-xs rounded-lg whitespace-nowrap cursor-pointer"
        >
          Grenade
        </button>
        <button
          type="button"
          {...bindHold('jump', 'jumpJustPressed')}
          className="h-12 px-4 bg-slate-800 active:bg-sky-400 active:text-slate-950 border border-slate-600 text-slate-100 font-semibold text-xs rounded-lg whitespace-nowrap cursor-pointer"
        >
          Jump
        </button>
        <button
          type="button"
          {...bindHold('fire')}
          className="h-12 px-5 bg-amber-500 active:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap cursor-pointer"
        >
          Fire
        </button>
      </div>
    </div>
  );
}
