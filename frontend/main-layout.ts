import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@vaadin/app-layout';
import '@vaadin/app-layout/vaadin-drawer-toggle.js';
import {Layout} from 'Frontend/views/view';
import {views} from 'Frontend/routes';
import {router} from "Frontend/index";
import {RouterLocation} from '@vaadin/router';
import './components/active-link';

@customElement('main-layout')
export class MainLayout extends Layout {

    @property()
    location: RouterLocation;

    constructor() {
        super();
        this.location = router.location;
    }

    render() {
        return html`
            <vaadin-app-layout class="h-full w-full">
                <header slot="navbar" class="w-full flex items-center px-m">
                    <vaadin-drawer-toggle></vaadin-drawer-toggle>
                    <h1 class="text-l m-m">Hilla CRM</h1>
                    <a href="/logout" class="ms-auto">Log out</a>
                </header>

                <div slot="drawer">
                    <div class="flex flex-col h-full m-l spacing-b-s">
                        ${views.map((view) => html`
                            <active-link .viewRoute="${view}" .active=${this.location.getUrl() === router.urlForPath(view.path)} />
                        `)}
                    </div>
                </div>
                <div class="h-full">
                    <slot><!-- The router puts views here --></slot>
                </div>
            </vaadin-app-layout>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.classList.add('flex', 'h-full', 'w-full');
    }
}

//  <a href=${view.path}> ${view.title} </a>