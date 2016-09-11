import Vue from 'vue'
import Tile from './components/tile.vue'
import KeyboardInputManager from './keys.js'
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
					merged: false
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
		keyUp: function() {
			console.log("up")
		},
		keyDown: function() {
			console.log("down")
		},
		keyLeft: function() {
			console.log("left")
		},
		keyRight: function() {
			console.log("right")
		}
	},
	components: {
		'tile': Tile,
	},
})