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
          <v-tab
            v-for="(tab, i) in tabs"
            :key="i"
            :href="tab.link"
            @click="caller(tab.call)"
          >
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
                :items-per-page="7"
                class="elevation-10"
                disable-sort
              >
                <template
                  v-slot:header="{ props }"
                  v-if="!this.$vuetify.breakpoint.xsOnly"
                >
                  <tr>
                    <td
                      v-for="(title, i) in props.headers"
                      :key="i"
                      class="grey--text text--darken-2 title"
                    >
                      {{ title.text }}
                    </td>
                  </tr>
                </template>
              </v-data-table>
              {{ fetchRestaurants }}
            </v-col>
          </v-row>
          <v-btn fab bottom right color="primary" class="mr-5 mb-5" fixed
            ><v-icon>mdi-plus</v-icon></v-btn
          >
        </v-container>
      </v-tab-item>
      <v-lazy>
        <v-tab-item id="users">
          <v-container class="container">
            <v-progress-linear
              color="primary"
              indeterminate
              :active="!userData.length"
            ></v-progress-linear>
            <v-row justify="center">
              <v-col cols="12" xs="10">
                <v-card
                  tile
                  v-for="(user, i) in userData"
                  :key="i"
                  @click="randomConsoleFunction(user)"
                >
                  <v-card-text>
                    <div class="wrapper">
                      <div>
                        {{ user.username }}
                      </div>
                      <div>
                        {{ user.registration }}
                      </div>
                      <div>
                        {{ user.status }}
                      </div>
                      <div>
                        <v-btn raised color="red lighten-1 white--text">Delete</v-btn>
                      </div>
                    </div>
                  </v-card-text>
                  <v-divider></v-divider>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-tab-item>
      </v-lazy>
    </v-tabs-items>
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
        icon: "mdi-silverware-fork-knife"
      },
      {
        link: "#users",
        name: "Users",
        call: "fetchUsers",
        icon: "mdi-account"
      }
    ],
    resTableHeaders: [
      {
        text: "Name",
        value: "name"
      },
      {
        text: "Cuisines",
        value: "cuisines"
      },
      {
        text: "Location",
        value: "location"
      }
    ],
    userTableHeaders: [
      {
        text: "Username"
      }
    ],
    restaurantData: [],
    userData: []
  }),
  computed: {
    fetchRestaurants() {
      this.restaurantData = this.$store.getters.fetchRestaurants;
    }
  },
  methods: {
    caller(name) {
      if (name === "") {
        return;
      }
      this[name]();
    },
    async fetchUsers() {
      const records = await fetch("/master/records", {
        method: "POST",
        headers: {
          'Accept': "Application/JSON",          
        },
        credentials: "same-origin"
      });
      const getUsers = await records.json()
      if (getUsers.valid) {
        this.userData = getUsers.users
      }
    },
    randomConsoleFunction(data) {
      console.log(data);
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
.container {
  margin-top: 120px;
}
.wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 20px;
  color: #000;
}
.wrapper > div {
  flex: 1
}
@media screen and (max-width: 600px) {
  .wrapper {
    flex-direction: column;
  }
  .wrapper div {
    margin-top: 10px;
  }
}
</style>
