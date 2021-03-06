import {View} from "Frontend/views/view";
import '@vaadin/text-field';
import '@vaadin/button';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-column';
import '@vaadin/dialog';
import '@vaadin/vertical-layout';
import '@vaadin/horizontal-layout';
import '@vaadin/form-layout';
import {Notification} from '@vaadin/notification';
import {Grid, GridDataProviderCallback, GridDataProviderParams} from '@vaadin/grid';
import {customElement, property, query, state} from 'lit/decorators.js';
import {html} from "lit";
import {translate} from "lit-translate";
import Company from "Frontend/generated/com/example/application/data/entity/Company";
import Sort from "Frontend/generated/dev/hilla/mappedtypes/Sort";
import Direction from "Frontend/generated/org/springframework/data/domain/Sort/Direction";
import {CompanyEndpoint} from "Frontend/generated/endpoints";
import {Binder, field} from "@hilla/form";
import CompanyModel from "Frontend/generated/com/example/application/data/entity/CompanyModel";
import {EndpointError} from "@hilla/frontend";

@customElement('company-list-view')
export class CompanyListView extends View {

    @query('#grid')
    private grid!: Grid;

    @property({type: Number})
    private gridSize = 0;

    @state()
    private filterText = '';

    @state()
    private dialogOpened = false;

    private gridDataProvider = this.getGridData.bind(this);
    private binder = new Binder<Company, CompanyModel>(this, CompanyModel)

    render() {
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
                <div class="flex w-full">
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
                <div class="flex flex-col" style="width: 400px;">
                    <vaadin-form-layout>
                        <vaadin-text-field
                                label="${translate('label.companyName')}"
                                id="name"
                                ${field(this.binder.model.name)}>
                        </vaadin-text-field>
                    </vaadin-form-layout>
                    <div class="flex gap-s">
                        <vaadin-button theme="primary" @click=${this.save}>${translate('action.save')}</vaadin-button>
                        <vaadin-button theme="tertiary" @click=${this.cancel}>${translate('action.cancel')}</vaadin-button>
                    </div>
                </div>
            </div>
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

    private async itemSelected(event: CustomEvent) {
        const item: Company = event.detail.value as Company;
        this.grid.selectedItems = item ? [item] : [];
        if (item) {
            const company = await CompanyEndpoint.getCompany(item.id!);
            company ? this.binder.read(company) : this.refreshGrid();
        } else {
            this.clearForm();
        }
    }

    private addCompany() {
        this.binder.clear();
    }

    private cancel() {
        this.grid.activeItem = undefined;
    }

    private clearForm() {
        this.binder.clear();
    }

    private refreshGrid() {
        this.grid.selectedItems = [];
        this.grid.clearCache();
    }

}