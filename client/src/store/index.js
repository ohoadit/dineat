import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  state: {
    sessionName: '',
    restaurants: [
      { 
        name: 'Spicy Sizzlers', 
        cuisines: 'Italian | Continental | Chinese | Sizzlers | Paneer',
        image: 'https://im1.dineout.co.in/images/uploads/restaurant/sharpen/3/m/w/p37920-15270679725b053544d7e5b.jpg',
        location: 'Navrangpura'
      }, 
      {
        name: 'Urban Khichdi', 
        cuisines: 'Desi | Gujarati | Khichdi',
        image: 'https://im1.dineout.co.in/images/uploads/restaurant/sharpen/4/t/q/p44343-15338807305b6d299ae777a.jpg',
        location: 'CG Road'
      },
      {
        name: 'El Clasico', 
        cuisines: 'Fastfood | Pizza | Burger | Fries | Coke',
        image: 'https://images.adsttc.com/media/images/58dc/2778/e58e/ceef/0900/01c3/slideshow/Portada_LEKA_IAAC_FABLab_Barcelona-7.jpg',
        location: 'Satellite' 
      },
      {
        name: 'Desi Ras', 
        cuisines: 'Kathiawaadi | Desi | Rajasthani',
        image: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg',
        location: 'Bodakdev' 
      },
      // {
      //   name: 'Companion',
      //   cuisines: 'South Indian | Dosa | Idli | Handva',
      //   image: 'https://images.pexels.com/photos/2225577/pexels-photo-2225577.jpeg',
      //   location: 'Prahlad Nagar'
      // }

    ]
  },
  mutations: {
    sessionStarted (state, name) {
      state.sessionName = name
    },
  },
  getters: {
    fetchRestaurants (state) {
      return state.restaurants
    },
    fetchRandom (state) {
      const x = Math.floor(Math.random() * Math.floor(5))
      console.log(state.restaurants[x])
      return state.restaurants[x]
    }
  },
  actions: {},
  modules: {}
});
