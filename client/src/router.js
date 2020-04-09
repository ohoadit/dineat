import Vue from "vue";
import VueRouter from "vue-router";
const Login = () => import( /* webpackChunkName: 'router' */  "./views/Login.vue");
const UserDashboard = () => import( /* webpackChunkName: 'router' */  "./views/UserDashboard.vue");
const Reset = () => import( /* webpackChunkName: 'router' */  "./views/Reset.vue");
const Admin = () => import( /* webpackChunkName: 'router' */  "./views/Admin.vue");
import store from "@/store";


Vue.use(VueRouter);

const isAuthenticated = async () => {
  const res = await fetch("/bank", {
    method: "GET",
    credentials: "same-origin"
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
        data.admin ? next('/admin') : next("/dashboard");
      } else {
        next();
      }
    }
  },
  {
    path: "/dashboard",
    name: "UserDashboard",
    component: UserDashboard,
    beforeEnter: async (to, from, next) => {
      const data = await isAuthenticated();
      if (data.valid) {
        data.admin ? next('/admin') : next();
        store.commit("setUser", { username: data.user.username, cookie: document.cookie});
        store.commit('sessionStarted')
      } else {
        next("/login");
      }
    }
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
    beforeEnter: async (to, from, next) => {
      const data = await isAuthenticated()
      if (data.valid) {
        data.admin ? next() : next('/dashboard')
        store.commit('setUser', { username: data.user.username, cookie: document.cookie});
        store.commit('sessionStarted')
      } else {
        next('/login');
      }
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
      }).then(res => res.json())
        .then(res => {
          res.valid ? next(): next('/')
        })
        .catch(err => {
          console.log(err);
          next('/');
        });
    },
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
