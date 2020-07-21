import { AnimationHelper } from "../utility/tweens/animation-helper";
import { BLACK, WHITE, CREAM } from "../utility/Constants";
import { State } from "../utility/state/State";

export class BootScene extends Phaser.Scene {
  private loadingBar: Phaser.GameObjects.Graphics;
  private progressBar: Phaser.GameObjects.Graphics;
  private loaded: boolean = false;
  constructor() {
    super({ key: "BootScene" });
  }

  public init() {
    if (this.loaded) {
      this.runStartupProcess();
    }
  }
  private runStartupProcess() {
    const animationHelper = new AnimationHelper(this);
    animationHelper.createGameAnimations(
      this.cache.json.get("ryanAndLoAnimation").anims
    );
    animationHelper.createGenericGameAnimations(
      ["egg-baby", "slime"],
      this.cache.json.get("combat").anims
    );

    const sprite = this.add.sprite(400, 300, "ryanandlo");
    sprite.scaleX = 1;
    sprite.scaleY = 1;
    sprite.anims.play("shine-in");
    sprite.on("animationcomplete", () => {
      this.sound.play("startup", { volume: 0.1 });

      this.add.text(300, 330, "Catshape Daruma®", {
        fontFamily: "pixel",
        fontSize: "20px",
        fill: BLACK.hex,
        fontWeight: "bold",
      });

      setTimeout(() => {
        this.scene.start("Audio");
        this.scene.start("CombatScene");
      }, 1);
    });

    // When we get to the point  where we can save state to a JSON, this is where we'd load it in, flipping the proper flags.
    const sm = State.getInstance();
    sm.initialize(this.game);
  }

  preload(): void {
    this.sound.add("startup");
    this.cameras.main.setBackgroundColor(WHITE.hex);
    this.createLoadingGraphics();
    this.load.on("complete", () => {
      this.loaded = true;
      this.runStartupProcess();
    });
    // Load the packages
    this.load.pack(
      "preload_spritesheets",
      "./src/assets/pack/spritesheets.json",
      "preload_spritesheets"
    );
    this.load.pack(
      "preload_images",
      "./src/assets/pack/image.json",
      "preload_images"
    );
    this.load.pack(
      "preload_audio",
      "./src/assets/pack/audio.json",
      "preload_audio"
    );
    this.load.pack(
      "preload_data",
      "./src/assets/pack/data.json",
      "preload_data"
    );
    this.load.pack(
      "preload_tilemaps",
      "./src/assets/pack/tilemaps.json",
      "preload_tilemaps"
    );
    // this.load.pack(
    //   "preload_data",
    //   "./src/assets/data/animations/combat.json",
    //   "preload_data"
    // );
    this.load.pack("preload", "./src/assets/pack.json", "preload");
  }
  private createLoadingGraphics(): void {
    // We can specify the type of config we want to send.
  }
}
