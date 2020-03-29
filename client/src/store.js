import Vue from "vue";
import Vuex from "vuex";
import router from "./router";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: {
      username: "",
      cookie: ""
    },
    resMin: [],
    restaurants: [
      {
        name: "React Sizzlers",
        cuisines: "Italian | Continental | Chinese | Sizzlers | Paneer",
        image:
          "https://im1.dineout.co.in/images/uploads/restaurant/sharpen/3/m/w/p37920-15270679725b053544d7e5b.jpg",
        location: "Navrangpura"
      },
      {
        name: "Urban Khichdi",
        cuisines: "Desi | Gujarati | Khichdi",
        image:
          "https://im1.dineout.co.in/images/uploads/restaurant/sharpen/4/t/q/p44343-15338807305b6d299ae777a.jpg",
        location: "CG Road"
      },
      {
        name: "El Clasico",
        cuisines: "Fastfood | Pizza | Burger | Fries | Coke",
        image:
          "https://images.adsttc.com/media/images/58dc/2778/e58e/ceef/0900/01c3/slideshow/Portada_LEKA_IAAC_FABLab_Barcelona-7.jpg",
        location: "Satellite"
      },
      {
        name: "Desi Ras",
        cuisines: "Kathiawaadi | Desi | Rajasthani",
        image:
          "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg",
        location: "Bodakdev"
      },
      {
        name: "Companion",
        cuisines: "South Indian | Dosa | Idli | Handva | Coffee",
        image:
          "https://cdn.pixabay.com/photo/2018/08/10/21/52/restaurant-3597677_960_720.jpg",
        location: "Prahlad Nagar"
      },
      {
        name: "Cafe Piano",
        cuisines: "Continental | Italian | Cafe | Bar | Fastfood",
        image:
          "https://cdn.pixabay.com/photo/2015/05/31/11/23/table-791167_960_720.jpg",
        location: "Satellite"
      },
      {
        name: "Royal Dining",
        cuisines: "Gujarati Thali |  ",
        image:
          "https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        location: "Vastrapur"
      },
      {
        name: "Vue Cafe",
        cuisines: "Cafe | Tea | Coffee | Fastfood | Pizza",
        image:
          "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        location: "CG Road"
      }
    ]
  },
  mutations: {
    setUser (state, payload) {
      Object.assign(state.user, payload)
    },

    minifier (state) {
      if (state.resMin.length) {
        return;
      }
      state.restaurants.forEach(restaurant => {
        let combined = "";
        for (const prop in restaurant) {
          combined += restaurant[prop];
        }
        state.resMin.push(combined.replace(/\s+/g, "").toLowerCase());
      });
    },

    sessionStarted (state) {
      const check = setInterval(() => {
        if (document.cookie !== state.user.cookie) {
          if (router.currentRoute.name !== "Login") {
              router.push("/login").catch(err => console.log(err))
          }
          clearInterval(check);
        }
      }, 1000);
    },

    sessionEnded (state) {
      Object.assign(state.user, {username: '', cookie: ''})
    }
  },

  getters: {
    fetchRestaurants (state) {
      return state.restaurants;
    },

    searchRestaurant: state => sentence => {
      store.commit("minifier");
      const lexicons = sentence.split(" ").filter(token => token.length >= 3);
      const arr = [];
      lexicons.forEach(lexicon => {
        state.resMin.forEach((restaurant, index) => {
          if (restaurant.includes(lexicon)) {
            if (!arr.includes(index)) {
              arr.push(state.restaurants[index]);
            }
          }
        });
      });
      return arr;
    }
  },
  actions: {},
  modules: {}
});


export default store;
