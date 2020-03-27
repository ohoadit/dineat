<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
  data: () => ({ 
    //
  }),
};
</script>

<style scoped>
#app {
    -webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
    background-color: #f6f7f9;
}
</style>
