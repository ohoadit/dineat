import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import UserDashboard from "../views/UserDashboard.vue";
import Signup from "../views/Signup.vue";
import Reset from "../views/Reset.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/login",
    name: "Home",
    component: Home,
    beforeEnter: (to, from, next) => {
      fetch("/bank", {
        method: "POST",
        credentials: "same-origin"
      })
        .then(res => res.json())
        .then(res => (res.valid ? next("/dashboard") : next()));
    }
  },
  {
    path: "/dashboard",
    name: "UserDashboard",
    component: UserDashboard,
    beforeEnter: (to, from, next) => {
      fetch("/bank", {
        method: "POST",
        credentials: "same-origin"
      })
        .then(res => res.json())
        .then(res => (res.valid ? next() : next("/login")));
    }
  },
  {
    path: "/register",
    name: "Signup",
    component: Signup,
    beforeEnter: (to, from, next) => {
      fetch("/bank", {
        method: "GET",
        credentials: "same-origin"
      })
        .then(res => res.json())
        .then(res => (res.valid ? next('/dashboard') : next()));
    }
  },
  {
    path: "/reset/:id",
    name: "Reset",
    component: Reset,
    beforeEnter: (to, from, next) => {
      const id = to.params.id;
      fetch("/admit/knock", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key: id
        })
      })
        .then(res => res.json())
        .then(res => {
          console.log(res);
          if (!res.valid) {
            next("/");
          }
        })
        .catch(err => {
          console.log(err);
          next();
        });
    }
  },
  {
    path: "*",
    redirect: "/login"
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
