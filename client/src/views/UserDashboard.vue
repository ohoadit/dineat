<template>
  <v-app>
    <v-app-bar fixed>
      <v-toolbar-title class="headline">Dineat</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-form ref="form" @submit.prevent="textSearch">
        <v-text-field
          label="search"
          v-model="speech"
          :value="speech"
          hide-details
          flat
          solo
          prepend-inner-icon="mdi-magnify"
          append-icon="mdi-microphone"
          @click:append="voiceSearch"
        ></v-text-field>
      </v-form>
      <v-spacer></v-spacer>
      <v-toolbar-items class="d-none d-sm-flex">
      
      <v-btn text color="white">{{ this.$store.state.sessionName }}</v-btn>
      <v-btn text @click="logout" color="primary">Logout</v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <v-container class="pa-10 mt-10">
      <v-row justify="center">
        <p class="title font-weight-regular">
          Now reserve a restaurant table with voice commands. Use the search feature to explore more data.
        </p>
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
      <v-row justify="center">
        <v-btn color="primary" @click="getData">Fetch</v-btn>
        <v-btn color="primary" class="ml-10" @click="loadRandom">Only first</v-btn>
      </v-row>
      <v-row>
        <v-col cols="12" xs="12" sm="6" v-for="(restaurant, index) in data" :key="index" >
          <v-card>
            <v-img :src="restaurant.image" max-height="300px"></v-img>
            <v-card-title>
              {{ restaurant.name }}
            </v-card-title>
            <v-card-text>
              {{ restaurant.location }}
            </v-card-text>
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
    this.voice = voices[2];
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
    async voiceSearch() {
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
            error = "Internet access is required for voice search to work";
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
    voiceSearch() {
      this.search(this.speech, this.dictionary)
    },
    loadRandom () {
      const num = Math.floor(Math.random() * 5)
      this.data = this.$store.getters.fetchRestaurants
      this.data = [this.data[num]]
      console.log(num)
    },
     getData () {
      this.data = this.$store.getters.fetchRestaurants
    },
    logout() {
      this.$router.push("/login");
      document.cookie =
        "Dineat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        console.log("Executed")
      this.$store.commit('sessionEnded')
    },

  }
};
</script>

<style>

</style>
