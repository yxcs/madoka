; (function () {
  'use strict'

  angular
    .module('koala.core')
    .provider('routeHelper', routeHelperProvider)

  routeHelperProvider.$inject = ['APP_REQUIRES']

  function routeHelperProvider(appRequires) {

    this.getUrl = function (name) {
      if (appRequires.files) {
        for (var m in appRequires.files) {
          if (appRequires.files[m].name && appRequires.files[m].name === name) {
            return appRequires.files[m].view
          }
        }
      }
    }

    this.resolveFor = function () {
      var _args = arguments
      return {
        deps: ['$ocLazyLoad', '$q', function ($ocLL, $q) {
          var promise = $q.when(1)
          for (var i = 0, len = _args.length; i < len; i++) {
            promise = andThen(_args[i])
          }
          return promise
          function andThen(_arg) {
            if (typeof _arg == 'function') {
              return promise.then(_arg)
            } else {
              return promise.then(function () {
                var whatToLoad = getRequired(_arg)
                if (!whatToLoad) return new Error('Route resolve: Bad resource name [' + _arg + ']')
                return $ocLL.load(whatToLoad)
              })
            }
          }
          function getRequired(name) {
            if (appRequires.modules) {
              for (var m in appRequires.modules) {
                if (appRequires.modules[m].name && appRequires.modules[m].name === name) {
                  return appRequires.modules[m];
                }
              }
            }
            if (appRequires.files) {
              for (var f in appRequires.files) {
                if (appRequires.files[f].name && appRequires.files[f].name === name) {
                  return appRequires.files[f].script
                }
              }
            }
          }
        }]
      }
    }
    this.$get = function () { }
  }

})()

