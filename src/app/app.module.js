/* global jQuery */
/* global angular */
/* global _ */
/* global moment */

; (function () {
  'use strict'

  angular.module('koala', [
    'koala.core',
    'koala.widgets',
    //Feature areas
    'koala.global',
    'koala.clients',
    'koala.contact',
    'koala.business',
    'koala.datahub',
    'koala.finance',
    'koala.admin',
    'koala.config',
  ])

})()
