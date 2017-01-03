/**
 * 通用服务
 */
; (function () {
  'use strict'

  angular
    .module('koala.core')
    .factory('common', common)

  function common($q, $http, $resource, $timeout, $ocLazyLoad, $window) {

    return {
      getUpt: getUpt,
      $q: $q,
      $http: $http,
      $resource: $resource,
      $window: $window,
      $timeout: $timeout,
      $ocLazyLoad: $ocLazyLoad,
      compareSemver: compareSemver,
    }

    ////////////////////////////////////////////

    function getUpt(path) {
      var deferred = $q.defer();
      $http.get('/koala' + path).success(function (data) {
        deferred.resolve(data);
      })
      return deferred.promise;
    }

    function compareSemver(a, b) {
      var pa = a.split('.');
      var pb = b.split('.');
      for (var i = 0; i < 3; i++) {
        var na = parseInt(pa[i]);
        var nb = parseInt(pb[i]);
        if (na > nb) return 1;
        if (nb > na) return -1;
      }
      return 0;
    }

  }

})()

/**
 * filter
 */
; (function () {
  'use strict'

  angular
    .module('koala.core')
    .filter('digiUnit', digiUnit)
    .filter('location', location)
    .filter('accoutStatus', accoutStatus)

  /////////////////////////////////////////////////
  function digiUnit() {
    return function (input, unit, top, type) {
      var out = ''
      var input = input || 0

      if (type === 'b') {
        type = 'b';
      } else {
        type = 'B';
      }
      switch (unit) {
        case 'B':
          out = input;
          break;
        case 'K':
          out = Number(input / 1024).toFixed(2);
          break;
        case 'M':
          out = Number(input / 1024 / 1024).toFixed(2);
          break;
        case 'G':
          out = Number(input / 1024 / 1024 / 1024).toFixed(2);
          break;

        default:
          {
            if (top === '_M') {
              if (Math.abs(input) < 1024) return out = input + ' ' + type;
              input /= 1024;
              if (Math.abs(input) < 1024) return out = input.toFixed(2) + ' K' + type;
              input /= 1024;
              if (Math.abs(input) < 1024) return out = input.toFixed(2) + ' M' + type;
              // input /= 1024;
              return out = input.toFixed(2) + ' M' + type;
            } else {
              if (Math.abs(input) < 1024) return out = input + ' ' + type;
              input /= 1024;
              if (Math.abs(input) < 1024) return out = input.toFixed(2) + ' K' + type;
              input /= 1024;
              if (Math.abs(input) < 1024) return out = input.toFixed(2) + ' M' + type;
              input /= 1024;
              return out = input.toFixed(2) + ' G' + type;
            }
          }
      }
      return out;
    };
  }

  location.$inject = ['LOCATION']
  function location(china) {
    return function (input, level) {
      var provinces = china;
      var name;
      provinces.forEach(function (itm) {
        if (itm.id == input) {
          name = itm.name;
          return
        } else {
          if (!itm.sub) return;
          itm.sub.forEach(function (sub_itm) {
            if (sub_itm.id == input) {
              name = sub_itm.name;
            }
          });
        }
      });
      return name;
    }
  }

  accoutStatus.$ineject = ['APP_DATA_MAP']
  function accoutStatus(APP_DATA_MAP) {
    return function (input) {
      if (input === null || input === undefined) { return 'N/A' }
      return APP_DATA_MAP.account_status[input]
    }
  }
})()