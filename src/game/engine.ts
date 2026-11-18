import { GROUND_Y, MISSIONS, VIEW_HEIGHT, VIEW_WIDTH } from './levels';
import {
  drawBossGunship,
  drawBossKraken,
  drawBossLandship,
  drawCrateSprite,
  drawPickupSprite,
  getEnemySprite,
  getHeroSprite,
  getPowSprite,
  getTankSprite,
} from './pixelArt';
import { sound } from './sound';
import {
  BossEntity,
  CrateEntity,
  Difficulty,
  EnemyEntity,
  EnemyKind,
  FloatingText,
  HudSnapshot,
  InputState,
  MissionConfig,
  MissionStats,
  Particle,
  PickupEntity,
  PickupKind,
  PlayerState,
  PowEntity,
  Projectile,
  SlugTank,
  WeaponType,
} from './types';

const GRAVITY = 720;

export interface EngineCallbacks {
  onMissionClear: (stats: MissionStats) => void;
  onGameOver: (stats: MissionStats) => void;
}

export class IronSlugEngine {
  private mission: MissionConfig;
  private difficulty: Difficulty;
  private callbacks: EngineCallbacks;

  private player: PlayerState;
  private tank: SlugTank | null = null;
  private enemies: EnemyEntity[] = [];
  private crates: CrateEntity[] = [];
  private pows: PowEntity[] = [];
  private pickups: PickupEntity[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private triggers: MissionConfig['triggers'] = [];
  private boss: BossEntity | null = null;

  private cameraX: number = 0;
  private arenaLocked: boolean = false;
  private bossSpawned: boolean = false;
  private bossDefeatedTimer: number = 0;
  private missionEnded: boolean = false;

  private score: number = 0;
  private highScore: number = 0;
  private enemiesDefeated: number = 0;
  private powsRescued: number = 0;
  private shotsFired: number = 0;
  private shotsHit: number = 0;
  private timeRemaining: number = 180;

  private nextId: number = 1;
  private elapsedTime: number = 0;
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;
  private bannerText: string | null = null;
  private bannerTimer: number = 0;

  constructor(
    missionIndex: number,
    difficulty: Difficulty,
    initialScore: number,
    highScore: number,
    callbacks: EngineCallbacks
  ) {
    const safeIdx = Math.max(0, Math.min(MISSIONS.length - 1, missionIndex));
    this.mission = MISSIONS[safeIdx];
    this.difficulty = difficulty;
    this.score = initialScore;
    this.highScore = highScore;
    this.callbacks = callbacks;

    const maxHp = difficulty === 'recruit' ? 120 : difficulty === 'veteran' ? 100 : 80;
    const lives = difficulty === 'recruit' ? 5 : difficulty === 'veteran' ? 3 : 2;

    this.player = {
      x: 44,
      y: GROUND_Y - 22,
      vx: 0,
      vy: 0,
      w: 16,
      h: 22,
      hp: maxHp,
      maxHp,
      lives,
      facing: 1,
      onGround: true,
      crouching: false,
      aimDir: 'forward',
      weapon: 'pistol',
      ammo: -1,
      grenades: 10,
      fireCooldown: 0,
      grenadeCooldown: 0,
      meleeTimer: 0,
      invulnTimer: 1.0,
      hitFlash: 0,
      animTime: 0,
      coyoteTimer: 0,
      jumpBuffer: 0,
      recoilTimer: 0,
      inTank: false,
      deadTimer: 0,
    };

    this.initLevelEntities();
    this.showBanner(`MISSION ${this.mission.id}: ${this.mission.name.toUpperCase()}`, 2.6);
  }

  private initLevelEntities(): void {
    this.crates = this.mission.crates.map((c) => ({
      ...c,
      id: this.nextId++,
      maxHp: c.hp,
      hitFlash: 0,
    }));

    this.pows = this.mission.pows.map((p) => ({
      id: this.nextId++,
      x: p.x,
      y: p.y,
      w: 16,
      h: 20,
      state: 'tied',
      timer: 0,
      drop: p.drop,
      facing: -1,
    }));

    this.triggers = this.mission.triggers.map((t) => ({
      triggerX: t.triggerX,
      triggered: false,
      enemies: t.enemies.map((e) => ({ ...e })),
    }));

    if (this.mission.tankSpawn) {
      this.tank = {
        active: true,
        x: this.mission.tankSpawn.x,
        y: this.mission.tankSpawn.y,
        vx: 0,
        vy: 0,
        w: 36,
        h: 28,
        hp: 180,
        maxHp: 180,
        facing: 1,
        onGround: true,
        turretAngle: 0,
        cannonCooldown: 0,
        vulcanCooldown: 0,
        treadPhase: 0,
        hitFlash: 0,
        occupied: false,
      };
    }
  }

  private diffMult(): number {
    return this.difficulty === 'recruit' ? 0.8 : this.difficulty === 'veteran' ? 1.0 : 1.28;
  }

  private showBanner(text: string, duration: number): void {
    this.bannerText = text;
    this.bannerTimer = duration;
  }

  private addShake(intensity: number, duration: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeTimer = Math.max(this.shakeTimer, duration);
  }

  private addScore(points: number, x?: number, y?: number, label?: string): void {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
    if (x !== undefined && y !== undefined) {
      this.floatingTexts.push({
        x,
        y,
        vy: -24,
        text: label ?? `+${points}`,
        color: '#fde047',
        life: 0.75,
        maxLife: 0.75,
      });
    }
  }

  public getHudSnapshot(): HudSnapshot {
    const nearTank =
      this.tank !== null &&
      this.tank.active &&
      !this.tank.occupied &&
      Math.abs(this.player.x - this.tank.x) < 38 &&
      Math.abs(this.player.y - this.tank.y) < 34;

    return {
      missionId: this.mission.id,
      missionName: this.mission.name,
      score: this.score,
      highScore: this.highScore,
      hp: Math.max(0, Math.ceil(this.player.hp)),
      maxHp: this.player.maxHp,
      lives: this.player.lives,
      weapon: this.player.weapon,
      ammo: this.player.ammo,
      grenades: this.player.grenades,
      inTank: this.player.inTank,
      tankHp: this.tank ? Math.max(0, Math.ceil(this.tank.hp)) : 0,
      tankMaxHp: this.tank ? this.tank.maxHp : 0,
      powsRescued: this.powsRescued,
      timeRemaining: Math.max(0, Math.ceil(this.timeRemaining)),
      boss:
        this.boss && this.boss.state !== 'dying'
          ? {
              name: this.boss.name,
              subtitle: this.boss.subtitle,
              hp: Math.max(0, Math.ceil(this.boss.hp)),
              maxHp: this.boss.maxHp,
              phase: this.boss.phase,
            }
          : null,
      bannerText: this.bannerTimer > 0 ? this.bannerText : null,
      tankPrompt: nearTank,
    };
  }

  public update(dt: number, input: InputState): void {
    if (this.missionEnded) return;

    this.elapsedTime += dt;

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.bannerText = null;
    }
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer <= 0) this.shakeIntensity = 0;
    }

    if (!this.boss || this.boss.state !== 'dying') {
      this.timeRemaining = Math.max(0, this.timeRemaining - dt);
    }

    for (const c of this.crates) {
      if (c.hitFlash > 0) c.hitFlash = Math.max(0, c.hitFlash - dt);
    }

    this.updatePlayer(dt, input);
    this.updateTank(dt);
    this.updateTriggers();
    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.updateProjectiles(dt);
    this.updatePows(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);
    this.updateCamera(dt);

    if (this.boss && this.boss.state === 'dying') {
      this.bossDefeatedTimer -= dt;
      if (Math.random() < 0.45) {
        this.spawnExplosion(
          this.boss.x + Math.random() * this.boss.w,
          this.boss.y + Math.random() * this.boss.h,
          18,
          false
        );
      }
      if (this.bossDefeatedTimer <= 0 && !this.missionEnded) {
        this.missionEnded = true;
        sound.stopBgm();
        sound.playVictory();
        const timeBonus = Math.ceil(this.timeRemaining) * 25;
        this.addScore(timeBonus);
        this.callbacks.onMissionClear({
          missionId: this.mission.id,
          missionName: this.mission.name,
          score: this.score,
          enemiesDefeated: this.enemiesDefeated,
          powsRescued: this.powsRescued,
          totalPows: this.mission.pows.length,
          timeRemaining: Math.ceil(this.timeRemaining),
          shotsFired: this.shotsFired,
          shotsHit: this.shotsHit,
        });
      }
    }
  }

  private updatePlayer(dt: number, input: InputState): void {
    const p = this.player;

    if (p.deadTimer > 0) {
      p.deadTimer -= dt;
      if (p.deadTimer <= 0) {
        if (p.lives > 0) {
          p.hp = p.maxHp;
          p.invulnTimer = 2.2;
          p.y = Math.min(p.y, GROUND_Y - 50);
          p.vy = -120;
          p.weapon = 'pistol';
          p.ammo = -1;
          p.grenades = Math.max(p.grenades, 6);
          this.showBanner('DEPLOYED!', 1.2);
        } else if (!this.missionEnded) {
          this.missionEnded = true;
          sound.stopBgm();
          this.callbacks.onGameOver({
            missionId: this.mission.id,
            missionName: this.mission.name,
            score: this.score,
            enemiesDefeated: this.enemiesDefeated,
            powsRescued: this.powsRescued,
            totalPows: this.mission.pows.length,
            timeRemaining: Math.ceil(this.timeRemaining),
            shotsFired: this.shotsFired,
            shotsHit: this.shotsHit,
          });
        }
      }
      return;
    }

    if (p.invulnTimer > 0) p.invulnTimer -= dt;
    if (p.hitFlash > 0) p.hitFlash -= dt;
    if (p.fireCooldown > 0) p.fireCooldown -= dt;
    if (p.grenadeCooldown > 0) p.grenadeCooldown -= dt;
    if (p.meleeTimer > 0) p.meleeTimer -= dt;
    if (p.recoilTimer > 0) p.recoilTimer -= dt;

    // Tank boarding / ejecting
    if (input.tankToggleJustPressed && this.tank && this.tank.active) {
      if (p.inTank) {
        p.inTank = false;
        this.tank.occupied = false;
        p.y = this.tank.y - 14;
        p.vy = -210;
        p.invulnTimer = 1.0;
        sound.playJump();
      } else {
        const dist = Math.hypot(p.x - this.tank.x, p.y - this.tank.y);
        if (dist < 46) {
          p.inTank = true;
          this.tank.occupied = true;
          p.crouching = false;
          sound.playPickup();
          this.floatingTexts.push({
            x: this.tank.x + 18,
            y: this.tank.y - 10,
            vy: -20,
            text: 'IRON SLUG!',
            color: '#a3e635',
            life: 1.0,
            maxLife: 1.0,
          });
        }
      }
    }

    // If inside Slug Tank, tank handles movement and firing
    if (p.inTank && this.tank && this.tank.active) {
      const t = this.tank;
      const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      t.vx = move * 142;
      if (move !== 0) {
        t.facing = move > 0 ? 1 : -1;
        t.treadPhase += dt * 18;
      }
      if (input.jumpJustPressed && t.onGround) {
        t.vy = -240;
        t.onGround = false;
        sound.playJump();
      }
      if (input.up) {
        t.turretAngle = -Math.PI / 4;
      } else {
        t.turretAngle = 0;
      }

      if (input.fire && t.vulcanCooldown <= 0) {
        t.vulcanCooldown = 0.085;
        this.fireTankVulcan();
      }
      if (input.grenade && t.cannonCooldown <= 0) {
        t.cannonCooldown = 0.55;
        this.fireTankCannon();
      }

      p.x = t.x + 10;
      p.y = t.y + 4;
      p.facing = t.facing;
      return;
    }

    // Standard Foot Commando Movement
    const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    p.crouching = input.down && p.onGround;
    const speed = p.crouching ? 56 : 128;
    p.vx = move * speed;

    if (move !== 0) {
      p.facing = move > 0 ? 1 : -1;
      p.animTime += dt * 10;
    } else {
      p.animTime = 0;
    }

    // Aim direction
    if (input.up && move !== 0) {
      p.aimDir = 'diag_up';
    } else if (input.up) {
      p.aimDir = 'up';
    } else if (input.down && !p.onGround) {
      p.aimDir = 'down';
    } else {
      p.aimDir = 'forward';
    }

    // Coyote & Jump Buffer
    if (p.onGround) {
      p.coyoteTimer = 0.1;
    } else {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    if (input.jumpJustPressed) {
      // Drop through one-way platform
      if (input.down && p.onGround && p.y + p.h < GROUND_Y - 2) {
        p.y += 6;
        p.onGround = false;
        p.coyoteTimer = 0;
      } else {
        p.jumpBuffer = 0.1;
      }
    } else {
      p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
    }

    if (p.jumpBuffer > 0 && p.coyoteTimer > 0) {
      p.vy = -278;
      p.onGround = false;
      p.coyoteTimer = 0;
      p.jumpBuffer = 0;
      sound.playJump();
    }

    // Gravity
    const prevBottom = p.y + p.h;
    p.vy = Math.min(440, p.vy + GRAVITY * dt);
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Clamp to camera / arena bounds
    const minX = this.arenaLocked ? this.mission.bossArenaX + 6 : this.cameraX + 4;
    const maxX = this.mission.length - p.w - 6;
    p.x = Math.max(minX, Math.min(maxX, p.x));

    // Platform & ground collisions
    p.onGround = false;
    if (p.vy >= 0) {
      for (const plat of this.mission.platforms) {
        if (
          p.x + p.w > plat.x + 2 &&
          p.x < plat.x + plat.w - 2 &&
          prevBottom <= plat.y + 4 &&
          p.y + p.h >= plat.y
        ) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.onGround = true;
          break;
        }
      }
    }

    if (p.y + p.h >= GROUND_Y) {
      p.y = GROUND_Y - p.h;
      p.vy = 0;
      p.onGround = true;
    }

    // Firing & Auto-Melee Knife
    if (input.fire && p.fireCooldown <= 0) {
      const meleeTarget = this.findMeleeTarget();
      if (meleeTarget) {
        this.performMelee(meleeTarget);
      } else {
        this.firePlayerWeapon();
      }
    }

    // Grenade throw
    if (input.grenadeJustPressed && p.grenadeCooldown <= 0 && p.grenades > 0) {
      p.grenades--;
      p.grenadeCooldown = 0.34;
      this.throwGrenade();
    }
  }

  private findMeleeTarget(): EnemyEntity | PowEntity | null {
    const p = this.player;
    const reachX = p.x + (p.facing === 1 ? p.w : -20);
    for (const pow of this.pows) {
      if (pow.state === 'tied') {
        if (Math.abs(pow.x - reachX) < 22 && Math.abs(pow.y - p.y) < 24) {
          return pow;
        }
      }
    }
    for (const e of this.enemies) {
      if (Math.abs(e.x - reachX) < 24 && Math.abs(e.y - p.y) < 24) {
        return e;
      }
    }
    return null;
  }

  private performMelee(target: EnemyEntity | PowEntity): void {
    const p = this.player;
    p.fireCooldown = 0.24;
    p.meleeTimer = 0.18;
    sound.playMelee();

    this.particles.push({
      x: p.x + (p.facing === 1 ? p.w + 8 : -8),
      y: p.y + 10,
      vx: p.facing * 30,
      vy: 0,
      size: 16,
      color: '#f8fafc',
      alpha: 1,
      life: 0.14,
      maxLife: 0.14,
      gravity: 0,
      kind: 'slash',
    });

    if ('state' in target) {
      this.freePow(target);
    } else {
      this.damageEnemy(target, 45, true);
      this.floatingTexts.push({
        x: target.x + 8,
        y: target.y - 6,
        vy: -24,
        text: 'SLASH!',
        color: '#38bdf8',
        life: 0.55,
        maxLife: 0.55,
      });
    }
  }

  private firePlayerWeapon(): void {
    const p = this.player;
    this.shotsFired++;
    p.recoilTimer = 0.08;

    let angle = p.facing === 1 ? 0 : Math.PI;
    if (p.aimDir === 'up') {
      angle = -Math.PI / 2;
    } else if (p.aimDir === 'down') {
      angle = Math.PI / 2;
    } else if (p.aimDir === 'diag_up') {
      angle = p.facing === 1 ? -Math.PI / 4 : (-3 * Math.PI) / 4;
    }

    const muzzleX =
      p.aimDir === 'up' ? p.x + p.w / 2 : p.x + (p.facing === 1 ? p.w + 3 : -3);
    const muzzleY =
      p.aimDir === 'up' ? p.y - 2 : p.crouching ? p.y + 13 : p.y + 9;

    // Brass shell casing particle
    if (p.weapon === 'pistol' || p.weapon === 'heavy_mg' || p.weapon === 'shotgun') {
      this.particles.push({
        x: p.x + p.w / 2,
        y: muzzleY,
        vx: -p.facing * (35 + Math.random() * 35),
        vy: -70 - Math.random() * 40,
        size: 2,
        color: '#facc15',
        alpha: 1,
        life: 0.45,
        maxLife: 0.45,
        gravity: 420,
        kind: 'casing',
      });
    }

    // Muzzle flash spark
    this.particles.push({
      x: muzzleX,
      y: muzzleY,
      vx: Math.cos(angle) * 30,
      vy: Math.sin(angle) * 30,
      size: 6,
      color: '#fef08a',
      alpha: 1,
      life: 0.07,
      maxLife: 0.07,
      gravity: 0,
      kind: 'spark',
    });

    switch (p.weapon) {
      case 'pistol': {
        p.fireCooldown = 0.16;
        sound.playShoot('pistol');
        this.spawnPlayerProjectile('bullet', muzzleX, muzzleY, angle, 350, 14, 5, 3);
        break;
      }
      case 'heavy_mg': {
        p.fireCooldown = 0.075;
        sound.playShoot('heavy_mg');
        const spread = (Math.random() - 0.5) * 0.09;
        this.spawnPlayerProjectile('heavy', muzzleX, muzzleY, angle + spread, 390, 12, 7, 3);
        this.consumeAmmo(1);
        break;
      }
      case 'shotgun': {
        p.fireCooldown = 0.44;
        sound.playShoot('shotgun');
        this.addShake(2.2, 0.1);
        for (let i = -3; i <= 3; i++) {
          const pelletAngle = angle + i * 0.085;
          this.spawnPlayerProjectile('pellet', muzzleX, muzzleY, pelletAngle, 340, 11, 5, 4, 0.36);
        }
        this.consumeAmmo(1);
        break;
      }
      case 'rocket': {
        p.fireCooldown = 0.38;
        sound.playShoot('rocket');
        this.addShake(2.0, 0.1);
        this.spawnPlayerProjectile('rocket', muzzleX, muzzleY, angle, 240, 52, 10, 5, 1.5, 32);
        this.consumeAmmo(1);
        break;
      }
      case 'flame': {
        p.fireCooldown = 0.09;
        sound.playShoot('flame');
        const fAngle = angle + (Math.random() - 0.5) * 0.18;
        this.spawnPlayerProjectile('flame', muzzleX, muzzleY, fAngle, 185, 9, 10, 10, 0.42, 0, 3);
        this.consumeAmmo(1);
        break;
      }
    }
  }

  private consumeAmmo(amount: number): void {
    if (this.player.ammo > 0) {
      this.player.ammo = Math.max(0, this.player.ammo - amount);
      if (this.player.ammo === 0) {
        this.player.weapon = 'pistol';
        this.player.ammo = -1;
      }
    }
  }

  private spawnPlayerProjectile(
    kind: Projectile['kind'],
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    w: number,
    h: number,
    life: number = 1.4,
    splashRadius: number = 0,
    pierce: number = 1
  ): void {
    this.projectiles.push({
      id: this.nextId++,
      fromPlayer: true,
      kind,
      x: x - w / 2,
      y: y - h / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w,
      h,
      damage,
      life,
      splashRadius,
      pierce,
      smokeTimer: 0,
    });
  }

  private throwGrenade(): void {
    const p = this.player;
    sound.playJump();
    this.projectiles.push({
      id: this.nextId++,
      fromPlayer: true,
      kind: 'grenade',
      x: p.x + p.w / 2,
      y: p.y + 4,
      vx: p.facing * 155,
      vy: -195,
      w: 6,
      h: 6,
      damage: 58,
      life: 1.6,
      bounces: 1,
      splashRadius: 36,
    });
  }

  private fireTankVulcan(): void {
    const t = this.tank;
    if (!t) return;
    sound.playShoot('heavy_mg');
    const dir = t.facing;
    const baseAngle = dir === 1 ? t.turretAngle : Math.PI - t.turretAngle;
    const mx = t.x + (dir === 1 ? t.w : 0);
    const my = t.y + 9;
    this.spawnPlayerProjectile(
      'heavy',
      mx,
      my,
      baseAngle + (Math.random() - 0.5) * 0.08,
      400,
      14,
      7,
      3
    );
  }

  private fireTankCannon(): void {
    const t = this.tank;
    if (!t) return;
    sound.playShoot('tank');
    this.addShake(3.2, 0.14);
    const dir = t.facing;
    const mx = t.x + (dir === 1 ? t.w + 2 : -4);
    const my = t.y + 10;
    this.projectiles.push({
      id: this.nextId++,
      fromPlayer: true,
      kind: 'tank_shell',
      x: mx,
      y: my,
      vx: dir * 240,
      vy: -115,
      w: 8,
      h: 6,
      damage: 78,
      life: 1.5,
      splashRadius: 42,
    });
  }

  private updateTank(dt: number): void {
    const t = this.tank;
    if (!t || !t.active) return;

    if (t.cannonCooldown > 0) t.cannonCooldown -= dt;
    if (t.vulcanCooldown > 0) t.vulcanCooldown -= dt;
    if (t.hitFlash > 0) t.hitFlash -= dt;

    t.vy = Math.min(420, t.vy + GRAVITY * dt);
    t.x += t.vx * dt;
    t.y += t.vy * dt;

    const minX = this.arenaLocked ? this.mission.bossArenaX + 6 : this.cameraX + 4;
    const maxX = this.mission.length - t.w - 6;
    t.x = Math.max(minX, Math.min(maxX, t.x));

    if (t.y + t.h >= GROUND_Y) {
      t.y = GROUND_Y - t.h;
      t.vy = 0;
      t.onGround = true;
    }

    if (!t.occupied) {
      t.vx *= 0.85;
    } else {
      // Crush basic infantry under tank treads!
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (
          e.kind !== 'turret' &&
          this.rectsOverlap(t.x, t.y + 6, t.w, t.h - 6, e.x, e.y, e.w, e.h)
        ) {
          this.damageEnemy(e, 999, true);
        }
      }
    }
  }

  private updateTriggers(): void {
    const px = this.player.x;
    for (const trig of this.triggers) {
      if (!trig.triggered && px >= trig.triggerX) {
        trig.triggered = true;
        for (const spec of trig.enemies) {
          this.spawnEnemy(spec.kind, trig.triggerX + spec.offsetX, spec.y);
        }
      }
    }

    if (!this.bossSpawned && px >= this.mission.bossArenaX + 40) {
      this.bossSpawned = true;
      this.arenaLocked = true;
      sound.playBossWarning();
      sound.setBgmMode('boss');
      this.spawnBoss();
    }
  }

  private spawnEnemy(kind: EnemyKind, x: number, y: number): void {
    const m = this.diffMult();
    let hp = 24;
    let w = 16;
    let h = 22;
    if (kind === 'bazooka') hp = 36;
    if (kind === 'shield') {
      hp = 48;
      w = 18;
    }
    if (kind === 'turret') {
      hp = 64;
      w = 22;
      h = 20;
    }
    if (kind === 'commando') hp = 40;

    this.enemies.push({
      id: this.nextId++,
      kind,
      x,
      y,
      vx: 0,
      vy: 0,
      w,
      h,
      hp: Math.round(hp * m),
      maxHp: Math.round(hp * m),
      facing: -1,
      onGround: kind !== 'paratrooper',
      shootCooldown: 0.7 + Math.random() * 0.8,
      stateTimer: 0,
      animTime: 0,
      hitFlash: 0,
      shieldUp: kind === 'shield',
      chuteOpen: kind === 'paratrooper',
    });
  }

  private spawnBoss(): void {
    const m = this.diffMult();
    const ax = this.mission.bossArenaX;
    if (this.mission.bossKind === 'gunship') {
      this.boss = {
        kind: 'gunship',
        name: 'R-SHOBU MK-II',
        subtitle: 'Twin-Rotor Assault Gunship',
        x: ax + VIEW_WIDTH + 30,
        y: 34,
        vx: -50,
        vy: 0,
        w: 104,
        h: 52,
        hp: Math.round(780 * m),
        maxHp: Math.round(780 * m),
        phase: 1,
        state: 'entering',
        stateTimer: 1.8,
        attackCooldown: 1.4,
        subTimer: 0,
        hitFlash: 0,
        facing: -1,
        hoverPhase: 0,
        targetX: ax + 320,
        targetY: 42,
        laserActive: false,
        laserAngle: 0,
        warningX: null,
      };
      this.showBanner('WARNING: R-SHOBU MK-II APPROACHING', 2.8);
    } else if (this.mission.bossKind === 'landship') {
      this.boss = {
        kind: 'landship',
        name: 'IRON BEHEMOTH',
        subtitle: 'Armored Siege Landship',
        x: ax + VIEW_WIDTH + 20,
        y: GROUND_Y - 62,
        vx: -40,
        vy: 0,
        w: 118,
        h: 62,
        hp: Math.round(1050 * m),
        maxHp: Math.round(1050 * m),
        phase: 1,
        state: 'entering',
        stateTimer: 2.0,
        attackCooldown: 1.4,
        subTimer: 0,
        hitFlash: 0,
        facing: -1,
        hoverPhase: 0,
        targetX: ax + 325,
        targetY: GROUND_Y - 62,
        laserActive: false,
        laserAngle: 0,
        warningX: null,
      };
      this.showBanner('WARNING: IRON BEHEMOTH INBOUND', 2.8);
    } else {
      this.boss = {
        kind: 'kraken',
        name: 'KRAKEN MK-IV',
        subtitle: 'Supreme Citadel Automaton',
        x: ax + VIEW_WIDTH + 20,
        y: GROUND_Y - 74,
        vx: -36,
        vy: 0,
        w: 94,
        h: 74,
        hp: Math.round(1350 * m),
        maxHp: Math.round(1350 * m),
        phase: 1,
        state: 'entering',
        stateTimer: 2.0,
        attackCooldown: 1.3,
        subTimer: 0,
        hitFlash: 0,
        facing: -1,
        hoverPhase: 0,
        targetX: ax + 345,
        targetY: GROUND_Y - 74,
        laserActive: false,
        laserAngle: 0,
        warningX: null,
      };
      this.showBanner('FINAL BOSS: KRAKEN MK-IV', 2.8);
    }
  }

  private updateEnemies(dt: number): void {
    const px = this.player.x;
    const py = this.player.y;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hitFlash > 0) e.hitFlash -= dt;
      if (e.shootCooldown > 0) e.shootCooldown -= dt;

      const dx = px - e.x;
      const dist = Math.abs(dx);
      e.facing = dx >= 0 ? 1 : -1;

      if (e.kind === 'paratrooper' && e.chuteOpen) {
        e.vy = 42;
        e.vx = Math.sin(this.elapsedTime * 3 + e.id) * 26;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (e.y + e.h >= GROUND_Y) {
          e.y = GROUND_Y - e.h;
          e.vy = 0;
          e.chuteOpen = false;
          e.onGround = true;
        }
      } else if (e.kind !== 'turret') {
        // Ground patrol & pursuit
        if (dist > 145 && dist < 340) {
          e.vx = e.facing * (e.kind === 'commando' ? 58 : e.kind === 'shield' ? 32 : 44);
          e.animTime += dt * 7;
        } else if (dist < 62 && e.kind !== 'shield') {
          e.vx = -e.facing * 24;
          e.animTime += dt * 5;
        } else {
          e.vx = 0;
          e.animTime = 0;
        }

        const prevBottom = e.y + e.h;
        e.vy = Math.min(400, e.vy + GRAVITY * dt);
        e.x += e.vx * dt;
        e.y += e.vy * dt;

        if (e.vy >= 0) {
          for (const plat of this.mission.platforms) {
            if (
              e.x + e.w > plat.x &&
              e.x < plat.x + plat.w &&
              prevBottom <= plat.y + 4 &&
              e.y + e.h >= plat.y
            ) {
              e.y = plat.y - e.h;
              e.vy = 0;
              e.onGround = true;
              break;
            }
          }
        }
        if (e.y + e.h >= GROUND_Y) {
          e.y = GROUND_Y - e.h;
          e.vy = 0;
          e.onGround = true;
        }
      }

      // Enemy Attacks when visible near viewport
      if (e.shootCooldown <= 0 && dist < 360 && e.x > this.cameraX - 20 && e.x < this.cameraX + VIEW_WIDTH + 30) {
        const fireRateScale = 1 / this.diffMult();
        if (e.kind === 'rifleman' || e.kind === 'paratrooper') {
          e.shootCooldown = (1.6 + Math.random() * 0.7) * fireRateScale;
          this.fireEnemyBullet(e.x + e.w / 2, e.y + 8, e.facing * 175, 0, 10);
        } else if (e.kind === 'shield') {
          e.shootCooldown = 1.9 * fireRateScale;
          this.fireEnemyBullet(e.x + e.w / 2, e.y + 10, e.facing * 165, 0, 11);
        } else if (e.kind === 'bazooka') {
          e.shootCooldown = (2.3 + Math.random() * 0.6) * fireRateScale;
          const ang = Math.atan2(py - e.y, px - e.x);
          this.projectiles.push({
            id: this.nextId++,
            fromPlayer: false,
            kind: 'enemy_rocket',
            x: e.x + e.w / 2,
            y: e.y + 6,
            vx: Math.cos(ang) * 145,
            vy: Math.sin(ang) * 145,
            w: 8,
            h: 5,
            damage: 16,
            life: 2.8,
            splashRadius: 20,
          });
        } else if (e.kind === 'turret') {
          e.shootCooldown = 1.45 * fireRateScale;
          this.fireEnemyBullet(e.x + 2, e.y + 6, e.facing * 190, -18, 12);
          this.fireEnemyBullet(e.x + 2, e.y + 10, e.facing * 190, 12, 12);
        } else if (e.kind === 'commando') {
          e.shootCooldown = 1.25 * fireRateScale;
          const ang = Math.atan2(py - e.y, px - e.x);
          this.fireEnemyBullet(e.x + e.w / 2, e.y + 8, Math.cos(ang) * 195, Math.sin(ang) * 195, 11);
        }
      }
    }
  }

  private fireEnemyBullet(x: number, y: number, vx: number, vy: number, damage: number): void {
    this.projectiles.push({
      id: this.nextId++,
      fromPlayer: false,
      kind: 'enemy_bullet',
      x,
      y,
      vx,
      vy,
      w: 5,
      h: 5,
      damage,
      life: 2.5,
    });
  }

  private updateBoss(dt: number): void {
    const b = this.boss;
    if (!b) return;

    if (b.hitFlash > 0) b.hitFlash -= dt;
    b.hoverPhase += dt;

    if (b.state === 'dying') return;

    // Phase 2 transition at 55% HP
    if (b.phase === 1 && b.hp <= b.maxHp * 0.55) {
      b.phase = 2;
      this.addShake(4.5, 0.4);
      sound.playExplosion(true);
      this.spawnExplosion(b.x + b.w / 2, b.y + b.h / 2, 28, false);
      this.showBanner(`${b.name}: OVERDRIVE PHASE!`, 2.0);
    }

    const ax = this.mission.bossArenaX;
    const pCenterX = this.player.x + this.player.w / 2;
    const pCenterY = this.player.y + this.player.h / 2;

    if (b.state === 'entering') {
      b.x += (b.targetX - b.x) * Math.min(1, dt * 2.4);
      b.stateTimer -= dt;
      if (b.stateTimer <= 0) {
        b.state = 'idle';
        b.stateTimer = 1.1;
      }
      return;
    }

    const rateScale = 1 / this.diffMult();

    if (b.kind === 'gunship') {
      // Hover & patrol left-right across arena sky
      const swayX = ax + 240 + Math.sin(b.hoverPhase * (b.phase === 2 ? 1.35 : 0.9)) * 125;
      const swayY = 36 + Math.sin(b.hoverPhase * 2.4) * 14;
      b.x += (swayX - b.x) * Math.min(1, dt * 3);
      b.y += (swayY - b.y) * Math.min(1, dt * 3);

      b.attackCooldown -= dt;
      if (b.attackCooldown <= 0) {
        const roll = Math.random();
        if (roll < 0.45) {
          // Gatling aimed fan sweep
          b.attackCooldown = (b.phase === 2 ? 1.1 : 1.5) * rateScale;
          const baseAng = Math.atan2(pCenterY - (b.y + b.h), pCenterX - (b.x + 40));
          const count = b.phase === 2 ? 5 : 3;
          for (let i = 0; i < count; i++) {
            const offset = (i - (count - 1) / 2) * 0.16;
            this.fireEnemyBullet(
              b.x + 36,
              b.y + b.h - 6,
              Math.cos(baseAng + offset) * 185,
              Math.sin(baseAng + offset) * 185,
              12
            );
          }
        } else if (roll < 0.8) {
          // Carpet bomb drop
          b.attackCooldown = (b.phase === 2 ? 1.2 : 1.7) * rateScale;
          for (let i = 0; i < (b.phase === 2 ? 3 : 2); i++) {
            this.projectiles.push({
              id: this.nextId++,
              fromPlayer: false,
              kind: 'enemy_bomb',
              x: b.x + 30 + i * 24,
              y: b.y + b.h - 4,
              vx: (Math.random() - 0.5) * 60,
              vy: 40,
              w: 8,
              h: 8,
              damage: 18,
              life: 3.0,
              splashRadius: 28,
            });
          }
        } else {
          // Wing missile salvo
          b.attackCooldown = 1.65 * rateScale;
          for (let i = -1; i <= 1; i++) {
            this.projectiles.push({
              id: this.nextId++,
              fromPlayer: false,
              kind: 'boss_missile',
              x: b.x + 20,
              y: b.y + 24,
              vx: -115 - i * 25,
              vy: 55 + Math.abs(i) * 20,
              w: 10,
              h: 5,
              damage: 16,
              life: 3.2,
              splashRadius: 22,
            });
          }
        }
      }
    } else if (b.kind === 'landship') {
      // Rolling fortress behavior
      if (b.state === 'idle') {
        const patrolX = ax + 305 + Math.sin(b.hoverPhase * 1.1) * 45;
        b.x += (patrolX - b.x) * Math.min(1, dt * 2.5);
        b.attackCooldown -= dt;
        if (b.attackCooldown <= 0) {
          const roll = Math.random();
          if (roll < 0.45) {
            // Mortar barrage
            b.attackCooldown = (b.phase === 2 ? 1.25 : 1.7) * rateScale;
            for (let i = 0; i < (b.phase === 2 ? 3 : 2); i++) {
              this.projectiles.push({
                id: this.nextId++,
                fromPlayer: false,
                kind: 'boss_orb',
                x: b.x - 10,
                y: b.y + 8,
                vx: -120 - i * 48,
                vy: -165 - i * 25,
                w: 9,
                h: 9,
                damage: 16,
                life: 3.0,
                splashRadius: 26,
              });
            }
          } else if (roll < 0.8) {
            // Lower flame / vulcan burst
            b.attackCooldown = 1.35 * rateScale;
            for (let i = 0; i < 4; i++) {
              this.fireEnemyBullet(
                b.x + 8,
                b.y + 38,
                -185 - i * 22,
                (i - 1.5) * 22,
                12
              );
            }
          } else {
            // Telegraphed Siege Beam Charge!
            b.state = 'charging';
            b.stateTimer = 0.85;
            b.laserActive = false;
          }
        }
      } else if (b.state === 'charging') {
        b.stateTimer -= dt;
        if (b.stateTimer <= 0) {
          b.state = 'attack_a';
          b.stateTimer = 0.75;
          b.laserActive = true;
          this.addShake(3.0, 0.4);
          sound.playExplosion(false);
        }
      } else if (b.state === 'attack_a') {
        b.stateTimer -= dt;
        // Beam covers ground lane at y = GROUND_Y - 22..GROUND_Y - 6
        const p = this.player;
        if (!p.inTank && p.deadTimer <= 0 && p.y + p.h > GROUND_Y - 24 && p.x < b.x) {
          this.damagePlayer(18);
        } else if (p.inTank && this.tank && this.tank.y + this.tank.h > GROUND_Y - 26 && this.tank.x < b.x) {
          this.damagePlayer(18);
        }
        if (b.stateTimer <= 0) {
          b.laserActive = false;
          b.state = 'idle';
          b.attackCooldown = 1.3 * rateScale;
        }
      }
    } else if (b.kind === 'kraken') {
      // Final Mech Boss
      if (b.state === 'idle') {
        const stalkX = ax + 325 + Math.sin(b.hoverPhase * (b.phase === 2 ? 1.5 : 0.95)) * 45;
        b.x += (stalkX - b.x) * Math.min(1, dt * 2.2);
        b.attackCooldown -= dt;
        if (b.attackCooldown <= 0) {
          const roll = Math.random();
          if (roll < 0.35) {
            // Shoulder missile volley
            b.attackCooldown = (b.phase === 2 ? 1.15 : 1.55) * rateScale;
            for (let i = 0; i < (b.phase === 2 ? 4 : 3); i++) {
              this.projectiles.push({
                id: this.nextId++,
                fromPlayer: false,
                kind: 'boss_missile',
                x: b.x + 12,
                y: b.y + 8,
                vx: -135 - i * 25,
                vy: -40 + i * 28,
                w: 10,
                h: 5,
                damage: 16,
                life: 3.2,
                splashRadius: 22,
              });
            }
          } else if (roll < 0.7) {
            // Plasma orb curtain (Phase 2 fires denser radial arc!)
            b.attackCooldown = (b.phase === 2 ? 1.2 : 1.65) * rateScale;
            const shots = b.phase === 2 ? 6 : 4;
            for (let i = 0; i < shots; i++) {
              const ang = Math.PI - 0.45 + (i / (shots - 1)) * 0.9;
              this.fireEnemyBullet(
                b.x + b.w / 2,
                b.y + 34,
                Math.cos(ang) * 175,
                Math.sin(ang) * 175,
                14
              );
            }
          } else {
            // Telegraphed Plasma Beam + Overhead Strike
            b.state = 'charging';
            b.stateTimer = 0.85;
            b.warningX = Math.max(ax + 24, Math.min(ax + 300, this.player.x));
          }
        }
      } else if (b.state === 'charging') {
        b.stateTimer -= dt;
        if (b.stateTimer <= 0) {
          b.state = 'attack_a';
          b.stateTimer = 0.8;
          b.laserActive = true;
          this.addShake(3.5, 0.35);
          sound.playExplosion(false);
          if (b.warningX !== null) {
            this.projectiles.push({
              id: this.nextId++,
              fromPlayer: false,
              kind: 'enemy_bomb',
              x: b.warningX,
              y: -12,
              vx: 0,
              vy: 230,
              w: 10,
              h: 12,
              damage: 20,
              life: 2.0,
              splashRadius: 34,
            });
            b.warningX = null;
          }
        }
      } else if (b.state === 'attack_a') {
        b.stateTimer -= dt;
        const p = this.player;
        if (p.deadTimer <= 0 && p.y + p.h > GROUND_Y - 26 && p.x < b.x) {
          this.damagePlayer(18);
        }
        if (b.stateTimer <= 0) {
          b.laserActive = false;
          b.state = 'idle';
          b.attackCooldown = 1.2 * rateScale;
        }
      }
    }
  }

  private updateProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.life -= dt;
      if (pr.life <= 0) {
        if (pr.splashRadius && pr.kind === 'grenade') {
          this.explodeProjectile(pr);
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      if (pr.kind === 'grenade' || pr.kind === 'tank_shell' || pr.kind === 'boss_orb') {
        pr.vy += 460 * dt;
      } else if (pr.kind === 'enemy_bomb') {
        pr.vy += 260 * dt;
      }

      if (pr.kind === 'rocket' || pr.kind === 'boss_missile') {
        pr.smokeTimer = (pr.smokeTimer ?? 0) + dt;
        if (pr.smokeTimer > 0.04) {
          pr.smokeTimer = 0;
          this.particles.push({
            x: pr.x + pr.w / 2,
            y: pr.y + pr.h / 2,
            vx: (Math.random() - 0.5) * 16,
            vy: -12,
            size: 4,
            color: '#cbd5e1',
            alpha: 0.75,
            life: 0.25,
            maxLife: 0.25,
            gravity: -10,
            kind: 'smoke',
          });
        }
      }

      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;

      // Ground bounce or detonation
      if (pr.y + pr.h >= GROUND_Y) {
        if (pr.kind === 'grenade' && (pr.bounces ?? 0) > 0) {
          pr.y = GROUND_Y - pr.h;
          pr.vy = -140;
          pr.vx *= 0.75;
          pr.bounces = (pr.bounces ?? 1) - 1;
          sound.playHit(true);
        } else if (
          pr.kind === 'grenade' ||
          pr.kind === 'tank_shell' ||
          pr.kind === 'enemy_bomb' ||
          pr.kind === 'boss_orb'
        ) {
          this.explodeProjectile(pr);
          this.projectiles.splice(i, 1);
          continue;
        } else if (pr.kind === 'rocket') {
          this.explodeProjectile(pr);
          this.projectiles.splice(i, 1);
          continue;
        } else {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Remove offscreen projectiles
      if (pr.x < this.cameraX - 60 || pr.x > this.cameraX + VIEW_WIDTH + 80 || pr.y < -60) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (pr.fromPlayer) {
        let consumed = false;

        // Hit Crates & Barrels
        for (let cIdx = this.crates.length - 1; cIdx >= 0; cIdx--) {
          const c = this.crates[cIdx];
          if (this.rectsOverlap(pr.x, pr.y, pr.w, pr.h, c.x, c.y, c.w, c.h)) {
            this.shotsHit++;
            this.damageCrate(c, cIdx, pr.damage);
            if (pr.splashRadius) this.explodeProjectile(pr);
            if ((pr.pierce ?? 1) <= 1) {
              consumed = true;
              break;
            } else {
              pr.pierce = (pr.pierce ?? 1) - 1;
            }
          }
        }
        if (consumed) {
          this.projectiles.splice(i, 1);
          continue;
        }

        // Hit tied POW ropes
        for (const pow of this.pows) {
          if (pow.state === 'tied' && this.rectsOverlap(pr.x, pr.y, pr.w, pr.h, pow.x, pow.y, pow.w, pow.h)) {
            this.freePow(pow);
            if (pr.kind !== 'flame') {
              consumed = true;
              break;
            }
          }
        }
        if (consumed) {
          this.projectiles.splice(i, 1);
          continue;
        }

        // Hit Enemies
        for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
          const e = this.enemies[eIdx];
          if (this.rectsOverlap(pr.x, pr.y, pr.w, pr.h, e.x, e.y, e.w, e.h)) {
            this.shotsHit++;
            const shielded =
              e.shieldUp &&
              ((pr.vx > 0 && e.facing === -1) || (pr.vx < 0 && e.facing === 1)) &&
              pr.kind !== 'rocket' &&
              pr.kind !== 'grenade' &&
              pr.kind !== 'tank_shell' &&
              pr.kind !== 'flame';

            if (shielded) {
              sound.playHit(true);
              this.damageEnemy(e, Math.max(2, Math.floor(pr.damage * 0.25)), false);
            } else {
              this.damageEnemy(e, pr.damage, false);
            }

            if (pr.splashRadius) this.explodeProjectile(pr);
            if ((pr.pierce ?? 1) <= 1) {
              consumed = true;
              break;
            } else {
              pr.pierce = (pr.pierce ?? 1) - 1;
            }
          }
        }
        if (consumed) {
          this.projectiles.splice(i, 1);
          continue;
        }

        // Hit Boss
        if (this.boss && this.boss.state !== 'dying') {
          const b = this.boss;
          if (this.rectsOverlap(pr.x, pr.y, pr.w, pr.h, b.x + 6, b.y + 4, b.w - 12, b.h - 6)) {
            this.shotsHit++;
            this.damageBoss(pr.damage);
            if (pr.splashRadius) this.explodeProjectile(pr);
            this.projectiles.splice(i, 1);
            continue;
          }
        }
      } else {
        // Enemy projectile hitting Player or Tank
        if (this.player.deadTimer <= 0) {
          const hitbox =
            this.player.inTank && this.tank
              ? { x: this.tank.x, y: this.tank.y, w: this.tank.w, h: this.tank.h }
              : {
                  x: this.player.x + 2,
                  y: this.player.crouching ? this.player.y + 8 : this.player.y + 2,
                  w: this.player.w - 4,
                  h: this.player.crouching ? this.player.h - 8 : this.player.h - 2,
                };

          if (this.rectsOverlap(pr.x, pr.y, pr.w, pr.h, hitbox.x, hitbox.y, hitbox.w, hitbox.h)) {
            if (pr.splashRadius) {
              this.explodeProjectile(pr);
            } else {
              this.damagePlayer(pr.damage);
            }
            this.projectiles.splice(i, 1);
            continue;
          }
        }
      }
    }
  }

  private explodeProjectile(pr: Projectile): void {
    const radius = pr.splashRadius ?? 28;
    const cx = pr.x + pr.w / 2;
    const cy = pr.y + pr.h / 2;
    this.spawnExplosion(cx, cy, radius, true);

    if (pr.fromPlayer) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        const dist = Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy);
        if (dist <= radius + 12) {
          this.damageEnemy(e, Math.round(pr.damage * 0.75), true);
        }
      }
      for (let cIdx = this.crates.length - 1; cIdx >= 0; cIdx--) {
        const c = this.crates[cIdx];
        const dist = Math.hypot(c.x + c.w / 2 - cx, c.y + c.h / 2 - cy);
        if (dist <= radius + 10) {
          this.damageCrate(c, cIdx, Math.round(pr.damage * 0.75));
        }
      }
      if (this.boss && this.boss.state !== 'dying') {
        const bx = Math.max(this.boss.x, Math.min(cx, this.boss.x + this.boss.w));
        const by = Math.max(this.boss.y, Math.min(cy, this.boss.y + this.boss.h));
        if (Math.hypot(bx - cx, by - cy) <= radius) {
          this.damageBoss(Math.round(pr.damage * 0.6));
        }
      }
    } else {
      const p = this.player;
      const dist = Math.hypot(p.x + p.w / 2 - cx, p.y + p.h / 2 - cy);
      if (dist <= radius + 8) {
        this.damagePlayer(pr.damage);
      }
    }
  }

  private damageCrate(c: CrateEntity, index: number, dmg: number): void {
    c.hp -= dmg;
    c.hitFlash = 0.08;
    sound.playHit(c.kind !== 'wood');
    if (c.hp <= 0) {
      const cx = c.x + c.w / 2;
      const cy = c.y + c.h / 2;
      this.crates.splice(index, 1);

      if (c.kind === 'barrel') {
        this.spawnExplosion(cx, cy, 44, true);
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          const e = this.enemies[i];
          if (Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < 58) {
            this.damageEnemy(e, 65, true);
          }
        }
      } else {
        for (let s = 0; s < 8; s++) {
          this.particles.push({
            x: cx,
            y: cy,
            vx: (Math.random() - 0.5) * 130,
            vy: -40 - Math.random() * 90,
            size: 3,
            color: c.kind === 'wood' ? '#b45309' : '#64748b',
            alpha: 1,
            life: 0.45,
            maxLife: 0.45,
            gravity: 340,
            kind: 'debris',
          });
        }
        if (c.drop) {
          this.spawnPickup(c.x, c.y, c.drop);
        }
      }
      this.addScore(50);
    }
  }

  private damageEnemy(e: EnemyEntity, dmg: number, isHeavy: boolean): void {
    e.hp -= dmg;
    e.hitFlash = 0.09;
    sound.playHit(e.kind === 'turret');

    if (e.hp <= 0) {
      const idx = this.enemies.indexOf(e);
      if (idx !== -1) this.enemies.splice(idx, 1);
      this.enemiesDefeated++;
      this.spawnExplosion(e.x + e.w / 2, e.y + e.h / 2, isHeavy || e.kind === 'turret' ? 20 : 12, false);
      const pts = e.kind === 'turret' ? 300 : e.kind === 'commando' ? 200 : 100;
      this.addScore(pts, e.x + 8, e.y - 4);
      if (Math.random() < 0.14) {
        this.spawnPickup(e.x, e.y, Math.random() < 0.5 ? 'medal' : 'grenade');
      }
    }
  }

  private damageBoss(dmg: number): void {
    const b = this.boss;
    if (!b || b.state === 'dying') return;
    b.hp -= dmg;
    b.hitFlash = 0.08;
    sound.playHit(true);

    if (b.hp <= 0) {
      b.hp = 0;
      b.state = 'dying';
      b.laserActive = false;
      this.bossDefeatedTimer = 2.4;
      this.projectiles = this.projectiles.filter((p) => p.fromPlayer);
      this.addShake(6.0, 1.5);
      sound.playExplosion(true);
      this.addScore(5000, b.x + b.w / 2, b.y + 10, '+5000 BOSS!');
      this.showBanner('TARGET DESTROYED!', 2.4);
    }
  }

  private damagePlayer(dmg: number): void {
    const p = this.player;
    if (p.invulnTimer > 0 || p.deadTimer > 0) return;

    if (p.inTank && this.tank && this.tank.active) {
      this.tank.hp -= dmg;
      this.tank.hitFlash = 0.12;
      p.invulnTimer = 0.35;
      sound.playHit(true);
      this.addShake(2.4, 0.15);

      if (this.tank.hp <= 0) {
        // Eject player safely as tank explodes!
        this.spawnExplosion(this.tank.x + 18, this.tank.y + 14, 38, true);
        this.tank.active = false;
        this.tank.occupied = false;
        p.inTank = false;
        p.vy = -240;
        p.invulnTimer = 1.8;
        this.showBanner('SLUG EJECT!', 1.2);
      }
      return;
    }

    p.hp -= dmg * this.diffMult();
    p.hitFlash = 0.16;
    p.invulnTimer = 1.0;
    sound.playPlayerHurt();
    this.addShake(3.2, 0.2);

    if (p.hp <= 0) {
      p.hp = 0;
      p.lives--;
      p.deadTimer = 1.3;
      this.spawnExplosion(p.x + p.w / 2, p.y + p.h / 2, 18, false);
    }
  }

  private freePow(pow: PowEntity): void {
    if (pow.state !== 'tied') return;
    pow.state = 'saluting';
    pow.timer = 1.2;
    this.powsRescued++;
    sound.playPowRescue();
    this.addScore(500, pow.x + 8, pow.y - 8, 'THANK YOU!');
    this.spawnPickup(pow.x + 2, pow.y, pow.drop);
  }

  private updatePows(dt: number): void {
    const p = this.player;
    for (let i = this.pows.length - 1; i >= 0; i--) {
      const pow = this.pows[i];
      if (pow.state === 'tied') {
        if (this.rectsOverlap(p.x, p.y, p.w, p.h, pow.x, pow.y, pow.w, pow.h)) {
          this.freePow(pow);
        }
      } else if (pow.state === 'saluting') {
        pow.timer -= dt;
        if (pow.timer <= 0) {
          pow.state = 'running_away';
        }
      } else if (pow.state === 'running_away') {
        pow.x -= 95 * dt;
        if (pow.x < this.cameraX - 40) {
          this.pows.splice(i, 1);
        }
      }
    }
  }

  private spawnPickup(x: number, y: number, kind: PickupKind): void {
    this.pickups.push({
      id: this.nextId++,
      x,
      y: y - 4,
      vx: 0,
      vy: -90,
      w: 14,
      h: 14,
      kind,
      life: 14,
      bobPhase: 0,
    });
  }

  private updatePickups(dt: number): void {
    const p = this.player;
    const pBox =
      p.inTank && this.tank
        ? { x: this.tank.x, y: this.tank.y, w: this.tank.w, h: this.tank.h }
        : { x: p.x, y: p.y, w: p.w, h: p.h };

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      pk.life -= dt;
      pk.bobPhase += dt * 5;
      if (pk.life <= 0) {
        this.pickups.splice(i, 1);
        continue;
      }

      const prevBottom = pk.y + pk.h;
      pk.vy = Math.min(300, pk.vy + GRAVITY * dt);
      pk.y += pk.vy * dt;

      if (pk.vy >= 0) {
        for (const plat of this.mission.platforms) {
          if (
            pk.x + pk.w > plat.x &&
            pk.x < plat.x + plat.w &&
            prevBottom <= plat.y + 4 &&
            pk.y + pk.h >= plat.y
          ) {
            pk.y = plat.y - pk.h;
            pk.vy = 0;
            break;
          }
        }
      }
      if (pk.y + pk.h >= GROUND_Y) {
        pk.y = GROUND_Y - pk.h;
        pk.vy = 0;
      }

      if (this.rectsOverlap(pBox.x, pBox.y, pBox.w, pBox.h, pk.x, pk.y, pk.w, pk.h)) {
        this.applyPickup(pk);
        this.pickups.splice(i, 1);
      }
    }
  }

  private applyPickup(pk: PickupEntity): void {
    const p = this.player;
    sound.playPickup();
    const labelMap: Record<PickupKind, { w?: WeaponType; ammo?: number; label: string }> = {
      heavy_mg: { w: 'heavy_mg', ammo: 180, label: 'HEAVY MACHINE GUN!' },
      shotgun: { w: 'shotgun', ammo: 28, label: 'SHOTGUN!' },
      rocket: { w: 'rocket', ammo: 22, label: 'ROCKET LAUNCHER!' },
      flame: { w: 'flame', ammo: 45, label: 'FLAME SHOT!' },
      grenade: { label: '+10 GRENADES!' },
      medkit: { label: 'REPAIRED +45 HP!' },
      medal: { label: '+1000 MEDAL!' },
    };

    const info = labelMap[pk.kind];
    if (info.w && info.ammo) {
      p.weapon = info.w;
      p.ammo = info.ammo;
      this.addScore(250);
    } else if (pk.kind === 'grenade') {
      p.grenades += 10;
      this.addScore(200);
    } else if (pk.kind === 'medkit') {
      p.hp = Math.min(p.maxHp, p.hp + 45);
      if (p.inTank && this.tank) {
        this.tank.hp = Math.min(this.tank.maxHp, this.tank.hp + 60);
      }
      this.addScore(200);
    } else if (pk.kind === 'medal') {
      this.addScore(1000);
    }

    this.floatingTexts.push({
      x: pk.x + 7,
      y: pk.y - 8,
      vy: -26,
      text: info.label,
      color: '#fbbf24',
      life: 1.0,
      maxLife: 1.0,
    });
  }

  private spawnExplosion(x: number, y: number, radius: number, loud: boolean): void {
    if (loud) {
      sound.playExplosion(radius > 30);
      this.addShake(radius > 30 ? 4.2 : 2.2, 0.22);
    }
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: radius * 0.6,
      color: '#fef08a',
      alpha: 1,
      life: 0.22,
      maxLife: 0.22,
      gravity: 0,
      kind: 'ring',
    });

    const count = Math.min(18, Math.max(7, Math.floor(radius * 0.45)));
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 25 + Math.random() * (radius * 2.6);
      const isFire = i % 3 !== 0;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 20,
        size: isFire ? 4 + Math.random() * 5 : 5 + Math.random() * 4,
        color: isFire ? (Math.random() < 0.5 ? '#f97316' : '#facc15') : '#475569',
        alpha: 1,
        life: 0.26 + Math.random() * 0.28,
        maxLife: 0.5,
        gravity: isFire ? -25 : -45,
        kind: isFire ? 'fire' : 'smoke',
      });
    }
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.vy += pt.gravity * dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.alpha = Math.max(0, pt.life / pt.maxLife);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
    }
  }

  private updateCamera(dt: number): void {
    if (this.arenaLocked) {
      const targetCam = this.mission.bossArenaX;
      this.cameraX += (targetCam - this.cameraX) * Math.min(1, dt * 4);
      return;
    }
    const desired = this.player.x - VIEW_WIDTH * 0.34;
    const clamped = Math.max(0, Math.min(this.mission.length - VIEW_WIDTH, desired));
    // Classic forward-push arcade camera (allows slight backtrack up to 80px)
    if (clamped > this.cameraX) {
      this.cameraX += (clamped - this.cameraX) * Math.min(1, dt * 8);
    } else if (clamped < this.cameraX - 40) {
      this.cameraX += (clamped + 40 - this.cameraX) * Math.min(1, dt * 5);
    }
  }

  private rectsOverlap(
    ax: number,
    ay: number,
    aw: number,
    ah: number,
    bx: number,
    by: number,
    bw: number,
    bh: number
  ): boolean {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // ==================== RENDERING ====================
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.imageSmoothingEnabled = false;
    ctx.save();

    if (this.shakeTimer > 0) {
      const sx = Math.round((Math.random() - 0.5) * 2 * this.shakeIntensity);
      const sy = Math.round((Math.random() - 0.5) * 2 * this.shakeIntensity);
      ctx.translate(sx, sy);
    }

    this.renderParallaxBackground(ctx);

    ctx.save();
    ctx.translate(-Math.round(this.cameraX), 0);

    this.renderTerrainAndPlatforms(ctx);
    this.renderCrates(ctx);
    this.renderPows(ctx);
    this.renderPickups(ctx);
    this.renderTank(ctx);
    this.renderEnemies(ctx);
    this.renderBoss(ctx);
    this.renderPlayer(ctx);
    this.renderProjectiles(ctx);
    this.renderParticles(ctx);
    this.renderFloatingTexts(ctx);

    ctx.restore();
    ctx.restore();
  }

  private renderParallaxBackground(ctx: CanvasRenderingContext2D): void {
    const biome = this.mission.biome;
    const cam = this.cameraX;

    if (biome === 'harbor') {
      // Sunset coastal sky gradient bands (crisp pixel bands)
      const skyBands = ['#1e1b4b', '#4c1d95', '#9d174d', '#ea580c', '#f59e0b'];
      const bandH = Math.ceil(165 / skyBands.length);
      skyBands.forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.fillRect(0, i * bandH, VIEW_WIDTH, bandH + 1);
      });
      // Sun disc
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(340, 88, 36, 36);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(336, 94, 44, 24);

      // Ocean horizon + shimmer
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(0, 152, VIEW_WIDTH, 76);
      ctx.fillStyle = '#f59e0b';
      for (let y = 156; y < 192; y += 6) {
        const w = 36 - (y - 156) * 0.4;
        ctx.fillRect(358 - w / 2 + Math.sin(this.elapsedTime * 3 + y) * 4, y, w, 2);
      }

      // Far parallax city/dock cranes (0.2x)
      ctx.fillStyle = '#18181b';
      for (let i = 0; i < 12; i++) {
        const bx = ((i * 92 - cam * 0.2) % (VIEW_WIDTH + 120) + VIEW_WIDTH + 120) % (VIEW_WIDTH + 120) - 80;
        const bh = 36 + (i % 3) * 18;
        ctx.fillRect(Math.round(bx), 152 - bh, 42, bh);
        // Crane arm
        if (i % 2 === 0) {
          ctx.fillRect(Math.round(bx) + 12, 152 - bh - 18, 4, 18);
          ctx.fillRect(Math.round(bx) + 6, 152 - bh - 18, 32, 3);
        }
      }

      // Midground ruined harbor walls (0.45x)
      ctx.fillStyle = '#27272a';
      for (let i = 0; i < 10; i++) {
        const mx = ((i * 120 - cam * 0.45) % (VIEW_WIDTH + 140) + VIEW_WIDTH + 140) % (VIEW_WIDTH + 140) - 90;
        ctx.fillRect(Math.round(mx), 182, 56, 46);
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(Math.round(mx) + 4, 186, 48, 4);
        ctx.fillStyle = '#27272a';
      }
    } else if (biome === 'foundry') {
      // Industrial smoky night-amber sky
      const skyBands = ['#090d14', '#18181b', '#27272a', '#451a03', '#7c2d12'];
      const bandH = Math.ceil(180 / skyBands.length);
      skyBands.forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.fillRect(0, i * bandH, VIEW_WIDTH, bandH + 1);
      });

      // Far smokestacks & factory silhouettes (0.2x)
      ctx.fillStyle = '#111827';
      for (let i = 0; i < 10; i++) {
        const fx = ((i * 110 - cam * 0.2) % (VIEW_WIDTH + 130) + VIEW_WIDTH + 130) % (VIEW_WIDTH + 130) - 90;
        ctx.fillRect(Math.round(fx), 96, 54, 132);
        ctx.fillRect(Math.round(fx) + 10, 62, 10, 34);
        ctx.fillRect(Math.round(fx) + 32, 70, 10, 26);
        // Glowing furnace window
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(Math.round(fx) + 14, 130, 24, 14);
        ctx.fillStyle = '#111827';
      }

      // Midground steel beams & vats (0.45x)
      ctx.fillStyle = '#1f2937';
      for (let i = 0; i < 10; i++) {
        const gx = ((i * 96 - cam * 0.45) % (VIEW_WIDTH + 120) + VIEW_WIDTH + 120) % (VIEW_WIDTH + 120) - 80;
        ctx.fillRect(Math.round(gx), 156, 12, 72);
        ctx.fillRect(Math.round(gx), 156, 96, 8);
      }
    } else {
      // Citadel stormy fortress night
      const flash = Math.sin(this.elapsedTime * 0.7) > 0.985;
      ctx.fillStyle = flash ? '#334155' : '#090d16';
      ctx.fillRect(0, 0, VIEW_WIDTH, 180);
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 140, VIEW_WIDTH, 88);

      // Far citadel towers (0.2x)
      ctx.fillStyle = '#161f30';
      for (let i = 0; i < 10; i++) {
        const tx = ((i * 104 - cam * 0.2) % (VIEW_WIDTH + 130) + VIEW_WIDTH + 130) % (VIEW_WIDTH + 130) - 90;
        ctx.fillRect(Math.round(tx), 68 + (i % 2) * 20, 48, 160);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(Math.round(tx) + 20, 84 + (i % 2) * 20, 8, 12);
        ctx.fillStyle = '#161f30';
      }

      // Diagonal storm rain
      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
      for (let r = 0; r < 28; r++) {
        const rx = (r * 37 + Math.floor(this.elapsedTime * 220)) % VIEW_WIDTH;
        const ry = (r * 23 + Math.floor(this.elapsedTime * 310)) % GROUND_Y;
        ctx.fillRect(rx, ry, 1, 6);
      }
    }
  }

  private renderTerrainAndPlatforms(ctx: CanvasRenderingContext2D): void {
    const startX = Math.max(0, Math.floor(this.cameraX / 16) * 16);
    const endX = Math.min(this.mission.length, this.cameraX + VIEW_WIDTH + 32);
    const biome = this.mission.biome;

    // Ground surface
    ctx.fillStyle = biome === 'harbor' ? '#44403c' : biome === 'foundry' ? '#1e293b' : '#1f2937';
    ctx.fillRect(startX, GROUND_Y, endX - startX, VIEW_HEIGHT - GROUND_Y);

    ctx.fillStyle = biome === 'harbor' ? '#78716c' : biome === 'foundry' ? '#475569' : '#4b5563';
    ctx.fillRect(startX, GROUND_Y, endX - startX, 5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(startX, GROUND_Y, endX - startX, 1);

    // Repeating ground brick / rail ties detail
    ctx.fillStyle = biome === 'harbor' ? '#292524' : '#0f172a';
    for (let gx = startX; gx < endX; gx += 16) {
      ctx.fillRect(gx, GROUND_Y + 5, 2, 14);
      ctx.fillRect(gx + 8, GROUND_Y + 19, 2, 16);
      if (biome === 'foundry') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(gx + 2, GROUND_Y + 2, 10, 2);
        ctx.fillStyle = '#0f172a';
      }
    }

    // Elevated one-way platforms
    for (const plat of this.mission.platforms) {
      if (plat.x + plat.w < this.cameraX - 20 || plat.x > this.cameraX + VIEW_WIDTH + 20) continue;
      ctx.fillStyle = '#090d14';
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = plat.style === 'dock' ? '#92400e' : plat.style === 'bridge' ? '#b45309' : '#475569';
      ctx.fillRect(plat.x + 1, plat.y + 1, plat.w - 2, plat.h - 2);
      ctx.fillStyle = plat.style === 'dock' ? '#d97706' : '#94a3b8';
      ctx.fillRect(plat.x + 1, plat.y + 1, plat.w - 2, 2);

      // Support struts
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(plat.x + 6, plat.y + plat.h, 3, GROUND_Y - (plat.y + plat.h));
      ctx.fillRect(plat.x + plat.w - 9, plat.y + plat.h, 3, GROUND_Y - (plat.y + plat.h));
    }
  }

  private renderCrates(ctx: CanvasRenderingContext2D): void {
    for (const c of this.crates) {
      drawCrateSprite(ctx, c.x, c.y, c.w, c.h, c.kind, c.hitFlash);
    }
  }

  private renderPows(ctx: CanvasRenderingContext2D): void {
    for (const pow of this.pows) {
      const spr = getPowSprite(pow.state === 'tied' ? 'tied' : 'salute');
      ctx.drawImage(spr, Math.round(pow.x), Math.round(pow.y));
    }
  }

  private renderPickups(ctx: CanvasRenderingContext2D): void {
    for (const pk of this.pickups) {
      const bob = Math.round(Math.sin(pk.bobPhase) * 2);
      drawPickupSprite(ctx, pk.x, pk.y + bob, pk.kind, this.elapsedTime);
    }
  }

  private renderTank(ctx: CanvasRenderingContext2D): void {
    const t = this.tank;
    if (!t || !t.active) return;

    const spr = getTankSprite(t.hitFlash > 0);
    ctx.save();
    const px = Math.round(t.x);
    const py = Math.round(t.y);
    if (t.facing === -1) {
      ctx.translate(px + t.w, py);
      ctx.scale(-1, 1);
      ctx.drawImage(spr, 0, 0, t.w, t.h);
    } else {
      ctx.drawImage(spr, px, py, t.w, t.h);
    }
    ctx.restore();

    // Prompt indicator when player is near unoccupied tank
    if (!t.occupied && Math.abs(this.player.x - t.x) < 48) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 2, py - 14, 42, 10);
      ctx.fillStyle = '#a3e635';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('[E] SLUG', px + 1, py - 7);
    }
  }

  private renderEnemies(ctx: CanvasRenderingContext2D): void {
    for (const e of this.enemies) {
      const px = Math.round(e.x);
      const py = Math.round(e.y);
      const flash = e.hitFlash > 0;

      if (e.kind === 'paratrooper' && e.chuteOpen) {
        // Draw pixel parachute canopy
        ctx.fillStyle = flash ? '#ffffff' : '#e2e8f0';
        ctx.fillRect(px - 2, py - 14, 20, 8);
        ctx.fillStyle = flash ? '#ffffff' : '#dc2626';
        ctx.fillRect(px + 3, py - 14, 10, 8);
        ctx.fillStyle = flash ? '#ffffff' : '#94a3b8';
        ctx.fillRect(px + 1, py - 6, 1, 8);
        ctx.fillRect(px + 14, py - 6, 1, 8);
      }

      if (e.kind === 'turret') {
        ctx.save();
        ctx.fillStyle = flash ? '#ffffff' : '#0f172a';
        ctx.fillRect(px, py + 4, e.w, e.h - 4);
        ctx.fillStyle = flash ? '#ffffff' : '#475569';
        ctx.fillRect(px + 2, py + 6, e.w - 4, e.h - 8);
        ctx.fillStyle = flash ? '#ffffff' : '#94a3b8';
        ctx.fillRect(e.facing === -1 ? px - 6 : px + e.w - 2, py + 8, 8, 5);
        ctx.fillStyle = flash ? '#ffffff' : '#ef4444';
        ctx.fillRect(px + 8, py + 8, 4, 4);
        ctx.restore();
        continue;
      }

      const spr = getEnemySprite(e.kind, Math.floor(e.animTime), flash);
      ctx.save();
      if (e.facing === -1) {
        ctx.translate(px + e.w, py);
        ctx.scale(-1, 1);
        ctx.drawImage(spr, 0, 0);
      } else {
        ctx.drawImage(spr, px, py);
      }
      ctx.restore();
    }
  }

  private renderBoss(ctx: CanvasRenderingContext2D): void {
    const b = this.boss;
    if (!b) return;

    // Warning reticle for Kraken orbital drop
    if (b.warningX !== null) {
      const blink = Math.sin(this.elapsedTime * 28) > 0;
      ctx.fillStyle = blink ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.25)';
      ctx.fillRect(Math.round(b.warningX) - 10, 0, 24, GROUND_Y);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(Math.round(b.warningX) - 10, GROUND_Y - 4, 24, 4);
    }

    // Charging glow or active siege laser beam
    if (b.state === 'charging') {
      const pulse = Math.sin(this.elapsedTime * 36) > 0;
      ctx.fillStyle = pulse ? '#fef08a' : '#ef4444';
      ctx.fillRect(Math.round(b.x) - 14, GROUND_Y - 22, 16, 12);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(this.mission.bossArenaX, GROUND_Y - 18, Math.round(b.x) - this.mission.bossArenaX, 4);
    } else if (b.laserActive) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(this.mission.bossArenaX, GROUND_Y - 24, Math.round(b.x) - this.mission.bossArenaX, 16);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(this.mission.bossArenaX, GROUND_Y - 20, Math.round(b.x) - this.mission.bossArenaX, 8);
    }

    if (b.kind === 'gunship') {
      drawBossGunship(ctx, b.x, b.y, b.w, b.h, this.elapsedTime, b.phase, b.hitFlash);
    } else if (b.kind === 'landship') {
      drawBossLandship(ctx, b.x, b.y, b.w, b.h, this.elapsedTime, b.phase, b.hitFlash);
    } else {
      drawBossKraken(ctx, b.x, b.y, b.w, b.h, this.elapsedTime, b.phase, b.hitFlash);
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D): void {
    const p = this.player;
    if (p.inTank || p.deadTimer > 0) return;

    // Blink during invulnerability frames
    if (p.invulnTimer > 0 && Math.floor(this.elapsedTime * 20) % 2 === 0) return;

    let pose: 'idle' | 'run1' | 'run2' | 'run3' | 'jump' | 'crouch' | 'aim_up' = 'idle';
    if (!p.onGround) {
      pose = p.aimDir === 'up' ? 'aim_up' : 'jump';
    } else if (p.crouching) {
      pose = 'crouch';
    } else if (p.aimDir === 'up') {
      pose = 'aim_up';
    } else if (Math.abs(p.vx) > 10) {
      const cycle = Math.floor(p.animTime) % 3;
      pose = cycle === 0 ? 'run1' : cycle === 1 ? 'run2' : 'run3';
    }

    const spr = getHeroSprite(pose, p.hitFlash > 0);
    const px = Math.round(p.x) - 2;
    const py = Math.round(p.y) + 2;

    ctx.save();
    if (p.facing === -1) {
      ctx.translate(px + 20, py);
      ctx.scale(-1, 1);
      ctx.drawImage(spr, 0, 0);
    } else {
      ctx.drawImage(spr, px, py);
    }
    ctx.restore();
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D): void {
    for (const pr of this.projectiles) {
      const px = Math.round(pr.x);
      const py = Math.round(pr.y);

      if (pr.kind === 'bullet' || pr.kind === 'heavy') {
        ctx.fillStyle = pr.kind === 'heavy' ? '#fbbf24' : '#fef08a';
        ctx.fillRect(px, py, pr.w, pr.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 1, py + 1, Math.max(1, pr.w - 2), 1);
      } else if (pr.kind === 'pellet') {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(px, py, pr.w, pr.h);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px + 1, py + 1, 2, 2);
      } else if (pr.kind === 'rocket' || pr.kind === 'enemy_rocket' || pr.kind === 'boss_missile') {
        ctx.fillStyle = pr.fromPlayer ? '#38bdf8' : '#ef4444';
        ctx.fillRect(px, py, pr.w, pr.h);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px + (pr.vx >= 0 ? pr.w - 3 : 0), py + 1, 3, pr.h - 2);
      } else if (pr.kind === 'flame') {
        ctx.fillStyle = Math.random() < 0.5 ? '#f97316' : '#ef4444';
        ctx.fillRect(px, py, pr.w, pr.h);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px + 2, py + 2, pr.w - 4, pr.h - 4);
      } else if (pr.kind === 'grenade' || pr.kind === 'tank_shell') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px, py, pr.w, pr.h);
        ctx.fillStyle = pr.kind === 'tank_shell' ? '#f59e0b' : '#84cc16';
        ctx.fillRect(px + 1, py + 1, pr.w - 2, pr.h - 2);
      } else {
        // Enemy bullets & orbs
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(px, py, pr.w, pr.h);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px + 1, py + 1, Math.max(1, pr.w - 2), Math.max(1, pr.h - 2));
      }
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      if (pt.kind === 'ring') {
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 2;
        const r = pt.size * (1.8 - pt.alpha);
        ctx.strokeRect(Math.round(pt.x - r / 2), Math.round(pt.y - r / 2), Math.round(r), Math.round(r));
      } else if (pt.kind === 'slash') {
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(Math.round(pt.x - 4), Math.round(pt.y - 8), 8, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(pt.x - 2), Math.round(pt.y - 10), 4, 20);
      } else {
        ctx.fillStyle = pt.color;
        ctx.fillRect(
          Math.round(pt.x - pt.size / 2),
          Math.round(pt.y - pt.size / 2),
          Math.ceil(pt.size),
          Math.ceil(pt.size)
        );
      }
      ctx.restore();
    }
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = Math.min(1, ft.life / (ft.maxLife * 0.5));
      ctx.fillStyle = '#090d14';
      ctx.fillText(ft.text, Math.round(ft.x) + 1, Math.round(ft.y) + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
    }
    ctx.restore();
  }
}
