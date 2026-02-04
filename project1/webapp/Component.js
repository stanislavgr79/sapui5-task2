sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "project1/model/models"
], (UIComponent, JSONModel, BindingMode, models) => {
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

            this.setModel(models.productModelV2(), "modelV2");

            const oV2Model = this.getModel("v2");
            oV2Model.setDefaultBindingMode(BindingMode.TwoWay);


            // enable routing
            this.getRouter().initialize();
        }
    });
});