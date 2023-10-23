sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
  ],
  function (BaseController, JSONModel, formatter, History, MessageBox) {
    "use strict";

    const FILTER = sap.ui.model.Filter;
    const EQ = sap.ui.model.FilterOperator.EQ;

    return BaseController.extend(
      "funzionalitareimputazione.controller.ProvisionDetail",
      {
        formatter: formatter,
        onInit: function () {
          this.getRouter()
            .getRoute("provisionDetail")
            .attachPatternMatched(this._onObjectMatched, this);
        },

        /**
         *  EVENT HANDLERS
         * */

        /**
         * Event handler for navigating back.
         * Navigate back in the browser history
         * @public
         */
        onNavBack: function () {
          var self = this;
          self.getRouter().navTo("provisions");
        },

        onDelete: function () {
          var self = this;
          var oDataModel = this.getModel();
          var oHeader = self.getView().byId("headerProvision");
          var oHeaderModel = oHeader.getModel("ProvisionHeader");
          var oHeaaderItem = oHeaderModel.getData();
          var oItem = {
            Bukrs: oHeaaderItem.Bukrs,
            Gjahr: oHeaaderItem.Gjahr,
            Fikrs: oHeaaderItem.Fikrs,
            Zammin: oHeaaderItem.Zammin,
            Zregistrato: oHeaaderItem.Zregistrato,
            Zufficioliv1: oHeaaderItem.Zufficioliv1,
            Zufficioliv2: oHeaaderItem.Zufficioliv2,
            ZCodGius: oHeaaderItem.ZCodGius,
            Zcoddecr: oHeaaderItem.Zcoddecr,
            ZidIpe: oHeaaderItem.ZidIpe,
            ZCodCla: oHeaaderItem.ZCodCla,
            ZCodIpe: oHeaaderItem.ZCodIpe,
            ZNumCla: oHeaaderItem.ZNumCla,
          };
          var sPathItem = self.getModel().createKey("ProvisionSet", oItem);
          oDataModel.remove("/" + sPathItem, {
            method: "DELETE",
            success: function () {
              MessageBox.success(
                "Reimputazione clausola cancellata correttamente",
                {
                  actions: sap.m.MessageBox.Action.CLOSE,
                  title: "Esito Operazione",
                  onClose: function () {
                    self.onNavBack();
                    location.reload();
                  },
                }
              );
            },
            error: function () {},
          });
        },
        /**
         * INTERNAL METHODS
         * */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched: async function (oEvent) {
          var self = this;
          var oDataModel = self.getModel();
          var oParameters = oEvent.getParameter("arguments");
          var sPath = self.getModel().createKey("ProvisionSet", oParameters);
          var bDelete = self.getView().byId("btnDeleteReimputation");
          var oPanelTableProvisionDetail = self
            .getView()
            .byId("pnlTableProvisionDetail");

          self
            .getModel()
            .metadataLoaded()
            .then(function () {
              oDataModel.read("/" + sPath, {
                success: function (data) {
                  console.log(data);
                  oPanelTableProvisionDetail.setVisible(true);
                  if (data.ZStatoCla === "03") {
                    bDelete.setVisible(true);
                  } else {
                    bDelete.setVisible(false);
                  }
                  var oModelJson = new sap.ui.model.json.JSONModel();
                  oModelJson.setData(data);
                  self.getView().setModel(oModelJson, "ProvisionHeader");
                  self.getView().setModel(oModelJson, "ProvisionDetail");
                },
                error: function () {
                  oPanelTableProvisionDetail.setVisible(false);
                },
              });
            });

          var oAuthModel = self.getModel("ZSS4_CA_CONI_VISIBILITA_SRV");
          var filters = [];

          filters.push(new FILTER("SEM_OBJ", EQ, "ZS4_FUNZ_REIMP_CLA_SRV"));
          filters.push(new FILTER("AUTH_OBJ", EQ, "Z_GEST_REI"));

          self
            .getModel("ZSS4_CA_CONI_VISIBILITA_SRV")
            .metadataLoaded()
            .then(function () {
              oAuthModel.read("/ZES_CONIAUTH_SET", {
                filters: filters,
                success: function (data) {
                  var oRecord = data.results[0];

                  var oData = {
                    AgrName: oRecord.AGR_NAME,
                  };

                  var aResults = data.results;
                  var bDeleteVisible = self.isUserEnabled(
                    aResults,
                    "ACTV_4",
                    "Z04"
                  );

                  bDelete.setVisible(bDeleteVisible);

                  var oModel = new sap.ui.model.json.JSONModel();
                  oModel.setData(oData);
                  self.setModel(oModel, "activityCheckModel");
                },
                error: function (error) {},
              });
            });
        },
      }
    );
  }
);
