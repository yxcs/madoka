; (function () {
  angular
    .module('koala.core')
    .factory('stroage', stroage)

  function stroage($window, $location) {
    var local = $window.localStorage
    var localData = [
          {"user_id": 1, "verify_wait_auth": true, "verify_refuse_auth": true, "charge_pending_auth": true, "charge_pass_auth": true, "refunds_init_auth": true, "refunds_done_auth": true, "config_init_auth": true, "config_init_pass": true},
          {"user_id": 3, "verify_wait_auth": false, "verify_refuse_auth": false, "charge_pending_auth": true, "charge_pass_auth": true, "refunds_init_auth": false, "refunds_done_auth": false, "config_init_auth": false, "config_init_pass": false},
          {"user_id": 2, "verify_wait_auth": false, "verify_refuse_auth": false, "charge_pending_auth": false, "charge_pass_auth": false, "refunds_init_auth": true, "refunds_done_auth": true, "config_init_auth": false, "config_init_pass": false},
          {"user_id": 52, "verify_wait_auth": false, "verify_refuse_auth": false, "charge_pending_auth": false, "charge_pass_auth": false, "refunds_init_auth": false, "refunds_done_auth": false, "config_init_auth": false, "config_init_pass": false},
          {"user_id": 53, "verify_wait_auth": true, "verify_refuse_auth": true, "charge_pending_auth": true, "charge_pass_auth": true, "refunds_init_auth": true, "refunds_done_auth": true, "config_init_auth": true, "config_init_pass": true},
          {"user_id": 51, "verify_wait_auth": false, "verify_refuse_auth": false, "charge_pending_auth": true, "charge_pass_auth": true, "refunds_init_auth": true, "refunds_done_auth": true, "config_init_auth": true, "config_init_pass": true}
        ]

    return {
      setAllItem: function () {
        if(!local.getItem('localData')) {
          local.setItem('localData', JSON.stringify(localData))
        }
      },
      setItem: function (data) {
        local.setItem('localData', JSON.stringify(data))
      },
      getItem: function () {
        return JSON.parse(local.getItem('localData'))
      },
      removeItem: function () {
        return local.removeItem('localData')
      }
    }
  }
})()