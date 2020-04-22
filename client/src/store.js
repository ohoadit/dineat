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
      state.restaurants.filter((restaurant) => restaurant.name.toLowerCase() === sentence);
      const lexicons = sentence.split(" ").filter((token) => state.cuisines.includes(token));

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
