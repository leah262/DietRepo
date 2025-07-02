import FXMLHttpRequest from "./FXMLHttpRequest.js";

class DietAPI {
    loadEntries() {
        if (this.userId) {
            const fxhr = new FXMLHttpRequest();
            fxhr.addEventListener('onReadyStateChange', this.handleLoadResponse.bind(this));
            fxhr.open('GET', `https://fake.server/api/Info-Servers/records/${this.userId}`);
            fxhr.send(null);
        }
    }

    handleLoadResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            this.processLoadResponse(fxhr);
        }
    }

    processLoadResponse(fxhr) {
        const response = JSON.parse(fxhr.responseText);
        console.log("Load response:", response);
        if (response && response.success) {
            this.updateEntriesFromResponse(response);
        } else {
            this.handleLoadError(response);
        }
    }

    updateEntriesFromResponse(response) {
        this.entries = response.data || [];
        sessionStorage.setItem('userEntries', JSON.stringify(this.entries));
        // ה-UI יטופל במחלקה שיורשת
    }

    handleLoadError(response) {
        console.error("Load failed:", response);
        // ה-UI יטופל במחלקה שיורשת
    }

    addEntryToServer(entry) {
        console.log("Sending entry to server:", entry);
        const fxhr = new FXMLHttpRequest();
        fxhr.addEventListener('onReadyStateChange', this.handleAddResponse.bind(this));
        fxhr.open('POST', 'https://fake.server/api/Info-Servers/records');
        fxhr.send(entry);
    }

    handleAddResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            this.processAddResponse(fxhr);
        }
    }

    processAddResponse(fxhr) {
        const response = JSON.parse(fxhr.responseText);
        console.log("Add response:", response);
        if (response && response.success) {
            this.handleAddSuccess(response);
        } else {
            this.handleAddError(response);
        }
    }

    handleAddSuccess(response) {
        // יטופל במחלקה שיורשת
        this.loadEntries();
        if (response.data) {
            this.addOneEntry(response.data);
        }
    }

    addOneEntry(entry) { // תיקון שם הפרמטר
        let records = JSON.parse(sessionStorage.getItem("userEntries")) || [];
        records.push(entry); // תיקון שם המשתנה
        sessionStorage.setItem("userEntries", JSON.stringify(records));
    }

    handleAddError(response) {
        console.error("Add failed:", response);
        // יטופל במחלקה שיורשת
    }

    updateEntryOnServer(entry) {
        const fxhr = new FXMLHttpRequest();
        fxhr.addEventListener('onReadyStateChange', this.handleUpdateResponse.bind(this));
        fxhr.open('PUT', `https://fake.server/api/Info-Servers/records/${entry.id}`);
        fxhr.send(entry);
    }

    handleUpdateResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            this.processUpdateResponse(fxhr);
        }
    }

    processUpdateResponse(fxhr) {
        const response = JSON.parse(fxhr.responseText);
        console.log("Update response:", response);
        if (response && response.success) {
            this.handleUpdateSuccess();
        } else {
            this.handleUpdateError(response);
        }
    }

    handleUpdateSuccess() {
        // יטופל במחלקה שיורשת
        this.loadEntries();
    }

    handleUpdateError(response) {
        console.error("Update failed:", response);
        // יטופל במחלקה שיורשת
    }

    performDelete(entryId) {
        const numericId = parseInt(entryId);
        const fxhr = new FXMLHttpRequest();
        fxhr.addEventListener('onReadyStateChange', this.handleDeleteResponse.bind(this));
        fxhr.open('DELETE', `https://fake.server/api/Info-Servers/records/${numericId}`);
        fxhr.send({ id: numericId, userId: this.userId });
    }

    handleDeleteResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            this.processDeleteResponse(fxhr);
        }
    }

    processDeleteResponse(fxhr) {
        const response = JSON.parse(fxhr.responseText);
        console.log("Delete response:", response);
        if (response && response.success) {
            this.handleDeleteSuccess();
        } else {
            this.handleDeleteError(response);
        }
    }

    handleDeleteSuccess() {
        // יטופל במחלקה שיורשת
        this.loadEntries();
    }

    handleDeleteError(response) {
        console.error("Delete failed:", response);
        // יטופל במחלקה שיורשת
    }
}

export default DietAPI;