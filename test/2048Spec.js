// https://vue-loader.vuejs.org/en/workflow/testing.html
var Vue = require('vue')
var tileComponent = require('../src/components/tile.vue')

describe('game', function () {
  // asserting rendered result by actually rendering the component
  it('should render correct message', function () {
    var vm = new Vue({
    	data: {
    		tile: {
				x: 2,
				y: 3,
				value: 2,
				merged: false,
				new: true,
			}
    	},
		template: '<div><tile :tile=tile></tile></div>',
		components: {
			'tile': tileComponent
		}
    }).$mount()

    expect(vm.$el.querySelector('.tile-inner').textContent).toBe('2')
    expect(vm.$el.firstChild.classList.contains('tile-new')).toBe(true)
    expect(vm.$el.firstChild.classList.contains('tile-2')).toBe(true)
  })
})