sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    Filter,
    FilterOperator,
    MessageBox
  ) {
    "use strict";

    const EQ = sap.ui.model.FilterOperator.EQ;
    const FILTER = sap.ui.model.Filter;
    //Modelli
    const PAGINATOR_MODEL = "paginatorModel";
    const PARAMS_POS_MODEL = "paramsPosModel";
    const REIMPUTATIONS_MODEL = "reimputationsModel";
    //Path
    const PATH_ENTITY_PROVISION = "ProvisionSet";
    const PATH_ENTITY_POS = "ProvisionItemsSet";
    //Componenti View
    const REIMPUTATIONS_TABLE = "tblReimputations";

    var sGjahr;
    var sAgrName;
    var sFikrs;
    var sPrctr;

    return BaseController.extend(
      "funzionalitareimputazione.controller.ProvisionRegisterReimputation",
      {
        formatter: formatter,
        onInit: function () {
          this.getRouter()
            .getRoute("provisionRegisterReimputation")
            .attachPatternMatched(this._onObjectMatched, this);

          var oViewModelParamsPos = new JSONModel({
            belnr: null,
            blpos: null,
          });

          this.setModel(oViewModelParamsPos, PARAMS_POS_MODEL);
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

        onSave: function () {
          var self = this;
          var oDataModel = self.getModel();

          var oHeader = self.getView().byId("headerProvision");
          var oHeaderModel = oHeader.getModel("ProvisionHeader");
          var oHeaaderItem = oHeaderModel.getData();

          var oTable = self.getView().byId(REIMPUTATIONS_TABLE);
          var oTableModel = oTable.getModel("ReimputationsList");

          var sPathItem = oTable.getSelectedContextPaths()[0];
          var oItem = oTableModel.getObject(sPathItem);

          Object.assign(oItem, {
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
          });
          delete oItem.__metadata;
          delete oItem.Beschr;

          oDataModel.create("/" + PATH_ENTITY_PROVISION, oItem, {
            success: function () {
              MessageBox.success("Clausola reimputata correttamente", {
                actions: sap.m.MessageBox.Action.CLOSE,
                title: "Esito Operazione",
                onClose: function () {
                  self.onNavBack();
                  location.reload();
                },
              });
            },
            error: function (err) {},

            async: true, // execute async request to not stuck the main thread
          });
        },

        onSelectedItem: function () {
          var self = this;
          var oTable = self.getView().byId(REIMPUTATIONS_TABLE);
          var oTableModel = oTable.getModel("ReimputationsList");
          var sPathItem = oTable.getSelectedContextPaths()[0];
          var oItem = oTableModel.getObject(sPathItem);
          var bSave = self.getView().byId("footerBtnSave");

          if (oItem) {
            bSave.setEnabled(true);
          }
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
        _onObjectMatched: function (oEvent) {
          var self = this;
          var oDataModel = self.getModel();
          var oParams = oEvent.getParameter("arguments");
          var oParamsPosModel = self.getModel(PARAMS_POS_MODEL);
          sAgrName = oParams.AgrName;
          sFikrs = oParams.ConiFikrs;
          sPrctr = oParams.ConiPrctr;
          oParamsPosModel.setProperty("/belnr", oParams.Belnr);
          oParamsPosModel.setProperty("/blpos", oParams.Blpos);
          var oParamsHeader = oParams;
          delete oParamsHeader.Belnr;
          delete oParamsHeader.Blpos;
          delete oParamsHeader.AgrName;
          delete oParamsHeader.ConiFikrs;
          delete oParamsHeader.ConiPrctr;

          var sPath = oDataModel.createKey(
            PATH_ENTITY_PROVISION,
            oParamsHeader
          );

          //Recupero i dati della testata
          oDataModel.read("/" + sPath, {
            success: function (data) {
              sGjahr = data.Gjahr;
              var oModelJson = new sap.ui.model.json.JSONModel();
              oModelJson.setData(data);
              self.getView().setModel(oModelJson, "ProvisionHeader");
              //Recupero lista delle reimputazioni
              self._getReimputationsList(self, oDataModel);
            },
            error: function () {},
          });
        },

        _getReimputationsList: function (self, oDataModel) {
          var oReimputationsListFilters = this._getReimputationsListFilters();
          var oPanelTableReimputations = self
            .getView()
            .byId("pnlTableReimputations");

          oDataModel.read("/" + PATH_ENTITY_POS, {
            urlParameters: {
              Gjahr: sGjahr,
              AgrName: sAgrName,
              Fikrs: sFikrs,
              Prctr: sPrctr,
            },
            filters: oReimputationsListFilters,
            success: function (data) {
              var oModelJson = new sap.ui.model.json.JSONModel();
              oPanelTableReimputations.setVisible(true);
              oModelJson.setData(data.results);
              self.getView().setModel(oModelJson, "ReimputationsList");
            },
            error: function () {
              oPanelTableReimputations.setVisible(false);
            },
          });
        },

        _getReimputationsListFilters: function () {
          var self = this;
          var oParamsPosModel = self.getModel(PARAMS_POS_MODEL);
          var belnr = oParamsPosModel.getProperty("/belnr");
          var blpos = oParamsPosModel.getProperty("/blpos");

          var filters = [];
          if (belnr && blpos) {
            filters.push(new FILTER("Belnr", EQ, belnr));
            filters.push(new FILTER("Blpos", EQ, blpos));
          }
          return filters;
        },
      }
    );
  }
);
