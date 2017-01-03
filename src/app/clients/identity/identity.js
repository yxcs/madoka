; (function () {
  'use strict'

  angular.module('koala.clients')
    .controller('IdentityList', IdentityList)
    .controller('IdentityPass', IdentityPass)
    .controller('IdentityReject', IdentityReject)
    .controller('IdentityDetail', IdentityDetail)
    .factory('identity', identity)
    .filter('fromNow', fromNow)

  function IdentityList($scope, $modal, Lightbox, identity) {
    var vm = this
    vm.pass = pass
    vm.reject = reject
    vm.openLightboxModal = openLightboxModal
    vm.more = more
    vm.init_verifies_count = 0

    activate()

    $scope.$watchGroup(['vm.params.verify_status'], function (newValue, oldValue) {
      if (!_.isEqual(newValue, oldValue)) {
        query()
      }
    })

    function activate() {
      vm.params = {
        verify_status: 'wait'
      }
      vm.params.page_size = 10
      query()
    }

    function query() {
      var params = _.assign({}, vm.params)
      identity.query(params).then(function (result) {
        vm.verifies = result.verifies
        vm.page = result.page || {}
        if (params && params.verify_status === 'wait') {
          vm.init_verifies_count = vm.page.verifies_count
        }
      })
    }

    function more() {
      vm.params.page_size += 10
      query()
    }

    function pass(id) {
      $modal
        .open({
          templateUrl: 'app/clients/identity/identity-pass.html',
          controller: 'IdentityPass as vm',
          size: 'xs',
          backdrop: 'static',
          resolve: {
            verify_id: function () {
              return id
            }
          }
        })
        .result.then(function (result) {
          if (result === 'fin') {
            query()
          }
        })
    }

    function reject(id) {
      $modal
        .open({
          templateUrl: 'app/clients/identity/identity-reject.html',
          controller: 'IdentityReject as vm',
          size: 'xs',
          backdrop: 'static',
          resolve: {
            verify_id: function () {
              return id
            }
          }
        })
        .result.then(function (result) {
          if (result === 'fin') {
            query()
          }
        })
    }

    function openLightboxModal(src) {
      var images = [{ 'url': src, 'thumbUrl': src, }]
      Lightbox.openModal(images, 0);
    }

  }

  function IdentityPass($modalInstance, verify_id, identity) {
    var vm = this

    vm.submit = function () {
      var params = _.assign({
        verify_id: verify_id
      }, vm.params)
      identity.pass(params).then(function (result) {
        $modalInstance.close('fin');
      })
    }

    vm.skip = function () {
      $modalInstance.close('cancel');
    }
  }

  function IdentityDetail($modalInstance, account_name, identity) {
    var vm = this
    vm.openLightboxModal = openLightboxModal
    activate()

    vm.skip = function () {
      $modalInstance.close('cancel');
    }

    function activate() {
      identity
        .detail({ account_name: account_name })
        .then(function (result) {
          vm.verifies = result
        })
    }

    function openLightboxModal(src) {
      var images = [{ 'url': src, 'thumbUrl': src, }]
      Lightbox.openModal(images, 0);
    }

  }

  function IdentityReject($modalInstance, verify_id, identity) {
    var vm = this

    vm.submit = function () {
      var params = _.assign({
        verify_id: verify_id
      }, vm.params)
      identity.reject(params).then(function (result) {
        $modalInstance.close('fin');
      })
    }

    vm.skip = function () {
      $modalInstance.close('cancel');
    }
  }

  function identity($http) {
    return {
      query: function (params) {
        return $http
          .get('/account/verify/requests', { params: params })
          .then(function (response) {
            return response.data
          })
      },
      pass: function (params) {
        var thisParams = _.assign(params, {
          verify_status: 'yes'
        })
        return $http
          .post('/account/verify/deal', thisParams)
          .then(function (response) {
            return response.data
          })
      },
      reject: function (params) {
        var thisParams = _.assign(params, {
          verify_status: 'refuse'
        })
        return $http
          .post('/account/verify/deal', thisParams)
          .then(function (response) {
            return response.data
          })
      },
      detail: function (params) {
        var thisParams = _.assign(params, {
          verify_status: 'yes',
        })
        return $http
          .get('/account/verify/requests', { params: thisParams })
          .then(function (response) {
            return response.data
          })
          .then(function (result) {
            return result.verifies[0] || {}
          })
      }
    }
  }

  function fromNow() {
    return function (input) {
      moment.locale('zh-cn', {
        relativeTime: {
          future: "在%s前",
          past: "%s前",
          s: "%d秒",
          m: "一分钟",
          mm: "%d分钟",
          h: "一小时",
          hh: "%d小时",
          d: "一天",
          dd: "%d天",
          M: "一个月",
          MM: "%d个月",
          y: "一年",
          yy: "%d年"
        }
      })
      return input ? moment.unix(input).fromNow() : ''
    }
  }
})();