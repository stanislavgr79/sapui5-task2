sap.ui.define([
    "./BaseController",
    "sap/m/Dialog",
	"sap/m/Button",
    "sap/m/Text",
    "sap/m/library"
], (BaseController, Dialog, Button, Text, mobileLibrary) => {
    "use strict";

    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

 return BaseController.extend("project1.controller.Main", {
        onInit() {
            this._ensureLostEditFocusHandler();
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

        addRecord: function() {
            const model = this.getModel("books");
            const books = model.getProperty("/books");
            
            const oNewBook = this._getNewEmptyBook();
            books.push(oNewBook);
            
            model.setProperty("/books", books);
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
            model.setProperty("/selectedItems", 0);
            this.byId("booksTable").removeSelections();
        },

        onDeleteDialogPress: function () {
			if (!this.oDeleteDialog) {
				this.oDeleteDialog = new Dialog({
					type: DialogType.Message,
					title: "Confirm",
					content: new Text({ text: "Are you sure you want to delete selected records?" }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Yes",
						press: function () {
							this.deleteRecords();
							this.oDeleteDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "No",
						press: function () {
							this.oDeleteDialog.close();
						}.bind(this)
					})
				});
			}

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

        _getNewEmptyBook: function() {
            return {
                Name: "",
                Author: "",
                Genre: "",
                ReleaseDate: null,
                AvailableQuantity: 0
            };
        }
    });
}); 
