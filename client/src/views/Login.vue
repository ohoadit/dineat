<template>
  <v-app>
    <v-app-bar elevation="3" fixed color="secondary white--text">
      <v-toolbar-title class="headline">
        Dineat
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text to="/register" color="white">Signup</v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <v-content v-if="this.$vuetify.breakpoint.xsOnly">
      <v-row class="pa-10" justify="center">
        <v-col>
          <h3 class="headline my-5 pt-5">Login</h3>
          <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
            <v-text-field
              v-model="username"
              label="Username"
              :value="username"
              name="username"
              :rules="[rules.isEmpty]"
              :error-messages="userError"
            ></v-text-field>
            <v-text-field
              type="password"
              v-model="password"
              :value="password"
              label="Password"
              name="password"
              :rules="[rules.checkLength]"
              :error-messages="passError"
            >
            </v-text-field>
            <v-row justify="center">
              <v-btn
                color="primary lighten-1"
                type="submit"
                width="100px"
                class="mt-5"
                elevation="3"
                tile
                >Login</v-btn
              >
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </v-content>
    <v-row
      justify="center"
      align="baseline"
      style="marginTop: 150px;"
      v-if="this.$vuetify.breakpoint.smAndUp"
    >
      <v-card
        width="500px"
        max-height="500px"
        elevation="5"
        class="pa-5"
      >
        <v-card-title class="headline"> Login </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="onSubmit">
            <v-text-field
              autofocus
              v-model="username"
              label="Username"
              :value="username"
              name="username"
              :rules="[rules.isEmpty]"
              :error-messages="userError"
            >
            </v-text-field>
            <v-text-field
              type="password"
              v-model="password"
              :value="password"
              label="Password"
              name="password"
              :rules="[rules.checkLength]"
              :error-messages="passError"
            >
            </v-text-field>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                type="submit"
                elevation="3"
                width="100px"
                tile
                >Login</v-btn
              >
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-row>
  </v-app>
</template>

<script>
export default {
  name: "Login",
  data: () => ({
    username: "",
    password: "",
    valid: false,
    userError: "",
    passError: "",
    rules: {
      isEmpty: v => !!v || "Should not be empty",
      checkLength: v => v.length >= 8 || "Minimum 8 characters"
    }
  }),
  
  methods: {
    async onSubmit() {
      this.userError = this.passError = ""
      if (!this.$refs.form.validate()) {
        return;
      }
      try { 
      let response = await fetch("/gate", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      });
      let res = await response.json();
      if (res.matched) {
        this.$router.push('/dashboard')
        this.$store.commit('setUser', this.username)
      } else {
        this[res.field] = res.msg
      }
    }catch (err) {
      console.log(err);
    }
  }}
};
</script>

<style scoped>

</style>
