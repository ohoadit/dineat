<template>
  <v-app>
    <v-app-bar fixed color="white" elevate-on-scroll>
      <div class="mr-2">
        <v-img src="" max-height="32" max-width="32"></v-img>
      </div>
      <v-toolbar-title class="appTitle font-weight-medium primary--text"
        >Dineat</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-btn class="primary--text" depressed>
        {{ this.$store.state.user.username }}
      </v-btn>
      <v-toolbar-items>
        <v-btn text @click="logout" color="primary">
          <v-icon left size="24">mdi-logout</v-icon>Logout
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-container class="pa-10 mt-10 wrapper" fluid>
      <v-row justify="center"> </v-row>
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
              <div class="cardItems pa-5">
                <div>
                  <v-icon>mdi-map-marker</v-icon>
                  {{ restaurant.location }}
                </div>
                <div>
                  <v-icon left>mdi-food-fork-drink</v-icon>
                  {{ restaurant.speciality }}
                </div>
              </div>
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
            <v-toolbar-title class="title">Guest Details</v-toolbar-title>
          </v-app-bar>
          <v-container class="pt-10 mt-10" fluid>
            <v-row justify="space-around">
              <v-col cols="12" xs="12" sm="10" md="5">
                <v-card elevation="5">
                  <v-img :src="currentBooking.image" max-height="400" />
                </v-card>
                <v-card
                  class="pa-2 mt-5 primary lighten-1 white--text"
                  elevation="3"
                >
                  <p class="center headline font-weight-medium">
                    {{ currentBooking.name }}
                  </p>
                  <p class="center">
                    {{ currentBooking.cuisines }}
                  </p>
                  <v-divider color="white" class="mb-5"></v-divider>
                  <div class="center" v-if="bookingDialog">
                    Open Time:
                    {{ formatTimings(currentBooking.time) }}
                  </div>
                  <p class="center mt-2">
                    Location:
                    {{ currentBooking.location }}
                  </p>
                </v-card>
              </v-col>

              <v-col cols="12" xs="12" sm="10" md="5">
                <p class="center headline font-weight-medium">Book Now</p>
                <v-card class="pa-5" flat>
                  <v-form ref="book" @submit.prevent="handleReservation">
                    <v-text-field
                      label="Name"
                      v-model="this.$store.state.user.username"
                      class="title font-weight-regular"
                      prepend-icon="mdi-checkbook"
                      :rules="[rules.isEmpty]"
                    ></v-text-field>
                    <v-select
                      label="Guests"
                      :items="guest"
                      v-model="guests"
                      prepend-icon="mdi-account-multiple"
                      :rules="[rules.isEmpty]"
                    ></v-select>
                    <v-menu
                      v-model="dateMenu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="date"
                          label="Choose Date"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-on="on"
                          :rules="[rules.isEmpty]"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        :allowed-dates="permittedDates"
                        v-model="date"
                        no-title
                        @input="dateMenu = false"
                      ></v-date-picker>
                    </v-menu>
                    <v-menu
                      v-model="timeMenu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                      max-width="290px"
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="time"
                          label="Choose Time"
                          prepend-icon="mdi-clock-outline"
                          readonly
                          v-on="on"
                          :rules="[rules.isEmpty]"
                        ></v-text-field>
                      </template>
                      <v-time-picker
                        v-if="timeMenu"
                        :allowed-hours="permittedHrs"
                        :allowed-minutes="[0, 30]"
                        scrollable
                        full-width
                        v-model="time"
                        @click:minute="timeMenu = false"
                        color="primary lighten-1"
                        format="24hr"
                      ></v-time-picker>
                    </v-menu>
                    <v-row justify="center" class="mt-10">
                      <v-btn color="primary lighten-1" type="submit"
                        >Reserve</v-btn
                      >
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
    infinite: true,
    data: [],
    successCommands: [
      "Here are some results!",
      "This is what I got!",
      "Search results are as follows"
    ],
    failureCommands: [
      "No match found!",
      "No such places or cuisines!",
      "Sorry no matching result!"
    ],
    dateMenu: false,
    timeMenu: false,
    rules: {
      isEmpty: value => !!value || "Should not be empty"
    },
    guest: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    guests: "",
    time: "",
    date: "",
    month: new Date().getMonth() + 1,
    today: "",
    dates: [],
    limit: []
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
          let googleVoice = voices.filter(voice =>
            voice.name.includes("Google" && "Female")
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
          if (result.toLowerCase().includes("first")) {
            return this.bindClick(this.data[0]);
          } else if (result.toLowerCase().includes("second")) {
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

    async bindClick(hotel) {
      this.bookingDialog = true;
      this.currentBooking = hotel;
      const data = await fetch("/bank/dates", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        credentials: "same-origin"
      });
      const dateTime = await data.json();
      this.dates = dateTime.dates;
      this.today = new Date(this.dates[0]);
    },
    setLimit([t1, t2]) {
      const temp = [];
      for (let i = Number(t1); i < Number(t2); i++) {
        temp.push(i);
      }
      return temp;
    },
    formatTimings(time) {
      if (time.includes(" ")) {
        const [day, eve] = time.split(" ");
        this.limit = [
          ...this.setLimit(day.split("-")),
          ...this.setLimit(eve.split("-"))
        ];
        return time.replace(" ", " & ");
      } else {
        const [a, b] = time.split("-");
        this.limit = this.setLimit(time.split("-"));
        return time;
      }
    },
    permittedDates(date) {
      if (![this.month, this.month + 1].includes(Number(date.split("-")[1]))) {
        return;
      }
      if (this.dates.includes(date)) {
        return date;
      }
    },
    permittedHrs(hr) {
      if (!this.date) {
        return;
      }
      if (this.date === this.dates[0]) {
        if (this.limit.includes(hr) && hr > this.today.getHours()) {
          return hr;
        }
      } else if (this.limit.includes(hr)) {
        return hr;
      }
    },
    handleReservation() {
      if (!this.$refs.book.validate()) {
        return;
      }
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
.appTitle {
  font-size: 28px;
}
.greeting {
  font-size: 24px;
}
.cardItems {
  display: flex;
  justify-content: space-between;
  align-content: center;
  font-size: 18px;
}
.wrapper {
  background-color: #fff;
  height: 100%;
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
  font-size: 18px;
  margin-top: 10;
}

@media screen and (max-width: 600px) {
  .center {
    font-size: 15px;
  }
}
</style>
