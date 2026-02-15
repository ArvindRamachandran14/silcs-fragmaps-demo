import Vue from "vue";
import Vuex from "vuex";
import startup, { StartupState } from "@/store/modules/startup";
import viewer, { ViewerState } from "@/store/modules/viewer";

Vue.use(Vuex);

export interface RootState {
  startup: StartupState;
  viewer: ViewerState;
}

export default new Vuex.Store<RootState>({
  modules: {
    startup,
    viewer,
  },
});
