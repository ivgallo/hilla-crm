import { Router } from '@vaadin/router';
import {routes} from './routes';
import {appStore} from "Frontend/stores/app-store";
import {get, registerTranslateConfig, translateConfig, use} from "lit-translate";
import {Binder} from "@hilla/form";

export const router = new Router(document.querySelector('#outlet'));

router.setRoutes(routes);

window.addEventListener('vaadin-router-location-changed', (e) => {
    appStore.setLocation((e as CustomEvent).detail.location);
    const title = appStore.currentViewTitle;
    if (title) {
        document.title = title + ' | ' + appStore.applicationName;
    } else {
        document.title = appStore.applicationName;
    }
});

registerTranslateConfig({
    loader: lang => fetch(`i18n/${lang}.json`).then((res) => res.json())
})
use(appStore.lang);

Binder.interpolateMessageCallback = (message, validator, binderNode) => {
    // Try to find a translation for the specific type of validator
    let key = `validationError.${validator.constructor.name}`;

    if (translateConfig.lookup(key, translateConfig)) {
        return get(key, validator as any);
    }

    return message;
};