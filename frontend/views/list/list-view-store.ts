import Contact from 'Frontend/generated/com/example/application/data/entity/Contact';
import ContactModel from 'Frontend/generated/com/example/application/data/entity/ContactModel';
import { crmStore } from 'Frontend/stores/app-store';
import {makeAutoObservable, observable, runInAction} from 'mobx';

class ListViewStore {

    filterText = '';
    selectedContact: Contact | null = null;

    constructor() {
        makeAutoObservable(
            this,
            {selectedContact: observable.ref},
            {autoBind: true}
        );
    }

    async updateFilter(filterText: string){
        this.filterText = filterText
        await crmStore.getFilteredContacts(this.filterText)
    }

    async save(contact: Contact) {
        await crmStore.saveContact(contact);
        this.cancelEdit();
    }

    async delete() {
        if (this.selectedContact) {
            await crmStore.deleteContact(this.selectedContact);
            this.cancelEdit();
        }
    }


    async setSelectedContact(contact: Contact){
        await crmStore.editContact(contact);
    }

    editNew() {
        this.selectedContact = ContactModel.createEmptyValue();
    }

    cancelEdit() {
        this.selectedContact = null;
    }
}

export const listViewStore = new ListViewStore();