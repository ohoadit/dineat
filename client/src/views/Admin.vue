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
          <v-tab class="white--text" href="#manager">
            Restaurants
          </v-tab>
          <v-tab class="white--text" href="#users">
            Users
          </v-tab>
          <v-tab class="white--text" href="#tab-3">
            Tab-3
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-tabs-items v-model="active">
      <v-tab-item id="manager" class="wrapper">
        <v-container class="container">
          <v-row justify="center">
            <v-col cols="12" xs="11">
              <v-data-table
                :headers="columnTitle"
                :items="data"
                items-per-page="5"
              >
                {{ loadRestaurants }}
              </v-data-table>
            </v-col>
          </v-row>
          <v-btn fab bottom right color="primary" class="mr-5 mb-5" fixed
            ><v-icon>mdi-plus</v-icon></v-btn
          >
        </v-container>
      </v-tab-item>
      <v-lazy>
        <v-tab-item id="users" class="blue-grey lighten-5">
          <v-container class="container">
            <v-row justify="center">
              <v-col cols="12" xs="10">
                <v-card>
                  <v-card-title class="title font-weight-regular">
                  </v-card-title>
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
    active: "tab-1",
    data: [],
    columnTitle: [
      {
        text: "Restaurant name",
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
    ]
  }),
  computed: {
    loadRestaurants() {
      this.data = this.$store.getters.fetchRestaurants;
    }
  },
  methods: {
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
  margin-top: 100px;
}
.wrapper {
  background-color: #f6f7f9;
}
</style>
