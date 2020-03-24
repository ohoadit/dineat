<template>
  <v-app>
    <v-content>
      <v-img src=""></v-img>
    <v-row justify="center" class="mt-10">
      <v-col cols="11" xs="11" sm="8" md="6" class="mt-10">
      <v-progress-linear indeterminate :active="showProgress" color="primary lighten-2"></v-progress-linear>
      <v-card
        max-height="500px"
        tile
        elevation="5"
      >
      <v-toolbar elevation="3" class="secondary white--text"><v-toolbar-title class="headline">Dineat</v-toolbar-title></v-toolbar>
        <v-card-title class="subtitle font-weight-regular">Registration</v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="onSubmit">
            <v-text-field
              autofocus
              v-model="email"
              label="Email"
              :value="email"
              name="email"
              :rules="[rules.isEmpty, rules.email]"
              validate-on-blur
            >
            </v-text-field>
        
            <v-card-actions class="mt-1">
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
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
    message: '',
    color: '',
    disabled: false,
    rules: {
      isEmpty: v => !!v || "Should not be empty",
      email: v => {
        const rex = /^[a-zA-Z0-9](\.?[a-zA-Z0-9]){5,}@(g(oogle)?mail\.com|iite\.indusuni\.ac\.in)$/
        return rex.test(v) || "Invalid email id";
      }
    }
  }),
  methods: {
    async onSubmit() {
      if (!this.$refs.form.validate()) {
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

</style>