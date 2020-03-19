<template>
  <v-app>
    <v-content>
      <v-img src=""></v-img>
    <v-row justify="center" class="ma-3">
      <v-col cols="12" xs="12" sm="7" md="4" class="mt-10">
      <v-progress-linear indeterminate :active="showProgress" color="primary lighten-1"></v-progress-linear>
      <v-card
        max-height="500px"
        tile
        elevation="5"
        class="grey lighten-5"
      >
      <v-toolbar class="primary lighten-1 white--text"><v-toolbar-title>Dineat</v-toolbar-title></v-toolbar>
        <v-card-title class="headline pl-5">Registration</v-card-title>
        <v-card-text class="pa-5">
          <v-form ref="form" @submit.prevent="onSubmit">
            <v-text-field
              autofocus
              v-model="email"
              label="Email"
              :value="email"
              name="email"
              :rules="[rules.isEmpty, rules.email]"
              prepend-icon="mdi-email-outline"
            >
            </v-text-field>
        
            <v-card-actions class="mt-1">
              <v-spacer></v-spacer>
              <v-btn
                color="primary lighten-1"
                type="submit"
                elevation="3"
                width="100px"
                >Register</v-btn
              >
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar" :color="color" :timeout="timeout" >{{ message }}</v-snackbar>
    </v-content>

  </v-app>
</template>

<script>
export default {
  name: "Signup",
  data: () => ({
    email: '',
    showProgress: false,
    snackbar: false,
    timeout: 7000,
    message: 'xdadevelopers',
    color: '',
    disabled: false,
    rules: {
      isEmpty: v => !!v || "Should not be empty",
      email: v => {
        const rex = /^[a-zA-Z0-9](\.?[a-zA-Z0-9]){5,}@g(oogle)?mail\.com$/;
        return rex.test(v) || "Invalid Email";
      }
    }
  }),
  methods: {
    async onSubmit() {
      if (!this.$refs.form.validate()) {
        console.log(this.$route.params.id)
        return;
      }
      this.showProgress = true
      this.disabled = true
       let response = await fetch("/admit/register", {
           method: "POST",
           headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({
               email: this.email,
           })
       })
       let receipt = await response.json()
       this.showProgress = false
       this.message = receipt.msg
       if (receipt.sent) {
         this.color = 'teal accent-4'
         this.snackbar = true         
       } else {
         this.color = 'red lighten-1'
         this.snackbar = true
       }
    }
  }
};
</script>

<style scoped>
.v-content {
  background-color: #d4e3ff;
}
</style>