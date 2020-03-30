<template>
  <v-app>
    <v-app-bar elevation="3" fixed color="secondary white--text">
      <v-toolbar-title class="headline">
        Dineat
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text color="white" @click="signupDialog = true"
          ><v-icon left>mdi-account-plus</v-icon> Signup</v-btn
        >
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
      <v-card width="500px" max-height="500px" elevation="5" class="pa-5">
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
              @focus="userError = ''"
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
              @focus="passError = ''"
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

    <v-dialog v-model="signupDialog" max-width="550px">
      <v-card tile>
          <v-progress-linear
          indeterminate
          color="primary"
          :active="showProgress"
      ></v-progress-linear>
        <v-card-text class="pt-10">
          <v-form ref="signup" @submit.prevent="onSignup">
            <v-text-field
              autofocus
              v-model="email"
              label="Email"
              name="email"
              :value="email"
              :rules="[rules.isEmpty]"
              :error-messages="emailError"
              validate-on-blur
              @focus="emailError = ''"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            width="100"
            tile
            :disabled="disabled"
            class="mr-5"
            @click="onSignup"
            >Register</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :color="color" :timeout="timeout">{{
      message
    }}</v-snackbar>
  </v-app>
</template>

<script>
export default {
  name: "Login",
  data: () => ({
    username: "",
    password: "",
    email: "",
    valid: false,
    userError: "",
    passError: "",
    emailError: "",
    signupDialog: false,
    disabled: false,
    showProgress: false,
    snackbar: false,
    timeout: 7000,
    message: "",
    color: "",
    rules: {
      isEmpty: v => !!v || "Should not be empty",
      checkLength: v => v.length >= 8 || "Minimum 8 characters"
    }
  }),

  methods: {
    async onSubmit() {
      this.userError = this.passError = "";
      if (!this.$refs.form.validate()) {
        return;
      }
      try {
        let response = await fetch("/gate", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          credentials: "same-origin",
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });
        let res = await response.json();
        if (res.matched) {
          res.admin
            ? this.$router.push("/admin")
            : this.$router.push("/dashboard");
          this.$store.commit("setUser", {
            username: this.username,
            cookie: document.cookie
          });
        } else {
          this[res.field] = res.msg;
        }
      } catch (err) {
        console.log(err);
      }
    },
    async onSignup() {
      this.emailError = ""
      if (!this.$refs.signup.validate()) {
        return;
      }
      this.showProgress = true;
      this.disabled = true;
      let response = await fetch("/admit/register", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: this.email
        })
      });
      let receipt = await response.json();
      this.showProgress = false;
      this.disabled = false;
      if (receipt.sent) {
        this.color = "teal accent-4";
        this.snackbar = true;
        this.signupDialog = false
      } else if (receipt.field) {
        return this[receipt.field] = receipt.msg;
      } else {
        this.color = "red lighten-1";
        this.snackbar = true;
        this.signupDialog = false
      }
      this.message = receipt.msg;
    }
  }
};
</script>

<style scoped></style>
