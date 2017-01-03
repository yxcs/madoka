; (function () {
  'use strict'

  angular
    .module('koala.finance')
    .controller('Debts', Debts)
    .controller('DebtsSync', DebtsSync)

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  function Debts(common, $state, $scope, $http, $q, $modal, autosave, branchCompany) {
    var vm = this
    var trans = common.$resource('/debts')

    var autoSaveData = autosave.getItem() || {}

    vm.params = autoSaveData.params || { key: 'username', status: 'OVERDUE', }
    vm.page_num_to_go = autoSaveData.page_num_to_go || 1

    vm.regions = [
      { key: '1', value: '华北地区' },
      { key: '2', value: '华东地区' },
      { key: '3', value: '华南地区' },
      { key: '4', value: '港澳台地区' },
      { key: '6', value: '海外地区' },
      { key: '-1', value: '未知区域' }
    ]

    vm.fetchTrans = fetchTrans
    vm.refresh = refresh

    vm.orderBy = function (order_key) {
      if (vm.params.order_type && vm.params.order_key === order_key) {
        vm.params.order_type === "asc" ? vm.params.order_type = "desc" : vm.params.order_type = "asc"
      } else {
        vm.params.order_type = "desc"
      }
      vm.params.order_key = order_key
      fetchTrans()
    }

    activate()

    $scope.$watch('vm.params.company', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.sellers = branchCompany.getSellers(vm.params.company)
        vm.fetchTrans()
      }
    })

    $scope.$watch('vm.params.user_id', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.fetchTrans()
      }
    })

    $scope.$watch('vm.page_num_to_go', function (val, old_val) {
      if (val === old_val) return
      vm.params.from = vm.size * (val - 1 || 0)
      fetchTrans()
    })


    $scope.$watchGroup(['vm.params.status',
      'vm.params.account_type',
      'vm.params.user_id',
      'vm.params.region_id',
      'vm.params.company', ], function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          fetchTrans()
        }
      })

    function activate() {
      branchCompany.getDefaultPromise.then(function (result) {
        vm.sellers = result.defaultSellers
        vm.companys = result.companys
        vm.defaultUserLabel = result.defaultUserLabel
      })
      fetchTrans()
    }

    function refresh() {
      autosave.removeItem()
      $state.reload()
    }

    function fetchTrans() {
      var params = _.clone(vm.params)

      if (params.value && params.key) {
        params = _.pick(params, 'key', 'value')
      } else {
        params = _.omit(params, 'key', 'value')
      }

      trans.get(params, function (data) {

        autosave.setItem({
          "params": vm.params,
          "page_num_to_go": vm.page_num_to_go,
        })

        vm.transData = data
        vm.totalItems = data.page.total_page * data.page.size
        vm.size = data.page.size
        vm.pageTotal = {
          pay_remain: 0,
          bonus_remain: 0,
          coupon: 0,
          flow: 0,
          debt_money: 0,
          debt_time: 0,
        }
        _.each(data.list, function (myData) {
          vm.pageTotal.pay_remain += myData.pay_remain
          vm.pageTotal.bonus_remain += myData.bonus_remain
          vm.pageTotal.coupon += myData.coupon
          vm.pageTotal.flow += myData.flow
          vm.pageTotal.debt_money += myData.debt_money
          vm.pageTotal.debt_time += myData.debt_time
        })
      })
    }

    $scope.sync = function (account_name) {
      var modalInstance = $modal.open({
        templateUrl: 'app/finance/debts/debts-sync.html',
        controller: 'DebtsSync',
        resolve: {
          account_name: function () {
            return account_name
          }
        }
      })
      modalInstance.result.then(function (cm) {
        if (cm !== 'cancel') {
          fetchTrans()
        }
      })
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  function DebtsSync($http, $modalInstance, $scope, account_name) {
    $scope.submit = function () {
      $http.post('/debt/sync', { account_name: account_name })
        .success(function (data) {
          if (data.result === true) {
            $modalInstance.close('fin')
          }
        })
        .error(function (data, status, headers, config) {
          $scope.notify('danger', '实时数据同步失败')
        })
    }

    $scope.skip = function () {
      $modalInstance.close('cancel')
    }

  }
})();
