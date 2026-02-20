import { REWARD_ENERGY } from "../DeepDungeonConstants";

export interface PlayerStats {
  energy: number;
  maxEnergy: number;
  currentLevel: number; // Nivel actual de la mazmorra
  inventory: {
    pickaxe: number;
  };
}

export class PlayerState {
  private static instance: PlayerState;
  private stats: PlayerStats = {
    energy: 100,
    maxEnergy: 100,
    currentLevel: 1, // Empezamos en el 1
    inventory: { pickaxe: 0 },
  };

  private constructor() {}

  public static getInstance(): PlayerState {
    if (!PlayerState.instance) {
      PlayerState.instance = new PlayerState();
    }
    return PlayerState.instance;
  }
  // ESTA ES LA FUNCIÓN QUE TE FALTA O TIENE OTRO NOMBRE
  public collectTool(name: "pickaxe") {
    this.stats.inventory[name] += 1;
    // Importante para actualizar la interfaz (el serrucho/pico de la imagen)
    window.dispatchEvent(new Event("inventoryUpdated"));
  }
  public getEnergy() {
    return this.stats.energy;
  }

  public consumeEnergy(amount: number): boolean {
    if (this.stats.energy >= amount) {
      this.stats.energy -= amount;
      window.dispatchEvent(new Event("energyChanged"));
      // -------------------------------------
      //console.log("Energía restante:", this.stats.energy);
      return true;
    }
    return false;
  }

  public addEnergy(amount: number) {
    this.stats.energy = Math.min(
      this.stats.energy + amount,
      this.stats.maxEnergy,
    );
  }

  public increaseMaxEnergy(amount: number) {
    this.stats.maxEnergy += amount;
    this.stats.energy += amount; // Opcional: curar al aumentar el máximo
  }
  public getLevel() {
    return this.stats.currentLevel;
  }
  public nextLevel() {
    this.stats.currentLevel += 1;
    // Sumamos la energía sin pasarnos del máximo (ej. 100)
    this.stats.energy = Math.min(this.stats.energy + REWARD_ENERGY, 100);
    // Avisamos a la interfaz para que actualice la barra de energía
    window.dispatchEvent(new Event("energyChanged"));
    //console.log(`¡Nivel ${this.stats.currentLevel}! Has recuperado ${REWARD_ENERGY} de energía.`);
  }
}
