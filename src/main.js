import Vue from 'vue'
import Tile from './components/tile.vue'
require('./style/game.scss')

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
			bestScore: 0
		}
	},
	ready: function() {
	    this.init();
	    this.addKeyListener();
	},
	methods: {
		init: function() {
		    this.initArrayGrid(this.conf.size);

		    this.tiles = [];
		    this.updateScore(0);

	    	for (var i = 0; i < this.startTiles; i++) {
				this.addRandomTile();
			}
		},
		initArrayGrid: function(size) {
		    var arr = [];

		    for (var x = 0; x < size; x++) {
		      arr[x] = [];
		      for (var y = 0; y < size; y++) {
		        arr[x][y] = 0;
		      }
		    }

		    this.grids = arr;
		},
		addRandomTile: function() {
			if (this.availableCells().length > 0) {
				var value = Math.random() < 0.6 ? 2 : 4;

				var randomCell = this.randomAvailableCell();

				this.addTile({
					x: randomCell.x,
					y: randomCell.y,
					value: value,
					merged: false,
					new: true,
				});
			}
		},
		addTile: function(tile) {

			var tiles = this.tiles,
				len = tiles.length;

			tiles.$set(len, {
				x: tile.x,
				y: tile.y,
				value: tile.value,
				merged: tile.merged,
				new: tile.new,
			});

			this.grids[tile.x][tile.y] = 1;
		},
		availableCells: function() {
			var cells = [],
				size = this.conf.size,
				grids = this.grids;

			for (var x = 0; x < size; x++) {
				for (var y = 0; y < size; y++) {
					if (!grids[x][y]) {
						cells.push({
							x: x,
							y: y
						});
					}
				}
			}

			return cells;
		},
		// Find the first available random position
		randomAvailableCell: function() {
			var cells = this.availableCells();

			if (cells.length) {
				return cells[Math.floor(Math.random() * cells.length)];
			}
		},
		updateScore: function(score) {
			var scoreContainer = document.getElementsByClassName('score-container')[0];

			//On init
			if (score === 0) {
				this.conf.score = 0;
				return false;
			}

			this.conf.score += score;

			if (this.conf.score > this.conf.bestScore) {
				this.conf.bestScore = this.conf.score;
			}

			// The mighty 2048 tile
			if (score === 2048)
				this.message(true);
		},

		moveTile: function(tile, position) {

			if (tile.x === position.x && tile.y === position.y) {
				return false;
			} else {
				this.grids[tile.x][tile.y] = 0;
				this.grids[position.x][position.y] = 1;

				tile.x = position.x;
				tile.y = position.y;

				return true;
			}

		},

		mergeTiles: function(curr, next)  {
			next.value *= 2;
			next.merged = true;
			
			this.grids[curr.x][curr.y] = 0;
			
			this.tiles.$remove(curr);

			this.updateScore(next.value);
		},

		move: function(direction) {
			var vector = this.getVector(direction);
			console.log('===============vector================')
			console.log(vector)
			console.log("\n")
			var traversals = this.buildTraversals(vector);
			console.log("=========traversals===========")
			console.log(traversals);
			console.log("\n")

			var moved = false;
			var positions;
			var next;
			var tile;

			traversals.x.forEach( (x) => {
				traversals.y.forEach( (y) => {
					// console.log(x, y);
					if (this.grids[x][y]) {
						var tile = this.findTile({ x: x, y: y });
						tile.new = false;
						tile.merged = false;
						
						console.log("tile (" + tile.x + ", " + tile.y + ") value: "+ tile.value)

						//找到 tile 最远可以移动的位置
						var positions = this.findFarthestPosition({
							x: x,
							y: y
						}, vector);
						console.log("fartchest position: (" + positions.farthest.x + ", " + positions.farthest.y + ")")

						var nextTile = this.findTile(positions.next);

						console.log("next tile (" + positions.next.x + ", " + positions.next.y + ")")
						console.log(nextTile)
						
						// Only one merger per row traversal?
						if (nextTile && nextTile.value === tile.value) {
							this.mergeTiles(tile, nextTile);
							moved = true;
						} else {
							var _moved = this.moveTile(tile, positions.farthest);
							if (_moved==true) moved = true;
						}
						console.log("\n")
					}
				});
			});

			if (moved) {
				console.log("moved!")
				this.addRandomTile();

				if (this.grids.toString().indexOf('0') === -1) {
					if (!this.tileMatchesAvailable()) {
						this.gameOver();
					}

				}

			}
		},

		tileMatchesAvailable: function() {

			var size = this.conf.size;
			var grids = this.grids;
			var tiles = this.tiles;
			var tile;

			for (var x = 0; x < size; x++) {
				for (var y = 0; y < size; y++) {
					tile = grids[x][y];

					if (tile) {
						for (var direction = 0; direction < 4; direction++) {
							var vector = this.getVector(direction);
							var cell = {
								x: x + vector.x,
								y: y + vector.y
							},
								other;

							if (cell.x >= 0 && cell.x < size && cell.y >= 0 && cell.y < size) {
								other = grids[cell.x][cell.y];
							} else {
								continue;
							}

							if (other && this.findTile(cell).value === this.findTile({
								x: x,
								y: y
							}).value) {
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
		getVector: function(direction) {
			var map = {
				0: {x: 0, y: -1 }, // Up
				1: {x: 1, y: 0 }, // Right
				2: {x: 0, y: 1 }, // Down
				3: {x: -1, y: 0 } // Left
			};

			return map[direction];
		},

		buildTraversals: function(vector) {
			var traversals = { x: [], y: [] };
			var	size = this.conf.size;

			for (var pos = 0; pos < size; pos++) {
				traversals.x.push(pos);
				traversals.y.push(pos);
			}

			// Always traverse from the farthest cell in the chosen direction
			// 如果是往下移动，则从 y=3 开始移动方块，traversal 最终为 [3,2,1,0]
			if (vector.x === 1) traversals.x = traversals.x.reverse();
			if (vector.y === 1) traversals.y = traversals.y.reverse();

			return traversals;
		},

		findTile: function(position) {

			if (position.x === -1 || position.y === -1)
				return null;
			else {
				var tiles = this.tiles;

				return tiles.filter(function(item, index) {
					return item.x === position.x && item.y === position.y;
				})[0];
			}

		},

		findFarthestPosition: function(cell, vector) {
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

		withinBounds: function(position) {
			var size = this.conf.size;

			return position.x >= 0 && position.x < size && position.y >= 0 && position.y < size;
		},

		addKeyListener: function() {
	        var map = {
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
		}
	},
	components: {
		'tile': Tile,
	},
})