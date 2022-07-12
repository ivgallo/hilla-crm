import {View} from "Frontend/views/view";
import '@vaadin/text-field';
import '@vaadin/button';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-column';
import '@vaadin/dialog';
import '@vaadin/vertical-layout';
import '@vaadin/horizontal-layout';
import '@vaadin/form-layout';
import '@vaadin/icon';
import '@vaadin/vaadin-lumo-styles/vaadin-iconset';
import {Notification} from '@vaadin/notification';
import { dialogRenderer } from '@vaadin/dialog/lit.js';
import { guard } from 'lit/directives/guard.js';
import {Grid, GridDataProviderCallback, GridDataProviderParams} from '@vaadin/grid';
import {customElement, property, query, state} from 'lit/decorators.js';
import {html, render} from "lit";
import {translate} from "lit-translate";
import Company from "Frontend/generated/com/example/application/data/entity/Company";
import Sort from "Frontend/generated/dev/hilla/mappedtypes/Sort";
import Direction from "Frontend/generated/org/springframework/data/domain/Sort/Direction";
import {CompanyEndpoint} from "Frontend/generated/endpoints";
import {Binder, field} from "@hilla/form";
import CompanyModel from "Frontend/generated/com/example/application/data/entity/CompanyModel";
import {EndpointError} from "@hilla/frontend";
import {Dialog} from "@vaadin/dialog";

@customElement('company-list-view')
export class CompanyListView extends View {

    @query('#grid')
    private grid!: Grid;

    @query('#dialog')
    private dialog!: Dialog;

    @property({type: Number})
    private gridSize = 0;

    @state()
    private filterText = '';

    @state()
    private dialogOpened = false;

    private gridDataProvider = this.getGridData.bind(this);
    private binder = new Binder<Company, CompanyModel>(this, CompanyModel, {
        onChange: () => {
            if (this.dialog) {
                this.dialog.requestContentUpdate();
            }
        }
    });

    render() {
        const {model} = this.binder;
        return html`
            <div class="toolbar flex gap-s">
                <vaadin-text-field
                        placeholder="${translate('label.filterByName')}"
                        .value=${this.filterText}
                        @input=${this.updateFilter}
                        clear-button-visible></vaadin-text-field>
                <vaadin-button @click="${this.addCompany}">${translate('action.addCompany')}
                </vaadin-button>
            </div>
            <div class="content flex gap-m h-full">
                <vaadin-grid class="grid h-full"
                             id="grid"
                             .size=${this.gridSize}
                             .dataProvider=${this.gridDataProvider}
                             @active-item-changed=${this.itemSelected}
                >
                    <vaadin-grid-column path="name" header="${translate('label.companyName')}"
                                        auto-width></vaadin-grid-column>
                </vaadin-grid>
            </div>
            <vaadin-dialog
                    id="dialog"
                    header-title="${this.binder.value.id ? translate("label.updateCompany") : translate("label.newCompany")}"
                    .headerRenderer="${guard([], () => (root: HTMLElement) => {
                        render(
                                html`
                                    <vaadin-button theme="tertiary" @click="${() => (this.dialogOpened = false)}">
                                        <vaadin-icon icon="lumo:cross"></vaadin-icon>
                                    </vaadin-button>
                                `,
                                root
                        );
                    })}"
                    .opened="${this.dialogOpened}"
                    @opened-changed="${(e: CustomEvent) => (this.dialogOpened = e.detail.value)}"
                    .noCloseOnOutsideClick="${true}"
                    ${dialogRenderer(
                            () => html`
                                <vaadin-vertical-layout
                                        style="align-items: stretch; width: 25rem; max-width: 100%;">
                                    <vaadin-text-field label="${translate('label.companyName')}"
                                                       id="name"
                                                       ${field(model.name)}>

                                    </vaadin-text-field>
                                </vaadin-vertical-layout>
                                <div class="dialog-footer">
                                    <vaadin-button @click="${() => (this.dialogOpened = false)}">
                                        ${translate('action.cancel')}
                                    </vaadin-button>
                                    <vaadin-button theme="primary" @click="${this.save}">
                                        ${translate('action.save')}
                                    </vaadin-button>
                                </div>
                            `
                    )}
            ></vaadin-dialog>
        `;
    }

    async connectedCallback() {
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
        this.gridSize = (await CompanyEndpoint.count()) ?? 0;
    }

    private async getGridData(
        params: GridDataProviderParams<Company>,
        callback: GridDataProviderCallback<Company | undefined>
    ) {
        const sort: Sort = {
            orders: params.sortOrders.map((order) => ({
                property: order.path,
                direction: order.direction == 'asc' ? Direction.ASC : Direction.DESC,
                ignoreCase: false,
            })),
        };
        const data = await CompanyEndpoint.getCompanies(this.filterText, {
            pageNumber: params.page,
            pageSize: params.pageSize,
            sort
        });

        callback(data, data.length);
    }

    updateFilter(e: { target: HTMLInputElement }) {
        this.filterText = e.target.value
        this.refreshGrid();
    }

    private async save() {
        try {
            const isNew = !this.binder.value.id;
            await this.binder.submitTo(CompanyEndpoint.save);
            if (isNew) {
                this.gridSize++;
            }
            this.clearForm();
            this.dialogOpened = false;
            this.refreshGrid();
            Notification.show(`Company saved.`, {position: 'bottom-start'});
        } catch (error: any) {
            if (error instanceof EndpointError) {
                Notification.show(`Server error. ${error.message}`, {theme: 'error', position: 'bottom-start'});
            } else {
                throw error;
            }
        }
    }

    async itemSelected(event: CustomEvent) {
        const item: Company = event.detail.value as Company;
        this.grid.selectedItems = item ? [item] : [];
        if (item) {
            const company = await CompanyEndpoint.getCompany(item.id!);
            company ? this.binder.read(company) : this.refreshGrid();
            console.log(this.binder.value)
            this.dialogOpened = true;
        } else {
            this.clearForm();
        }
    }

    private cancel() {
        this.dialogOpened = false
        this.clearForm()
    }

    private addCompany() {
        this.dialogOpened = true;
        this.clearForm();
    }

    private clearForm() {
        this.binder.clear();
        this.grid.activeItem = undefined;
    }

    private refreshGrid() {
        this.grid.selectedItems = [];
        this.grid.clearCache();
    }

}