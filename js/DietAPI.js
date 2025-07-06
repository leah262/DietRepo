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
            const response = JSON.parse(fxhr.responseText);
            console.log("Load response:", response);
            if (response && response.success) {
                this.updateEntriesFromResponse(response);
            } else {
                console.error("Load failed:", response);
            }
        }
    }

    addEntryToServer(entry) {
        console.log("Sending entry to server:", entry);
        this.makeRequest('POST', 'https://fake.server/api/Info-Servers/records', entry, this.handleAddResponse.bind(this));
    }

    handleAddResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            const response = JSON.parse(fxhr.responseText);
            console.log("Add response:", response);
            if (response && response.success) {
                // הוספת הרשומה מקומית מיד בלי לטעון מחדש
                if (response.data) {
                    this.addEntryLocally(response.data);
                }
                this.handleAddSuccess(response);
            } else {
                console.error("Add failed:", response);
                this.handleAddError(response);
            }
        }
    }

    addEntryLocally(entry) {
        // הוספה מקומית לרשימה
        this.entries.unshift(entry); // מוסיף בהתחלה כדי שיופיע למעלה
        sessionStorage.setItem("userEntries", JSON.stringify(this.entries));
        // עדכון הצגה מקומית
        this.refreshUI();
    }

    updateEntryOnServer(entry) {
        this.makeRequest('PUT', `https://fake.server/api/Info-Servers/records/${entry.id}`, entry, this.handleUpdateResponse.bind(this));
    }

    handleUpdateResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            const response = JSON.parse(fxhr.responseText);
            console.log("Update response:", response);
            if (response && response.success) {
                // עדכון מקומי של הרשומה
                this.updateEntryLocally(response.data || entry);
                this.handleUpdateSuccess();
            } else {
                console.error("Update failed:", response);
                this.handleUpdateError(response);
            }
        }
    }

    updateEntryLocally(updatedEntry) {
        const index = this.entries.findIndex(e => parseInt(e.id) === parseInt(updatedEntry.id));
        if (index !== -1) {
            this.entries[index] = updatedEntry;
            sessionStorage.setItem("userEntries", JSON.stringify(this.entries));
            this.refreshUI();
        }
    }

    performDelete(entryId) {
        const numericId = parseInt(entryId);
        this.makeRequest('DELETE', `https://fake.server/api/Info-Servers/records/${numericId}`, 
            { id: numericId, userId: this.userId }, this.handleDeleteResponse.bind(this));
    }

    handleDeleteResponse(e) {
        const fxhr = e.target;
        if (fxhr.state === 4) {
            const response = JSON.parse(fxhr.responseText);
            console.log("Delete response:", response);
            if (response && response.success) {
                // מחיקה מקומית
                this.deleteEntryLocally(response.deletedId || this.lastDeletedId);
                this.handleDeleteSuccess();
            } else {
                console.error("Delete failed:", response);
                this.handleDeleteError(response);
            }
        }
    }

    deleteEntryLocally(entryId) {
        const numericId = parseInt(entryId);
        this.entries = this.entries.filter(e => parseInt(e.id) !== numericId);
        sessionStorage.setItem("userEntries", JSON.stringify(this.entries));
        this.refreshUI();
    }

    // Helper method to reduce code duplication
    makeRequest(method, url, data, callback) {
        const fxhr = new FXMLHttpRequest();
        fxhr.addEventListener('onReadyStateChange', callback);
        fxhr.open(method, url);
        fxhr.send(data);
    }

    // These methods will be overridden in DietCore
    updateEntriesFromResponse(response) {
        this.entries = response.data || [];
        sessionStorage.setItem('userEntries', JSON.stringify(this.entries));
    }

    handleAddSuccess(response) {
        // יטופל במחלקה שיורשת
    }

    handleAddError(response) {
        // יטופל במחלקה שיורשת
    }

    handleUpdateSuccess() {
        // יטופל במחלקה שיורשת
    }

    handleUpdateError(response) {
        // יטופל במחלקה שיורשת
    }

    handleDeleteSuccess() {
        // יטופל במחלקה שיורשת
    }

    handleDeleteError(response) {
        // יטופל במחלקה שיורשת
    }

    refreshUI() {
        // יטופל במחלקה שיורשת
    }
}

export default DietAPI;