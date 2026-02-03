sap.ui.define([
    "./validate"
], function (validate) {
    "use strict";

    const _updateFormState = function (oView) {
        oView.getModel("books").setProperty(
            "/validate/isFormValid",
            validate.validateForm(oView, "books")
        );
    };

    const ValidateBook = {
        onValidateName: function (oEvent) {
            const sValue = oEvent.getSource().getValue();
            ValidateBook.callValidateName.call(this, sValue);
        },

        onValidateAuthor: function (oEvent) {
            const sValue = oEvent.getSource().getValue();
            ValidateBook.callValidateAuthor.call(this, sValue);
        },

        onValidateGenre: function (oEvent) {
            const sValue = oEvent.getSource().getValue();
            ValidateBook.callValidateGenre.call(this, sValue);
        },

        onValidateReleaseDate: function (oEvent) {
            const oValue = oEvent.getSource().getValue();
            ValidateBook.callValidateReleaseDate.call(this, oValue);
        },

        callValidateName: function (sValue) {
            const bValid = validate.validateStringState(sValue);
            const oView = this.getView();
            oView.getModel("books").setProperty("/validate/isValidName", bValid);
            _updateFormState(oView);
        },

        callValidateAuthor: function (sValue) {
            const bValid = validate.validateStringState(sValue);
            const oView = this.getView();
            oView.getModel("books").setProperty("/validate/isValidAuthor", bValid);
            _updateFormState(oView);
        },

        callValidateGenre: function (sValue) {
            const bValid = validate.validateStringState(sValue);
            const oView = this.getView();
            oView.getModel("books").setProperty("/validate/isValidGenre", bValid);
            _updateFormState(oView);
        },

        callValidateReleaseDate: function (oValue) {
            const bValid = validate.validateDateState(oValue);
            const oView = this.getView();
            oView.getModel("books").setProperty("/validate/isValidReleaseDate", bValid);
            _updateFormState(oView);
        },

        validateForm: function () {
            return validate.validateForm(this.getView(), "books");
        }
    };

    return ValidateBook;
});
