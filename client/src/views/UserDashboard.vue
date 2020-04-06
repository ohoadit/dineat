<template>
  <v-app>
    <v-app-bar fixed elevation="3">
      <v-app-bar-nav-icon
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title class="headline">Dineat</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text @click="logout" color="primary">
          <v-icon left>mdi-logout</v-icon>Logout
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-list>
        <v-list-item>
          <v-list-item-content class="headline">
            {{ this.$store.state.user.username }}
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item link>
          <v-list-item-icon>
            <v-icon left>mdi-book-open</v-icon>
          </v-list-item-icon>
          <v-list-item-content class="title font-weight-regular">
            <v-list-item-title>
              My bookings
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-container class="pa-10 mt-10">
      <v-row justify="center">
        <p class="title font-weight-regular">
          Reserve a restaurant table with voice commands. Use the search feature
          to explore.
        </p>
      </v-row>
      <v-row justify="center" class="mb-5">
        <v-col cols="12" xs="12" sm="10" md="9">
          <v-form ref="form" @submit.prevent="textSearch">
            <v-text-field
              label="search..."
              v-model="speech"
              :value="speech"
              hide-details
              autofocus
              solo
              clearable
              prepend-inner-icon="mdi-magnify"
              append-icon="mdi-microphone"
              @click:append="voiceSearch"
              @click:clear="getData"
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
            <v-card-title class="title font-weight-regular">
              search for areas, places, cuisines ....
              <v-spacer></v-spacer>
              <v-progress-circular
                :indeterminate="infinite"
                color="primary lighten-1"
              ></v-progress-circular>
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red lighten-1 white--text" @click="stopCapturing">Stop</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
      <v-dialog
        class="mt-10 subtitle font-weight-regular"
        v-model="alert"
        max-width="500px"
      >
        <v-card tile color="orange lighten-1 white--text">
          <v-card-title>
            Alert
          </v-card-title>
          <v-card-text class="white--text title font-weight-regular">
            <p>
              Google chrome is recommended for voice search. However, Dineat's
              voice feature works fine on firefox too.
            </p>
            <p>
              In case you are using Firefox, you need to activate certain flags.
            </p>
            <p>For that</p>
            <ol>
              <li>
                Open a new tab in firefox and type about:config in the URL box
                and click Accept the risk and continue if on desktop.
              </li>
              <li>
                Now in the search preference name type
                media.webspeech.recognition.enable and set it to true it by
                clicking toggle.
              </li>
              <li>
                Same procedure for media.webspeech.recognition.force_enable and
                media.webspeech.synth.enabled.
              </li>
            </ol></v-card-text
          >
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="alert = false">Dismiss</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-row class="mt-10" justify="center">
        <v-col
          cols="12"
          xs="12"
          sm="6"
          md="3"
          v-for="(restaurant, index) in data"
          :key="index"
        >
          <v-hover v-slot:default="{ hover }">
            <v-card
              @click="bindClick(restaurant)"
              tile
              :elevation="hover ? 10 : 2"
            >
              <v-img :src="restaurant.image" max-height="300px"></v-img>
              <v-card-title>
                {{ restaurant.name }}
              </v-card-title>
              <v-card-text class="subtitle">
                <div>
                  <v-icon>mdi-map-marker</v-icon>
                  {{ restaurant.location }}
                </div>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
      <v-dialog
        v-model="bookingDialog"
        fullscreen
        transition="dialog-bottom-transition"
      >
        <v-card tile>
          <v-toolbar class="primary white--text">
            <v-btn icon @click="bookingDialog = false" color="white"
              ><v-icon>mdi-close</v-icon></v-btn
            >
            <v-toolbar-title>{{ currentBooking.name }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn text color="white">Save</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-row justify="center" class="mt-10">
            <p class="display-1 font-weight-regular">Booking Details</p>
          </v-row>
          <v-row justify="center">
            <v-col cols="12" xs="10" sm="6" md="5">
              <v-card  elevation="5">
              <v-img :src="currentBooking.image" max-height="400px"/>
              </v-card>
            </v-col>
            <v-col cols="12" xs="10" sm="6" md="5">
              <v-text-field label="Name"></v-text-field>
            </v-col>
          </v-row>
        </v-card>
      </v-dialog>
    </v-container>
    {{ loadRestaurants }}
    {{ initSpeechApi }}
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
    voiceModule: false,
    alert: false,
    drawer: false,
    bookingDialog: false,
    currentBooking: {},
    data: [],
    bookWords: ["book", "book a table", "find a table", "table", "find"],
    infinite: true,
    rules: {
      required: value => !!value || "Required"
    }
  }),
  computed: {
    initSpeechApi () {
      const recognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!recognition) {
      this.voiceModule = true;
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
    synthesis.onvoiceschanged = () => voices = synthesis.getVoices();
      this.synthesis = synthesis;
      this.voice = voices[2];
    },
    loadRestaurants() {
      this.data = this.$store.getters.fetchRestaurants;
    }
  },
  mounted () {
    this.$store.dispatch('grabRestaurants')
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
        recognize.onstart = () => this.voiceDialog = true;

        recognize.onspeechend = () => {
          recognize.stop();
          this.voiceDialog = false;
        };

        recognize.onresult = event => solved(event.results[0][0].transcript);

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
    stopCapturing () {
      this.recognize.stop()
      this.voiceDialog = false
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
        if (this.voiceModule) {
          this.alert = true;
          return;
        }
        const result = await this.startCapturing(this.recognize);
        this.speech = result;
        let results = this.$store.getters.searchRestaurant(this.speech.toLowerCase());
        if (results.length) {
          this.dictate("Here is what I found")
          this.data = [...results]
        } else {
          this.dictate("Sorry, no match found.");
        }
      } catch (err) {
        this.dictate(err);
      }
    },

    textSearch() {
      if (this.speech === "") {
        return;
      }
      this.data = this.$store.getters.searchRestaurant(this.speech.toLowerCase());
    },
    getData() {
      this.data = this.$store.getters.fetchRestaurants;
    },
    bindClick(hotel) {
      this.bookingDialog = true;
      this.currentBooking = hotel;
    },
    randomReturn () {

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

<style scoped>
#app {
  background-color: #f5f5f5;
}
</style>
