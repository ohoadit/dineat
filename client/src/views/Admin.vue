<template>
  <v-app>
    <v-app-bar color="secondary white--text" fixed>
      <v-toolbar-title class="headline">Dineat</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text color="white" @click="logout">
          <v-icon left>mdi-logout</v-icon>
          Logout
        </v-btn>
      </v-toolbar-items>
      <template v-slot:extension>
        <v-tabs v-model="active" fixed-tabs>
          <v-tabs-slider color="white"></v-tabs-slider>
          <v-tab
            class="white--text"
            v-for="(tab, i) in tabs"
            :key="i"
            :href="tab.link"
            @click="caller(tab.call)"
          >
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
            <v-row justify="center">
              <v-col cols="12" xs="10">
                <v-card
                  tile
                  v-for="(user, i) in userData"
                  :key="i"
                  @click="randomConsoleFunction(user)"
                >
                  <v-card-text class="title font-weight-regular">
                    <div class="primary">
                      <div>
                        {{ user.name }}
                      </div>
                      <div>
                        {{ user.time }}
                      </div>
                      <div>
                        {{ user.status }}
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
        call: ""
      },
      {
        link: "#users",
        name: "Users",
        call: "fetchUsers"
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
    caller (name) {
      if (!name === '') {
        this[name]()
      }
    },
    fetchUsers() {
      setTimeout(() => {
        this.userData = [
        {
          name: "Tissot",
          time: Date.now().toString(),
          status: "Registered"
        },
        {
          name: "Mido",
          time: Date.now().toLocaleString(),
          status: "Link Sent"
        },
        {
          name: "Kenzo",
          time: Date.now().toLocaleString(),
          status: "Link Expired"
        }
      ];
      }, 5000)
      
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
</style>
