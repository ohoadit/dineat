import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {
      name: '',
    },
    restaurants: [
      { 
        name: "Yanki Sizzlers", 
        cuisines: "Italian | Continental | Chinese | Sizzlers",
        images: "https://im1.dineout.co.in/images/uploads/restaurant/sharpen/3/m/w/p37920-15270679725b053544d7e5b.jpg",
        timings: "12-15 18-23"
      }, 
      {
        name: "Urban Khichdi", 
        cuisines: "Desi | Gujarati | Khichdi",
        images: "https://im1.dineout.co.in/images/uploads/restaurant/sharpen/4/t/q/p44343-15338807305b6d299ae777a.jpg",
        timings: "12-15 18-23"
      }
    ]
  },
  mutations: {},
  actions: {},
  modules: {}
});
