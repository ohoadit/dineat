<template>
  <v-app>
    <v-app-bar fixed color="white" elevate-on-scroll>
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
    <v-container class="pa-10 mt-10" fluid>
      <v-row justify="center">
        <p class="title font-weight-regular">
          Reserve a restaurant table with voice commands. Use the search feature
          to explore.
        </p>
      </v-row>
      <v-row justify="center" class="mb-5">
        <v-col cols="12" xs="12" sm="10" md="8">
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
              @click:clear="loadRestaurants"
            ></v-text-field>
          </v-form>
        </v-col>
      </v-row>
      <v-row justify="center" class="mt-7">
        <v-btn color="primary" @click="loadRestaurants">Explore</v-btn>
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
              search for restuarants, places, cuisines ....
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
                  {{ restaurant.speciality }}
                </div>
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
        <v-card tile class="wrapper">
          <v-app-bar class="orange darken-1 white--text" fixed flat>
            <v-btn icon @click="bookingDialog = false" color="white"
              ><v-icon>mdi-close</v-icon></v-btn
            >
            <v-toolbar-title>Booking Details</v-toolbar-title>
          </v-app-bar>
          <v-container class="pt-10 mt-10" fluid>
          <v-row justify="center">
            
            <v-col cols="12" xs="12" sm="10" md="6">
              <v-card  elevation="5" tile>
                <v-img :src="currentBooking.image" max-height="400"/>
              </v-card>

              <v-card class="pa-2 mt-5" color="blue lighten-1 white--text" outlined>
                <p class="center headline font-weight-medium">{{ currentBooking.name }}</p>
                <p class="title font-weight-regular center">Popular Cuisines : <span class="subtitle font-weight-regular">{{ currentBooking.cuisines }}</span></p>
              </v-card>
            </v-col>

            <v-col cols="12" xs="12" sm="10" md="6">
              <v-card outlined class="pa-5">
                <v-form ref="book" @submit.prevent="handleReservation">
                  <v-text-field label="Name" v-model="this.$store.state.user.username"></v-text-field>

                </v-form>
              </v-card>
            </v-col>
            
          </v-row>
          </v-container>
        </v-card>
      </v-dialog>
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
    voiceModule: false,
    alert: false,
    drawer: false,
    bookingDialog: false,
    currentBooking: {},
    data: [],
    successCommands: ["Here are some results!", "This is what I got!", "Search results are as follows"],
    failureCommands: ["No match found!", "No such places or cuisines!", "Sorry no matching result!"],
    infinite: true,
    rules: {
      required: value => !!value || "Required"
    }
  }),
  
  mounted () {
    this.$store.dispatch('grabRestaurants')
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

    const setTextToSpeech = () => {
      let voices = [];
      const synthesis = window.speechSynthesis;
      voices = synthesis.getVoices();
      synthesis.onvoiceschanged = () => {
      voices = synthesis.getVoices();
      this.voice = voices[1];
      this.synthesis = synthesis;
      }     
    }      
    setTimeout(setTextToSpeech, 500);
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
    async voiceSearch() {
      try {
        if (this.voiceModule) {
          this.alert = true;
          return;
        }
        const result = await this.startCapturing(this.recognize);
        this.speech = result;
        if (result.toLowerCase().includes('open' || 'book')) {
          if (result.toLowerCase().includes('open the first' || 'book the first')) {
           return this.bindClick(this.data[0])
          } else if (result.toLowerCase().includes('open the second' || 'book the second')) {
            return this.bindClick(this.data[1])
          }
        }
        let results = this.$store.getters.searchRestaurant(this.speech.toLowerCase());
        if (results.length) {
          this.dictate(this.successCommands[Math.floor(Math.random() * 3)])
          this.data = [...results]
        } else {
          this.dictate(this.failureCommands[Math.floor(Math.random() * 3)]);
        }
      } catch (err) {
        this.dictate(err);
      }
    },

    textSearch() {
      console.log(this.voice)
      if (this.speech === "") {
        return;
      }
      this.data = this.$store.getters.searchRestaurant(this.speech.toLowerCase());
    },

    loadRestaurants() {
      this.data = this.$store.getters.fetchRestaurants;
    },

    bindClick(hotel) {
      this.bookingDialog = true;
      this.currentBooking = hotel;
    },
    formatTimings: time => {
      if (!time) {
        return
      } else {
        console.log(`Timings are :${time}`)
      }
    },
    logout() {
      this.$router.go("/login");
      document.cookie =
        "Dineat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      this.$store.commit("sessionEnded");
    }
  }
};
</script>

<style scoped>
#app {
  background-color: #fff;
}
.wrapper {
  overflow: hidden;
}
.center {
 text-align: center;
}
</style>
