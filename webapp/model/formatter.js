sap.ui.define([], function () {
  "use strict";

  return {
    /**
     * Rounds the number unit value to 2 digits
     * @public
     * @param {string} sValue the number string to be rounded
     * @returns {string} sValue with 2 digits rounded
     */
    numberUnit: function (sValue) {
      if (!sValue) {
        return "";
      }
      return parseFloat(sValue).toFixed(2);
    },

    /**
     * Recupera la descrizione dello stato
     *
     * @param {string} sValue
     * @returns {string}
     */
    formatStateCla: function (sValue) {
      var sDesc = "";
      if (sValue) {
        switch (sValue) {
          case "00":
            sDesc = "Attiva";
            break;
          case "01":
            sDesc = "Non Attiva";
            break;
          case "02":
            sDesc = "Non Imputata";
            break;
          case "03":
            sDesc = "Reimputata";
            break;
          case "04":
            sDesc = "Non Reimputata";
            break;
          default:
            sDesc = "defautl";
        }
      }

      return sDesc;
    },

    /**
     * Prendo l'anno da una data passata come stringa
     *
     * @param {string} sDate
     * @returns
     */
    getYear: function (sDate) {
      var year = "";
      if (sDate) {
        year = new Date(sDate).getFullYear();
      }
      return year;
    },
  };
});
