import Vue from 'vue';
import Tile from './components/tile.vue';
import { gameStorage } from './store';

require('./style/game.scss');

new Vue({
  el: '#game',
  data: {
    grids: [],
    tiles: [],
    startTiles: 2,
    tilePosition: 121,
    conf: {
      score: 0,
      size: 4,
      bestScore: 0,
    },
  },
  ready() {
    const tilesStoraged = gameStorage.fetch('vue2048');
    const confStoraged = gameStorage.fetch('vue2048-config');

    if (confStoraged.score) {
      this.conf = confStoraged;
      this.continueGame(tilesStoraged);
    } else {
      this.init();
    }

    this.addKeyListener();

    this.$watch('tiles', (tiles) => {
      gameStorage.save('vue2048', tiles);
    });

    this.$watch('conf', (conf) => {
      gameStorage.save('vue2048-config', conf);
    }, {
      deep: true,
    });
  },
  methods: {
    init() {
      this.initArrayGrid(this.conf.size);

      this.tiles = [];
      this.updateScore(0);

      for (let i = 0; i < this.startTiles; i += 1) {
        this.addRandomTile();
      }
    },
    continueGame(tiles) {
      this.initArrayGrid(this.conf.size);
      this.tiles = tiles;

      tiles.forEach((item) => {
        this.grids[item.x][item.y] = 1;
      });
    },
    initArrayGrid(size) {
      const arr = [];

      for (let x = 0; x < size; x += 1) {
        arr[x] = [];
        for (let y = 0; y < size; y += 1) {
          arr[x][y] = 0;
        }
      }

      this.grids = arr;
    },
    addRandomTile() {
      if (this.availableCells().length > 0) {
        const value = Math.random() < 0.9 ? 2 : 4;

        const randomCell = this.randomAvailableCell();

        this.addTile({
          value,
          x: randomCell.x,
          y: randomCell.y,
          merged: false,
          new: true,
        });
      }
    },
    addTile(tile) {
      const tiles = this.tiles;
      const len = tiles.length;

      tiles.$set(len, {
        x: tile.x,
        y: tile.y,
        value: tile.value,
        merged: tile.merged,
        new: tile.new,
      });

      this.grids[tile.x][tile.y] = 1;
    },
    availableCells() {
      const cells = [];
      const size = this.conf.size;
      const grids = this.grids;

      for (let x = 0; x < size; x += 1) {
        for (let y = 0; y < size; y += 1) {
          if (!grids[x][y]) {
            cells.push({ x, y });
          }
        }
      }

      return cells;
    },
    // Find the first available random position
    randomAvailableCell() {
      const cells = this.availableCells();

      if (cells.length) {
        return cells[Math.floor(Math.random() * cells.length)];
      }
    },
    updateScore(score) {
      // On init
      if (score === 0) {
        this.conf.score = 0;
        return false;
      }

      this.conf.score += score;

      if (this.conf.score > this.conf.bestScore) {
        this.conf.bestScore = this.conf.score;
      }

      // The mighty 2048 tile
      if (score === 2048) {
        this.message(true);
      }
    },
    moveTile(tile, position) {
      if (tile.x === position.x && tile.y === position.y) {
        return false;
      }

      this.grids[tile.x][tile.y] = 0;
      this.grids[position.x][position.y] = 1;

      tile.x = position.x;
      tile.y = position.y;

      return true;
    },
    mergeTiles(curr, next) {
      next.value *= 2;
      next.merged = true;

      this.grids[curr.x][curr.y] = 0;

      this.tiles.$remove(curr);

      this.updateScore(next.value);
    },
    move(direction) {
      const vector = this.getVector(direction);
      // console.log('===============vector================')
      // console.log(vector)
      // console.log("\n")
      const traversals = this.buildTraversals(vector);
      // console.log("=========traversals===========")
      // console.log(traversals);
      // console.log("\n")

      let moved = false;

      traversals.x.forEach((x) => {
        traversals.y.forEach((y) => {
          // console.log(x, y);
          if (this.grids[x][y]) {
            const tile = this.findTile({ x, y });
            tile.new = false;
            tile.merged = false;

            // console.log("tile (" + tile.x + ", " + tile.y + ") value: "+ tile.value)

            // 找到 tile 最远可以移动的位置
            const positions = this.findFarthestPosition({ x, y }, vector);

            const nextTile = this.findTile(positions.next);

            // console.log("next tile (" + positions.next.x + ", " + positions.next.y + ")")
            // console.log(nextTile)

            // Only one merger per row traversal?
            if (nextTile && nextTile.value === tile.value && nextTile.merged === false) {
              this.mergeTiles(tile, nextTile);
              moved = true;
            } else {
              const tileMoved = this.moveTile(tile, positions.farthest);
              if (tileMoved === true) moved = true;
            }
            // console.log("\n")
          }
        });
      });

      if (moved) {
        this.addRandomTile();

        if (this.grids.toString().indexOf('0') === -1) {
          if (!this.tileMatchesAvailable()) {
            this.gameOver();
          }
        }
      }
    },
    tileMatchesAvailable() {
      const size = this.conf.size;
      const grids = this.grids;
      let tile;

      for (let x = 0; x < size; x += 1) {
        for (let y = 0; y < size; y += 1) {
          tile = grids[x][y];

          if (tile) {
            for (let direction = 0; direction < 4; direction += 1) {
              const vector = this.getVector(direction);
              const cell = {
                x: x + vector.x,
                y: y + vector.y,
              };
              let other;

              if (cell.x >= 0 && cell.x < size && cell.y >= 0 && cell.y < size) {
                other = grids[cell.x][cell.y];
              } else {
                continue;
              }

              if (other && this.findTile(cell).value === this.findTile({ x, y }).value) {
                return true; // These two tiles can be merged
              }
            }
          }
        }
      }

      return false;
    },
    // Y 方向向下为正常方向
    // X 方向向右为正常方向
    getVector(direction) {
      const map = {
        0: { x: 0, y: -1 }, // Up
        1: { x: 1, y: 0 }, // Right
        2: { x: 0, y: 1 }, // Down
        3: { x: -1, y: 0 }, // Left
      };

      return map[direction];
    },
    buildTraversals(vector) {
      const traversals = { x: [], y: [] };
      const size = this.conf.size;

      for (let pos = 0; pos < size; pos += 1) {
        traversals.x.push(pos);
        traversals.y.push(pos);
      }

      // Always traverse from the farthest cell in the chosen direction
      // 如果是往下移动，则从 y=3 开始移动方块，traversal 最终为 [3,2,1,0]
      if (vector.x === 1) traversals.x = traversals.x.reverse();
      if (vector.y === 1) traversals.y = traversals.y.reverse();

      return traversals;
    },
    findTile(position) {
      if (position.x === -1 || position.y === -1) {
        return null;
      }
      let tiles = this.tiles;

      tiles = tiles.filter((item => item.x === position.x && item.y === position.y));

      return tiles[0];
    },
    findFarthestPosition(cell, vector) {
      var previous;

      do {
        previous = cell;
        cell = {
          x: previous.x + vector.x,
          y: previous.y + vector.y
        };

      } while (this.withinBounds(cell) && !this.grids[cell.x][cell.y]);

      return {
        farthest: previous,
        next: cell // Used to check if a merge is required
      };
    },
    withinBounds(position) {
      const size = this.conf.size;

      return position.x >= 0 && position.x < size && position.y >= 0 && position.y < size;
    },
    addKeyListener() {
      const map = {
        38: 0, // Up
        39: 1, // Right
        40: 2, // Down
        37: 3, // Left
      };
      // Respond to direction keys
      document.addEventListener("keydown", (event) => {
        var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                        event.shiftKey;
        var mapped    = map[event.which];

        if (!modifiers) {
          if (mapped !== undefined) {
            event.preventDefault();
            this.move(mapped);
          }
        }
      });
    },
  },
  components: {
    tile: Tile,
  },
});
