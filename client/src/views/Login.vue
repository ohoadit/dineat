<template>
  <v-app>
    <v-container v-if="this.$vuetify.breakpoint.xsOnly" fluid class="wrapper">
      <v-row class="pa-10" justify="center">
        <v-col>
          <p class="display-1 font-weight-regular mb-10 pb-5" align="center">
            Dineat
          </p>
          <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
            <v-text-field
              autofocus
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
              :rules="[rules.isEmpty, rules.checkLength]"
              :error-messages="passError"
            >
            </v-text-field>
            <v-row justify="space-around" align="center" class="mt-5">
              <v-btn
                color="primary"
                width="100"
                class="mt-5"
                elevation="3"
                @click="signupDialog = true"
                >Signup</v-btn
              >
              <v-btn color="primary" type="submit" width="100" class="mt-5" elevation="3"
                >Signin</v-btn
              >
            </v-row>
          </v-form>
        </v-col>
      </v-row>
      <v-row justify="center" class="mt-10">
        <v-btn tile outlined color="primary" @click="restDialog = true">
          <v-icon left>mdi-silverware-fork-knife</v-icon>
          Restaurant
        </v-btn>
      </v-row>
    </v-container>
    <v-container v-if="this.$vuetify.breakpoint.smAndUp" fluid class="wrapper">
      <v-row class="mt-10">
        <v-col cols="12">
          <p class="display-1 font-weight-regular" align="center">Dineat</p>
          <v-row justify="center" class="mt-10">
            <v-card width="500px" max-height="500px" elevation="5" class="pa-5 pt-10">
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
                    validate-on-blur
                  >
                  </v-text-field>
                  <v-text-field
                    type="password"
                    v-model="password"
                    :value="password"
                    label="Password"
                    name="password"
                    :rules="[rules.isEmpty, rules.checkLength]"
                    :error-messages="passError"
                    @focus="passError = ''"
                    validate-on-blur
                  >
                  </v-text-field>
                  <v-card-actions class="mt-5">
                    <v-row justify="space-around" align="center">
                      <v-btn color="primary" @click="signupDialog = true" width="90">Signup</v-btn>
                      <v-btn color="primary" type="submit" width="90">Signin</v-btn>
                    </v-row>
                  </v-card-actions>
                </v-form>
              </v-card-text>
            </v-card>
          </v-row>
        </v-col>
      </v-row>
      <v-row justify="center" class="mt-10">
        <v-btn tile outlined color="primary" @click="restDialog = true">
          <v-icon left>mdi-silverware-fork-knife</v-icon>
          Restaurant
        </v-btn>
      </v-row>
    </v-container>
    <v-dialog v-model="signupDialog" max-width="550px">
      <v-card tile>
        <v-progress-linear indeterminate color="primary" :active="showProgress"></v-progress-linear>
        <v-card-text class="pt-10">
          <v-form ref="signup" @submit.prevent>
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
            :disabled="disabled"
            class="mr-5 mb-5"
            @click="onSignup"
            >Join</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="restDialog" max-width="500px">
      <v-card tile>
        <v-card-title class="headline font-weight-regular">Restaurant</v-card-title>
        <v-card-text>
          <v-form ref="reForm" @submit.prevent="onSignin">
            <v-text-field
              v-model="id"
              name="id"
              label="Id"
              :rules="[rules.isEmpty, rules.isNumber]"
              :error-messages="idErr"
              validate-on-blur
            ></v-text-field>
            <v-text-field
              v-model="pass"
              type="password"
              name="id"
              label="Password"
              :rules="[rules.isEmpty, rules.checkLength]"
              :error-messages="passErr"
              validate-on-blur
            ></v-text-field>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn type="submit" color="primary">Submit</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :color="color" :timeout="timeout">{{ message }}</v-snackbar>
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
    restDialog: false,
    id: "",
    pass: "",
    idErr: "",
    passErr: "",
    signupDialog: false,
    emailError: "",
    disabled: false,
    showProgress: false,
    snackbar: false,
    timeout: 7000,
    message: "",
    color: "",
    rules: {
      isEmpty: (v) => !!v || "Should not be empty",
      checkLength: (v) => v.length >= 8 || "Minimum 8 characters",
      isNumber: (v) => /^\d+$/.test(v) || "Should be a number",
    },
  }),

  methods: {
    async onSubmit() {
      this.userError = this.passError = "";
      if (!this.$refs.form.validate()) {
        return;
      }
      let response = await fetch("/gate", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });
      let res = await response.json();
      if (res.matched) {
        res.admin ? this.$router.go("/admin") : this.$router.go("/dashboard");
      } else {
        this[res.field] = res.msg;
      }
    },
    async onSignup() {
      this.emailError = "";
      if (!this.$refs.signup.validate()) {
        return;
      }
      this.showProgress = true;
      this.disabled = true;
      let response = await fetch("/admit/register", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.email,
        }),
      });
      let receipt = await response.json();
      this.showProgress = false;
      this.disabled = false;
      if (receipt.sent) {
        this.color = "teal accent-4";
        this.snackbar = true;
        this.signupDialog = false;
        this.email = "";
      } else if (receipt.field) {
        return (this[receipt.field] = receipt.msg);
      } else {
        this.color = "red lighten-1";
        this.snackbar = true;
        this.signupDialog = false;
        this.email = "";
      }
      this.message = receipt.msg;
    },
    onSignin() {
      this.idErr = this.passErr = "";
      if (!this.$refs.reForm.validate()) {
        return;
      }
      fetch("/rest/gate", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.id,
          password: this.pass,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.matched) {
            this.$router.go("/eatery");
          } else {
            this[data.field] = data.msg;
          }
        });
    },
  },
};
</script>

<style scoped>
.wrapper {
  background-color: #fff;
  height: 100%;
}
</style>
