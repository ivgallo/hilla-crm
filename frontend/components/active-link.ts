import {css, html, LitElement, TemplateResult} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {ViewRoute} from "Frontend/routes";

@customElement('active-link')
export class ActiveLink extends LitElement {

    static styles = css`
		a {
			text-decoration: none;
		}
		a:where(:any-link) {
			color: var(--lumo-primary-text-color);
		}
		.active {
			font-weight: bold;
		}
	`;

    viewRoute: ViewRoute;

    @property()
    active: boolean = false;

    constructor(viewRoute: ViewRoute) {
        super();
        this.viewRoute = viewRoute;
    }

    render(): TemplateResult {
        const classes = { active: this.active };
        return html`<a href=${this.viewRoute.path} class=${classMap(classes)} > ${this.viewRoute.title} </a>`;
    }

}