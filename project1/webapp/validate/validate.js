sap.ui.define([], function () {
    "use strict";

    const _validateStringState = function (sValue) {
        return sValue.trim().length > 0 ? true : false;
    };

    const _validateDateState = function (sValue) {
        if (typeof sValue !== "string") {
            return false;
        }
        if (sValue.trim() === "") {
            return false;
        }
        const oDate = new Date(sValue);
        return !isNaN(oDate.getTime());
    };

    const _validateForm = function () {
        const oValidate = this.getView().getModel("books").getProperty("/validate");
        return Object.entries(oValidate)
            .filter(([key]) => key !== "isFormValid")
            .every(([, value]) => value === true);
    };

    const Validate = {

        onValidateName: function (oEvent) {
            const sValue = oEvent.getSource().getValue();
            Validate.callValidateName.call(this, sValue);
        },

        onValidateAuthor: function (oEvent) {
            const sValue = oEvent.getSource().getValue();
            Validate.callValidateAuthor.call(this, sValue);
        },

        onValidateGenre: function (oEvent) {
            const sValue = oEvent.getSource().getValue();
            Validate.callValidateGenre.call(this, sValue);
        },

        onValidateReleaseDate: function (oEvent) {
            const oValue = oEvent.getSource().getValue();
            Validate.callValidateReleaseDate.call(this, oValue);
        },

        callValidateName: function (sValue) {
            const bValid = _validateStringState(sValue);
            this.getView().getModel("books").setProperty("/validate/isValidName", bValid);
            this.getView().getModel("books").setProperty("/validate/isFormValid", _validateForm.call(this));
        },

        callValidateAuthor: function (sValue) {
            const bValid = _validateStringState(sValue);
            this.getView().getModel("books").setProperty("/validate/isValidAuthor", bValid);
            this.getView().getModel("books").setProperty("/validate/isFormValid", _validateForm.call(this));
        },

        callValidateGenre: function (sValue) {
            const bValid = _validateStringState(sValue);
            this.getView().getModel("books").setProperty("/validate/isValidGenre", bValid);
            this.getView().getModel("books").setProperty("/validate/isFormValid", _validateForm.call(this));
        },

        callValidateReleaseDate: function (oValue) {
            const bValid = _validateDateState(oValue);
            this.getView().getModel("books").setProperty("/validate/isValidReleaseDate", bValid);
            this.getView().getModel("books").setProperty("/validate/isFormValid", _validateForm.call(this));
        },

        validateForm: function () {
            return _validateForm.call(this);
        }
    };

    return Validate;
});