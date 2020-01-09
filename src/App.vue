<template>
  <div id="app">
    <WindowLayout :content-url="contentUrl"/>
  </div>
</template>

<script lang="ts">

  import {Component, Vue} from "vue-property-decorator";

  import WindowLayout from "@/views/layout/WindowLayout.vue";


  @Component({
    components: {
      WindowLayout
    }
  })
  export default class App extends Vue {
    private get contentUrl() {
      let searchStr: string = location.search;
      if (searchStr === "") {
        return undefined
      }
      searchStr = searchStr.substring(1);
      const params = searchStr.split("&");
      if (params.length <= 0) {
        return undefined;
      }

      for (let p in params) {
        const ps = params[p].split("=");
        if (ps.length <= 1 || ps[0] !== "openUrl") {
          continue
        }
        return ps[1];
      }

      return undefined;
    }
  }

</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
