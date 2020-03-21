<template>
  <v-app>
    <v-app-bar fixed color="white" elevation="2">
      <v-app-bar-nav-icon
        @click="drawer = true"
        class="d-sm-none"
      ></v-app-bar-nav-icon>
      <v-toolbar-title class="headline">Dineat</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="d-none d-sm-flex">
        <v-btn text color="primary">Bookings</v-btn>
        <v-btn text @click="logout" color="primary">Logout</v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      class="d-sm-none"
    ></v-navigation-drawer>
    <v-container class="pa-10 mt-10">
      <v-row justify="center">
        <p class="headline primary--text">
          Welcome {{ this.$store.state.sessionName }}
        </p>
      </v-row>
      <v-row justify="center">
      <p class="title font-weight-regular">
          Reserve a restaurant table with voice commands. Use the search
          feature to explore.
        </p>
        </v-row>
      <v-row justify="center" class="mb-5">
        <v-col cols="12" xs="12" sm="10" md="9">
          <v-form ref="form" @submit.prevent="textSearch">
            <v-text-field
              label="search"
              v-model="speech"
              :value="speech"
              hide-details
              solo
              clearable
              color="pink"
              prepend-inner-icon="mdi-magnify"
              append-icon="mdi-microphone"
              @click:append="voiceSearch"
            ></v-text-field>
          </v-form>
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
              <v-spacer></v-spacer>
              <v-progress-circular
                :indeterminate="infinite"
                color="primary lighten-1"
              ></v-progress-circular>
            </v-card-title>
          </v-card>
        </v-dialog>
      </v-row>
      <v-row justify="center">
        <v-btn color="primary" @click="getData">Find Manually</v-btn>
      </v-row>
      <v-alert
        type="warning"
        class="mt-10 title font-weight-regular"
        v-model="alert"
        dismissible
      >
        <p>
          Google chrome is recommended for voice search. However, Dineat's voice
          feature works fine on firefox too.
        </p>
        <p>
          In case you are using Firefox, you need to activate certain flags.
        </p>
        <p>For that</p>
        <ol>
          <li>
            Open a new tab in firefox and type about:config in the URL box and
            click Accept the risk and continue.
          </li>
          <li>
            Now in the search preference name type
            media.webspeech.recognition.enable and set it to true it by clicking
            toggle.
          </li>
          <li>
            Same procedure for media.webspeech.recognition.force_enable and
            media.webspeech.synth.enabled.
          </li>
        </ol>
      </v-alert>
      <v-row class="mt-10">
        <v-col
          cols="12"
          xs="12"
          sm="6"
          md="3"
          v-for="(restaurant, index) in data"
          :key="index"
        >
          <v-card>
            <v-img :src="restaurant.image" max-height="300px"></v-img>
            <v-card-title>
              {{ restaurant.name }}
            </v-card-title>
            <v-card-text class="subtitle">
              <v-icon>mdi-map-marker</v-icon>{{ restaurant.location }}
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
    notify: false,
    alert: false,
    drawer: false,
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
    if (!recognition) {
      this.notify = true;
      return;
    }
    let recognize = new recognition();
    if (recognize) {
      recognize.lang = "en-US";
      recognize.interimResults = false;
      recognize.maxAlternatives = 1;
      this.recognize = recognize;
    }
    let voices = [];
    const synthesis = window.speechSynthesis;
    voices = synthesis.getVoices();
    synthesis.onvoiceschanged = async () => {
      voices = await synthesis.getVoices();
      console.log(voices);
    };
    this.synthesis = synthesis;
    this.voice = voices[4];
    console.log(voices);
  },
  methods: {
    dictate(toSpeak) {
      if (this.synthesis.speaking) {
        return;
      }
      const speaker = new SpeechSynthesisUtterance(toSpeak);
      speaker.voice = this.voice;
      speaker.pitch = 1;
      speaker.rate = 0.9;
      this.synthesis.speak(speaker);
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
      console.log("Search called!");
      console.log(`Keyword : ${keyword}`);
      console.log(`Dictionary : ${dictionary}`);
      const res = dictionary.filter(word => keyword === word);
      return res.length ? true : false;
    },

    async voiceSearch() {
      try {
        if (this.notify) {
          this.alert = true;
        }
        const result = await this.startCapturing(this.recognize);
        this.speech = result;
        this.search(this.speech.toLowerCase(), this.bookWords)
          ? this.dictate("Here are some results")
          : this.dictate("Sorry. No match found.");
      } catch (err) {
        this.dictate(err);
      }
    },

    textSearch() {
      if (this.speech === "") {
        console.log("Returned");
        return;
      }
      this.data = this.$store.getters.searchRestaurant(this.speech);
    },
    loadRandom() {
      const num = Math.floor(Math.random() * 5);
      this.data = this.$store.getters.fetchRestaurants;
      this.data = [this.data[num]];
    },
    getData() {
      this.data = this.$store.getters.fetchRestaurants;
    },
    logout() {
      this.$router.push("/login");
      document.cookie =
        "Dineat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      this.$store.commit("sessionEnded");
    }
  }
};
</script>

<style></style>
