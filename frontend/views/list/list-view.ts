import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {View} from '../../views/view';
import '@vaadin/text-field';
import '@vaadin/button';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-column';
import './contact-form';
import {crmStore, uiStore} from 'Frontend/stores/app-store';
import {listViewStore} from "Frontend/views/list/list-view-store";
import '@vaadin/notification';
import {translate} from "lit-translate";

@customElement('list-view')
export class ListView extends View {

    firstSelectionEvent = true;

    render() {
        return html`
            <div class="toolbar flex gap-s">
                <vaadin-text-field
                        placeholder="${translate('label.filterByName')}"
                        .value=${listViewStore.filterText}
                        @input=${this.updateFilter}
                        clear-button-visible></vaadin-text-field>
                <vaadin-button @click=${listViewStore.editNew}>${translate('action.addContact')}</vaadin-button>
            </div>
            <div class="content flex gap-m h-full">
                <vaadin-grid
                        class="grid h-full"
                        .items=${crmStore.contacts}
                        .selectedItems=${[listViewStore.selectedContact]}
                        @active-item-changed=${this.handleGridSelection}>
                    <vaadin-grid-column path="firstName" header="${translate('label.firstName')}" auto-width></vaadin-grid-column>
                    <vaadin-grid-column path="lastName" header="${translate('label.lastName')}" auto-width></vaadin-grid-column>
                    <vaadin-grid-column path="email" header="${translate('label.email')}" auto-width></vaadin-grid-column>
                    <vaadin-grid-column path="status.name" header="${translate('label.status')}" auto-width></vaadin-grid-column>
                    <vaadin-grid-column path="company.name" header="${translate('label.company')}" auto-width></vaadin-grid-column>
                </vaadin-grid>
                <contact-form class="flex flex-col gap-s" ?hidden=${!listViewStore.selectedContact}></contact-form>
            </div>
            <vaadin-notification
                    theme=${uiStore.message.error ? 'error' : 'contrast'}
                    position="bottom-start"
                    .opened=${uiStore.message.open}
                    .renderer=${(root: HTMLElement) =>
                            (root.textContent = uiStore.message.text)}>
            </vaadin-notification>
        `;
    }

    async updateFilter(e: { target: HTMLInputElement }) {
       await listViewStore.updateFilter(e.target.value)
    }

    async handleGridSelection(e: CustomEvent) {
      if (this.firstSelectionEvent) {
        this.firstSelectionEvent = false;
        return;
      }
      await listViewStore.setSelectedContact(e.detail.value);
    }

    connectedCallback() {
        super.connectedCallback();
        this.classList.add(
            'box-border',
            'flex',
            'flex-col',
            'p-m',
            'gap-s',
            'w-full',
            'h-full'
        );
        this.autorun(() => {
            if (listViewStore.selectedContact) {
                this.classList.add("editing");
            } else {
                this.classList.remove("editing");
            }
        });
    }
}
