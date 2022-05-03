import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@vaadin/app-layout';
import '@vaadin/app-layout/vaadin-drawer-toggle.js';
import {Layout} from 'Frontend/views/view';
import {views} from 'Frontend/routes';
import {router} from "Frontend/index";
import {appStore} from "Frontend/stores/app-store";
import {translate, use} from "lit-translate";
import {AppLayout} from "@vaadin/app-layout";
import '@vaadin/select';

interface RouteInfo {
    path: string;
    title: string;
    icon: string;
}

@customElement('main-layout')
export class MainLayout extends Layout {

    private items = [
        {
            label: 'English',
            value: 'en',
        },
        {
            label: 'Spanish',
            value: 'es',
        }
    ];

    render() {
        console.log(appStore.lang);
        return html`
            <vaadin-app-layout primary-section="drawer">
                <header class="view-header" slot="navbar">
                    <vaadin-drawer-toggle aria-label="Menu toggle" class="view-toggle" theme="contrast"></vaadin-drawer-toggle>
                    <h1 class="view-title">${translate(appStore.currentViewTitle)}</h1>
                    <div class="ms-auto pr-s">
                        <vaadin-select
                                .items="${this.items}"
                                .value="${appStore.lang}"
                                ?selected
                                @change="${this.changeLanguage}"
                        ></vaadin-select>
                        <a href="/logout" class="view-header-link">${translate('label.logout')}</a>
                    </div>
                   
                </header>
                <section class="drawer-section" slot="drawer">
                    <h2 class="app-name">${appStore.applicationName}</h2>
                    <nav aria-labelledby="views-title" class="menu-item-container">
                        <ul class="navigation-list">
                            ${MainLayout.getMenuRoutes().map(
                                    (viewRoute) => html`
                                        <li>
                                            <a
                                                    ?highlight=${viewRoute.path == appStore.location}
                                                    class="menu-item-link"
                                                    href=${router.urlForPath(viewRoute.path)}
                                            >
                                                <span class="${viewRoute.icon} menu-item-icon"></span>
                                                <span class="menu-item-text">${translate(viewRoute.title)}</span>
                                            </a>
                                        </li>
                                    `
                            )}
                        </ul>
                    </nav>
                    <footer class="footer"></footer>
                </section>
                <slot></slot>
            </vaadin-app-layout>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.classList.add('block', 'h-full');
        this.reaction(
            () => appStore.location,
            () => {
                AppLayout.dispatchCloseOverlayDrawerEvent();
            }
        );
    }

    changeLanguage(e: Event) {
        const htmlSelect = e.target as HTMLSelectElement;
        appStore.lang = htmlSelect.value;
        use(appStore.lang);
    }

    private static getMenuRoutes(): RouteInfo[] {
        return views.filter((route) => route.title) as RouteInfo[];
    }
}