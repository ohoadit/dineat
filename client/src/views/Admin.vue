<template>
  <v-app>
    <v-app-bar fixed color="white">
      <v-toolbar-title class="headline">Dineat</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text @click="logout" color="primary">
          <v-icon left>mdi-logout</v-icon>
          Logout
        </v-btn>
      </v-toolbar-items>
      <template v-slot:extension>
        <v-tabs v-model="active" fixed-tabs>
          <v-tabs-slider></v-tabs-slider>
          <v-tab v-for="(tab, i) in tabs" :key="i" :href="tab.link" @click="caller(tab.call)">
            <v-icon left>{{ tab.icon }}</v-icon>
            {{ tab.name }}
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-tabs-items v-model="active" class="transparent">
      <v-tab-item id="manager">
        <v-container class="container">
          <v-row justify="center">
            <v-col cols="12" xs="11">
              <v-data-table
                hide-default-header
                :headers="resTableHeaders"
                :items="restaurantData"
                :items-per-page="setItems()"
                class="elevation-3"
                disable-sort
              >
                <template v-slot:header="{ props }" v-if="!breakpoint()">
                  <tr>
                    <td
                      v-for="(title, i) in props.headers"
                      :key="i"
                      class="title font-weight-regular heading"
                    >
                      {{ title.text }}
                    </td>
                  </tr>
                </template>
                <template v-slot:item.action="{ item }">
                  <v-btn icon @click="editRestaurant(item)"><v-icon>mdi-pencil</v-icon></v-btn>
                </template>
              </v-data-table>
              {{ fetchRestaurants }}
            </v-col>
          </v-row>
          <v-btn
            fab
            bottom
            right
            color="pink white--text"
            class="mr-5 mb-5"
            fixed
            @click="addDialog = true"
            ><v-icon>mdi-plus</v-icon></v-btn
          >
        </v-container>
      </v-tab-item>
      <v-tab-item id="users">
        <v-container class="container">
          <v-progress-linear color="primary" indeterminate :active="grep"></v-progress-linear>
          <v-data-table
            :headers="userTableHeaders"
            :items="userData"
            :items-per-page="setItems()"
            class="elevation-3"
            hide-default-header
          >
            <template v-slot:header="{ props }" v-if="!breakpoint()">
              <tr>
                <td
                  v-for="(title, i) in props.headers"
                  :key="i"
                  class="title font-weight-regular heading"
                >
                  {{ title.text }}
                </td>
              </tr>
            </template>
            <template v-slot:item.action="{ item }">
              <v-btn color="red lighten-1" icon @click="deleteUser(item)"
                ><v-icon>mdi-trash-can-outline</v-icon></v-btn
              >
              <v-btn color="primary" icon @click="setDomain(item)"
                ><v-icon>mdi-lock-reset</v-icon></v-btn
              >
            </template>
          </v-data-table>
          <v-dialog max-width="500px" v-model="domainDialog">
            <v-card tile>
              <v-toolbar elevation="1">
                <v-toolbar-title>Resetter Link</v-toolbar-title>
              </v-toolbar>
              <div class="px-10 my-10">
                <v-select
                  v-model="domain"
                  :items="domainNames"
                  label="Domain"
                  :rules="[rules.isEmpty]"
                ></v-select>
              </div>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="primary" class="send" @click="resetUser">Send</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </v-tab-item>
    </v-tabs-items>
    <v-dialog v-model="addDialog" fullscreen transition="dialog-bottom-transition">
      <v-card tile color="#f6f7f9">
        <v-app-bar color="primary" fixed>
          <v-btn icon color="white" @click="addDialog = false"><v-icon>mdi-close</v-icon></v-btn>
          <v-toolbar-title class="white--text">
            Add a new Restaurant
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-progress-linear
            color="white"
            striped
            indeterminate
            absolute
            bottom
            height="3"
            :active="push"
          ></v-progress-linear>
        </v-app-bar>
        <v-container class="mt-5" :class="!this.$vuetify.breakpoint.xsOnly ? 'pa-10' : ''">
          <v-card class="mt-10 pa-10" tile elevation="5">
            <v-row justify="center">
              <v-col cols="12" xs="12" sm="10">
                <v-file-input
                  v-model="image"
                  label="Image"
                  show-size
                  :error-messages="imageError"
                  @change="showPreview"
                  accept="image/*"
                ></v-file-input>
                <v-row justify="center">
                  <v-col cols="11" xs="10">
                    <v-img :src="imageURL" v-show="image" max-width="400px" max-height="400px" />
                  </v-col>
                </v-row>
                <v-form ref="form" @submit.prevent="handleUpload">
                  <v-text-field
                    v-model="name"
                    label="Restaurant name"
                    :value="name"
                    :rules="[rules.isEmpty]"
                  ></v-text-field>
                  <v-text-field
                    v-model="location"
                    label="Location"
                    :value="location"
                    :rules="[rules.isEmpty]"
                  ></v-text-field>
                  <v-select
                    v-model="forte"
                    :items="specialities"
                    label="Speciality"
                    :rules="[rules.isEmpty]"
                  ></v-select>
                  <v-slider
                    v-model="tables"
                    dense
                    min="7"
                    max="25"
                    class="mt-5"
                    label="Number of Tables"
                    :thumb-size="22"
                    thumb-label="always"
                  ></v-slider>
                  <v-select
                    v-model="foodServed"
                    label="Cuisines Served"
                    :items="cuisines"
                    :rules="[rules.isEmpty]"
                    chips
                    multiple
                    clearable
                  ></v-select>
                  <v-card class="pa-10 mt-5" elevation="5">
                    <p class="headline" align="center">Open hours</p>
                    <v-range-slider
                      class="my-5"
                      v-model="morning"
                      ticks="always"
                      min="0"
                      max="24"
                      :thumb-size="22"
                      thumb-label="always"
                    ></v-range-slider>
                    <v-range-slider
                      class="my-5"
                      v-model="evening"
                      ticks="always"
                      min="0"
                      max="24"
                      :thumb-size="22"
                      thumb-label="always"
                    ></v-range-slider>
                  </v-card>
                  <v-row justify="center">
                    <v-btn
                      @click="handleUpload"
                      color="primary white--text"
                      class="mt-10"
                      width="100"
                      >Save</v-btn
                    >
                  </v-row>
                </v-form>
              </v-col>
            </v-row>
          </v-card>
        </v-container>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :color="color" :timeout="timeout">{{ message }}</v-snackbar>
  </v-app>
</template>

<script>
// @ is an alias to /src
import Login from "./Login";
export default {
  name: "Admin",
  data: () => ({
    active: null,
    tabs: [
      {
        link: "#manager",
        name: "Restaurants",
        call: "",
        icon: "mdi-silverware-fork-knife",
      },
      {
        link: "#users",
        name: "Users",
        call: "fetchUsers",
        icon: "mdi-account",
      },
    ],
    resTableHeaders: [
      {
        text: "Name",
        value: "name",
      },
      {
        text: "Speciality",
        value: "speciality",
      },
      {
        text: "Location",
        value: "location",
      },
      {
        value: "action",
      },
    ],
    userTableHeaders: [
      {
        text: "Username",
        value: "username",
      },
      {
        text: "Date",
        value: "date",
      },
      {
        text: "Time",
        value: "time",
      },
      {
        text: "Status",
        value: "status",
      },
      {
        value: "action",
      },
    ],
    specialities: [],
    cuisines: [],
    restaurantData: [],
    userData: [],
    addDialog: false,
    name: "",
    image: null,
    imageURL: "",
    location: "",
    forte: "",
    foodServed: "",
    tables: 7,
    morning: [0, 24],
    evening: [0, 24],
    username: "",
    domainNames: ["gmail.com", "iite.indusuni.ac.in", "indusuni.ac.in"],
    domainDialog: false,
    domain: "",
    imageError: "",
    selError: "",
    rules: {
      isEmpty: (v) => !!v || "Should not be empty",
    },
    grep: false,
    push: false,
    snackbar: false,
    timeout: 7000,
    message: "",
    color: "",
  }),
  computed: {
    fetchRestaurants() {
      this.cuisines = this.$store.getters.fetchCuisines;
      this.specialities = this.cuisines.slice(0, 20);
      this.restaurantData = this.$store.getters.fetchRestaurants;
    },
  },
  mounted() {
    this.$store.dispatch("grabRestaurants");
  },
  methods: {
    setItems() {
      return this.$vuetify.breakpoint.xsOnly ? 5 : 10;
    },
    breakpoint() {
      return this.$vuetify.breakpoint.xsOnly;
    },
    caller(name) {
      if (name === "") {
        return;
      }
      this[name]();
    },
    editRestaurant(restInfo) {
      console.log(restInfo);
    },
    showPreview() {
      this.imageError = "";
      if (!this.image) {
        return (this.imageURL = "");
      }
      ["image/jpg", "image/jpeg", "image/png"].filter((imageType) => this.image.type === imageType)
        .length
        ? (this.imageURL = URL.createObjectURL(this.image))
        : (this.imageError = "Invalid image");
    },
    async handleUpload() {
      this.imageError = "";
      console.log(this.cuisines);
      if (!this.$refs.form.validate()) {
        if (!this.image) {
          this.imageError = "Invalid Image";
        }
        return;
      }
      if (
        !this.image ||
        !["image/jpg", "image/jpeg", "image/png"].filter(
          (imageType) => this.image.type === imageType
        ).length
      ) {
        return (this.imageError = "Invalid image");
      }
      this.push = true;
      let openHours =
        JSON.stringify(this.morning) === "[0,12]" && JSON.stringify(this.evening) === "[12,24]"
          ? "24 hrs"
          : this.morning.join("-") + " " + this.evening.join("-");
      let formdata = new FormData();
      formdata.append("name", this.name);
      formdata.append("speciality", this.forte);
      formdata.append("location", this.location);
      formdata.append("image", this.image);
      formdata.append("cuisines", this.foodServed);
      formdata.append("tables", this.tables);
      formdata.append("openhrs", openHours);

      const upload = await fetch("/master/collect", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: formdata,
      });
      this.push = false;
      const receipt = await upload.json();
      if (receipt.valid) {
        this.color = "teal accent-4";
        this.snackbar = true;
        this.message = receipt.msg;
        this.addDialog = false;
        this.$store.state.restaurants.unshift(receipt.data);
      } else {
        this.color = "red lighten-1";
        this.snackbar = true;
        this.message = receipt.msg;
      }
    },
    async fetchUsers() {
      const records = await fetch("/master/records", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      });
      const getUsers = await records.json();
      if (getUsers.valid) {
        this.userData = getUsers.users;
      } else {
        this.color = "red lighten-1";
        this.snackbar = true;
        this.message = getUsers.msg;
      }
    },
    async deleteUser(userinfo) {
      this.grep = true;
      const res = await fetch("/master/remove", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userinfo.username,
        }),
        credentials: "same-origin",
      });
      const reply = await res.json();

      if (reply.valid && reply.dtd) {
        this.color = "teal accent-4";
        this.snackbar = true;
        this.userData = this.userData.filter((user) => user.username !== userinfo.username);
      } else {
        this.color = "red lighten-1";
        this.snackbar = true;
      }
      this.grep = false;
      this.message = reply.msg;
    },
    setDomain(userInfo) {
      this.domainDialog = true;
      this.username = userInfo.username;
      console.log(this.username);
    },
    async resetUser() {
      if (!this.domain) {
        return;
      }
      this.grep = true;
      this.domainDialog = false;
      const res = await fetch("/admit/renew", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          username: this.username,
          domain: this.domain,
        }),
      });
      const receipt = await res.json();
      if (receipt.sent) {
        this.color = "teal accent-4";
        this.snackbar = true;
      } else {
        this.color = "red";
        this.snackbar = true;
      }
      this.grep = false;
      this.message = receipt.msg;
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
.container {
  margin-top: 120px;
}

.heading {
  border-bottom: solid 1px #dbdbdb;
}
</style>
