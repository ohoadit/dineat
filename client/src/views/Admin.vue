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
                :items-per-page="setItems()"
                class="table elevation-10"
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
            ><v-icon>mdi-plus</v-icon></v-btn
          >
        </v-container>
      </v-tab-item>
      <v-tab-item id="users">
        <v-container class="container">
          <v-progress-linear
            color="primary"
            indeterminate
            :active="grep"
          ></v-progress-linear>
          <v-data-table
            :headers="userTableHeaders"
            :items="userData"
            :items-per-page="setItems()"
            class="elevation-10 headline"
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
              <v-btn color="primary" icon @click="resetUser(item)"
                ><v-icon>mdi-lock-reset</v-icon></v-btn
              >
            </template>
          </v-data-table>
        </v-container>
      </v-tab-item>
    </v-tabs-items>
    <v-snackbar v-model="snackbar" :color="color" :timeout="timeout">{{
      message}}</v-snackbar>
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
        text: "Username",
        value: "username"
      },
      {
        text: "Date",
        value: "date"
      },
      {
        text: "Time",
        value: "time"
      },
      {
        text: "Status",
        value: "status"
      },
      {
        value: "action"
      }
    ],
    restaurantData: [],
    userData: [],
    grep: false,
    snackbar: false,
    timeout: 7000,
    message: "",
    color: "",
  }),
  computed: {
    fetchRestaurants() {
      this.restaurantData = this.$store.getters.fetchRestaurants;
    }
  },
  methods: {
    setItems() {
      return this.$vuetify.breakpoint.xsOnly ? 5 : 7;
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
    async fetchUsers() {
      const records = await fetch("/master/records", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        credentials: "same-origin"
      });
      const getUsers = await records.json();
      if (getUsers.valid) {
        this.userData = getUsers.users;
      } else {
        this.color = 'red lighten-1'
        this.snackbar = true
        this.message = getUsers.msg
      }
    },
    async deleteUser(userinfo) {
      this.grep = true
      const res = await fetch('/master/remove', {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user: userinfo.username
        }),
        credentials: "same-origin"
      });
      const reply = await res.json()

      if (reply.valid && reply.dtd) {
        this.color = "teal accent-4";
        this.snackbar = true;
        this.userData = this.userData.filter(user => user.username !== userinfo.username)
      } else {
        this.color = "red lighten-1";
        this.snackbar = true;
      }
      this.grep = false
      this.message = reply.msg;
    },
    async resetUser(userInfo) {
      this.grep = true
      const res = await fetch('/admit/renew', {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: userInfo.username
        })
      })
      const receipt = await res.json()
      if (receipt.sent) {
        this.color = "teal accent-4"
        this.snackbar = true
      } else {
        this.color = "red"
        this.snackbar = true
      }
      this.grep = false
      this.message = receipt.msg
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
  flex: 1;
}

.heading {
  border-bottom: solid 1px #dbdbdb;
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
