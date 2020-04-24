<template>
  <v-app>
    <v-app-bar fixed color="white">
      <v-toolbar-title class="appTitle font-weight-medium">Dineat</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn depressed>
        <v-icon left>mdi-account</v-icon>
        React Cafe
      </v-btn>
    </v-app-bar>
    <v-container class="wrapper">
      <v-row justify="space-around" align="center">
        <v-btn color="primary" @click="startStreaming">Start</v-btn>
        <v-btn color="red lighten-1 white--text" @click="stopStreaming">Stop</v-btn>
      </v-row>
      <v-row justify="center">
        <div class="frameWrapper" v-if="openCamera">
          <qrcode-stream :camera="camera" @init="onInit" @decode="decodeTicket"></qrcode-stream>
        </div>
      </v-row>
      <v-snackbar v-model="snackbar" :color="color"
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
  }),
  methods: {
    showSnackbar(type, msg) {
      this.color = type === "success" ? "teal accent-4" : "red lighten-1";
      this.snackmsg = msg;
      this.snackbar = true;
    },
    async onInit(initialized) {
      this.openCamera = true;
      try {
        await initialized;
      } catch (err) {
        this.openCamera = false;
        if (err.name === "NotAllowedError") {
          this.showSnackbar("err", "Camera access is needed for the QR scan.");
        } else if (err.name === "NotFoundError") {
          this.showSnackbar("err", "Camera module not found on this device");
        } else if (err.name === "NotSupportedError") {
          this.showSnackbar(
            "err",
            "Secure origin is required for the camera usage toggle it using flags."
          );
        } else {
          this.showSnackbar("err", "Cannot use camera stream on this device :/");
        }
      }
    },
    decodeTicket(token) {
      fetch("/");
    },
    startStreaming() {
      this.openCamera = true;
      this.camera = "auto";
    },
    stopStreaming() {
      this.openCamera = false;
      this.camera = "off";
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
