import { X } from 'lucide-react';

interface ControlsModalProps {
  onClose: () => void;
}

const CONTROL_ROWS = [
  { action: 'Move Left / Right', keys: 'A / D or Left / Right Arrows' },
  { action: 'Aim Up / Crouch', keys: 'W / S or Up / Down Arrows' },
  { action: 'Jump (Drop Platform: Down + Jump)', keys: 'K, Z, or Space' },
  { action: 'Fire Weapon / Close Melee Knife', keys: 'J, X, or Left Click' },
  { action: 'Throw Grenade / Tank Cannon', keys: 'L, C, or Right Click' },
  { action: 'Board / Eject Iron Slug Tank', keys: 'E or Shift' },
  { action: 'Pause Mission', keys: 'P or Escape' },
];

export function ControlsModal({ onClose }: ControlsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Controls Reference"
    >
      <div className="w-full max-w-lg bg-[#121721] border border-slate-700 rounded-xl p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Controls & Combat Guide</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Classic run-and-gun bindings with automatic close-quarters knife slash.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close controls modal"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800 border-y border-slate-800">
          {CONTROL_ROWS.map((row) => (
            <div key={row.action} className="flex items-center justify-between gap-4 py-2.5 text-sm">
              <span className="text-slate-200">{row.action}</span>
              <span className="font-mono-tabular text-xs text-amber-400 text-right">{row.keys}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-slate-400 leading-relaxed">
          <p>
            <strong className="text-slate-200">Weapons:</strong> Shoot crates and rescue tied POWs for{' '}
            <span className="text-amber-300">[H] Heavy MG</span>,{' '}
            <span className="text-red-400">[S] Shotgun</span>,{' '}
            <span className="text-sky-400">[R] Rocket</span>, and{' '}
            <span className="text-orange-400">[F] Flame Shot</span>.
          </p>
          <p>
            <strong className="text-slate-200">Iron Slug Tank:</strong> Press <span className="text-lime-400">E</span> near the parked mini-tank to board for heavy armor and unlimited cannon shells.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
