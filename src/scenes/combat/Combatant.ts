import {
  getUID,
  Directions,
  createRandom,
  getRandomInt,
} from "../../utility/Utility";

export enum Orientation {
  left,
  right,
}

export enum CombatantType {
  partyMember,
  enemy,
  boss,
}

export enum CombatActionTypes {
  attack,
  heal,
  defend,
  castSpell,
  useItem,
  failure,
  enchantment,
}

export type BaseStat =
  | "strength"
  | "wisdom"
  | "intellect"
  | "dexterity"
  | "stamina"
  | "hp"
  | "mp"
  | "speed"
  | "physicalResist"
  | "magicalResist";

export interface CombatResult {
  actionType: CombatActionTypes;
  executor: Combatant;
  target: Combatant;
  resultingValue: number;
  targetDown?: boolean;
  message?: string[];
  critical?: boolean;
}

export class Combatant extends Phaser.GameObjects.Sprite {
  public currentHp: number;
  public currentMp: number;
  public combatantType: CombatantType;

  public uid: string = getUID();
  private direction: Directions;
  constructor(
    public scene: Phaser.Scene,
    public id: number,
    public name: string,
    public spriteKey: string,
    public maxHp: number,
    public maxMp: number,
    public level: number,
    public intellect: number,
    public dexterity: number,
    public strength: number,
    public wisdom: number,
    public stamina: number,
    public physicalResist: number,
    public magicalResist: number,
    tint?: number
  ) {
    super(scene, 0, 0, spriteKey);
    this.setSprite();
    if (tint) {
      this.setTint(tint);
    }
    this.anims.play(spriteKey);
  }
  public setSprite(direction?: Directions) {
    this.direction = direction;
    this.setOrigin(0.5, 0.5);
    this.setAlpha(1);
  }

  getDirection() {
    return this.direction;
  }

  getOrientation() {
    return this.direction === Directions.left
      ? Orientation.left
      : Orientation.right;
  }
  standUp() {
    if (this.direction === Directions.right) {
      this.faceRight();
    }
    if (this.direction === Directions.left) {
      this.faceLeft();
    }
  }
  faceRight() {
    this.setFrame(6);
    this.flipX = true;
  }
  faceLeft() {
    this.setFrame(6);
    this.flipX = false;
  }
  faint() {
    this.setFrame(9);
  }
  initializeStatus(currentHp?: number, currentMp?: number) {
    this.setCurrentHp(currentHp);
    this.setCurrentMp(currentMp);
  }

  setCurrentHp(currentHp) {
    this.currentHp = currentHp >= 0 ? currentHp : this.getMaxHp();
  }
  setCurrentMp(currentMp) {
    this.currentMp = currentMp >= 0 ? currentMp : this.getMaxMp();
  }

  // public canCastSpell(spell: Spell): boolean {
  //   const { cost } = spell;
  //   return this.currentMp - cost >= 0;
  // }
  // /**
  //  * Return true if successful, false otherwise.
  //  * @param spell
  //  */
  // private subtractSpellCostFromMp(spell: Spell): boolean {
  //   const { cost } = spell;
  //   if (this.currentMp - cost >= 0) {
  //     this.setCurrentMp(this.currentMp - cost);
  //     return true;
  //   }
  //   return false;
  // }

  // addSpell(spell: Spell) {
  //   if (!this.spells.has(spell.id)) {
  //     this.spells.set(spell.id, spell);
  //   }
  // }
  // removeSpell(spellId) {
  //   this.spells.delete(spellId);
  // }

  private rollForAttackCrit = (): boolean => {
    const randomNumber = createRandom(100)();
    const critChance = this.getCritChance();
    return randomNumber < critChance;
  };

  attackTarget(targets: Combatant[]): CombatResult[] {
    let potency = this.getAttackPower();
    const isCrit = this.rollForAttackCrit();
    if (isCrit) {
      potency = Math.round(potency * 1.7);
    }
    const adjustedPotency = getRandomInt(potency - 1.5, potency + 1.5);
    return targets.map((t) => {
      const damageDone = t.receivePhysicalDamage(adjustedPotency);
      return {
        actionType: CombatActionTypes.attack,
        executor: this,
        target: t,
        resultingValue: damageDone,
        targetDown: t.currentHp === 0,
        critical: isCrit,
      };
    });
  }

  failedAction(targets: Combatant[]): CombatResult[] {
    const results = targets.map((t) => ({
      actionType: CombatActionTypes.failure,
      executor: this,
      target: t,
      resultingValue: 0,
      targetDown: t.currentHp === 0,
    }));
    return results;
  }
  receivePhysicalDamage(potency: number) {
    const defensePotency = this.getDefensePower();
    const actualDamage = Math.max(1, potency - defensePotency);
    this.damageFor(actualDamage);
    return actualDamage;
  }

  receiveMagicalDamage(potency: number) {
    const magicResistPotency = this.getMagicResist();
    const actualDamage = Math.max(1, potency - magicResistPotency);
    this.damageFor(actualDamage);
    return actualDamage;
  }
  public getAttackPower() {
    return this.strength * this.levelModifier();
  }
  public getMagicPower() {
    return this.intellect * this.levelModifier();
  }
  public getDefensePower() {
    return this.stamina * this.levelModifier();
  }

  public getMagicResist() {
    return (
      this.magicalResist * this.levelModifier() +
      this.wisdom * this.levelModifier()
    );
  }

  public getSpeed() {
    return this.dexterity * this.levelModifier();
  }

  public getCritChance() {
    return Math.min(this.dexterity * this.levelModifier() * 0.3, 33);
  }

  protected levelModifier() {
    return Math.round(1 + this.level / 10);
  }

  public getMaxHp() {
    return this.maxHp;
  }

  public getMaxMp() {
    return this.maxMp;
  }

  public healFor(hitPoints: number): number {
    const missingHealth = this.getMaxHp() - this.currentHp;
    this.currentHp = Math.min(this.getMaxHp(), this.currentHp + hitPoints);
    return Math.min(missingHealth, hitPoints);
  }
  public recoverManaFor(manaPoints: number): number {
    const missingMana = this.getMaxMp() - this.currentMp;
    this.currentMp = Math.min(this.getMaxMp(), this.currentMp + manaPoints);
    return Math.min(missingMana, manaPoints);
  }

  public damageFor(hitPoints: number) {
    this.currentHp = Math.max(0, this.currentHp - hitPoints);
    if (this.currentHp === 0) {
    }
  }

  // public setParty(party: Party) {
  //   this.currentParty = party;
  // }
  // public getParty() {
  //   return this.currentParty;
  // }
}
