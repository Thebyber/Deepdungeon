import Phaser from "phaser";

export class DungeonBuilder {
  private static readonly ZONE_SIZE = 16;
  private static readonly MAP_SIZE = 32;

  static generate(
    scene: Phaser.Scene,
    tilesetKey: string,
  ): Phaser.Tilemaps.Tilemap {
    // 1. Crear el mapa maestro vacío
    const map = scene.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: this.MAP_SIZE,
      height: this.MAP_SIZE,
    });

    const tileset = map.addTilesetImage("Tileset-deep-dungeon", tilesetKey);
    const groundLayer = map.createBlankLayer("Ground", tileset!);
    const wallLayer = map.createBlankLayer("Wall", tileset!);

    // 2. Definir los cuadrantes
    const quadrants = [
      { zone: "zoneA", x: 0, y: 0 },
      { zone: "zoneB", x: this.ZONE_SIZE, y: 0 },
      { zone: "zoneD", x: 0, y: this.ZONE_SIZE },
      { zone: "zoneC", x: this.ZONE_SIZE, y: this.ZONE_SIZE },
    ];

    // 3. Rellenar cada cuadrante
    quadrants.forEach((q) => {
      const randomMapNum = Math.floor(Math.random() * 3) + 1;
      const tempMapKey = `${q.zone}_map${randomMapNum}`;
      const tempMap = scene.make.tilemap({ key: tempMapKey });

      this.copyLayerData(tempMap, "Ground", groundLayer!, q.x, q.y);
      this.copyLayerData(tempMap, "Wall", wallLayer!, q.x, q.y);

      tempMap.destroy();
    });

    return map;
  }

  private static copyLayerData(
    sourceMap: Phaser.Tilemaps.Tilemap,
    layerName: string,
    destLayer: Phaser.Tilemaps.TilemapLayer,
    offsetX: number,
    offsetY: number,
  ) {
    const layer = sourceMap.getLayer(layerName);
    if (!layer) return;

    for (let y = 0; y < this.ZONE_SIZE; y++) {
      for (let x = 0; x < this.ZONE_SIZE; x++) {
        const tile = sourceMap.getTileAt(x, y, true, layerName);
        if (tile && tile.index !== -1) {
          destLayer.putTileAt(tile.index, x + offsetX, y + offsetY);
        }
      }
    }
  }
}
