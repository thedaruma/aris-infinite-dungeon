import { RED, GREEN, BLUE } from "../../utility/Constants";
import { Combatant } from "./Combatant";

export class Hotkey extends Phaser.GameObjects.Graphics {
  private skill: any;
  constructor({ scene, x, y, skill }) {
    super(scene);
    this.fillStyle(RED.hex, 1.0);
    this.fillRect(x, y, 50, 50);
    this.skill = skill;
  }

  public getSkill() {
    return this.skill;
  }
}

export class Hotbar extends Phaser.GameObjects.Container {
  private hotkeys: Hotkey[] = [];
  constructor(scene, x, y) {
    super(scene, x, y);
  }
  buildHotbar(hotkeys: any[]) {
    this.removeAll();
    this.hotkeys = [];
    hotkeys.forEach((h, i) => {
      this.addHotkeyToHotbar(h, i);
    });
  }

  addHotkeyToHotbar(skill, index) {
    const hotkey = new Hotkey({
      scene: this.scene,
      x: 50 * index + 5 * index,
      y: 0,
      skill,
    });
    this.hotkeys.push(hotkey);
    this.add(hotkey);
  }

  public hasHotkey(index: number) {
    return Boolean(this.hotkeys[index]);
  }
  public getSkillAt(index: number): Hotkey {
    if (this.hasHotkey(index)) {
      return this.hotkeys[index];
    }
  }
}

export class CombatContainer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, entities) {
    super(scene, x, y);
  }
}

export class CombatScene extends Phaser.Scene {
  private phaserSprite: Phaser.GameObjects.Sprite;
  private PartyContainer: Phaser.GameObjects.Container;
  private EnemyContainer: Phaser.GameObjects.Container;
  private hotbar: Hotbar;
  private EnergyContainer: Phaser.GameObjects.Container;
  private QueueContainer: Phaser.GameObjects.Container;
  constructor() {
    super({
      key: "CombatScene",
    });
  }

  init(): void {
    this.PartyContainer = new Phaser.GameObjects.Container(this, 150, 250);
    this.add.existing(this.PartyContainer);
    const hero = new Phaser.GameObjects.Graphics(this);
    hero.fillStyle(BLUE.hex, 1.0);
    hero.fillRect(0, 0, 25, 25);
    const hero2 = new Combatant(
      this,
      1,
      "egg-baby",
      "egg-baby",
      30,
      30,
      1,
      1,
      1,
      2,
      1,
      10,
      1,
      1,
      BLUE.hex
    );
    this.PartyContainer.add(hero2);
      hero2.anims.play('egg-baby-idle')
    this.EnemyContainer = new Phaser.GameObjects.Container(this, 600, 250);
    this.add.existing(this.EnemyContainer);
    const enemy = new Phaser.GameObjects.Graphics(this);

    enemy.fillStyle(GREEN.hex, 1.0);
    enemy.fillRect(0, 0, 25, 25);
    
    const enemy2 = new Combatant(
      this,
      1,
      "slime",
      "slime",
      30,
      30,
      1,
      1,
      1,
      2,
      1,
      10,
      1,
      1,
      GREEN.hex
    );
    enemy2.anims.play('slime-idle')
    
    this.EnemyContainer.add(enemy2);

    this.hotbar = new Hotbar(this, 300, 540);
    this.add.existing(this.hotbar);

    this.hotbar.buildHotbar([
      { name: "Something", power: 10 },
      { name: "Another", power: 20 },
      { name: "Last", power: 30 },
      { name: "Most Powerful", power: 40 },
    ]);

    this.input.keyboard.on("keydown", (event) => {
      switch (event.key) {
        case "1":
        case "2":
        case "3":
        case "4":
          if (this.hotbar.hasHotkey(Number(event.key) - 1)) {
            const skillToExecute = this.hotbar.getSkillAt(
              Number(event.key - 1)
            );
            console.log(skillToExecute.getSkill());
          }
          break;
        default:
          break;
      }
    });
  }

  createHotbar() {}

  preload(): void {}

  create(): void {}
}
