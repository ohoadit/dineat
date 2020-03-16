<template>
  <v-app>
    <v-app-bar fixed elevation="3" class="primary lighten-1 white--text">
      <v-toolbar-title class="headline font-weight-medium">Dineat</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-form ref="form" @submit.prevent="xda">
        <v-text-field
          label="search"
          v-model="speech"
          :value="speech"
          solo
          prepend-inner-icon="mdi-magnify"
          append-icon="mdi-microphone"
          @click:append="bookTable"
        ></v-text-field>
      </v-form>
      <v-btn text @click="logout" color="white">Logout</v-btn>
    </v-app-bar>
    <v-container class="pa-10 mt-10">
      <v-row justify="center">
        <p class="title font-weight-regular">
          Now reserve a restaurant table with voice commands.
        </p>
      </v-row>
      <v-row justify="center">
        <v-col cols="12" xs="12" sm="6">
          <v-card class="pa-5 grey lighten-5" tile elevation="5">
            <v-card-title class="font-weight-regular"
              >Book your table with voice.</v-card-title
            >
            <v-card-text>
              <v-form @submit.prevent="search(speech)" ref="form1">
                <v-row align="center">
                  <v-col cols="10">
                    <v-text-field
                      placeholder="Book a table ..."
                      v-model="speech"
                      :value="speech"
                      :rules="[rules.required]"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="1">
                    <v-btn icon @click="bookTable">
                      <v-icon color="primary">mdi-microphone</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-dialog
          v-model="voiceDialog"
          persistent
          max-width="500px"
          height="auto"
        >
          <v-card tile>
            <v-card-title>
              Capturing commands...
            </v-card-title>
            <v-progress-linear
              :indeterminate="infinite"
              color="primary lighten-1"
            ></v-progress-linear>
          </v-card>
        </v-dialog>
      </v-row>

      <v-row>
        <v-col>
          <v-card v-for="(booking, index) in data" :key="index">
            <v-card-title>
              {{ booking.name }}
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: "UserDashboard",
  data: () => ({
    synthesis: null,
    recognize: null,
    voice: null,
    speech: "",
    voiceDialog: false,
    data: [],
    bookWords: ["book", "book a table", "find a table", "table", "find"],
    infinite: true,
    rules: {
      required: value => !!value || "Required"
    }
  }),
  mounted() {
    const recognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    let recognize = new recognition();
    if (recognize) {
      recognize.lang = "en-US";
      recognize.interimResults = false;
      recognize.maxAlternatives = 1;
      this.recognize = recognize;
    } else {
      alert(
        "Assistant requires speech recognition enabled in the browser. \n Google Chrome is recommended"
      );
    }
    let voices = [];
    const synthesis = window.speechSynthesis;
    voices = synthesis.getVoices();
    synthesis.onvoiceschanged = async () => {
      voices = await synthesis.getVoices();
      console.log(voices);
    };
    this.synthesis = synthesis;
    this.voice = voices[5];
    console.log(voices);
  },
  methods: {
    dictate(toSpeak) {
      if (this.synthesis.speaking) {
        return;
      }
      const speaker = new SpeechSynthesisUtterance(toSpeak);
      speaker.voice = this.voice;
      console.log(this.voice);
      speaker.pitch = 1;
      speaker.rate = 0.9;
      this.synthesis.speak(speaker);
    },
    async bookTable() {
      try {
        const result = await this.startCapturing(this.recognize);
        this.speech = result;
        this.search(this.speech.toLowerCase(), this.bookWords)
          ? this.dictate("Here are some results")
          : this.dictate("Sorry. No match found.");
      } catch (err) {
        this.dictate(err);
      }
    },
    startCapturing(recognize) {
      const promise = new Promise((solved, denied) => {
        recognize.onstart = () => {
          this.voiceDialog = true;
        };

        recognize.onspeechend = () => {
          recognize.stop();
          this.voiceDialog = false;
        };

        recognize.onresult = event => {
          solved(event.results[0][0].transcript);
        };

        recognize.onerror = err => {
          this.voiceDialog = false;
          let error = "";
          if (err.error === "no-speech") {
            error = "Please try again ...";
          } else if (err.error === "network") {
            error = "Internet access is required";
          } else {
            error = "Microphone access is needed for voice search to work";
          }
          denied(error);
        };
        recognize.start();
      });
      return promise;
    },
    search(keyword, dictionary) {
      console.log("Search called!")
      for (let word of dictionary) {
        if (keyword == word) {
          return true;
        }
      }
    },
    xda() {
      alert("Now playing!")
      this.search(speech, this.dictionary)
    },
    logout() {
      this.$router.go("/login");
      document.cookie =
        "Dineat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }
};
</script>
