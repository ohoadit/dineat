import Vue from "vue";
import VueRouter from "vue-router";
const Login = () => import(/* webpackChunkName: 'login' */ "./views/Login.vue");
const UserDashboard = () => import(/* webpackChunkName: 'dash' */ "./views/UserDashboard.vue");
const Reset = () => import(/* webpackChunkName: 'reset' */ "./views/Reset.vue");
const Admin = () => import(/* webpackChunkName: 'admin' */ "./views/Admin.vue");
const Eatery = () => import(/* webpackChunkName: 'eatery' */ "./views/Eatery.vue");
import store from "@/store";

Vue.use(VueRouter);

const isAuthenticated = async () => {
  const res = await fetch("/bank", {
    method: "GET",
    credentials: "same-origin",
  });
  const msg = await res.json();
  return msg;
};

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    beforeEnter: async (to, from, next) => {
      const data = await isAuthenticated();
      if (data.valid) {
        if (data.eatery) {
          next("/eatery");
        } else if (data.admin) {
          next("/admin");
        } else {
          next("/dashboard");
        }
      } else {
        next();
      }
    },
  },
  {
    path: "/dashboard",
    name: "UserDashboard",
    component: UserDashboard,
    beforeEnter: async (to, from, next) => {
      const data = await isAuthenticated();
      if (data.valid) {
        if (data.eatery) {
          next("/eatery");
        } else if (data.admin) {
          next("/admin");
        } else {
          next();
        }
        store.commit("setUser", {
          username: data.user.username,
          cookie: document.cookie,
        });
        store.commit("sessionStarted");
      } else {
        next("/login");
      }
    },
  },
  {
    path: "/eatery",
    name: "Eatery",
    component: Eatery,
    beforeEnter: async (to, from, next) => {
      const data = await isAuthenticated();
      if (data.valid) {
        if (data.eatery) {
          next();
        } else if (data.admin) {
          next("/admin");
        } else {
          next("/dashboard");
        }
      } else {
        next("/login");
      }
      store.commit("setUser", {
        username: data.user.username,
        cookie: document.cookie,
      });
      store.commit("sessionStarted");
    },
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
    beforeEnter: async (to, from, next) => {
      const data = await isAuthenticated();
      if (data.valid) {
        if (data.admin) {
          next();
        } else if (data.eatery) {
          next("/eatery");
        } else {
          next("/dashboard");
        }
        store.commit("setUser", {
          username: data.user.username,
          cookie: document.cookie,
        });
        store.commit("sessionStarted");
      } else {
        next("/login");
      }
    },
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: id,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          res.valid ? next() : next("/");
        })
        .catch((err) => {
          next("/");
        });
    },
  },
  {
    path: "*",
    redirect: "/login",
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
