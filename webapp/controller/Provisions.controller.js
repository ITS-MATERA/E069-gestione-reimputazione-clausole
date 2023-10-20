sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    Filter,
    FilterOperator,
    exportLibrary,
    Spreadsheet
  ) {
    "use strict";

    const EQ = sap.ui.model.FilterOperator.EQ;
    const BT = sap.ui.model.FilterOperator.BT;
    const FILTER = sap.ui.model.Filter;
    const PATH_ENTITY_PROVISION = "ProvisionSet";
    //Models
    const PAGINATOR_MODEL = "paginatorModel";
    const PROVISIONS_MODEL = "provisionsModel";
    const ACTIVITY_CHECK_MODEL = "activityCheckModel";

    const PROVISIONS_TABLE = "tblProvisions";
    const PROVISIONS_LIST = "ProvisionsList";
    const PROVISIONS_EXPORT_LIST = "ProvisionsExportList";

    const EDM_TYPE = exportLibrary.EdmType;

    var sAgrName;
    var sFikrs;
    var sPrctr;

    return BaseController.extend(
      "funzionalitareimputazione.controller.Provisions",
      {
        formatter: formatter,

        onInit: function () {
          var self = this;
          var oViewModel;

          var oModelAuth = new JSONModel({
            enabledStart: false,
          });
          this.setModel(oModelAuth, "Auth");

          this.setModel(oViewModel, PROVISIONS_MODEL);

          self.acceptOnlyNumber("fZcoddecrFrom");
          self.acceptOnlyNumber("fZcoddecrTo");
          self.acceptOnlyNumber("fZCodIpeFrom");
          self.acceptOnlyNumber("fZCodIpeTo");
          self.acceptOnlyNumber("fZNumClaFrom");
          self.acceptOnlyNumber("fZNumClaFrom");
        },

        onBeforeRendering: async function () {
          var self = this;
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
                  var oModelAuth = self.getModel("Auth");
                  sAgrName = oRecord.AGR_NAME;
                  sFikrs = oRecord.FIKRS;
                  sPrctr = oRecord.PRCTR;

                  var oData = {
                    AgrName: sAgrName,
                    RegisterEnable: false,
                  };

                  var aResults = data.results;
                  var bRegisterEnable = self.isUserEnabled(
                    aResults,
                    "ACTV_1",
                    "Z01"
                  );
                  var bStartEnable = self.isUserEnabled(
                    aResults,
                    "ACTV_3",
                    "Z03"
                  );

                  oData.RegisterEnable = bRegisterEnable;
                  oModelAuth.setProperty("/enabledStart", bStartEnable);

                  var oModel = new sap.ui.model.json.JSONModel();
                  oModel.setData(oData);
                  self.setModel(oModel, ACTIVITY_CHECK_MODEL);
                },
                error: function (error) {},
              });
            });
        },

        onStart: function () {
          this._getProvisionsList();
        },

        onShowDetail: function () {
          var self = this;
          var oTable = self.getView().byId(PROVISIONS_TABLE);
          var oTableModel = oTable.getModel(PROVISIONS_LIST);
          var sPathItem = oTable.getSelectedContextPaths()[0];
          var oItem = oTableModel.getObject(sPathItem);
          var oParameters = {
            Bukrs: oItem.Bukrs,
            Gjahr: oItem.Gjahr,
            Fikrs: oItem.Fikrs,
            Zammin: oItem.Zammin,
            Zregistrato: oItem.Zregistrato,
            Zufficioliv1: oItem.Zufficioliv1,
            ZCodGius: oItem.ZCodGius,
            Zufficioliv2: oItem.Zufficioliv2,
            Zcoddecr: oItem.Zcoddecr,
            ZidIpe: oItem.ZidIpe,
            ZCodCla: oItem.ZCodCla,
            ZCodIpe: oItem.ZCodIpe,
            ZNumCla: oItem.ZNumCla,
          };

          self.getRouter().navTo("provisionDetail", oParameters);
        },

        onRegisterReimputation: function () {
          var self = this;
          var oTable = self.getView().byId(PROVISIONS_TABLE);
          var oTableModel = oTable.getModel(PROVISIONS_LIST);
          var sPathItem = oTable.getSelectedContextPaths()[0];
          var oItem = oTableModel.getObject(sPathItem);

          var oParameters = {
            Blpos: oItem.Blpos,
            Belnr: oItem.Belnr,
            Bukrs: oItem.Bukrs,
            Gjahr: oItem.Gjahr,
            Fikrs: oItem.Fikrs,
            Zammin: oItem.Zammin,
            Zregistrato: oItem.Zregistrato,
            Zufficioliv1: oItem.Zufficioliv1,
            ZCodGius: oItem.ZCodGius,
            Zufficioliv2: oItem.Zufficioliv2,
            Zcoddecr: oItem.Zcoddecr,
            ZidIpe: oItem.ZidIpe,
            ZCodCla: oItem.ZCodCla,
            ZCodIpe: oItem.ZCodIpe,
            ZNumCla: oItem.ZNumCla,
            AgrName: sAgrName,
            ConiFikrs: sFikrs,
            ConiPrctr: sPrctr,
          };

          self.getRouter().navTo("provisionRegisterReimputation", oParameters);
        },

        onSelectedItem: function () {
          var self = this;
          var oTable = self.getView().byId(PROVISIONS_TABLE);
          var oTableModel = oTable.getModel(PROVISIONS_LIST);
          var sPathItem = oTable.getSelectedContextPaths()[0];
          var oItem = oTableModel.getObject(sPathItem);
          var bRegisterReimputation = self
            .getView()
            .byId("btnRegisterReimputation");
          var oActCheckModel = self.getModel(ACTIVITY_CHECK_MODEL);
          var oActCheckData = oActCheckModel.getData();
          bRegisterReimputation.setEnabled(
            oItem.ZStatoCla === "04" && oActCheckData.RegisterEnable
          );
        },

        onExport: function () {
          var oSheet;
          var self = this;

          var oTable = self.getView().byId(PROVISIONS_TABLE);
          var oTableModel = oTable.getModel(PROVISIONS_LIST);

          var aCols = this._createColumnConfig();
          var oSettings = {
            workbook: {
              columns: aCols,
            },
            dataSource: oTableModel.getData(),
            fileName: "Lista clausole.xlsx",
          };

          oSheet = new Spreadsheet(oSettings);
          oSheet.build().finally(function () {
            oSheet.destroy();
          });
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        _getHeaderFilters: function () {
          var self = this;
          var aFilters = [];
          var fGjahr = self.getView().byId("fGjahr");
          var fZammin = self.getView().byId("fZammin");
          var fZufficioliv1 = self.getView().byId("fZufficioliv1");
          var fZufficioliv2 = self.getView().byId("fZufficioliv2");
          var fZcoddecrFrom = self.getView().byId("fZcoddecrFrom");
          var fZcoddecrTo = self.getView().byId("fZcoddecrTo");
          var fZCodIpeFrom = self.getView().byId("fZCodIpeFrom");
          var fZCodIpeTo = self.getView().byId("fZCodIpeTo");
          var fFdatkFrom = self.getView().byId("fFdatkFrom");
          var fFdatkTo = self.getView().byId("fFdatkTo");
          var fZNumClaFrom = self.getView().byId("fZNumClaFrom");
          var fZNumClaTo = self.getView().byId("fZNumClaTo");
          var fZStatoCla = self.getView().byId("fZStatoCla");

          this._setFilterEQValue(aFilters, fGjahr);
          this._setFilterEQValue(aFilters, fZammin);
          this._setFilterEQValue(aFilters, fZufficioliv1);
          this._setFilterEQValue(aFilters, fZufficioliv2);
          this._setFilterEQKey(aFilters, fZStatoCla);

          self.setFilterBT(
            aFilters,
            "Zcoddecr",
            fZcoddecrFrom.getValue(),
            fZcoddecrTo.getValue()
          );
          self.setFilterBT(
            aFilters,
            "ZCodIpe",
            fZCodIpeFrom.getValue(),
            fZCodIpeTo.getValue()
          );
          self.setFilterBT(
            aFilters,
            "Fdatk",
            fFdatkFrom.getValue(),
            fFdatkTo.getValue()
          );
          self.setFilterBT(
            aFilters,
            "ZNumCla",
            fZNumClaFrom.getValue(),
            fZNumClaTo.getValue()
          );

          return aFilters;
        },

        _getProvisionsList: function () {
          var self = this;
          var oDataModel = self.getModel();
          var oView = self.getView();
          var aFilters = this._getHeaderFilters();
          var oPanelTableProvisions = self.getView().byId("pnlTableProvisions");
          var bRegisterReimputation = self
            .getView()
            .byId("btnRegisterReimputation");

          oView.setBusy(true);

          oDataModel.read("/" + PATH_ENTITY_PROVISION, {
            urlParameters: {
              AgrName: sAgrName,
              Fikrs: sFikrs,
              Prctr: sPrctr,
            },
            filters: aFilters,
            success: function (data) {
              oPanelTableProvisions.setVisible(true);
              bRegisterReimputation.setVisible(true);
              var oModelJson = new sap.ui.model.json.JSONModel();
              oModelJson.setData(data.results);
              oView.setModel(oModelJson, PROVISIONS_LIST);
              oView.setBusy(false);
            },
            error: function () {
              oPanelTableProvisions.setVisible(false);
              oView.setBusy(false);
            },
          });
        },

        _setFilterEQValue: function (filters, input) {
          if (input?.getValue()) {
            filters.push(
              new FILTER(
                input.data("searchPropertyModel"),
                EQ,
                input.getValue()
              )
            );
          }
        },

        _setFilterEQKey: function (filters, input) {
          if (input?.getSelectedKey()) {
            filters.push(
              new FILTER(
                input.data("searchPropertyModel"),
                EQ,
                input.getSelectedKey()
              )
            );
          }
        },

        _createColumnConfig: function () {
          var self = this;
          var sColLabel = "tableNameColumn";
          var oBundle = self.getResourceBundle();
          var aCols = [
            {
              label: oBundle.getText(sColLabel + "Gjahr"),
              property: "Gjahr",
              type: EDM_TYPE.String,
            },
            {
              label: oBundle.getText(sColLabel + "Zammin"),
              property: "Zammin",
              type: EDM_TYPE.String,
            },
            {
              label: oBundle.getText(sColLabel + "Zufficioliv1"),
              property: "Zufficioliv1",
              type: EDM_TYPE.String,
            },
            {
              label: oBundle.getText(sColLabel + "Zufficioliv2"),
              property: "Zufficioliv2",
              type: EDM_TYPE.String,
            },
            {
              label: oBundle.getText(sColLabel + "Zcoddecr"),
              property: "Zcoddecr",
              type: EDM_TYPE.String,
            },
            {
              label: oBundle.getText(sColLabel + "ZCodIpe"),
              property: "ZCodIpe",
              type: EDM_TYPE.String,
            },
            {
              label: oBundle.getText(sColLabel + "Fdatk"),
              property: "Fdatk",
              type: EDM_TYPE.Date,
              format: "yyyy",
              textAlign: "left",
            },
            {
              label: oBundle.getText(sColLabel + "ZImpIpeCl"),
              property: "ZImpIpeCl",
              type: EDM_TYPE.Currency,
            },
            {
              label: oBundle.getText(sColLabel + "Ktext"),
              property: "ZoggSpesIm",
              type: EDM_TYPE.String,
            },
            {
              label: oBundle.getText(sColLabel + "ZStatoCla"),
              property: "ZStatoCla",
              type: EDM_TYPE.Enumeration,
              valueMap: {
                "00": "Attiva",
                "01": "Non Attiva",
                "02": "Non Imputata",
                "03": "Reimputata",
                "04": "Non Reimputata",
              },
            },
          ];

          return aCols;
        },
      }
    );
  }
);
