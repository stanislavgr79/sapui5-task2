sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime information for the device the UI5 app is running on as a JSONModel.
         * @returns {sap.ui.model.json.JSONModel} The device model.
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        /**
         * Creates and returns a JSON model with book data
         * @returns {sap.ui.model.json.JSONModel} The books model with dummy data
         */
        createBooksModel: function () {
            var oModel = new JSONModel({
                books: [
                    {
                        ID: "1",
                        Name: "1984",
                        Author: "George Orwell",
                        Genre: "Dystopian",
                        ReleaseDate: new Date(1949, 5, 8),
                        AvailableQuantity: 5
                    },
                    {
                        ID: "2",
                        Name: "To Kill a Mockingbird",
                        Author: "Harper Lee",
                        Genre: "Fiction",
                        ReleaseDate: new Date(1960, 6, 11),
                        AvailableQuantity: 3
                    },
                    {
                        ID: "3",
                        Name: "The Great Gatsby",
                        Author: "F. Scott Fitzgerald",
                        Genre: "Classic",
                        ReleaseDate: new Date(1925, 3, 10),
                        AvailableQuantity: 7
                    },
                    {
                        ID: "4",
                        Name: "Pride and Prejudice",
                        Author: "Jane Austen",
                        Genre: "Romance",
                        ReleaseDate: new Date(1813, 0, 28),
                        AvailableQuantity: 4
                    },
                    {
                        ID: "5",
                        Name: "The Catcher in the Rye",
                        Author: "J.D. Salinger",
                        Genre: "Fiction",
                        ReleaseDate: new Date(1951, 6, 16),
                        AvailableQuantity: 6
                    },
                    {
                        ID: "6",
                        Name: "Harry Potter and the Philosopher's Stone",
                        Author: "J.K. Rowling",
                        Genre: "Fantasy",
                        ReleaseDate: new Date(1997, 5, 26),
                        AvailableQuantity: 10
                    }
                ]
            });
            return oModel;
        }
    };

});