<template>
  <v-app>
    <v-container class="container pa-0" fluid>
      <v-carousel
        cycle
        hide-delimiter-background
        hide-delimiters
        :show-arrows="false"
        :height="mobile ? '100%' : '75vh'"
      >
        <v-carousel-item v-for="(slide, i) in content" :key="i">
          <v-card
            tile
            flat
            :color="slide.color"
            class="fill-height d-flex flex-column"
            align="center"
          >
            <v-row>
              <v-col
                class="title font-weight-regular black--text text-center pt-10 px-10"
                cols="12"
              >
                {{ slide.desc }}
              </v-col>
              <v-col cols="12">
                <v-img
                  :src="require(`../assets/${slide.img}.svg`)"
                  contain
                  :max-height="mobile ? '300px' : '350px'"
                ></v-img>
              </v-col>
              <v-col cols="12" v-if="mobile">
                <v-btn dark class="mx-7" width="90" @click="loginDialog = true">Login</v-btn>
                <v-btn dark class="mx-7" width="90" @click="signupDialog = true">Signup</v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-carousel-item>
      </v-carousel>
      <v-card flat tile class="pa-0 ma-0" color="#f6f7f9" height="25vh" v-if="!mobile">
        <v-row justify="center" align="center" class="fill-height">
          <v-btn dark class="mx-10" width="90" @click="loginDialog = true">Login</v-btn>
          <v-btn dark class="mx-10" width="90" @click="signupDialog = true">Signup</v-btn>
        </v-row></v-card
      >
    </v-container>
    <v-dialog
      v-model="loginDialog"
      v-if="loginDialog"
      max-width="500px"
      persistent
      no-click-animation
    >
      <v-card tile>
        <v-card-title class="headline font-weight-regular"
          >Dineat<v-spacer></v-spacer>
          <v-btn icon @click="loginDialog = false"><v-icon>mdi-close</v-icon></v-btn></v-card-title
        >

        <v-card-text class="px-7">
          <v-form ref="form" @submit.prevent="onSubmit">
            <v-text-field
              autofocus
              v-model="username"
              label="Username"
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
              label="Password"
              name="password"
              :rules="[rules.isEmpty, rules.checkLength]"
              :error-messages="passError"
              @focus="passError = ''"
              validate-on-blur
            >
            </v-text-field>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="
                  () => {
                    loginDialog = false;
                    restDialog = true;
                  }
                "
                text
              >
                Eatery
              </v-btn>
              <v-btn color="primary" type="submit" text>Login</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="restDialog"
      v-if="restDialog"
      max-width="500px"
      persistent
      no-click-animation
    >
      <v-card tile>
        <v-card-title class="headline font-weight-regular"
          >Restaurant<v-spacer></v-spacer>
          <v-btn icon @click="restDialog = false"><v-icon>mdi-close</v-icon></v-btn></v-card-title
        >
        <v-card-text class="px-7">
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
              <v-btn
                color="primary"
                text
                @click="
                  () => {
                    restDialog = false;
                    loginDialog = true;
                  }
                "
                >Back</v-btn
              >
              <v-btn type="submit" color="primary" text>Login</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="signupDialog" v-if="signupDialog" max-width="500px">
      <v-card tile>
        <v-progress-linear indeterminate color="primary" :active="showProgress"></v-progress-linear>
        <v-card-title class="headline font-weight-regular">Dineat</v-card-title>
        <v-card-text class="pt-5 px-5">
          <v-form ref="signup" @submit.prevent>
            <v-text-field
              autofocus
              v-model="email"
              label="Email"
              name="email"
              :rules="[rules.isEmpty]"
              :error-messages="emailError"
              validate-on-blur
              @focus="emailError = ''"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" text :disabled="disabled" class="mb-2" @click="onSignup"
            >Register</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :color="color" :timeout="timeout"
      >{{ message }} <v-btn text @click="snackbar = false">Close</v-btn></v-snackbar
    >
  </v-app>
</template>

<script>
export default {
  name: "Login",
  data: () => ({
    loginDialog: false,
    username: "",
    password: "",
    userError: "",
    passError: "",
    restDialog: false,
    id: "",
    pass: "",
    idErr: "",
    passErr: "",
    signupDialog: false,
    email: "",
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
    content: [
      {
        img: "dineat",
        color: "indigo lighten-5",
        desc: "Dineat is a web-app that helps users reserve tables in their favourite restaurants",
      },
      {
        img: "search",
        color: "yellow lighten-4",
        desc: "Search for any restaurants by name cuisine or location with voice",
      },
      {
        img: "form",
        color: "white",
        desc: "Use the voice interface to fill out the forms",
      },
      {
        img: "qr",
        color: "indigo accent-1",
        desc: "Just use the QR ticket to check-in the restaurant",
      },
      {
        img: "decode",
        color: "orange lighten-4",
        desc: "Restaurants get the appropriate results on scanning the ticket",
      },
    ],
  }),
  computed: {
    mobile() {
      return this.$vuetify.breakpoint.xs;
    },
  },
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
        res.admin ? this.$router.push("/admin") : this.$router.push("/dashboard");
      } else {
        this[res.field] = res.msg;
      }
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
            this.$router.push("/eatery");
          } else {
            this[data.field] = data.msg;
          }
        });
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
  },
};
</script>

<style scoped>
.container {
  height: 100%;
  overflow: hidden;
}
</style>
