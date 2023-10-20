sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, UIComponent, mobileLibrary, Filter, FilterOperator) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend(
      "funzionalitareimputazione.controller.BaseController",
      {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
          return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
          return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        isUserEnabled: function (array, param, value) {
          return array.filter((x) => x[param] === value).length > 0;
        },

        setFilterEQ: function (aFilters, sPropertyModel, sValue) {
          if (sValue) {
            aFilters.push(
              new Filter(sPropertyModel, FilterOperator.EQ, sValue)
            );
          }
        },

        setFilterBT: function (aFilters, sPropertyModel, sValueFrom, sValueTo) {
          if (sValueFrom && sValueTo) {
            aFilters.push(
              new Filter(
                sPropertyModel,
                FilterOperator.BT,
                sValueFrom,
                sValueTo
              )
            );
            return;
          }
          if (sValueFrom || sValueTo) {
            this.setFilterEQ(aFilters, sPropertyModel, sValueFrom);
            this.setFilterEQ(aFilters, sPropertyModel, sValueTo);
            return;
          }
        },

        acceptOnlyNumber: function (sId) {
          var oInput = this.getView().byId(sId);
          oInput.attachBrowserEvent("keypress", function (oEvent) {
            if (isNaN(oEvent.key)) {
              oEvent.preventDefault();
            }
          });
        },
      }
    );
  }
);
