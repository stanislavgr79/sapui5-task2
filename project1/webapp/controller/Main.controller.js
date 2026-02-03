sap.ui.define([
    "./BaseController",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/library",
    "../validate/validate",
    "sap/m/MessageBox",
	"sap/m/MessageToast"
], (BaseController, Dialog, Button, Text, mobileLibrary, validate, MessageBox, MessageToast) => {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.DialogType
    var DialogType = mobileLibrary.DialogType;

 return BaseController.extend("project1.controller.Main", {
        onInit() {
            this._ensureLostEditFocusHandler();
            this._oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            //Main.controller.js:23 v2 model batch usage: true
            console.log("v2 model batch usage: " + this.getModel("v2").bUseBatch);
        },

        onBeforeRendering() {
            const genres = this._getUniqueGenres();
            this.getModel("books").setProperty("/booksGenre", genres);
        },

        onAfterRendering: function() {
        },

        onExit: function() {
            if (this._onLostEditFocus) {
                document.removeEventListener("click", this._onLostEditFocus, true);
            }
        },

        onSelectionChange: function() {
            const selectedItems = this.byId("booksTable").getSelectedItems().length;
            this.getModel("books").setProperty("/selectedItems", selectedItems);
        },

        //v2 OData Table
        // oModel.remove("/Products(999)", {success: mySuccessHandler, error: myErrorHandler});
        onDeleteV2Press: function () {
            const selected = this.byId("productsTableV2").getSelectedItems();
            const oBundle = this._oBundle;  
            const oModel = this.getModel("v2");
            const aDeferred = oModel.getDeferredGroups() || [];
            if (!aDeferred.includes("deleteGroup")) {
                oModel.setDeferredGroups(aDeferred.concat(["deleteGroup"]));
            }
            const oModelV2View = this.getModel("v2view");

            selected.forEach(item => {
                var oProduct = item.getBindingContext("v2").getObject();
                oModel.remove("/Products(" + oProduct.ID + ")", {
                    groupId: "deleteGroup",
                    success: function() {
                        MessageToast.show(oBundle.getText("deleteSuccessMessage")); 
                    },
                    error: function() {
                        MessageBox.error(oBundle.getText("deleteErrorMessage")); 
                    }
                });
            });
            oModel.submitChanges({
                groupId: "deleteGroup"
            });

            oModelV2View.setProperty("/selectedItems", 0);
            this.byId("productsTableV2").removeSelections(); 
        },

        onSelectionChangeV2: function() {
            const selectedItemsV2 = this.byId("productsTableV2").getSelectedItems().length;
            this.getModel("v2view").setProperty("/selectedItems", selectedItemsV2);
        },

        addRecord: function() {
            const model = this.getModel("books");
            const oNewBook = model.getProperty("/newBooks");
            if(!this._validateSubmitNewBook(oNewBook)) {
                return;
            }
            const books = model.getProperty("/books");
            books.push(oNewBook);            
            model.setProperty("/books", books);
            //update genres
            const genres = this._getUniqueGenres();
            model.setProperty("/booksGenre", genres);

            if (this.oAddRecordDialog) {
                this.oAddRecordDialog.close();
            }
            this._resetNewBookForm();
        },

        async onOpenAddRecordDialog() {
            if (!this.oAddRecordDialog) {
                const oAddRecordDialog = await this.loadFragment({
                    name: "project1.view.pages.main.fragments.AddRecords"
                });
                this.oAddRecordDialog = oAddRecordDialog;

                this.getView().addDependent(this.oAddRecordDialog);
            }
            this.oAddRecordDialog.open();
		},

        onCloseAddRecordDialog: function() {
            this._resetNewBookForm();
            this._resetValidateState();
            if (this.oAddRecordDialog) {
                this.oAddRecordDialog.close();
            }
        },

        deleteRecords: function() {
            const selected = this.byId("booksTable").getSelectedItems();
            const model = this.getModel("books");
            const books = model.getProperty("/books");
            
            selected.forEach(item => {
                var oBook = item.getBindingContext("books").getObject();
                books.splice(books.indexOf(oBook), 1);
            });
            
            model.setProperty("/books", books);
            //update genres
            const genres = this._getUniqueGenres();
            model.setProperty("/booksGenre", genres);

            model.setProperty("/selectedItems", 0);
            this.byId("booksTable").removeSelections();
        },

        onDeleteDialogPress: function () {
            const oBundle = this._oBundle;
            const oDeleteDialog = new Dialog({
                type: DialogType.Message,
                title: oBundle.getText("confirmTitle"),
                content: new Text({ text: oBundle.getText("confirmDeleteMessage") }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: oBundle.getText("yesButton"),
                    press: function () {
                        this.deleteRecords();
                        this.oDeleteDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: oBundle.getText("noButton"),
                    press: function () {
                        this.oDeleteDialog.close();
                    }.bind(this)
                })
            });
            this.oDeleteDialog = oDeleteDialog;

            this.oDeleteDialog.open();
        },

        onFilter: function() {
            const input = this.byId("bookTitleInput").getValue().trim();
            const genre = this.byId("genreSelect").getSelectedKey();
            
            const table = this.byId("booksTable");
            const items = table.getBinding("items");
            const filters = [];

            if (input) {
                filters.push(new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, input));
            }

            if (genre && genre !== "All") {
                filters.push(new sap.ui.model.Filter("Genre", sap.ui.model.FilterOperator.EQ, genre));
            }

            items.filter(filters);
        },

        onEdit: function (oEvent) {
            const oEditButton = oEvent.getSource();
            const oHBox = oEditButton.getParent();
            const oListItem = oHBox.getParent();

            const oContext = oListItem.getBindingContext("books");
            const oBooksModel = this.getModel("books");
            const sPath = oContext.getPath();
            oBooksModel.setProperty(sPath + "/isEditMode", true);
        },

        onSave: function (oEvent) {
            let oListItem = oEvent.getSource();
            const oContext = oListItem.getBindingContext("books");
            const oObject = oContext.getObject();
            if (Object.prototype.hasOwnProperty.call(oObject, "isEditMode")) {
                delete oObject.isEditMode;
            }
            this.getModel("books").refresh(true);
        },

        _ensureLostEditFocusHandler: function() {
            if (!this._onLostEditFocus) {
                this._onLostEditFocus = this._handleLostEditFocus.bind(this);
            }

            document.addEventListener("click", this._onLostEditFocus, true);
        },

        _handleLostEditFocus: function(oEvent) {
            const oTarget = oEvent && oEvent.target;
            const oGenreSelect = this.byId("genreSelect");
            const oSelectPicker = oGenreSelect?.getPicker ? oGenreSelect.getPicker() : null;
            const oPickerDom = oSelectPicker?.getDomRef ? oSelectPicker.getDomRef() : null;

            if (oTarget && (oTarget.closest(".rowEditInput") || oTarget.closest(".actionButtons"))) {
                return;
            }

            if (oTarget && oPickerDom?.contains(oTarget)) {
                return;
            }

            this._cancelActiveEdit();
        },

        _cancelActiveEdit: function () {
            const oBooksModel = this.getModel("books");
            const aBooks = oBooksModel.getProperty("/books") || [];
            aBooks.forEach(book => {
                if (Object.prototype.hasOwnProperty.call(book, "isEditMode")) {
                    delete book.isEditMode;
                }
            });
            oBooksModel.refresh(true);
        },

        _getUniqueGenres: function() {
            const books = this.getModel("books").getProperty("/books");
            const genres = [...new Set(books.map(book => book.Genre))];
            genres.sort();
            
            const aGenreObjects = [{ key: "All", text: "" }];
            genres.forEach(genre => {
                aGenreObjects.push({ key: genre, text: genre });
            });
            
            return aGenreObjects;
        },

        _resetNewBookForm: function () {
            const model = this.getModel("books");
            model.setProperty("/newBooks", {
                ID: "",
                Name: "",
                Author: "",
                Genre: "",
                ReleaseDate: null,
                AvailableQuantity: 0
            });
        },

        _resetValidateState: function () {
            const model = this.getModel("books");
            model.setProperty("/validate", {
                isValidName: true,
                isValidAuthor: true,
                isValidGenre: true,
                isValidReleaseDate: true,
                isFormValid: true
            });
        },

        _validateSubmitNewBook: function (oNewBook) {
            validate.callValidateName.call(this, oNewBook.Name);
            validate.callValidateAuthor.call(this, oNewBook.Author);
            validate.callValidateGenre.call(this, oNewBook.Genre);
            validate.callValidateReleaseDate.call(this, oNewBook.ReleaseDate);
            return validate.validateForm.call(this);
        }
    });
});
