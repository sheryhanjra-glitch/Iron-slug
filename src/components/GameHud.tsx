import { HudSnapshot, WeaponType } from '../game/types';

interface GameHudProps {
  hud: HudSnapshot;
}

const WEAPON_LABELS: Record<WeaponType, { code: string; name: string }> = {
  pistol: { code: 'P', name: 'Pistol' },
  heavy_mg: { code: 'H', name: 'Heavy MG' },
  shotgun: { code: 'S', name: 'Shotgun' },
  rocket: { code: 'R', name: 'Rocket' },
  flame: { code: 'F', name: 'Flame' },
};

export function GameHud({ hud }: GameHudProps) {
  const hpPct = Math.max(0, Math.min(100, (hud.hp / Math.max(1, hud.maxHp)) * 100));
  const tankPct = hud.tankMaxHp > 0 ? Math.max(0, Math.min(100, (hud.tankHp / hud.tankMaxHp) * 100)) : 0;
  const weaponInfo = WEAPON_LABELS[hud.weapon];

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-4 select-none">
      {/* Top Unobtrusive Arcade HUD Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Player Health, Lives, Weapon, Grenades */}
        <div className="flex flex-col gap-1.5 bg-[#0B0E13]/85 border border-slate-700/80 rounded-md px-3 py-2 min-w-[210px]">
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-white">
              HP <span className="font-mono-tabular text-amber-400">{hud.hp}/{hud.maxHp}</span>
            </span>
            <span className="font-mono-tabular text-slate-300">Lives ×{hud.lives}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-sm overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                hpPct > 50 ? 'bg-emerald-500' : hpPct > 25 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${hpPct}%` }}
            />
          </div>

          {hud.inTank && (
            <div className="flex flex-col gap-1 pt-0.5">
              <div className="flex items-center justify-between text-[11px] text-lime-400 font-medium">
                <span>Iron Slug Armor</span>
                <span className="font-mono-tabular">
                  {hud.tankHp}/{hud.tankMaxHp}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-lime-400 transition-all duration-150"
                  style={{ width: `${tankPct}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-[11px] text-slate-300 pt-0.5 font-mono-tabular">
            <span>
              [{weaponInfo.code}] {weaponInfo.name}:{' '}
              <strong className="text-amber-300">{hud.ammo < 0 ? 'INF' : hud.ammo}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Grenades: <strong className="text-lime-300">{hud.grenades}</strong>
            </span>
          </div>
        </div>

        {/* Center Mission Banner */}
        {hud.bannerText && (
          <div className="hidden sm:flex items-center justify-center bg-[#0B0E13]/90 border border-amber-500/70 rounded-md px-4 py-1.5 shadow-lg">
            <span className="font-display text-sm sm:text-base font-bold tracking-wider text-amber-400">
              {hud.bannerText}
            </span>
          </div>
        )}

        {/* Right: Score, POWs, Timer */}
        <div className="flex flex-col items-end gap-1 bg-[#0B0E13]/85 border border-slate-700/80 rounded-md px-3 py-2">
          <div className="text-xs text-slate-400">
            Mission {hud.missionId} · {hud.missionName}
          </div>
          <div className="font-mono-tabular text-base sm:text-lg font-bold text-white leading-none">
            {hud.score.toString().padStart(7, '0')}
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-slate-300 font-mono-tabular">
            <span>POW {hud.powsRescued}</span>
            <span aria-hidden="true">·</span>
            <span className={hud.timeRemaining <= 25 ? 'text-red-400 font-bold' : ''}>
              Time {hud.timeRemaining}s
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Boss Health Bar */}
      {hud.boss && (
        <div className="mx-auto w-full max-w-lg bg-[#0B0E13]/90 border border-red-500/60 rounded-md px-3.5 py-2">
          <div className="flex items-center justify-between gap-3 text-xs mb-1">
            <span className="font-display font-bold tracking-wide text-red-400">
              {hud.boss.name}
            </span>
            <span className="text-slate-300 font-mono-tabular">
              Phase {hud.boss.phase} · {hud.boss.hp}/{hud.boss.maxHp}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-sm overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                hud.boss.phase === 2 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{
                width: `${Math.max(0, Math.min(100, (hud.boss.hp / Math.max(1, hud.boss.maxHp)) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
