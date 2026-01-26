sap.ui.define([
    "./BaseController"
], (BaseController, models) => {
    "use strict";

 return BaseController.extend("project1.controller.Main", {
        onInit() {

        },

        onBeforeRendering() {
            var genres = this._getUniqueGenres();
            this.getModel("books").setProperty("/booksGenre", genres);
        },

        onSelectionChange: function() {
            var selectedItems = this.byId("booksTable").getSelectedItems().length;
            this.getModel("books").setProperty("/selectedItems", selectedItems);
        },

        deleteRecords: function() {
            var selected = this.byId("booksTable").getSelectedItems();
            var model = this.getModel("books");
            var books = model.getProperty("/books");
            
            selected.forEach(item => {
                var oBook = item.getBindingContext("books").getObject();
                books.splice(books.indexOf(oBook), 1);
            });
            
            model.setProperty("/books", books);
            model.setProperty("/selectedItems", 0);
            this.byId("booksTable").removeSelections();
        },

        addRecord: function() {
            var model = this.getModel("books");
            var books = model.getProperty("/books");
            
            books.push(
                this._getNewEmptyBook()
            );
            
            model.setProperty("/books", books);
        },

        _getUniqueGenres: function() {
            var books = this.getModel("books").getProperty("/books");
            var genres = [...new Set(books.map(book => book.Genre))];
            genres.sort();
            
            var aGenreObjects = [{ key: "All", text: "" }];
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
        },

        onFilter: function() {
            var input = this.byId("bookTitleInput").getValue().trim();
            var genre = this.byId("genreSelect").getSelectedKey();
            
            var table = this.byId("booksTable");
            var items = table.getBinding("items");
            var filters = [];

            if (input) {
                filters.push(new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, input));
            }

            if (genre && genre !== "All") {
                filters.push(new sap.ui.model.Filter("Genre", sap.ui.model.FilterOperator.EQ, genre));
            }

            items.filter(filters);
        }
    });
}); 