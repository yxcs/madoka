; (function () {
  'use strict'

  angular
    .module('koala.core')
    .config(configure)

  function configure($httpProvider, $ocLazyLoadProvider, $locationProvider, APP_REQUIRES) {

    configureHttp()
    configureLazyLoad()
    configureLocation()

    function configureHttp() {
      $httpProvider.interceptors.push(['$location', '$rootScope', '$q', '$cookies', '$window', 'ENVAPI',
        function ($location, $rootScope, $q, $cookies, $window, ENVAPI) {
          return {
            request: function (config) {

              if (/.html$/.test(config.url)) {
                return config
              } else {
                var url = ENVAPI + config.url
                config.url = url
                return config
              }
            },
            response: function (res) {
              if (res.data.error_code) {
                var msg = res.data.message || 'Unknow Error'
                $rootScope.notify('danger', '[' + res.data.error_code + '] ' + msg)
              }
              return res
            },
            responseError: function (rejection) {
              if (rejection.data.error_code) {
                var msg = rejection.data.message || 'Unknow Error'
                $rootScope.notify('danger', '[' + rejection.data.error_code + '] ' + msg)
              }
              return $q.reject(rejection)
            }
          };
        }])
    }

    function configureLazyLoad() {
      $ocLazyLoadProvider.config({
        // debug: false,
        // events: true,
        modules: APP_REQUIRES.modules
      });
    }

    function configureLocation() {
      $locationProvider.html5Mode(true)
    }
  }
})()