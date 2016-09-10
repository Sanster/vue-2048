<template>
  <div id="game" class="container" v-cloak>
    <section class="heading">
      <h1 class="title">2048</h1>
      <div class="scores-container">
        <div class="score-container">124</div>
        <div class="best-container">666</div>
      </div>
    </section>

    <section class="above-game">
      <div class="game-intro">Join the numbers and get to the <strong>2048 tile!</strong></div>
      <a class="restart-button" v-on="click: init">New Game</a>
    </section>

    <section class="game-container">
      <div class="grid-container">

      </div>
      <div class="tile-container" id="tile-container">

      </div>
    </section>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      msg: 'Hello Vue!'
    }
  }
}
</script>

<style>
body {
  font-family: Helvetica, sans-serif;
}
</style>