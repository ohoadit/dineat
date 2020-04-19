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
      <v-menu
        offsetY
        right
        origin="center center"
        transition="scroll-y-transition"
      >
        <template v-slot:activator="{ on }">
          <v-btn color="#f5f6f9" class="primary--text" depressed v-on="on">
            <v-icon left>mdi-account</v-icon>
            {{ username }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-icon left>mdi-timetable</v-icon>Bookings
          </v-list-item>
          <v-list-item @click="logout">
            <v-icon left>mdi-logout</v-icon>Logout
          </v-list-item>
        </v-list>
      </v-menu>
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
        <v-dialog v-model="voiceDialog" persistent max-width="500px">
          <v-card tile>
            <v-card-title class="title font-weight-regular">
              {{ command }}
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

      <v-row
        class="mt-10"
        justify="center"
        :class="this.$vuetify.breakpoint.mdAndUp ? 'mx-10' : ''"
      >
        <v-col
          cols="12"
          xs="12"
          sm="6"
          md="4"
          lg="3"
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
        <v-card tile class="">
          <v-app-bar class="orange darken-1 white--text" flat fixed>
            <v-btn icon @click="bookingDialog = false" color="white"
              ><v-icon>mdi-close</v-icon></v-btn
            >
            <v-toolbar-title class="title">Booking Details</v-toolbar-title>
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
                <v-card class="pa-5" flat>
                  <p class="center headline font-weight-medium">Book Now</p>
                  <v-form
                    ref="book"
                    @submit.prevent="handleReservation(currentBooking.id)"
                  >
                    <v-text-field
                      ref="name"
                      label="Name"
                      v-model="name"
                      class="title font-weight-regular"
                      prepend-icon="mdi-checkbook"
                      :rules="[rules.isEmpty]"
                    ></v-text-field>
                    <v-select
                      ref="dropdown"
                      :items="guests"
                      v-model="guest"
                      label="Guest"
                      prepend-icon="mdi-account-multiple"
                      :rules="[rules.isEmpty]"
                    ></v-select>
                    <v-menu
                      v-model="dateMenu"
                      :close-on-content-click="false"
                      :nudge-right="20"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          ref="date"
                          v-model="date"
                          label="Choose Date"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-on="on"
                          @focus="fetchDateTime"
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
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          ref="time"
                          v-model="time"
                          :value="time"
                          label="Choose Time"
                          prepend-icon="mdi-clock-outline"
                          readonly
                          v-on="on"
                          @focus="
                            () => {
                              fetchDateTime();
                              time = '';
                            }
                          "
                          @blur.native.stop="timeMenu = false"
                          :rules="[rules.isEmpty]"
                        ></v-text-field>
                      </template>
                      <v-time-picker
                        v-if="timeMenu"
                        :allowed-hours="permittedHrs"
                        :allowed-minutes="minutes"
                        scrollable
                        v-model="time"
                        @click:hour="minsHandler"
                        @click:minute="timeMenu = false"
                        color="primary lighten-1"
                        format="24hr"
                      ></v-time-picker>
                    </v-menu>
                    <v-row justify="space-around" class="mt-10">
                      <v-btn
                        color="primary lighten-1"
                        width="90"
                        @click="resetForm"
                        >Reset</v-btn
                      >
                      <v-btn color="primary lighten-1" width="90" type="submit"
                        >Reserve</v-btn
                      >
                    </v-row>
                    <v-row justify="center">
                      <v-card class="mt-10" elevation="3" tile>
                        <v-img v-if="url" :src="url"></v-img>
                      </v-card>
                    </v-row>
                  </v-form>
                </v-card>
              </v-col>
            </v-row>
            <v-btn
              fab
              bottom
              right
              color="orange darken-1 white--text"
              class="mr-1 mb-5"
              fixed
              @click="voiceBooking"
              ><v-icon>mdi-microphone</v-icon></v-btn
            >
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
    command: "",
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
      "Search results are as follows",
    ],
    failureCommands: [
      "No match found!",
      "No such places or cuisines!",
      "Sorry no matching result!",
    ],
    dateMenu: false,
    timeMenu: false,
    name: "",
    guest: "",
    time: "",
    date: "",
    month: new Date().getMonth() + 1,
    rules: {
      isEmpty: (value) => !!value || "Should not be empty",
    },
    guests: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    today: "",
    dates: [],
    hours: [],
    minutes: [],
    compHrs: new Set(),
    url: "",
  }),
  computed: {
    username() {
      return this.$store.state.user.username;
    },
  },
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
    notify(message) {
      this.synthesis.cancel();
      const speaker = new SpeechSynthesisUtterance(message);
      speaker.voice = this.voice;
      speaker.pitch = 1;
      speaker.rate = 1;
      this.synthesis.speak(speaker);
    },
    dictate(toSpeak) {
      return new Promise((solved) => {
        if (this.synthesis.speaking) {
          this.stopSpeaking();
        }
        const speaker = new SpeechSynthesisUtterance(toSpeak);
        speaker.voice = this.voice;
        speaker.pitch = 1;
        speaker.rate = 1;
        this.synthesis.speak(speaker);
        speaker.onend = () => solved("Done assisting!");
      });
    },

    startCapturing(recognize, dialog) {
      const promise = new Promise((solved, denied) => {
        recognize.onstart = () => (this[dialog] = true);

        recognize.onspeechend = () => {
          recognize.stop();
          this[dialog] = false;
        };

        recognize.onresult = (event) => solved(event.results[0][0].transcript);

        recognize.onerror = (err) => {
          this[dialog] = false;
          let error = "";
          if (err.error === "no-speech") {
            error = "Please try again ...";
          } else if (err.error === "network") {
            error = "Network access is required for voice search to work";
          } else if (err.error === "not-allowed") {
            error = "Microphone access is needed for voice search to work";
          }
          this.notify(error);
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

    stopSpeaking() {
      this.synthesis.cancel();
    },
    async voiceSearch() {
      try {
        if (this.voiceModule) {
          this.alert = true;
          return;
        }
        this.command = "Speak for, places, cuisines ....";
        const result = await this.startCapturing(this.recognize, "voiceDialog");
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
          this.notify(this.successCommands[Math.floor(Math.random() * 3)]);
          this.data = [...results];
        } else {
          this.notify(this.failureCommands[Math.floor(Math.random() * 3)]);
        }
      } catch (err) {}
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

    async fetchDateTime() {
      const data = await fetch("/bank/dates", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      });
      const dateTime = await data.json();
      this.dates = dateTime.dates;
      this.today = new Date(dateTime.today);
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
        this.hours = [
          ...this.setLimit(day.split("-")),
          ...this.setLimit(eve.split("-")),
        ];
        return time.replace(" ", " & ");
      } else {
        const [a, b] = time.split("-");
        this.hours = this.setLimit(time.split("-"));
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
        if (this.hours.includes(hr) && hr >= this.today.getHours()) {
          if (hr === this.today.getHours()) {
            if (this.today.getMinutes() < 31) {
              this.compHrs.add(hr);
              return hr;
            } else {
              return;
            }
          }
          this.compHrs.add(hr);
          return hr;
        }
      } else if (this.hours.includes(hr)) {
        this.compHrs.add(hr);
        return hr;
      }
    },
    minsHandler(hr) {
      const minutes = [0, 15, 30, 45];
      const currentMinutes = this.today.getMinutes();
      const currentHours = this.today.getHours();
      const todayMins = minutes.filter((min) => min - currentMinutes > 15);

      if (this.date === this.dates[0]) {
        if (currentMinutes > 45 && hr === currentHours + 1) {
          return (this.minutes = minutes.slice(1));
        }
        if (hr === this.today.getHours()) {
          return (this.minutes = todayMins);
        }
      }
      return (this.minutes = minutes);
    },
    async handleReservation(eateryId) {
      if (!this.$refs.book.validate()) {
        return;
      }
      const ack = await fetch("/bank/book", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: this.name,
          guests: this.guest,
          date: this.date,
          time: this.time,
          resId: eateryId,
        }),
      });
      const saved = await ack.json();
      this.url = saved.ticket;
    },
    async QnA(que, fields) {
      this.$refs[fields.open[0]][fields.open[1]]();
      if (fields.menu) {
        this[fields.menu] = true;
      }
      await this.dictate(que);
      this.command = que;
      let answer = await this.startCapturing(this.recognize, "voiceDialog");

      if (fields.close.length) {
        this.$refs[fields.close[0]][fields.close[1]]();
      }
      if (fields.menu) {
        this[fields.menu] = false;
      }
      return answer;
    },
    async voiceBooking() {
      let answer = "";
      if (!this.name) {
        try {
          answer = await this.QnA(
            "Tell your name or just say next to use the default username!",
            { open: ["name", "focus"], close: [], menu: false }
          );
          this.name = answer.includes("next") ? this.username : answer;
        } catch (err) {
          return this.notify(err);
        }
      }
      if (!this.guest) {
        try {
          answer = await this.QnA(
            "What will be the total number of guests at the venue?",
            {
              open: ["dropdown", "activateMenu"],
              close: ["dropdown", "blur"],
              menu: false,
            }
          );
          let num = Number(answer);
          if (this.guests.includes(num)) {
            this.guest = num;
          } else {
            return this.notify("Please choose from the dropdown list only");
          }
        } catch (err) {
          return this.notify("Please try again");
        }
      }
      if (!this.date) {
        try {
          answer = await this.QnA("Please choose a date from the picker.", {
            open: ["date", "focus"],
            close: ["date", "blur"],
            menu: "dateMenu",
          });
          answer = answer.replace(/(st|nd|rd|th|of)/g, "");
          let date = new Date(answer);
          if (date.toString() !== "Invalid Date") {
            date.setFullYear(this.today.getFullYear());
            let unf = date
              .toLocaleString("en-US", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
              .split(",")[0]
              .replace(/\//g, "-")
              .split("-");
            unf.unshift(unf.pop());
            let iso = unf.join("-");
            if (this.dates.includes(iso)) {
              this.date = iso;
            } else {
              return this.notify("Date unavailable");
            }
          } else {
            return this.notify("Invalid Date");
          }
        } catch (err) {
          return;
        }
      }
      if (!this.time) {
        try {
          answer = await this.QnA("At what time ?", {
            open: ["time", "focus"],
            close: ["time", "blur"],
            menu: "timeMenu",
          });

          if (!answer.includes(":" || "a.m." || "p.m.")) {
            return this.notify("Invalid time");
          }
          const [actual, meridiem] = answer.split(" ");
          const [hr, min] = actual.split(":");
          const spknHr =
            meridiem === "a.m." || hr === "12" ? Number(hr) : 12 + Number(hr);
          const spknMin = Number(min);
          this.minsHandler(spknHr);
          if (
            [...this.compHrs].includes(spknHr) &&
            this.minutes.includes(spknMin)
          ) {
            this.time = [spknHr, min].join(":");
          } else {
            return this.notify("Time unavailable");
          }
        } catch (err) {
          return;
        }
      }
    },
    resetForm() {
      this.$refs.book.reset();
    },
    logout() {
      this.$router.go("/login");
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
.cardItems {
  display: flex;
  justify-content: space-between;
  align-content: center;
  font-size: 16px;
}
.dialog {
  overflow: hidden;
}
.wrapper {
  background-color: #fff;
  height: 100%;
}
.dialogWrapper {
  background-color: #fff;
  overflow-y: hidden;
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
