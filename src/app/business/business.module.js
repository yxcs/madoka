/* global jQuery */
/* global angular */
/* global _ */
/* global moment */

; (function () {
  'use strict'

  angular.module('koala.business', ['bootstrapLightbox'])

  angular
    .module('koala.business')
    .config(configureLightbox)
    .filter('getInfinity', getInfinity)

    ///////////////////////////////////////////////
    configureLightbox.$inject = ['LightboxProvider']
    function configureLightbox(LightboxProvider) {
      LightboxProvider.templateUrl = 'app/global/views/_modal_lightbox.html'
    }

    function getInfinity() {
      return function (item) {
        return item >= Number.MAX_SAFE_INTEGER ? '∞' : item
      }
    }

})()

