<template>
  <v-app>
    <v-app-bar fixed color="white" elevate-on-scroll>
      <v-toolbar-title class="appTitle font-weight-medium primary--text"
        >Dineat</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text @click="logout" color="primary">
          <v-icon left size="24">mdi-logout</v-icon>Logout
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-container class="pa-10 mt-10 wrapper" fluid>
      <v-row justify="center">
        <p class="primary--text greeting">
          Hi {{ this.$store.state.user.username }}
        </p>
      </v-row>
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
              label="search"
              v-model="speech"
              :value="speech"
              hide-details
              autofocus
              solo
              clearable
              prepend-inner-icon="mdi-magnify"
              append-icon="mdi-microphone"
              @click:append="voiceSearch"
            ></v-text-field>
          </v-form>
        </v-col>
      </v-row>
      <v-row justify="center" class="mt-7" align="center">
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
              search for, places, cuisines ....
              <v-spacer></v-spacer>
              <v-progress-circular
                :indeterminate="infinite"
                color="primary lighten-1"
              ></v-progress-circular>
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red lighten-1 white--text" @click="stopCapturing"
                >Stop</v-btn
              >
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
            <v-card @click="bindClick(restaurant)" :elevation="hover ? 10 : 2">
              <v-img
                max-height="300px"
                :src="restaurant.image"
                class="blue-grey lighten-5"
                aspect-ratio="1"
              >
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height blue-grey lighten-5"
                    align="center"
                    justify="center"
                    ><v-progress-circular
                      indeterminate
                      color="primary lighten-1"
                    ></v-progress-circular
                  ></v-row>
                </template>
              </v-img>
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
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card tile class="dialogWrapper">
          <v-app-bar
            class="orange darken-1 white--text"
            fixed
            elevate-on-scroll
          >
            <v-btn icon @click="bookingDialog = false" color="white"
              ><v-icon>mdi-close</v-icon></v-btn
            >
            <v-toolbar-title class="title">Booking Details</v-toolbar-title>
          </v-app-bar>
          <v-container class="pt-10 mt-10" fluid>
            <v-row justify="space-around">
              <v-col cols="12" xs="12" sm="10" md="5">
                <v-card elevation="5" tile>
                  <v-img :src="currentBooking.image" max-height="400" />
                </v-card>
                <v-card
                  class="pa-2 mt-5 primary lighten-1 white--text"
                  elevation="3"
                >
                  <p class="center headline font-weight-medium">
                    {{ currentBooking.name }}
                  </p>
                  <p class="title center">
                    <span class="subtitle">
                      {{ currentBooking.cuisines }}
                    </span>
                  </p>

                  <div class="title center" v-if="bookingDialog">
                    Open Time:
                    {{ formatTimings(currentBooking.time) }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" xs="12" sm="10" md="5">
                <v-card class="pa-5" flat>
                  <div class="center headline mb-5">Reservation</div>
                  <v-form ref="book" @submit.prevent="handleReservation">
                    <v-text-field
                      label="Name"
                      class="title font-weight-regular"
                      :rules="[rules.isEmpty]"
                      v-model="this.$store.state.user.username"
                    ></v-text-field>
                    <v-select
                      label="Guests"
                      :items="guest"
                      v-model="guests"
                      :rules="[rules.isEmpty]"
                    ></v-select>
                    <v-row justify="center">
                      <v-time-picker
                        :allowed-hours="permittedHrs"
                        :allowed-minutes="[0, 30]"
                        scrollable
                        v-model="time"
                        color="primary"
                        format="24hr"
                      ></v-time-picker>
                    </v-row>
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
    bookingDialog: false,
    currentBooking: {},
    stylePicker: "",
    data: [],
    successCommands: [
      "Here are some results!",
      "This is what I got!",
      "Search results are as follows",
    ],
    failureCommands: [
      "No match found!",
      "No such places or cuisines!",
      "Sorry no matching result!",
    ],
    infinite: true,
    rules: {
      isEmpty: (value) => !!value || "Should not be empty",
    },
    guest: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    guests: "",
    time: "",
    limit: [],
    permittedHrs: [],
  }),

  mounted() {
    this.$store.dispatch("grabRestaurants");
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
      this.voice = voices[1];
      this.synthesis = synthesis;
      if (!voices.length) {
        synthesis.onvoiceschanged = () => {
          voices = synthesis.getVoices();
          let googleVoice = voices.filter((voice) =>
            voice.name.includes("Google" && "US")
          );
          this.voice = googleVoice.length ? googleVoice[0] : voices[1];
          this.synthesis = synthesis;
        };
      }
    };
    setTimeout(setTextToSpeech, 1000);
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
        recognize.onstart = () => (this.voiceDialog = true);

        recognize.onspeechend = () => {
          recognize.stop();
          this.voiceDialog = false;
        };

        recognize.onresult = (event) => solved(event.results[0][0].transcript);

        recognize.onerror = (err) => {
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
    stopCapturing() {
      this.recognize.stop();
      this.voiceDialog = false;
    },
    async voiceSearch() {
      try {
        if (this.voiceModule) {
          this.alert = true;
          return;
        }
        const result = await this.startCapturing(this.recognize);
        this.speech = result;
        if (result.toLowerCase().includes("open" || "book")) {
          if (result.toLowerCase().includes("open first" || "book first")) {
            return this.bindClick(this.data[0]);
          } else if (
            result.toLowerCase().includes("open second" || "book second")
          ) {
            return this.bindClick(this.data[1]);
          }
        }
        let results = this.$store.getters.searchRestaurant(
          this.speech.toLowerCase()
        );
        if (results.length) {
          this.dictate(this.successCommands[Math.floor(Math.random() * 3)]);
          this.data = [...results];
        } else {
          this.dictate(this.failureCommands[Math.floor(Math.random() * 3)]);
        }
      } catch (err) {
        this.dictate(err);
      }
    },

    textSearch() {
      if (this.speech === "") {
        return;
      }
      this.data = this.$store.getters.searchRestaurant(
        this.speech.toLowerCase()
      );
    },

    loadRestaurants() {
      this.data = this.$store.getters.fetchRestaurants;
    },

    bindClick(hotel) {
      this.bookingDialog = true;
      this.currentBooking = hotel;
    },

    setTimes([t1, t2]) {
      const temp = [];
      for (let i = Number(t1); i < Number(t2); i++) {
        temp.push(i);
      }
      return temp;
    },
    formatTimings(time) {
      time = "11-15";
      if (time.includes(" ")) {
        const [day, eve] = time.split(" ");
        const [startA, startB] = day.split("-");
        const [startC, startD] = eve.split("-");
      } else {
        console.time("Set");
        const [a, b] = time.split("-");
        this.setTimes(time.split("-"));
        console.timeEnd("Set");
      }
      return time;
    },
    logout() {
      this.$router.push("/login");
      document.cookie =
        "Dineat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      this.$store.commit("sessionEnded");
    },
  },
};
</script>

<style scoped>
.appTitle {
  font-size: 28px;
}
.greeting {
  font-size: 24px;
  letter-spacing: 2px;
}
.wrapper {
  background-color: #fff;
}
.buttonWrapper {
  background-color: #efefef;
}
.dialogWrapper {
  background-color: #fff;
  overflow: hidden;
}
.center {
  text-align: center;
  font-weight: normal;
}
</style>
