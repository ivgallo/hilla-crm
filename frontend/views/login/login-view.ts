import {uiStore} from 'Frontend/stores/app-store';
import {html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {View} from 'Frontend/views/view';
import {LoginFormLoginEvent, LoginI18n} from '@vaadin/login/vaadin-login-form.js';
import '@vaadin/login/vaadin-login-form.js';
import {get} from "lit-translate";

@customElement('login-view')
export class LoginView extends View {
    @state()
    private error = false;

    connectedCallback() {
        super.connectedCallback();
        this.classList.add('flex', 'flex-col', 'items-center', 'justify-center');
        uiStore.setLoggedIn(false);
    }

    render() {

       const loginI18nDefault: LoginI18n = {
           form: {
               "title": get('login.form.title'),
               "username": get('login.form.username'),
               "password": get('login.form.password'),
               "submit": get('login.form.submit'),
               "forgotPassword": get('login.form.forgotPassword')
           },
           errorMessage: {
               title: 'Incorrect username or password',
               message: '',
           }
       }
        return html`
            <h1>Hilla CRM</h1>
            <vaadin-login-form
                    no-forgot-password
                    @login=${this.login}
                    .error=${this.error}
                    .i18n=${Object.assign(
                            loginI18nDefault
                    )}
            >
            </vaadin-login-form>
        `;
    }

    async login(e: LoginFormLoginEvent) {
        try {
            await uiStore.login(e.detail.username, e.detail.password);
        } catch (err) {
            this.error = true;
        }
    }

}