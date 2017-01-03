; (function () {
  'use strict'

  angular
    .module('koala.core')
    .config(authConfig)
    .factory('AuthInterceptor', AuthInterceptor)
    .provider('AuthToken', AuthTokenProvider)

  function authConfig($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor')
  }

  function AuthInterceptor($q, $rootScope, AuthToken) {
    return {
      request: function (config) {
        // 向header注入token
        if (AuthToken.getToken()) {
          config.headers = config.headers || {}
          config.headers['x-token'] = AuthToken.getToken()
        }
        return config
      },
      responseError: function (rejection) {
        // 授权失败
        if (rejection.data.error_code == 1002) {
          AuthToken.removeToken()
          $rootScope.$emit('oauth:error', rejection)
        }
        return $q.reject(rejection)
      }
    }
  }

  function AuthTokenProvider() {
    this.$get = function ($cookies) {
      return {
        setToken: function (data) {
          return $cookies.set('token', data)
        },
        getToken: function () {
          return $cookies.get('token')
        },
        removeToken: function() {
          return $cookies.remove('token')
        }
      }
    }
  }

})()