import { REWARD_ENERGY } from "../DeepDungeonConstants";

export interface PlayerStats {
  energy: number;
  maxEnergy: number;
  currentLevel: number; // Nivel actual de la mazmorra
  inventory: {
    pickaxe: number;
  };
  targetScore: number;
  attack: number;
  defense: number;
}

export class PlayerState {
  private static instance: PlayerState;
  public stats: PlayerStats = {
    energy: 100,
    maxEnergy: 100,
    currentLevel: 1, // Empezamos en el 1
    inventory: { pickaxe: 0 },
    targetScore: 1000,
    attack: 1,
    defense: 1,
  };

  private constructor() {}

  public static getInstance(): PlayerState {
    if (!PlayerState.instance) {
      PlayerState.instance = new PlayerState();
    }
    return PlayerState.instance;
  }
  // ESTA ES LA FUNCIÓN QUE TE FALTA O TIENE OTRO NOMBRE

  public getAttack() {
    return this.stats.attack;
  }
  public getDefense() {
    return this.stats.defense;
  }

  public getEnergy() {
    return this.stats.energy;
  }

  public consumeEnergy(amount: number): boolean {
    // 1. Calculamos la energía restante permitiendo que llegue a 0
    // aunque el daño sea mayor que la vida actual.
    const newEnergy = Math.max(0, this.stats.energy - amount);

    // Guardamos si realmente hubo un cambio (opcional, para el boolean)
    const wasAlive = this.stats.energy > 0;

    this.stats.energy = newEnergy;

    // 2. Notificamos a React y otros componentes
    this.notifyStatsUpdate();

    // 3. Si llegamos a 0, podrías disparar aquí un evento de muerte
    if (this.stats.energy === 0 && wasAlive) {
      //console.log("¡El jugador se ha quedado sin energía!");
      window.dispatchEvent(new Event("PLAYER_DIED"));
    }

    return true;
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
    // IMPORTANTE: Avisar a React que la energía cambió
    this.notifyStatsUpdate();
  }
  public getLevel() {
    return this.stats.currentLevel;
    // IMPORTANTE: Avisar a React que la energía cambió
    this.notifyStatsUpdate();
  }

  public nextLevel() {
    this.stats.currentLevel += 1;
    // Sumamos la energía sin pasarnos del máximo (ej. 100)
    this.stats.energy = Math.min(this.stats.energy + REWARD_ENERGY, 100);
    // Avisamos a la interfaz para que actualice la barra de energía
    window.dispatchEvent(new Event("energyChanged"));
    //console.log(`¡Nivel ${this.stats.currentLevel}! Has recuperado ${REWARD_ENERGY} de energía.`);
  }
  public collectTool(name: "pickaxe") {
    this.stats.inventory[name] += 1;
    this.notifyStatsUpdate();
  }

  public spendPickaxe(): boolean {
    if (this.stats.inventory.pickaxe > 0) {
      this.stats.inventory.pickaxe -= 1;
      this.notifyStatsUpdate();
      return true;
    }
    return false;
  }

  // Asegúrate de que los getters apunten a this.stats
  public getPickaxes() {
    return this.stats.inventory.pickaxe;
  }

  public upgradeAttack(amount: number) {
    this.stats.attack += amount; // Faltaba el .stats
    this.notifyStatsUpdate();
  }

  // Método centralizado para avisar a React
  private notifyStatsUpdate() {
    const event = new CustomEvent("PLAYER_STATS_CHANGED", {
      detail: {
        attack: this.stats.attack,
        defense: this.stats.defense,
        pickaxes: this.stats.inventory.pickaxe,
        energy: this.stats.energy,
        maxEnergy: this.stats.maxEnergy,
        currentLevel: this.stats.currentLevel,
      },
    });
    window.dispatchEvent(event);
  }
  // AÑADE ESTO:
  public setLevel(newLevel: number) {
    this.level = newLevel;
  }
}
