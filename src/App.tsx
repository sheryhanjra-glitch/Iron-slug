import { useCallback, useEffect, useRef, useState } from 'react';
import { ControlsModal } from './components/ControlsModal';
import { GameHud } from './components/GameHud';
import { MissionOverlay } from './components/MissionOverlay';
import { TitleScreen } from './components/TitleScreen';
import { TouchControls } from './components/TouchControls';
import { IronSlugEngine } from './game/engine';
import { MISSIONS, VIEW_HEIGHT, VIEW_WIDTH } from './game/levels';
import { sound } from './game/sound';
import {
  Difficulty,
  GameScreenState,
  HudSnapshot,
  InputState,
  MissionStats,
} from './game/types';

const HIGH_SCORE_KEY = 'iron_slug_high_score';

function loadHighScore(): number {
  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number): void {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // Ignore storage quota/privacy restrictions
  }
}

function createEmptyInput(): InputState {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpJustPressed: false,
    fire: false,
    grenade: false,
    grenadeJustPressed: false,
    tankToggleJustPressed: false,
  };
}

export default function App() {
  const [screen, setScreen] = useState<GameScreenState>('TITLE_MENU');
  const [difficulty, setDifficulty] = useState<Difficulty>('veteran');
  const [selectedMission, setSelectedMission] = useState<number>(0);
  const [currentMission, setCurrentMission] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(loadHighScore);
  const [hud, setHud] = useState<HudSnapshot | null>(null);
  const [lastStats, setLastStats] = useState<MissionStats | null>(null);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(true);
  const [showTouchPad, setShowTouchPad] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<IronSlugEngine | null>(null);
  const inputRef = useRef<InputState>(createEmptyInput());
  const screenRef = useRef<GameScreenState>(screen);
  const highScoreRef = useRef<number>(highScore);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  const startMission = useCallback(
    (missionIdx: number, carryScore: number = 0) => {
      sound.unlock();
      inputRef.current = createEmptyInput();
      setCurrentMission(missionIdx);
      setLastStats(null);

      const engine = new IronSlugEngine(
        missionIdx,
        difficulty,
        carryScore,
        highScoreRef.current,
        {
          onMissionClear: (stats) => {
            if (stats.score > highScoreRef.current) {
              setHighScore(stats.score);
              saveHighScore(stats.score);
            }
            setLastStats(stats);
            if (missionIdx >= MISSIONS.length - 1) {
              setScreen('CAMPAIGN_VICTORY');
            } else {
              setScreen('MISSION_CLEAR');
            }
          },
          onGameOver: (stats) => {
            if (stats.score > highScoreRef.current) {
              setHighScore(stats.score);
              saveHighScore(stats.score);
            }
            setLastStats(stats);
            setScreen('GAME_OVER');
          },
        }
      );

      engineRef.current = engine;
      setHud(engine.getHudSnapshot());
      setScreen('PLAYING');
      sound.startBgm('normal');
    },
    [difficulty]
  );

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
    if (!next && screenRef.current === 'PLAYING' && bgmEnabled) {
      sound.startBgm('normal');
    }
  };

  const handleToggleBgm = () => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    sound.setBgmEnabled(next);
    if (next && !muted && screenRef.current === 'PLAYING') {
      sound.startBgm('normal');
    }
  };

  const handlePauseToggle = useCallback(() => {
    if (screenRef.current === 'PLAYING') {
      sound.stopBgm();
      setScreen('PAUSED');
    } else if (screenRef.current === 'PAUSED') {
      setScreen('PLAYING');
      if (!muted && bgmEnabled) {
        sound.startBgm('normal');
      }
    }
  }, [bgmEnabled, muted]);

  const handleMainMenu = useCallback(() => {
    sound.stopBgm();
    engineRef.current = null;
    inputRef.current = createEmptyInput();
    setHud(null);
    setScreen('TITLE_MENU');
  }, []);

  // Keyboard bindings
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const activeScreen = screenRef.current;

      if (code === 'KeyP' || code === 'Escape') {
        if (showControls) {
          setShowControls(false);
          return;
        }
        if (activeScreen === 'PLAYING' || activeScreen === 'PAUSED') {
          e.preventDefault();
          handlePauseToggle();
          return;
        }
      }

      if (activeScreen !== 'PLAYING') return;

      if (
        code === 'Space' ||
        code === 'ArrowUp' ||
        code === 'ArrowDown' ||
        code === 'ArrowLeft' ||
        code === 'ArrowRight'
      ) {
        e.preventDefault();
      }

      const inp = inputRef.current;
      if (code === 'KeyA' || code === 'ArrowLeft') inp.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') inp.right = true;
      if (code === 'KeyW' || code === 'ArrowUp') inp.up = true;
      if (code === 'KeyS' || code === 'ArrowDown') inp.down = true;
      if (code === 'KeyK' || code === 'KeyZ' || code === 'Space') {
        if (!inp.jump) inp.jumpJustPressed = true;
        inp.jump = true;
      }
      if (code === 'KeyJ' || code === 'KeyX') inp.fire = true;
      if (code === 'KeyL' || code === 'KeyC') {
        if (!inp.grenade) inp.grenadeJustPressed = true;
        inp.grenade = true;
      }
      if (code === 'KeyE' || code === 'ShiftLeft' || code === 'ShiftRight') {
        if (!e.repeat) inp.tankToggleJustPressed = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const inp = inputRef.current;
      if (code === 'KeyA' || code === 'ArrowLeft') inp.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') inp.right = false;
      if (code === 'KeyW' || code === 'ArrowUp') inp.up = false;
      if (code === 'KeyS' || code === 'ArrowDown') inp.down = false;
      if (code === 'KeyK' || code === 'KeyZ' || code === 'Space') inp.jump = false;
      if (code === 'KeyJ' || code === 'KeyX') inp.fire = false;
      if (code === 'KeyL' || code === 'KeyC') inp.grenade = false;
    };

    const onBlur = () => {
      inputRef.current = createEmptyInput();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [handlePauseToggle, showControls]);

  // Fixed-timestep arcade loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let accumulator = 0;
    let hudTick = 0;
    const STEP = 1 / 60;

    const frame = (now: number) => {
      const elapsed = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const engine = engineRef.current;
      const canvas = canvasRef.current;

      if (engine && canvas) {
        if (screenRef.current === 'PLAYING') {
          accumulator += elapsed;
          while (accumulator >= STEP) {
            engine.update(STEP, inputRef.current);
            inputRef.current.jumpJustPressed = false;
            inputRef.current.grenadeJustPressed = false;
            inputRef.current.tankToggleJustPressed = false;
            accumulator -= STEP;
          }

          hudTick += elapsed;
          if (hudTick >= 0.06) {
            hudTick = 0;
            const snap = engine.getHudSnapshot();
            setHud(snap);
            if (snap.highScore > highScoreRef.current) {
              setHighScore(snap.highScore);
              saveHighScore(snap.highScore);
            }
          }
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          engine.render(ctx);
        }
      }

      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      sound.stopBgm();
    };
  }, []);

  const handleTouchControlChange = (key: keyof InputState, active: boolean) => {
    inputRef.current[key] = active;
  };

  const handleTouchPulse = (key: 'jumpJustPressed' | 'grenadeJustPressed' | 'tankToggleJustPressed') => {
    inputRef.current[key] = true;
  };

  return (
    <div className="min-h-screen bg-[#0B0E13] text-slate-100 flex flex-col">
      {/* 3-Zone Top Bar */}
      <header className="w-full border-b border-slate-800/90 bg-[#0E1219]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleMainMenu();
            }}
            className="font-display text-lg font-bold tracking-wider text-white whitespace-nowrap shrink-0"
          >
            IRON SLUG
          </a>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              type="button"
              onClick={() => setShowControls(true)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Controls
            </button>
            <button
              type="button"
              onClick={handleToggleMute}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {muted ? 'Audio: Off' : 'Audio: On'}
            </button>
            <button
              type="button"
              onClick={handleToggleBgm}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {bgmEnabled ? 'Music: On' : 'Music: Off'}
            </button>
            <button
              type="button"
              onClick={() => setShowTouchPad((prev) => !prev)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {showTouchPad ? 'Hide Touch Pad' : 'Touch Pad'}
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {screen === 'TITLE_MENU' ? (
              <button
                type="button"
                onClick={() => startMission(selectedMission, 0)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Start Mission
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseToggle}
                className="px-4 py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {screen === 'PAUSED' ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Centered Arcade Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-5 sm:py-6">
        <div className="w-full max-w-[1160px] flex flex-col">
          {/* Arcade Bezel Frame */}
          <div className="relative w-full aspect-video bg-[#090C11] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            {screen === 'TITLE_MENU' ? (
              <TitleScreen
                difficulty={difficulty}
                selectedMission={selectedMission}
                highScore={highScore}
                onSelectDifficulty={setDifficulty}
                onSelectMission={setSelectedMission}
                onStart={() => startMission(selectedMission, 0)}
                onOpenControls={() => setShowControls(true)}
              />
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  width={VIEW_WIDTH}
                  height={VIEW_HEIGHT}
                  onMouseDown={(e) => {
                    if (screenRef.current !== 'PLAYING') return;
                    if (e.button === 0) inputRef.current.fire = true;
                    if (e.button === 2) {
                      inputRef.current.grenade = true;
                      inputRef.current.grenadeJustPressed = true;
                    }
                  }}
                  onMouseUp={(e) => {
                    if (e.button === 0) inputRef.current.fire = false;
                    if (e.button === 2) inputRef.current.grenade = false;
                  }}
                  onMouseLeave={() => {
                    inputRef.current.fire = false;
                    inputRef.current.grenade = false;
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full block pixelated"
                />

                {hud && <GameHud hud={hud} />}

                {screen !== 'PLAYING' && (
                  <MissionOverlay
                    screen={screen}
                    stats={lastStats}
                    highScore={highScore}
                    onResume={handlePauseToggle}
                    onNextMission={() =>
                      startMission(currentMission + 1, lastStats?.score ?? 0)
                    }
                    onRestart={() => startMission(currentMission, 0)}
                    onMainMenu={handleMainMenu}
                  />
                )}
              </>
            )}
          </div>

          {/* Optional On-Screen Touch / Pointer Controls */}
          {showTouchPad && screen === 'PLAYING' && (
            <TouchControls
              onControlChange={handleTouchControlChange}
              onPulseAction={handleTouchPulse}
              tankAvailable={Boolean(hud?.tankPrompt || hud?.inTank)}
            />
          )}

          {/* Compact Footer Strip */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span>Move: A/D or Arrows</span>
              <span aria-hidden="true">·</span>
              <span>Aim Up / Crouch: W/S</span>
              <span aria-hidden="true">·</span>
              <span>Jump: Space / K</span>
              <span aria-hidden="true">·</span>
              <span>Fire: J / Click</span>
              <span aria-hidden="true">·</span>
              <span>Grenade: L / Right-Click</span>
              <span aria-hidden="true">·</span>
              <span>Tank: E</span>
            </div>
            <div className="sm:hidden flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowControls(true)}
                className="text-slate-300 hover:text-white underline cursor-pointer"
              >
                Controls
              </button>
              <button
                type="button"
                onClick={handleToggleMute}
                className="text-slate-300 hover:text-white underline cursor-pointer"
              >
                {muted ? 'Unmute' : 'Mute'}
              </button>
              <button
                type="button"
                onClick={() => setShowTouchPad((prev) => !prev)}
                className="text-slate-300 hover:text-white underline cursor-pointer"
              >
                {showTouchPad ? 'Hide Pad' : 'Touch Pad'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
    </div>
  );
}
