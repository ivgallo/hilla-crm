import { CrmStore } from "./crm-store";
import {UiStore} from "Frontend/stores/ui-store";
import {RouterLocation} from "@vaadin/router";
import {makeAutoObservable} from "mobx";

export class AppStore {

  crmStore = new CrmStore();
  uiStore = new UiStore();

  applicationName = 'Hilla CRM';
  location = '';
  currentViewTitle = '';
  lang = 'en';

  constructor() {
    makeAutoObservable(this);
  }

  setLocation(location: RouterLocation) {
    const serverSideRoute = location.route?.path == '(.*)';
    if (location.route && !serverSideRoute) {
      this.location = location.route.path;
    } else if (location.pathname.startsWith(location.baseUrl)) {
      this.location = location.pathname.substr(location.baseUrl.length);
    } else {
      this.location = location.pathname;
    }
    if (serverSideRoute) {
      this.currentViewTitle = document.title; // Title set by server
    } else {
      this.currentViewTitle = (location?.route as any)?.title || '';
    }
  }


}

export const appStore = new AppStore();
export const crmStore = appStore.crmStore;
export const uiStore  = appStore.uiStore;