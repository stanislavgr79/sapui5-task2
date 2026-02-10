sap.ui.define([
	"./BaseController",
	"sap/ui/core/routing/History"
], function (BaseController, History) {
	"use strict";

	return BaseController.extend("project1.controller.Product", {
		onInit: function () {
			const oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("RouteProduct").attachPatternMatched(this._onProductRouteMatched, this);
		},

        //Step 32: Routing Back and History
		onNavBack: function () {
			const sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.back();
			} else {
				this.getOwnerComponent().getRouter().navTo("RouteMain", {}, true);
			}
		},

		_onProductRouteMatched: function (oEvent) {
			const sProductId = oEvent.getParameter("arguments")?.productId;
            // this.getView().bindElement("/Products(" + sProductId + ")", "v2"); или
            
            const oModel = this.getModel("v2");
			const sPath = oModel.createKey("/Products", { ID: sProductId });
			this.getView().bindElement({
				path: sPath,
				model: "v2"
			});
		}
	});
});
