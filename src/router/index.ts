import Vue from "vue";
import Router, { RouteConfig } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import ViewerPage from "@/pages/ViewerPage.vue";

Vue.use(Router);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "home",
    alias: "/home",
    component: HomePage,
  },
  {
    path: "/viewer",
    name: "viewer",
    component: ViewerPage,
  },
  {
    path: "*",
    redirect: "/",
  },
];

export default new Router({
  mode: "history",
  routes,
});
