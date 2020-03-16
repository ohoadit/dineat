<template>
<v-app>
  <Login/>
</v-app>
</template>

<script>
// @ is an alias to /src
import Login from "./Login"
export default {
  name: 'Home',
  components: {
    "Login": Login
  }
}
</script>
