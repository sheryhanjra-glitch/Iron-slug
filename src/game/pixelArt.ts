import { PickupKind } from './types';

type Palette = Record<string, string>;

const spriteCache = new Map<string, HTMLCanvasElement>();

function bakeSprite(
  key: string,
  rows: string[],
  palette: Palette,
  whiteSilhouette: boolean = false
): HTMLCanvasElement {
  const cacheKey = whiteSilhouette ? `${key}_white` : key;
  const existing = spriteCache.get(cacheKey);
  if (existing) return existing;

  const h = rows.length;
  const w = rows[0]?.length ?? 1;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    for (let y = 0; y < h; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        const color = palette[ch];
        if (!color) continue;
        ctx.fillStyle = whiteSilhouette ? '#ffffff' : color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  spriteCache.set(cacheKey, canvas);
  return canvas;
}

const HERO_PALETTE: Palette = {
  K: '#14110f', // outline black
  R: '#dc2626', // red headband
  r: '#991b1b', // dark headband
  S: '#f1c27d', // skin light
  s: '#c68642', // skin shadow
  H: '#452719', // hair
  V: '#334155', // tactical vest
  v: '#1e293b', // vest shadow
  G: '#4d7c0f', // camo pants
  g: '#365314', // camo shadow
  B: '#3f2e21', // boots
  M: '#94a3b8', // gun metal light
  m: '#475569', // gun metal dark
  Y: '#f59e0b', // brass / buckle
};

const HERO_IDLE: string[] = [
  '.....KKKKKK.........',
  '....KHHHHHHK........',
  '...KRRRRRRRRK.......',
  '..KrKSSSSSSK........',
  '..K.KSHKSSKSK.......',
  '....KSSSSSSK........',
  '.....KssssK.........',
  '...KKKVVVVKKK.......',
  '..KSSVVVVVVSSK......',
  '..KssVVYYVVssKmmmm..',
  '...KKVVVVVVKKMMMMMK.',
  '....KVVVVVVmKmmmmK..',
  '....KGGGGGGK........',
  '....KGGKKGGK........',
  '....KggKKggK........',
  '....KGGKKGGK........',
  '....KGGKKGGK........',
  '....KBBKKBBK........',
  '...KBBBKKBBBK.......',
  '...KKKKKKKKKK.......',
];

const HERO_RUN_1: string[] = [
  '.....KKKKKK.........',
  '....KHHHHHHK........',
  '...KRRRRRRRRK.......',
  '.KrrKSSSSSSK........',
  '.K..KSHKSSKSK.......',
  '....KSSSSSSK........',
  '.....KssssK.........',
  '...KKKVVVVKKK.......',
  '..KSSVVVVVVSSK......',
  '..KssVVYYVVssKmmmm..',
  '...KKVVVVVVKKMMMMMK.',
  '....KVVVVVVmKmmmmK..',
  '....KGGGGGGK........',
  '...KGGGK.KGGK.......',
  '..KGGGk...KggK......',
  '..KBBK.....KBBK.....',
  '.KBBBK......KBBBK...',
  '.KKKKK......KKKKK...',
  '....................',
  '....................',
];

const HERO_RUN_2: string[] = [
  '....................',
  '.....KKKKKK.........',
  '....KHHHHHHK........',
  '...KRRRRRRRRK.......',
  '.KrrKSSSSSSK........',
  '....KSHKSSKSK.......',
  '....KSSSSSSK........',
  '.....KssssK.........',
  '...KKKVVVVKKK.......',
  '..KSSVVVVVVSSK......',
  '..KssVVYYVVssKmmmm..',
  '...KKVVVVVVKKMMMMMK.',
  '....KVVVVVVmKmmmmK..',
  '....KGGGGGGK........',
  '....KGGGGGGK........',
  '....KggKKGGK........',
  '....KBBKKBBK........',
  '...KBBBK.KBBK.......',
  '...KKKKK..KKK.......',
  '....................',
];

const HERO_RUN_3: string[] = [
  '.....KKKKKK.........',
  '....KHHHHHHK........',
  '...KRRRRRRRRK.......',
  '..KrKSSSSSSK........',
  '....KSHKSSKSK.......',
  '....KSSSSSSK........',
  '.....KssssK.........',
  '...KKKVVVVKKK.......',
  '..KSSVVVVVVSSK......',
  '..KssVVYYVVssKmmmm..',
  '...KKVVVVVVKKMMMMMK.',
  '....KVVVVVVmKmmmmK..',
  '....KGGGGGGK........',
  '....KGGKKGGGK.......',
  '...KggK..KGGGk......',
  '...KBBK...KBBK......',
  '..KBBBK....KBBBK....',
  '..KKKKK....KKKKK....',
  '....................',
  '....................',
];

const HERO_CROUCH: string[] = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '.....KKKKKK.........',
  '....KHHHHHHK........',
  '...KRRRRRRRRK.......',
  '..KrKSSSSSSK........',
  '....KSHKSSKSK.......',
  '....KSSSSSSK........',
  '...KKKVVVVKKK.......',
  '..KSSVVYYVVSSKmmmm..',
  '...KKVVVVVVKKMMMMMK.',
  '...KGGGGGGGGmKmmmmK.',
  '..KGGGKKKKGGGK......',
  '..KBBBK..KBBBK......',
  '..KKKKK..KKKKK......',
  '....................',
  '....................',
];

const HERO_AIM_UP: string[] = [
  '.........KK.........',
  '........KMMK........',
  '........KMMK........',
  '.....KKKKmmK........',
  '....KHHHHHHK........',
  '...KRRRRRRRRK.......',
  '..KrKSSSSSSK........',
  '....KSHKSSKSK.......',
  '....KSSSSSSK........',
  '.....KssssK.........',
  '...KKKVVVVKKK.......',
  '..KSSVVVVVVSSK......',
  '..KssVVYYVVssK......',
  '...KKVVVVVVKK.......',
  '....KGGGGGGK........',
  '....KGGKKGGK........',
  '....KggKKggK........',
  '....KBBKKBBK........',
  '...KBBBKKBBBK.......',
  '...KKKKKKKKKK.......',
];

const HERO_JUMP: string[] = [
  '.....KKKKKK.........',
  '....KHHHHHHK........',
  '...KRRRRRRRRK.......',
  '.KrrKSSSSSSK........',
  '....KSHKSSKSK.......',
  '....KSSSSSSK........',
  '.....KssssK.........',
  '...KKKVVVVKKK.......',
  '..KSSVVVVVVSSK......',
  '..KssVVYYVVssKmmmm..',
  '...KKVVVVVVKKMMMMMK.',
  '....KGGGGGGKmKmmmmK.',
  '...KGGGK.KGGK.......',
  '...KBBK...KBBK......',
  '..KBBBK...KBBBK.....',
  '..KKKKK...KKKKK.....',
  '....................',
  '....................',
  '....................',
  '....................',
];

const ENEMY_PALETTE: Palette = {
  K: '#111317',
  H: '#4b5563', // steel helmet
  h: '#374151',
  O: '#f97316', // orange visor
  R: '#dc2626', // red beret / trim
  S: '#d6a57a',
  U: '#52525b', // uniform
  u: '#3f3f46',
  B: '#27272a', // boots
  M: '#94a3b8', // weapon metal
  m: '#475569',
  Y: '#eab308', // gold/ammo
  W: '#cbd5e1', // shield highlight
};

const RIFLEMAN_1: string[] = [
  '....KKKKKK........',
  '...KHHHHHHK.......',
  '..KHHHHHHHHK......',
  '..KhhKOOSSK.......',
  '...KKSSSSSK.......',
  '....KKUUUUk.......',
  '...KUUUUUUUK......',
  '..KSSUUUUUSSKmmm..',
  '..KssUUYYUUsKMMMK.',
  '...KKUUUUUUKKmmmK.',
  '....KuuuuuuK......',
  '....KuuKKuuK......',
  '....KuuKKuuK......',
  '....KBBKKBBK......',
  '...KBBBKKBBBK.....',
  '...KKKKKKKKKK.....',
];

const RIFLEMAN_2: string[] = [
  '....KKKKKK........',
  '...KHHHHHHK.......',
  '..KHHHHHHHHK......',
  '..KhhKOOSSK.......',
  '...KKSSSSSK.......',
  '....KKUUUUk.......',
  '...KUUUUUUUK......',
  '..KSSUUUUUSSKmmm..',
  '..KssUUYYUUsKMMMK.',
  '...KKUUUUUUKKmmmK.',
  '....KuuuuuuK......',
  '...KuuK..KuuK.....',
  '..KBBK....KBBK....',
  '.KBBBK....KBBBK...',
  '.KKKKK....KKKKK...',
  '..................',
];

const BAZOOKA_1: string[] = [
  '...KKKKKK.........',
  '..KHHHHHHK........',
  '.KHHHHHHHHK..KKKKK',
  '.KhhKOOSSK.KKmmmmK',
  '..KKSSSSSKKMMMMMMK',
  '..KKUUUUUKmmmmmmmK',
  '.KYYUUUUUKKKKKKKK.',
  '.KYYUUUUUUSSK.....',
  '..KKUUUUUUKK......',
  '...KuuuuuuK.......',
  '...KuuKKuuK.......',
  '...KuuKKuuK.......',
  '...KBBKKBBK.......',
  '..KBBBKKBBBK......',
  '..KKKKKKKKKK......',
  '..................',
];

const SHIELD_1: string[] = [
  '...KKKKKK...KKKK..',
  '..KHHHHHHK..KWWK..',
  '.KHHHHHHHHK.KWMK..',
  '.KhhKOOSSK..KWMK..',
  '..KKSSSSSK..KWMK..',
  '..KKUUUUUK..KWMK..',
  '.KUUUUUUUUK.KWMK..',
  '.KSSUUUUSSK.KWMK..',
  '..KKUUUUUUK.KWMK..',
  '...KuuuuuuK.KWMK..',
  '...KuuKKuuK.KWMK..',
  '...KuuKKuuK.KWMK..',
  '...KBBKKBBK.KmmK..',
  '..KBBBKKBBBK.KK...',
  '..KKKKKKKKKK......',
  '..................',
];

const COMMANDO_1: string[] = [
  '....KKKKKK........',
  '...KRRRRRRK.......',
  '..KRRRRRRRRK......',
  '..KrrKOOSSK.......',
  '...KKSSSSSK.......',
  '....KKBBBBK.......',
  '...KBBBBBBBK......',
  '..KSSBBYYBBSSKmm..',
  '..KssBBBBBBsKMMMK.',
  '...KKBBBBBBKKmmmK.',
  '....KuuuuuuK......',
  '....KuuKKuuK......',
  '....KBBKKBBK......',
  '...KBBBKKBBBK.....',
  '...KKKKKKKKKK.....',
  '..................',
];

const POW_PALETTE: Palette = {
  K: '#111317',
  H: '#d4d4d8', // scruffy hair/beard
  S: '#f1c27d',
  s: '#c68642',
  T: '#d6d3d1', // tattered clothes
  t: '#a8a29e',
  R: '#b45309', // rope
};

const POW_TIED: string[] = [
  '....KKKKKK......',
  '...KHHHHHHK.....',
  '...KHSSSSHK.....',
  '...KHSSKSHK.....',
  '....KHHHHK......',
  '...KKTTTTKK.....',
  '..KTTTTTTTTK....',
  '..KRRRRRRRRK....',
  '..KTTTTTTTTK....',
  '..KRRRRRRRRK....',
  '...KttttttK.....',
  '...KttKKttK.....',
  '...KttKKttK.....',
  '..KssK..KssK....',
  '..KKKK..KKKK....',
];

const POW_SALUTE: string[] = [
  '....KKKKKK......',
  '...KHHHHHHK.....',
  '...KHSSSSHK..KK.',
  '...KHSSKSHK.KSSK',
  '....KHHHHK..KTTK',
  '...KKTTTTKK.KTTK',
  '..KTTTTTTTTKKK..',
  '..KTTKTTTTTK....',
  '..KSSKTTTTTK....',
  '...KKttttttK....',
  '....KttKKttK....',
  '....KttKKttK....',
  '....KssKKssK....',
  '...KsssKKsssK...',
  '...KKKKKKKKKK...',
];

const TANK_PALETTE: Palette = {
  K: '#0f172a',
  O: '#65a30d', // olive green bright
  o: '#4d7c0f', // olive mid
  D: '#365314', // olive dark
  M: '#94a3b8', // steel
  m: '#475569',
  d: '#1e293b', // dark tread
  Y: '#facc15', // headlight
  R: '#ef4444', // emblem
  W: '#38bdf8', // viewport
};

const TANK_BODY: string[] = [
  '..........KKKKKKKKKKKK..............',
  '.........KOOOOOOOOOOOOOK............',
  '........KOOWWOOOOOROOOOOK...........',
  '.......KOOOOOOOOOOOOOOOOOKKKKKKKKKK.',
  '.......KoooooooooooooooooKMMMMMMMMK.',
  '......KDDDDDDDDDDDDDDDDDDKmmmmmmmmK.',
  '..KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK..',
  '.KOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOYYK.',
  'KooooooooooooooooooooooooooooooooooK',
  'KDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDK',
  '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
  '.KddMmmddMmmddMmmddMmmddMmmddMmmddK.',
  '.KmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmK.',
  '..KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK..',
];

export function getHeroSprite(
  pose: 'idle' | 'run1' | 'run2' | 'run3' | 'jump' | 'crouch' | 'aim_up',
  whiteFlash: boolean = false
): HTMLCanvasElement {
  switch (pose) {
    case 'run1':
      return bakeSprite('hero_run1', HERO_RUN_1, HERO_PALETTE, whiteFlash);
    case 'run2':
      return bakeSprite('hero_run2', HERO_RUN_2, HERO_PALETTE, whiteFlash);
    case 'run3':
      return bakeSprite('hero_run3', HERO_RUN_3, HERO_PALETTE, whiteFlash);
    case 'jump':
      return bakeSprite('hero_jump', HERO_JUMP, HERO_PALETTE, whiteFlash);
    case 'crouch':
      return bakeSprite('hero_crouch', HERO_CROUCH, HERO_PALETTE, whiteFlash);
    case 'aim_up':
      return bakeSprite('hero_aim_up', HERO_AIM_UP, HERO_PALETTE, whiteFlash);
    default:
      return bakeSprite('hero_idle', HERO_IDLE, HERO_PALETTE, whiteFlash);
  }
}

export function getEnemySprite(
  kind: 'rifleman' | 'bazooka' | 'shield' | 'commando' | 'paratrooper',
  frame: number,
  whiteFlash: boolean = false
): HTMLCanvasElement {
  if (kind === 'bazooka') {
    return bakeSprite('enemy_bazooka', BAZOOKA_1, ENEMY_PALETTE, whiteFlash);
  }
  if (kind === 'shield') {
    return bakeSprite('enemy_shield', SHIELD_1, ENEMY_PALETTE, whiteFlash);
  }
  if (kind === 'commando') {
    return bakeSprite('enemy_commando', COMMANDO_1, ENEMY_PALETTE, whiteFlash);
  }
  if (frame % 2 === 1) {
    return bakeSprite('enemy_rifle2', RIFLEMAN_2, ENEMY_PALETTE, whiteFlash);
  }
  return bakeSprite('enemy_rifle1', RIFLEMAN_1, ENEMY_PALETTE, whiteFlash);
}

export function getPowSprite(state: 'tied' | 'salute'): HTMLCanvasElement {
  if (state === 'tied') {
    return bakeSprite('pow_tied', POW_TIED, POW_PALETTE);
  }
  return bakeSprite('pow_salute', POW_SALUTE, POW_PALETTE);
}

export function getTankSprite(whiteFlash: boolean = false): HTMLCanvasElement {
  return bakeSprite('slug_tank', TANK_BODY, TANK_PALETTE, whiteFlash);
}

export function drawCrateSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  kind: 'wood' | 'steel' | 'barrel',
  hitFlash: number
): void {
  const px = Math.round(x);
  const py = Math.round(y);
  ctx.save();
  if (hitFlash > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px, py, w, h);
    ctx.restore();
    return;
  }

  if (kind === 'barrel') {
    ctx.fillStyle = '#111827';
    ctx.fillRect(px, py, w, h);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(px + 1, py + 1, w - 2, h - 2);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(px + 2, py + 2, 3, h - 4);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(px + 1, py + 5, w - 2, 2);
    ctx.fillRect(px + 1, py + h - 7, w - 2, 2);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(px + 4, py + Math.floor(h / 2) - 2, w - 8, 4);
  } else if (kind === 'steel') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px, py, w, h);
    ctx.fillStyle = '#475569';
    ctx.fillRect(px + 1, py + 1, w - 2, h - 2);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(px + 2, py + 2, w - 4, 2);
    ctx.fillRect(px + 2, py + 2, 2, h - 4);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(px + 4, py + 4, w - 8, h - 8);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(px + 6, py + 6, 4, 4);
  } else {
    // Wooden crate
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(px, py, w, h);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(px + 1, py + 1, w - 2, h - 2);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(px + 2, py + 2, w - 4, h - 4);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px + 2, py + Math.floor(h / 2) - 1, w - 4, 2);
    // Diagonal brace
    for (let i = 3; i < w - 3; i++) {
      ctx.fillRect(px + i, py + i, 2, 2);
    }
    ctx.fillStyle = '#d97706';
    ctx.fillRect(px + 2, py + 2, w - 4, 1);
  }
  ctx.restore();
}

export function drawPickupSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: PickupKind,
  time: number
): void {
  const px = Math.round(x);
  const py = Math.round(y);
  const pulse = Math.sin(time * 8) > 0;

  ctx.save();
  if (kind === 'medal') {
    ctx.fillStyle = '#111827';
    ctx.fillRect(px + 1, py + 1, 10, 10);
    ctx.fillStyle = pulse ? '#fde047' : '#f59e0b';
    ctx.fillRect(px + 2, py + 2, 8, 8);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(px + 4, py, 4, 3);
    ctx.restore();
    return;
  }

  // Classic Metal Slug weapon/item box
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(px, py, 14, 14);

  let boxColor = '#f59e0b';
  let letter = 'H';
  let textColor = '#0f172a';

  switch (kind) {
    case 'heavy_mg':
      boxColor = pulse ? '#fbbf24' : '#f59e0b';
      letter = 'H';
      break;
    case 'shotgun':
      boxColor = pulse ? '#ef4444' : '#dc2626';
      letter = 'S';
      textColor = '#ffffff';
      break;
    case 'rocket':
      boxColor = pulse ? '#38bdf8' : '#0284c7';
      letter = 'R';
      textColor = '#ffffff';
      break;
    case 'flame':
      boxColor = pulse ? '#fb923c' : '#ea580c';
      letter = 'F';
      textColor = '#ffffff';
      break;
    case 'grenade':
      boxColor = '#4d7c0f';
      letter = 'G';
      textColor = '#fef08a';
      break;
    case 'medkit':
      boxColor = '#f8fafc';
      letter = '+';
      textColor = '#dc2626';
      break;
  }

  ctx.fillStyle = '#64748b';
  ctx.fillRect(px + 1, py + 1, 12, 12);
  ctx.fillStyle = boxColor;
  ctx.fillRect(px + 2, py + 2, 10, 10);

  // Crisp 5x7 pixel letter inside pickup box
  ctx.fillStyle = textColor;
  const cx = px + 5;
  const cy = py + 4;
  if (letter === 'H') {
    ctx.fillRect(cx, cy, 1, 6);
    ctx.fillRect(cx + 3, cy, 1, 6);
    ctx.fillRect(cx, cy + 2, 4, 1);
  } else if (letter === 'S') {
    ctx.fillRect(cx, cy, 4, 1);
    ctx.fillRect(cx, cy + 1, 1, 2);
    ctx.fillRect(cx, cy + 2, 4, 1);
    ctx.fillRect(cx + 3, cy + 3, 1, 2);
    ctx.fillRect(cx, cy + 5, 4, 1);
  } else if (letter === 'R') {
    ctx.fillRect(cx, cy, 1, 6);
    ctx.fillRect(cx, cy, 3, 1);
    ctx.fillRect(cx + 3, cy + 1, 1, 1);
    ctx.fillRect(cx, cy + 2, 3, 1);
    ctx.fillRect(cx + 2, cy + 3, 1, 1);
    ctx.fillRect(cx + 3, cy + 4, 1, 2);
  } else if (letter === 'F') {
    ctx.fillRect(cx, cy, 1, 6);
    ctx.fillRect(cx, cy, 4, 1);
    ctx.fillRect(cx, cy + 2, 3, 1);
  } else if (letter === 'G') {
    ctx.fillRect(cx + 1, cy, 3, 1);
    ctx.fillRect(cx, cy + 1, 1, 4);
    ctx.fillRect(cx + 1, cy + 5, 3, 1);
    ctx.fillRect(cx + 3, cy + 3, 1, 2);
    ctx.fillRect(cx + 2, cy + 3, 2, 1);
  } else if (letter === '+') {
    ctx.fillRect(cx + 1, cy, 2, 6);
    ctx.fillRect(cx - 1, cy + 2, 6, 2);
  }

  ctx.restore();
}

export function drawBossGunship(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  phase: 1 | 2,
  hitFlash: number
): void {
  const px = Math.round(x);
  const py = Math.round(y);
  ctx.save();

  const flash = hitFlash > 0;
  const olive = flash ? '#ffffff' : phase === 2 ? '#7c2d12' : '#3f6212';
  const oliveLight = flash ? '#ffffff' : phase === 2 ? '#c2410c' : '#65a30d';
  const dark = flash ? '#ffffff' : '#1e293b';
  const metal = flash ? '#ffffff' : '#64748b';

  // Animated twin rotor blades on top
  const bladeSpan = Math.sin(time * 45) > 0 ? 48 : 24;
  ctx.fillStyle = flash ? '#ffffff' : '#0f172a';
  ctx.fillRect(px + 26, py - 6, 6, 6);
  ctx.fillRect(px + w - 32, py - 6, 6, 6);
  ctx.fillStyle = flash ? '#ffffff' : '#cbd5e1';
  ctx.fillRect(px + 29 - bladeSpan / 2, py - 8, bladeSpan, 2);
  ctx.fillRect(px + w - 29 - bladeSpan / 2, py - 8, bladeSpan, 2);

  // Main fuselage outline
  ctx.fillStyle = flash ? '#ffffff' : '#090d14';
  ctx.fillRect(px + 8, py + 4, w - 16, h - 12);

  // Armored body
  ctx.fillStyle = olive;
  ctx.fillRect(px + 10, py + 6, w - 20, h - 16);
  ctx.fillStyle = oliveLight;
  ctx.fillRect(px + 14, py + 8, w - 36, 8);

  // Heavy stub wings + missile pods
  ctx.fillStyle = dark;
  ctx.fillRect(px, py + 16, w, 10);
  ctx.fillStyle = metal;
  ctx.fillRect(px + 2, py + 18, 18, 6);
  ctx.fillRect(px + w - 20, py + 18, 18, 6);

  // Glowing missile tips
  ctx.fillStyle = flash ? '#ffffff' : '#ef4444';
  ctx.fillRect(px + 2, py + 24, 4, 4);
  ctx.fillRect(px + 10, py + 24, 4, 4);
  ctx.fillRect(px + w - 14, py + 24, 4, 4);
  ctx.fillRect(px + w - 6, py + 24, 4, 4);

  // Armored cockpit visor
  ctx.fillStyle = flash ? '#ffffff' : '#0f172a';
  ctx.fillRect(px + 12, py + 14, 24, 12);
  ctx.fillStyle = flash ? '#ffffff' : phase === 2 ? '#ef4444' : '#38bdf8';
  ctx.fillRect(px + 14, py + 16, 18, 8);
  ctx.fillStyle = flash ? '#ffffff' : '#e0f2fe';
  ctx.fillRect(px + 16, py + 17, 6, 2);

  // Ventral gatling turret + exhaust thrusters
  ctx.fillStyle = dark;
  ctx.fillRect(px + 34, py + h - 12, 24, 10);
  ctx.fillStyle = metal;
  ctx.fillRect(px + 22, py + h - 8, 14, 4);

  // Thruster flames
  const flameLen = 6 + Math.floor(Math.sin(time * 30) * 3 + 3);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(px + w - 12, py + 12, flameLen, 6);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(px + w - 12, py + 14, Math.max(2, flameLen - 3), 2);

  // Phase 2 smoke damage glow
  if (phase === 2 && !flash) {
    ctx.fillStyle = Math.sin(time * 20) > 0 ? '#f59e0b' : '#dc2626';
    ctx.fillRect(px + 50, py + 14, 14, 6);
  }

  ctx.restore();
}

export function drawBossLandship(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  phase: 1 | 2,
  hitFlash: number
): void {
  const px = Math.round(x);
  const py = Math.round(y);
  ctx.save();
  const flash = hitFlash > 0;
  const hull = flash ? '#ffffff' : '#334155';
  const hullLight = flash ? '#ffffff' : '#64748b';
  const dark = flash ? '#ffffff' : '#0f172a';
  const trim = flash ? '#ffffff' : phase === 2 ? '#dc2626' : '#d97706';

  // Main chassis
  ctx.fillStyle = dark;
  ctx.fillRect(px + 4, py + 14, w - 8, h - 22);
  ctx.fillStyle = hull;
  ctx.fillRect(px + 6, py + 16, w - 12, h - 26);
  ctx.fillStyle = hullLight;
  ctx.fillRect(px + 10, py + 18, w - 20, 6);

  // Upper command turret + massive siege cannon pointing left
  ctx.fillStyle = dark;
  ctx.fillRect(px + 34, py, 56, 18);
  ctx.fillStyle = hull;
  ctx.fillRect(px + 36, py + 2, 52, 14);
  ctx.fillStyle = trim;
  ctx.fillRect(px + 40, py + 6, 16, 4);

  // Siege barrel
  ctx.fillStyle = dark;
  ctx.fillRect(px - 18, py + 4, 54, 10);
  ctx.fillStyle = hullLight;
  ctx.fillRect(px - 16, py + 6, 50, 4);

  // Lower flame/vulcan bay
  ctx.fillStyle = flash ? '#ffffff' : '#090d14';
  ctx.fillRect(px + 8, py + 32, 22, 12);
  ctx.fillStyle = flash ? '#ffffff' : phase === 2 ? '#ef4444' : '#f97316';
  ctx.fillRect(px + 10, py + 34, 10, 8);

  // Reactor furnace grill
  ctx.fillStyle = flash ? '#ffffff' : '#090d14';
  ctx.fillRect(px + 44, py + 28, 36, 14);
  ctx.fillStyle = flash ? '#ffffff' : Math.sin(time * 16) > 0 ? '#f59e0b' : '#ef4444';
  for (let gx = 48; gx < 76; gx += 6) {
    ctx.fillRect(px + gx, py + 30, 4, 10);
  }

  // Rolling armored rail wheels
  const wheelRoll = Math.floor(time * 12) % 4;
  for (let wx = 12; wx < w - 16; wx += 22) {
    ctx.fillStyle = dark;
    ctx.fillRect(px + wx, py + h - 14, 16, 14);
    ctx.fillStyle = hullLight;
    ctx.fillRect(px + wx + 3, py + h - 11, 10, 8);
    ctx.fillStyle = trim;
    ctx.fillRect(px + wx + 5 + (wheelRoll % 2) * 2, py + h - 9, 3, 3);
  }

  ctx.restore();
}

export function drawBossKraken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  phase: 1 | 2,
  hitFlash: number
): void {
  const px = Math.round(x);
  const py = Math.round(y);
  ctx.save();
  const flash = hitFlash > 0;
  const armor = flash ? '#ffffff' : '#1e293b';
  const armorLight = flash ? '#ffffff' : '#475569';
  const dark = flash ? '#ffffff' : '#090d14';
  const legStride = Math.round(Math.sin(time * 6) * 4);

  // Heavy articulated mech legs
  ctx.fillStyle = dark;
  ctx.fillRect(px + 18 + legStride, py + h - 26, 16, 26);
  ctx.fillRect(px + w - 34 - legStride, py + h - 26, 16, 26);
  ctx.fillStyle = armorLight;
  ctx.fillRect(px + 20 + legStride, py + h - 24, 10, 20);
  ctx.fillRect(px + w - 32 - legStride, py + h - 24, 10, 20);
  // Boots/feet
  ctx.fillStyle = dark;
  ctx.fillRect(px + 12 + legStride, py + h - 8, 24, 8);
  ctx.fillRect(px + w - 38 - legStride, py + h - 8, 24, 8);

  // Torso chassis
  ctx.fillStyle = dark;
  ctx.fillRect(px + 12, py + 12, w - 24, h - 34);
  ctx.fillStyle = armor;
  ctx.fillRect(px + 14, py + 14, w - 28, h - 38);
  ctx.fillStyle = armorLight;
  ctx.fillRect(px + 18, py + 16, w - 36, 8);

  // Shoulder missile pods
  ctx.fillStyle = dark;
  ctx.fillRect(px + 4, py + 4, 22, 18);
  ctx.fillRect(px + w - 26, py + 4, 22, 18);
  ctx.fillStyle = flash ? '#ffffff' : '#dc2626';
  ctx.fillRect(px + 8, py + 8, 4, 4);
  ctx.fillRect(px + 16, py + 8, 4, 4);
  ctx.fillRect(px + w - 22, py + 8, 4, 4);
  ctx.fillRect(px + w - 14, py + 8, 4, 4);

  // Head sensor dome
  ctx.fillStyle = dark;
  ctx.fillRect(px + w / 2 - 14, py, 28, 14);
  ctx.fillStyle = armorLight;
  ctx.fillRect(px + w / 2 - 12, py + 2, 24, 10);
  ctx.fillStyle = flash ? '#ffffff' : phase === 2 ? '#ef4444' : '#facc15';
  ctx.fillRect(px + w / 2 - 8, py + 5, 16, 4);

  // Left plasma cannon arm
  ctx.fillStyle = dark;
  ctx.fillRect(px - 14, py + 24, 28, 14);
  ctx.fillStyle = armorLight;
  ctx.fillRect(px - 12, py + 26, 22, 8);
  ctx.fillStyle = flash ? '#ffffff' : '#38bdf8';
  ctx.fillRect(px - 14, py + 28, 4, 6);

  // Central Reactor Core (Armored in Phase 1, Exposed & Glowing in Phase 2)
  if (flash) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + w / 2 - 15, py + 24, 30, 22);
  } else if (phase === 1) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(px + w / 2 - 14, py + 26, 28, 20);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(px + w / 2 - 6, py + 32, 12, 8);
  } else {
    const pulse = Math.sin(time * 24) > 0;
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(px + w / 2 - 15, py + 24, 30, 22);
    ctx.fillStyle = pulse ? '#ef4444' : '#f97316';
    ctx.fillRect(px + w / 2 - 11, py + 27, 22, 16);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(px + w / 2 - 6, py + 31, 12, 8);
  }

  ctx.restore();
}
