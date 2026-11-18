export type GameScreenState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'MISSION_CLEAR'
  | 'CAMPAIGN_VICTORY'
  | 'GAME_OVER';

export type Difficulty = 'recruit' | 'veteran' | 'arcade';

export type WeaponType = 'pistol' | 'heavy_mg' | 'shotgun' | 'rocket' | 'flame';

export type PickupKind =
  | 'heavy_mg'
  | 'shotgun'
  | 'rocket'
  | 'flame'
  | 'grenade'
  | 'medkit'
  | 'medal';

export type EnemyKind =
  | 'rifleman'
  | 'bazooka'
  | 'shield'
  | 'paratrooper'
  | 'turret'
  | 'commando';

export type BossKind = 'gunship' | 'landship' | 'kraken';

export type ThemeBiome = 'harbor' | 'foundry' | 'citadel';

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  oneWay?: boolean;
  style?: 'dock' | 'steel' | 'bridge' | 'stone';
}

export interface CrateEntity {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  kind: 'wood' | 'steel' | 'barrel';
  drop?: PickupKind;
  hitFlash: number;
}

export interface PowEntity {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  state: 'tied' | 'freed' | 'saluting' | 'running_away';
  timer: number;
  drop: PickupKind;
  facing: 1 | -1;
}

export interface PickupEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  kind: PickupKind;
  life: number;
  bobPhase: number;
}

export interface EnemyEntity {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  onGround: boolean;
  shootCooldown: number;
  stateTimer: number;
  animTime: number;
  hitFlash: number;
  shieldUp?: boolean;
  patrolMinX?: number;
  patrolMaxX?: number;
  chuteOpen?: boolean;
  spawned?: boolean;
}

export interface BossEntity {
  kind: BossKind;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  phase: 1 | 2;
  state:
    | 'entering'
    | 'idle'
    | 'attack_a'
    | 'attack_b'
    | 'attack_c'
    | 'charging'
    | 'dying';
  stateTimer: number;
  attackCooldown: number;
  subTimer: number;
  hitFlash: number;
  facing: 1 | -1;
  hoverPhase: number;
  targetX: number;
  targetY: number;
  laserActive: boolean;
  laserAngle: number;
  warningX: number | null;
}

export interface SlugTank {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  onGround: boolean;
  turretAngle: number;
  cannonCooldown: number;
  vulcanCooldown: number;
  treadPhase: number;
  hitFlash: number;
  occupied: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  lives: number;
  facing: 1 | -1;
  onGround: boolean;
  crouching: boolean;
  aimDir: 'forward' | 'up' | 'down' | 'diag_up' | 'diag_down';
  weapon: WeaponType;
  ammo: number; // -1 for unlimited pistol
  grenades: number;
  fireCooldown: number;
  grenadeCooldown: number;
  meleeTimer: number;
  invulnTimer: number;
  hitFlash: number;
  animTime: number;
  coyoteTimer: number;
  jumpBuffer: number;
  recoilTimer: number;
  inTank: boolean;
  deadTimer: number;
}

export interface Projectile {
  id: number;
  fromPlayer: boolean;
  kind:
    | 'bullet'
    | 'heavy'
    | 'pellet'
    | 'rocket'
    | 'flame'
    | 'grenade'
    | 'tank_shell'
    | 'enemy_bullet'
    | 'enemy_rocket'
    | 'enemy_bomb'
    | 'boss_orb'
    | 'boss_missile';
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  damage: number;
  life: number;
  bounces?: number;
  pierce?: number;
  splashRadius?: number;
  smokeTimer?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
  kind: 'spark' | 'smoke' | 'fire' | 'casing' | 'debris' | 'slash' | 'ring';
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface EnemySpawnTrigger {
  triggerX: number;
  triggered: boolean;
  enemies: Array<{
    kind: EnemyKind;
    offsetX: number;
    y: number;
  }>;
}

export interface MissionConfig {
  id: number;
  name: string;
  subtitle: string;
  biome: ThemeBiome;
  length: number;
  bossArenaX: number;
  bossKind: BossKind;
  platforms: Platform[];
  crates: Array<Omit<CrateEntity, 'id' | 'maxHp' | 'hitFlash'>>;
  pows: Array<{ x: number; y: number; drop: PickupKind }>;
  triggers: EnemySpawnTrigger[];
  tankSpawn?: { x: number; y: number };
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  fire: boolean;
  grenade: boolean;
  grenadeJustPressed: boolean;
  tankToggleJustPressed: boolean;
}

export interface MissionStats {
  missionId: number;
  missionName: string;
  score: number;
  enemiesDefeated: number;
  powsRescued: number;
  totalPows: number;
  timeRemaining: number;
  shotsFired: number;
  shotsHit: number;
}

export interface HudSnapshot {
  missionId: number;
  missionName: string;
  score: number;
  highScore: number;
  hp: number;
  maxHp: number;
  lives: number;
  weapon: WeaponType;
  ammo: number;
  grenades: number;
  inTank: boolean;
  tankHp: number;
  tankMaxHp: number;
  powsRescued: number;
  timeRemaining: number;
  boss: {
    name: string;
    subtitle: string;
    hp: number;
    maxHp: number;
    phase: 1 | 2;
  } | null;
  bannerText: string | null;
  tankPrompt: boolean;
}
