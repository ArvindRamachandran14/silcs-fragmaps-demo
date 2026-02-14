import Vue from "vue";
import Vuex from "vuex";
import startup, { StartupState } from "@/store/modules/startup";

Vue.use(Vuex);

export interface RootState {
  startup: StartupState;
}

export default new Vuex.Store<RootState>({
  modules: {
    startup,
  },
});
