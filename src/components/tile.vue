<template>
	<div
		class="tile tile-{{tile.value}} {{tile.new ? 'tile-new' : ''}} {{tile.merged ? ' tile-merged' : ''}}"
		:style="{transform: 'translate(' + calcStyleX + 'px,' + calcStyleY + 'px)'}"
		>
		<div class="tile-inner">{{tile.value}}</div>
	</div>
</template>

<script>
export default {
	replace: true,
	props: ['tile'],
	template: '#tile-template',
	computed: {
		calcStyleX: function() {
			var tilePosition = this.$parent.tilePosition;
			
			return tilePosition * this.tile.x;
		},

		calcStyleY: function() {
			var tilePosition = this.$parent.tilePosition;

			return tilePosition * this.tile.y;
		},

		isMerged: function(){
			return 'tile-merged';
		}
	}
}
</script>
