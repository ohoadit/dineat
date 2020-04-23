import Vue from "vue";
import Vuex from "vuex";
import router from "./router";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: {
      username: "",
      cookie: "",
    },
    resMin: [],
    restaurants: [],
    cuisines: [],
    cuiMin: "",
  },
  mutations: {
    setUser(state, payload) {
      Object.assign(state.user, payload);
    },

    setRestaurants(state, payload) {
      state.restaurants = payload.eateries;
      state.cuisines = payload.cuisines;
    },

    minifier(state) {
      if (state.resMin.length) {
        return;
      }
      state.cuiMin = state.cuisines
        .join("")
        .replace(/\s+/g, "")
        .toLowerCase();

      state.restaurants.forEach((restaurant) => {
        let combined = "";
        for (const prop in restaurant) {
          combined += restaurant[prop];
        }
        state.resMin.push(combined.replace(/\s+/g, "").toLowerCase());
      });
    },

    sessionStarted(state) {
      const check = setInterval(() => {
        if (document.cookie !== state.user.cookie) {
          if (router.currentRoute.name !== "Login") {
            router.push("/login").catch((err) => {});
          }
          clearInterval(check);
        }
      }, 1000);
    },

    sessionEnded(state) {
      Object.assign(state.user, { username: "", cookie: "" });
    },
  },

  getters: {
    fetchCuisines(state) {
      return state.cuisines;
    },

    fetchRestaurants(state) {
      return state.restaurants;
    },

    searchRestaurant: (state) => (sentence) => {
      store.commit("minifier");
      const arr = [];
      const nameMatch = state.restaurants.filter(
        (restaurant) => restaurant.name.toLowerCase() === sentence
      );
      if (nameMatch.length) {
        return nameMatch;
      }
      console.log(nameMatch);
      const cuisineMatch = [];
      const min = sentence.replace(/\s+/, "");
      if (state.cuiMin.includes(min)) {
        state.resMin.forEach((res, index) => {
          if (res.includes(min)) {
            cuisineMatch.push(state.restaurants[index]);
          }
        });
        if (cuisineMatch.length) {
          return cuisineMatch;
        }
      }
      const lexicons = sentence.split(" ").filter((token) => token.length > 3);
      lexicons.forEach((lexicon) => {
        state.resMin.forEach((restaurant, index) => {
          if (restaurant.includes(lexicon)) {
            if (!arr.includes(restaurant)) {
              arr.push(state.restaurants[index]);
            }
          }
        });
      });
      return arr;
    },
  },
  actions: {
    async grabRestaurants(context) {
      fetch("/master/pull", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "same-origin",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            context.commit("setRestaurants", { eateries: data.places, cuisines: data.cuisines });
          }
        })
        .catch((err) => {});
    },
  },
  modules: {},
});

export default store;
