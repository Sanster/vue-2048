import Vue from 'vue'
require('./style/game.scss')

new Vue({
	el: '#game',
	data: {
		grids: [],
	},
	ready: function() {
	    this.init();
	},
	methods: {
		init: function() {
		    this.initArrayGrid(4);
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
	}
})