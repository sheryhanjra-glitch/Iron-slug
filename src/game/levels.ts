import { MissionConfig } from './types';

export const VIEW_WIDTH = 480;
export const VIEW_HEIGHT = 270;
export const GROUND_Y = 228;

export const MISSIONS: MissionConfig[] = [
  {
    id: 1,
    name: 'Scorched Harbor',
    subtitle: 'Coastal Dockyard Assault',
    biome: 'harbor',
    length: 2820,
    bossArenaX: 2320,
    bossKind: 'gunship',
    tankSpawn: { x: 1240, y: GROUND_Y - 28 },
    platforms: [
      { x: 240, y: 176, w: 96, h: 8, oneWay: true, style: 'dock' },
      { x: 430, y: 152, w: 84, h: 8, oneWay: true, style: 'dock' },
      { x: 640, y: 174, w: 120, h: 8, oneWay: true, style: 'dock' },
      { x: 910, y: 168, w: 110, h: 8, oneWay: true, style: 'bridge' },
      { x: 1080, y: 138, w: 88, h: 8, oneWay: true, style: 'dock' },
      { x: 1480, y: 174, w: 116, h: 8, oneWay: true, style: 'dock' },
      { x: 1690, y: 146, w: 96, h: 8, oneWay: true, style: 'bridge' },
      { x: 1940, y: 172, w: 128, h: 8, oneWay: true, style: 'dock' },
      // Boss arena side platforms for dodging aerial sweeps
      { x: 2380, y: 172, w: 84, h: 8, oneWay: true, style: 'dock' },
      { x: 2630, y: 172, w: 84, h: 8, oneWay: true, style: 'dock' },
    ],
    crates: [
      { x: 190, y: GROUND_Y - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'heavy_mg' },
      { x: 380, y: GROUND_Y - 20, w: 14, h: 20, hp: 15, kind: 'barrel' },
      { x: 465, y: 152 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'grenade' },
      { x: 690, y: 174 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'shotgun' },
      { x: 830, y: GROUND_Y - 20, w: 14, h: 20, hp: 15, kind: 'barrel' },
      { x: 1110, y: 138 - 18, w: 18, h: 18, hp: 35, kind: 'steel', drop: 'rocket' },
      { x: 1380, y: GROUND_Y - 20, w: 14, h: 20, hp: 15, kind: 'barrel' },
      { x: 1540, y: 174 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'medkit' },
      { x: 1730, y: 146 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'flame' },
      { x: 1870, y: GROUND_Y - 20, w: 14, h: 20, hp: 15, kind: 'barrel' },
      { x: 2150, y: GROUND_Y - 18, w: 18, h: 18, hp: 30, kind: 'steel', drop: 'heavy_mg' },
      { x: 2210, y: GROUND_Y - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'medkit' },
    ],
    pows: [
      { x: 280, y: 176 - 20, drop: 'heavy_mg' },
      { x: 730, y: GROUND_Y - 20, drop: 'medal' },
      { x: 1140, y: GROUND_Y - 20, drop: 'shotgun' },
      { x: 1610, y: GROUND_Y - 20, drop: 'grenade' },
      { x: 2010, y: 172 - 20, drop: 'rocket' },
    ],
    triggers: [
      {
        triggerX: 60,
        triggered: false,
        enemies: [
          { kind: 'rifleman', offsetX: 340, y: GROUND_Y - 22 },
          { kind: 'rifleman', offsetX: 400, y: GROUND_Y - 22 },
        ],
      },
      {
        triggerX: 280,
        triggered: false,
        enemies: [
          { kind: 'rifleman', offsetX: 310, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 390, y: GROUND_Y - 22 },
          { kind: 'paratrooper', offsetX: 250, y: -24 },
        ],
      },
      {
        triggerX: 540,
        triggered: false,
        enemies: [
          { kind: 'shield', offsetX: 300, y: GROUND_Y - 22 },
          { kind: 'rifleman', offsetX: 370, y: 174 - 22 },
          { kind: 'paratrooper', offsetX: 330, y: -24 },
        ],
      },
      {
        triggerX: 840,
        triggered: false,
        enemies: [
          { kind: 'turret', offsetX: 330, y: GROUND_Y - 22 },
          { kind: 'rifleman', offsetX: 380, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 410, y: 168 - 22 },
        ],
      },
      {
        triggerX: 1200,
        triggered: false,
        enemies: [
          { kind: 'shield', offsetX: 340, y: GROUND_Y - 22 },
          { kind: 'rifleman', offsetX: 380, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 430, y: GROUND_Y - 22 },
          { kind: 'paratrooper', offsetX: 290, y: -24 },
        ],
      },
      {
        triggerX: 1560,
        triggered: false,
        enemies: [
          { kind: 'turret', offsetX: 320, y: GROUND_Y - 22 },
          { kind: 'commando', offsetX: 360, y: GROUND_Y - 22 },
          { kind: 'rifleman', offsetX: 410, y: 146 - 22 },
        ],
      },
      {
        triggerX: 1920,
        triggered: false,
        enemies: [
          { kind: 'shield', offsetX: 300, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 350, y: GROUND_Y - 22 },
          { kind: 'commando', offsetX: 390, y: GROUND_Y - 22 },
          { kind: 'paratrooper', offsetX: 280, y: -24 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Iron Foundry',
    subtitle: 'Armored Railworks',
    biome: 'foundry',
    length: 3020,
    bossArenaX: 2500,
    bossKind: 'landship',
    tankSpawn: { x: 1120, y: GROUND_Y - 28 },
    platforms: [
      { x: 220, y: 174, w: 108, h: 8, oneWay: true, style: 'steel' },
      { x: 410, y: 146, w: 96, h: 8, oneWay: true, style: 'steel' },
      { x: 630, y: 172, w: 132, h: 8, oneWay: true, style: 'bridge' },
      { x: 890, y: 150, w: 110, h: 8, oneWay: true, style: 'steel' },
      { x: 1290, y: 172, w: 120, h: 8, oneWay: true, style: 'steel' },
      { x: 1520, y: 144, w: 104, h: 8, oneWay: true, style: 'bridge' },
      { x: 1780, y: 170, w: 120, h: 8, oneWay: true, style: 'steel' },
      { x: 2050, y: 154, w: 110, h: 8, oneWay: true, style: 'steel' },
      // Boss arena gantry
      { x: 2560, y: 168, w: 92, h: 8, oneWay: true, style: 'steel' },
      { x: 2710, y: 142, w: 72, h: 8, oneWay: true, style: 'steel' },
    ],
    crates: [
      { x: 170, y: GROUND_Y - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'shotgun' },
      { x: 350, y: GROUND_Y - 20, w: 14, h: 20, hp: 15, kind: 'barrel' },
      { x: 450, y: 146 - 18, w: 18, h: 18, hp: 30, kind: 'steel', drop: 'flame' },
      { x: 690, y: 172 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'heavy_mg' },
      { x: 820, y: GROUND_Y - 20, w: 14, h: 20, hp: 15, kind: 'barrel' },
      { x: 940, y: 150 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'grenade' },
      { x: 1350, y: 172 - 18, w: 18, h: 18, hp: 30, kind: 'steel', drop: 'rocket' },
      { x: 1440, y: GROUND_Y - 20, w: 14, h: 20, hp: 15, kind: 'barrel' },
      { x: 1560, y: 144 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'medkit' },
      { x: 1830, y: 170 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'heavy_mg' },
      { x: 2100, y: 154 - 18, w: 18, h: 18, hp: 30, kind: 'steel', drop: 'shotgun' },
      { x: 2360, y: GROUND_Y - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'medkit' },
    ],
    pows: [
      { x: 260, y: 174 - 20, drop: 'flame' },
      { x: 740, y: GROUND_Y - 20, drop: 'grenade' },
      { x: 1030, y: GROUND_Y - 20, drop: 'medal' },
      { x: 1580, y: GROUND_Y - 20, drop: 'rocket' },
      { x: 2120, y: GROUND_Y - 20, drop: 'heavy_mg' },
    ],
    triggers: [
      {
        triggerX: 60,
        triggered: false,
        enemies: [
          { kind: 'rifleman', offsetX: 320, y: GROUND_Y - 22 },
          { kind: 'shield', offsetX: 390, y: GROUND_Y - 22 },
        ],
      },
      {
        triggerX: 320,
        triggered: false,
        enemies: [
          { kind: 'bazooka', offsetX: 330, y: GROUND_Y - 22 },
          { kind: 'commando', offsetX: 390, y: GROUND_Y - 22 },
          { kind: 'paratrooper', offsetX: 280, y: -24 },
        ],
      },
      {
        triggerX: 620,
        triggered: false,
        enemies: [
          { kind: 'turret', offsetX: 330, y: GROUND_Y - 22 },
          { kind: 'rifleman', offsetX: 370, y: 172 - 22 },
          { kind: 'shield', offsetX: 410, y: GROUND_Y - 22 },
        ],
      },
      {
        triggerX: 980,
        triggered: false,
        enemies: [
          { kind: 'commando', offsetX: 320, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 370, y: GROUND_Y - 22 },
          { kind: 'paratrooper', offsetX: 300, y: -24 },
          { kind: 'paratrooper', offsetX: 380, y: -24 },
        ],
      },
      {
        triggerX: 1360,
        triggered: false,
        enemies: [
          { kind: 'turret', offsetX: 310, y: GROUND_Y - 22 },
          { kind: 'shield', offsetX: 360, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 410, y: 144 - 22 },
        ],
      },
      {
        triggerX: 1720,
        triggered: false,
        enemies: [
          { kind: 'commando', offsetX: 300, y: GROUND_Y - 22 },
          { kind: 'commando', offsetX: 360, y: GROUND_Y - 22 },
          { kind: 'turret', offsetX: 410, y: GROUND_Y - 22 },
        ],
      },
      {
        triggerX: 2100,
        triggered: false,
        enemies: [
          { kind: 'shield', offsetX: 300, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 350, y: GROUND_Y - 22 },
          { kind: 'commando', offsetX: 390, y: GROUND_Y - 22 },
          { kind: 'paratrooper', offsetX: 310, y: -24 },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Citadel Core',
    subtitle: 'Storm Fortress Finale',
    biome: 'citadel',
    length: 3180,
    bossArenaX: 2660,
    bossKind: 'kraken',
    tankSpawn: { x: 1480, y: GROUND_Y - 28 },
    platforms: [
      { x: 210, y: 172, w: 100, h: 8, oneWay: true, style: 'stone' },
      { x: 400, y: 144, w: 92, h: 8, oneWay: true, style: 'stone' },
      { x: 610, y: 170, w: 112, h: 8, oneWay: true, style: 'steel' },
      { x: 860, y: 146, w: 100, h: 8, oneWay: true, style: 'stone' },
      { x: 1120, y: 172, w: 118, h: 8, oneWay: true, style: 'stone' },
      { x: 1320, y: 138, w: 92, h: 8, oneWay: true, style: 'steel' },
      { x: 1680, y: 172, w: 120, h: 8, oneWay: true, style: 'stone' },
      { x: 1940, y: 146, w: 104, h: 8, oneWay: true, style: 'steel' },
      { x: 2220, y: 170, w: 116, h: 8, oneWay: true, style: 'stone' },
      // Final Boss Arena flanking perches
      { x: 2700, y: 172, w: 80, h: 8, oneWay: true, style: 'steel' },
      { x: 2820, y: 136, w: 72, h: 8, oneWay: true, style: 'steel' },
    ],
    crates: [
      { x: 160, y: GROUND_Y - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'heavy_mg' },
      { x: 340, y: GROUND_Y - 20, w: 14, h: 20, hp: 15, kind: 'barrel' },
      { x: 435, y: 144 - 18, w: 18, h: 18, hp: 30, kind: 'steel', drop: 'rocket' },
      { x: 660, y: 170 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'shotgun' },
      { x: 900, y: 146 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'flame' },
      { x: 1030, y: GROUND_Y - 20, w: 14, h: 20, hp: 15, kind: 'barrel' },
      { x: 1170, y: 172 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'medkit' },
      { x: 1355, y: 138 - 18, w: 18, h: 18, hp: 30, kind: 'steel', drop: 'grenade' },
      { x: 1730, y: 172 - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'heavy_mg' },
      { x: 1870, y: GROUND_Y - 20, w: 14, h: 20, hp: 15, kind: 'barrel' },
      { x: 1980, y: 146 - 18, w: 18, h: 18, hp: 30, kind: 'steel', drop: 'rocket' },
      { x: 2490, y: GROUND_Y - 18, w: 18, h: 18, hp: 30, kind: 'steel', drop: 'heavy_mg' },
      { x: 2540, y: GROUND_Y - 16, w: 16, h: 16, hp: 20, kind: 'wood', drop: 'medkit' },
    ],
    pows: [
      { x: 250, y: 172 - 20, drop: 'shotgun' },
      { x: 750, y: GROUND_Y - 20, drop: 'grenade' },
      { x: 1210, y: GROUND_Y - 20, drop: 'flame' },
      { x: 1760, y: GROUND_Y - 20, drop: 'medal' },
      { x: 2270, y: 170 - 20, drop: 'rocket' },
    ],
    triggers: [
      {
        triggerX: 60,
        triggered: false,
        enemies: [
          { kind: 'commando', offsetX: 330, y: GROUND_Y - 22 },
          { kind: 'shield', offsetX: 390, y: GROUND_Y - 22 },
        ],
      },
      {
        triggerX: 340,
        triggered: false,
        enemies: [
          { kind: 'turret', offsetX: 330, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 380, y: GROUND_Y - 22 },
          { kind: 'paratrooper', offsetX: 280, y: -24 },
        ],
      },
      {
        triggerX: 680,
        triggered: false,
        enemies: [
          { kind: 'commando', offsetX: 310, y: GROUND_Y - 22 },
          { kind: 'shield', offsetX: 360, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 410, y: 146 - 22 },
        ],
      },
      {
        triggerX: 1040,
        triggered: false,
        enemies: [
          { kind: 'turret', offsetX: 310, y: GROUND_Y - 22 },
          { kind: 'commando', offsetX: 360, y: GROUND_Y - 22 },
          { kind: 'paratrooper', offsetX: 290, y: -24 },
          { kind: 'paratrooper', offsetX: 360, y: -24 },
        ],
      },
      {
        triggerX: 1420,
        triggered: false,
        enemies: [
          { kind: 'shield', offsetX: 320, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 370, y: GROUND_Y - 22 },
          { kind: 'commando', offsetX: 420, y: GROUND_Y - 22 },
        ],
      },
      {
        triggerX: 1820,
        triggered: false,
        enemies: [
          { kind: 'turret', offsetX: 320, y: GROUND_Y - 22 },
          { kind: 'commando', offsetX: 360, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 410, y: GROUND_Y - 22 },
          { kind: 'paratrooper', offsetX: 310, y: -24 },
        ],
      },
      {
        triggerX: 2220,
        triggered: false,
        enemies: [
          { kind: 'shield', offsetX: 300, y: GROUND_Y - 22 },
          { kind: 'commando', offsetX: 345, y: GROUND_Y - 22 },
          { kind: 'bazooka', offsetX: 390, y: GROUND_Y - 22 },
          { kind: 'turret', offsetX: 420, y: GROUND_Y - 22 },
        ],
      },
    ],
  },
];
