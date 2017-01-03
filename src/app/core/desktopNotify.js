/* global _ */
/* global angular */
/* global Notification */
; (function () {
  angular
    .module('koala.core')
    .factory('desktopNotify', desktopNotify)
  var icon = 'data:image/png;base64,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'

  function desktopNotify($q, $interval, $http, $window, $rootScope, $state, stroage) {
    var notyStorage
    var polling

    function Poller(interval, cb, limit) {
      var _this = this
      this.interval = interval || 250
      this.poll = null
      this.limit = limit
      var count = 0

      this.poll = $interval(function () {
        if (typeof cb == 'function') {
          if (_this.limit) {
            count++
            if (count > _this.limit) {
              _this.stop()
              return false
            }
          }
          cb(_this.poll)
        }
      }, this.interval)
    }

    function NotyStorage() {
      var sync = 'sync'
      var self = this
      var baseTime = ~~(+new Date() / 1000)

      self.getSyncSeq = function () {
        if (!sessionStorage.getItem(sync)) {
          sessionStorage.setItem(sync, '{}')
        }
        return JSON.parse(sessionStorage.getItem(sync))
      }

      self.getBaseTime = function (target) {
        return self.getSyncSeq()[target] || baseTime
      }

      self.setBaseTime = function (target, value) {
        var seq = self.getSyncSeq()
        seq[target] = value
        sessionStorage.setItem(sync, JSON.stringify(seq))
      }

      self.clear = function () {
        sessionStorage.removeItem(sync)
      }

      self.init = function (target) {
        if (self.getBaseTime(target) === baseTime) self.setBaseTime(target, ~~(+new Date() / 1000))
      }
    }

    function syncCheck() {
      var param = _.filter(stroage.getItem(), function(item) {
    	if(item.user_id === $rootScope.self.info.user_id) {
    		return true
    	}
    	return false
      })[0]

      if(param.verify_wait_auth) {
        showVerifyWait()
      }
      if(param.verify_refuse_auth) {
        showVerifyRefuse()
      }
      if(param.charge_pending_auth) {
        showChargePending()
      }
      if(param.charge_pass_auth) {
        showChargePass()
      }
      if(param.refunds_init_auth) {
        showRefundsInit()
      }
      if(param.refunds_done_auth) {
        showRefundsDone()
      }
      if(param.config_init_auth) {
        showConfigInit()
      }
      if(param.config_init_pass) {
        showConfigPass()
      }
    }

    function showVerifyWait() {
      return $http.get('/account/verify/requests', { params: { page_size: 100, verify_status: 'wait' } })
        .then(function (resp) {
          var itemName = 'verify'
          var needNoty = _(resp.data.verifies)
            .pluck('created_at')
            .filter(function (ele) { return ele > notyStorage.getBaseTime(itemName) })
            .value()
          if (needNoty.length > 0) {
            notify('身份审核', '又多了' + needNoty.length + '条待审核申请╮(╯-╰)╭', 'clients.identity')
            notyStorage.setBaseTime(itemName, _.last(needNoty))
          }
        })
    }

    function showVerifyRefuse() {
      return $http.get('/account/verify/requests', { params: { page_size: 100, verify_status: 'refuse' } })
        .then(function (resp) {
          var itemName = 'verify'
          var needNoty = _(resp.data.verifies)
            .pluck('created_at')
            .filter(function (ele) { return ele > notyStorage.getBaseTime(itemName) })
            .value()
          if (needNoty.length > 0) {
            notify('身份审核', '又多了' + needNoty.length + '条审核拒绝信息╮(╯-╰)╭', 'clients.identity')
            notyStorage.setBaseTime(itemName, _.last(needNoty))
          }
        })
    }

    function showChargePending() {
    	return $http.get('/charges', { params: {status: 'PENDING' } })
        .then(function (resp) {
          var itemName = 'addMoney'
          var needNoty = _(resp.data.list)
            .pluck('created_at')
            .filter(function (ele) { return ele > notyStorage.getBaseTime(itemName) })
            .value()
          if (needNoty.length > 0) {
            notify('加款管理', '又多了' + needNoty.length+ '条待充值信息╮(╯-╰)╭', 'finance.details')
            notyStorage.setBaseTime(itemName, _.first(needNoty))
          }
        })
    }

    function showChargePass() {
    	return $http.get('/charges', { params: {status: 'PASS', user_id: $rootScope.self.info.user_id } })
        .then(function (resp) {
          var itemName = 'addMoney'
          var needNoty = _(resp.data.list)
            .pluck('created_at')
            .filter(function (ele) { return ele > notyStorage.getBaseTime(itemName) })
            .value()
          if (needNoty.length > 0) {
            notify('加款管理', '又多了' + needNoty.length+ '条待充值信息╮(╯-╰)╭', 'finance.details')
            notyStorage.setBaseTime(itemName, _.first(needNoty))
          }
        })
    }

    function showRefundsInit() {
    	return $http.get('/refunds', { params: {status: 'INIT' } })
        .then(function (resp) {
          var itemName = 'dealRefunds'
          var needNoty = _(resp.data.refunds)
            .pluck('create_time')
            .filter(function (ele) { return ele > notyStorage.getBaseTime(itemName) })
            .value()
          if (needNoty.length > 0) {
            notify('提现管理', '又多了' + needNoty.length+ '条提现待处理信息╮(╯-╰)╭', 'finance.refunds')
            notyStorage.setBaseTime(itemName, _.first(needNoty))
          }
        })
    }

    function showRefundsDone() {
    	return $http.get('/refunds', { params: {status: 'DONE', user_id: $rootScope.self.info.user_id } })
        .then(function (resp) {
          var itemName = 'dealRefunds'
          var needNoty = _(resp.data.refunds)
            .pluck('create_time')
            .filter(function (ele) { return ele > notyStorage.getBaseTime(itemName) })
            .value()
          if (needNoty.length > 0) {
            notify('提现管理', '又多了' + needNoty.length+ '条提现待处理信息╮(╯-╰)╭', 'finance.refunds')
            notyStorage.setBaseTime(itemName, _.first(needNoty))
          }
        })
    }

    function showConfigInit() {
    	return $http.get('/charge_confs', { params: {status: 'INIT' } })
        .then(function (resp) {
          var itemName = 'chargeConfig'
          var needNoty = _(resp.data.charg_confs)
            .pluck('create_at')
            .filter(function (ele) { return ele > notyStorage.getBaseTime(itemName) })
            .value()
          if (needNoty.length > 0) {
            notify('计费管理', '又多了' + needNoty.length+ '条待计费信息╮(╯-╰)╭', 'business.charges')
            notyStorage.setBaseTime(itemName, _.first(needNoty))
          }
        })
    }

    function showConfigPass() {
    	return $http.get('/charge_confs', { params: {status: 'PASS', user_id: $rootScope.self.info.user_id } })
        .then(function (resp) {
          var itemName = 'chargeConfig'
          var needNoty = _(resp.data.charg_confs)
            .pluck('create_at')
            .filter(function (ele) { return ele > notyStorage.getBaseTime(itemName) })
            .value()
          if (needNoty.length > 0) {
            notify('计费管理', '又多了' + needNoty.length+ '条待计费信息╮(╯-╰)╭', 'business.charges')
            notyStorage.setBaseTime(itemName, _.first(needNoty))
          }
        })
    }

    function notify(title, body, state) {
      if (!Notification) {
        alert('哼哼, 不换 chrome 或者 chromium 就不给你推送通知')
        return
      }
      if (Notification.permission !== "granted")
        Notification.requestPermission()
      else {
        var notification = new Notification(title, {
          icon: icon,
          body: body,
        })
        notification.onclick = function () {
          $window.focus()
          $state.go(state)
          notification.close()
        }
      }
    }

    function init() {
      notyStorage = new NotyStorage()

      notyStorage.init('verify')
      notyStorage.init('addMoney')
      notyStorage.init('dealRefunds')
      notyStorage.init('chargeConfig')
      
      $rootScope.initPromise
        .then(function () {
          syncCheck()
          polling = Poller(900000, syncCheck)
        })
    }

    return {
      requestPermission: function () {
        if (Notification.permission !== "granted") Notification.requestPermission()
      },
      init: init
    }
  }

})();