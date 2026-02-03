sap.ui.define([
    "./BaseController",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/library",
    "../validate/validateBook",
    "../validate/validateProductV2",
    "sap/m/MessageBox",
	"sap/m/MessageToast"
], (BaseController, Dialog, Button, Text, mobileLibrary, validateBook, validateProductV2, MessageBox, MessageToast) => {
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
            const oModelV2 = this.getModel("modelV2");

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

            oModelV2.setProperty("/selectedItems", 0);
            this.byId("productsTableV2").removeSelections(); 
        },

        onSelectionChangeV2: function() {
            const selectedItemsV2 = this.byId("productsTableV2").getSelectedItems().length;
            this.getModel("modelV2").setProperty("/selectedItems", selectedItemsV2);
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

        addProductRecord: function() {
            // get the binding context of the new entity from the dialog form
            const oContext = this.oAddRecordProductDialogV2.getBindingContext("v2");
            // get the new product data from the binding context
            const oNewProduct = oContext.getObject();
            // validate the new product data
            if (!this._validateSubmitNewProduct(oNewProduct)) {
                return;
            }
            const oModel = this.getModel("v2");
            // submit the changes to the OData service
            oModel.submitChanges({
                success: function() {
                    const oBinding = this.byId("productsTableV2").getBinding("items");
                    // refresh the table binding to show the new product
                    oBinding.refresh(true);
                    MessageToast.show(this._oBundle.getText("addSuccessMessage"));
                }.bind(this),
                error: function() {
                    MessageBox.error(this._oBundle.getText("addErrorMessage"));
                }.bind(this)
            });

            if (this.oAddRecordProductDialogV2) {
                this.oAddRecordProductDialogV2.close();
            }
        },

        async onOpenAddRecordProductDialogV2() {
            if (!this.oAddRecordProductDialogV2) {
                const oAddRecordProductDialogV2 = await this.loadFragment({
                    name: "project1.view.pages.main.fragments.AddRecordsV2"
                });
                this.oAddRecordProductDialogV2 = oAddRecordProductDialogV2;

                this.getView().addDependent(this.oAddRecordProductDialogV2);
            }
            const modelV2 = this.getModel("v2");
            // create a new entry in the OData model
            let oContext = modelV2.createEntry("/Products", {
                // not to send a POST request yet
                inactive: true,
                // initial properties for the new entity
                properties: {
                    ID: null,
                    Name: "",
                    Description: "",
                    ReleaseDate: null,
                    Price: 0,
                    Rating: 0
                }
            });
            // set the binding context of the dialog to the new entry
            this.oAddRecordProductDialogV2.setBindingContext(oContext, "v2");
            this.oAddRecordProductDialogV2.open();
		},

        onCloseAddRecordProductDialogV2: function() {
            // reset validation state in the model JSON modelV2
            this._resetValidateProductState();
            // get the binding context of the created entity to be deleted
            const oContext = this.oAddRecordProductDialogV2?.getBindingContext("v2");
            // delete the created entity
            oContext.delete();
            if (this.oAddRecordProductDialogV2) {
                this.oAddRecordProductDialogV2.close();
            }
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
            validateBook.callValidateName.call(this, oNewBook.Name);
            validateBook.callValidateAuthor.call(this, oNewBook.Author);
            validateBook.callValidateGenre.call(this, oNewBook.Genre);
            validateBook.callValidateReleaseDate.call(this, oNewBook.ReleaseDate);
            return validateBook.validateForm.call(this);
        },

        //v2
        _resetValidateProductState: function () {
            const model = this.getModel("modelV2");
            model.setProperty("/validate", {
                isValidId: true,
                isValidName: true,
                isValidDescription: true,
                isValidReleaseDate: true,
                isValidPrice: true,
                isValidRating: true,
                isFormValid: true
            });
        },

        _validateSubmitNewProduct: function (oNewProduct) {
            validateProductV2.callValidateId.call(this, oNewProduct.ID);
            validateProductV2.callValidateName.call(this, oNewProduct.Name);
            validateProductV2.callValidateDescription.call(this, oNewProduct.Description);
            validateProductV2.callValidateReleaseDate.call(this, oNewProduct.ReleaseDate);
            validateProductV2.callValidatePrice.call(this, oNewProduct.Price);
            validateProductV2.callValidateRating.call(this, oNewProduct.Rating);
            return validateProductV2.validateForm.call(this);
        }
    });
});
