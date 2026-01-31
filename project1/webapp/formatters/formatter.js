sap.ui.define([], () => {
    "use strict";

    return {
        releaseDateYear(sValue) {
            const year = new Date(sValue).getFullYear();
            const oBundle = this?.getModel?.("i18n")?.getResourceBundle?.();

            if (oBundle) {
                return oBundle.getText("publishedYear", [year]);
            }

            return `Published: ${year}`;
        }
    };
});