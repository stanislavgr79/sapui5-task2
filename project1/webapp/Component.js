sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "project1/model/models"
], (UIComponent, JSONModel, models) => {
    "use strict";

    return UIComponent.extend("project1.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // initialize books model using lifecycle event
            this.setModel(models.createBooksModel(), "books");

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            this.setModel(new JSONModel({ selectedItems: 0 }), "v2view");

            // enable routing
            this.getRouter().initialize();
        }
    });
});