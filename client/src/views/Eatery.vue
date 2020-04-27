<template>
  <v-app>
    <v-app-bar fixed color="white">
      <v-toolbar-title class="appTitle font-weight-medium">Dineat</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-menu offsetY bottom origin="center center" transition="scale-transition">
        <template v-slot:activator="{ on }">
          <v-btn depressed v-on="on">
            <v-icon left>mdi-account</v-icon>
            {{ username }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="todaysBookings">Upcoming</v-list-item>
          <v-list-item @click="logout"> <v-icon left>mdi-logout</v-icon>Logout </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-container class="wrapper">
      <v-row justify="space-around" align="center" class="px-10">
        <v-btn color="primary" @click="startStreaming">Start</v-btn>
        <v-btn color="red lighten-1 white--text" @click="stopStreaming">Stop</v-btn>
      </v-row>
      <v-row justify="center">
        <v-expand-x-transition>
          <div class="frameWrapper" v-if="openCamera">
            <qrcode-stream :camera="camera" @init="onInit" @decode="decodeTicket"></qrcode-stream>
          </div>
        </v-expand-x-transition>
      </v-row>
      <v-row justify="center" class="mt-10 pt-10 px-10">
        <v-slide-y-reverse-transition>
          <v-alert
            v-model="results"
            text
            :color="alert.color"
            dismissible
            width="500px"
            border="left"
          >
            <p class="headline">
              <v-icon left medium :color="alert.color">{{ alert.icon }}</v-icon> {{ alert.msg }}
            </p>
            <div v-if="alert.success" class="subtitle-1 font-weight-regular pl-10 ml-10">
              <p>
                <v-icon left medium :color="alert.color">mdi-account-outline</v-icon>
                User: {{ alert.username }}
              </p>
              <p>
                <v-icon left medium :color="alert.color">mdi-account-details-outline</v-icon>
                Name: {{ alert.name }}
              </p>
              <p>
                <v-icon left medium :color="alert.color">mdi-account-multiple</v-icon>
                Guests: {{ alert.guests }}
              </p>
              <p><v-icon left medium :color="alert.color">mdi-clock</v-icon>{{ alert.time }}</p>
            </div>
            <v-row v-if="alert.diff" align="center" justify="space-around" class="mt-10">
              <v-btn outlined :color="alert.color"> Accept</v-btn>
              <v-btn outlined :color="alert.color">Reject</v-btn>
            </v-row>
          </v-alert>
        </v-slide-y-reverse-transition>
      </v-row>
      <v-snackbar v-model="snackbar" :color="color" :timeout="timeout"
        >{{ snackmsg }} <v-btn text @click="snackbar = false">CLOSE</v-btn></v-snackbar
      >
    </v-container>
  </v-app>
</template>

<script>
import { QrcodeStream } from "vue-qrcode-reader";

export default {
  name: "eatery",
  components: { QrcodeStream },
  data: () => ({
    camera: "auto",
    openCamera: false,
    snackbar: false,
    color: "",
    snackmsg: "",
    timeout: 10000,
    results: false,
    alert: {},
  }),
  computed: {
    username() {
      return this.$store.state.user.username;
    },
  },
  watch: {
    results(val) {
      if (!val && this.camera === "off") {
        this.startStreaming();
      }
    },
  },
  methods: {
    showSnackbar(type, msg) {
      this.color = type === "success" ? "teal accent-4" : "red lighten-1";
      this.snackmsg = msg;
      this.snackbar = true;
    },

    startStreaming() {
      if (this.results) {
        this.showSnackbar("success", "Please close the dialog first!");
        this.color = "blue";
        return;
      }
      this.openCamera = true;
      this.camera = "auto";
    },
    stopStreaming() {
      this.openCamera = false;
      this.camera = "off";
    },
    async onInit(initialized) {
      this.openCamera = true;
      try {
        await initialized;
      } catch (err) {
        this.openCamera = false;
        if (err.name === "NotAllowedError") {
          this.showSnackbar("err", "Camera access is needed for scanning the QR code");
        } else if (err.name === "NotFoundError") {
          this.showSnackbar("err", "Camera module not found on this device");
        } else if (err.name === "NotSupportedError") {
          this.showSnackbar(
            "err",
            "Secure origin is required for the camera usage; toggle it using flags."
          );
        } else {
          this.showSnackbar("err", "Cannot use camera stream on this device :/");
        }
      }
    },
    decodeTicket(token) {
      fetch("/rest/verify", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          ticket: token,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          Object.assign(this.alert, data);
          this.results = true;
        })
        .catch((err) => {});
      this.stopStreaming();
    },
    logout() {
      this.$router.push("/login");
      document.cookie = "Dineat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      this.$store.commit("sessionEnded");
    },
  },
};
</script>

<style scoped>
.appTitle {
  font-size: 28px;
}
.wrapper {
  margin-top: 100px;
}
.frameWrapper {
  max-width: 500px;
  max-height: 500px;
}

@media screen and (max-width: 600px) {
  .frameWrapper {
    max-width: 350px;
    max-height: 350px;
  }
}
</style>
