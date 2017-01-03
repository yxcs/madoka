; (function () {
  'use strict'

  angular
    .module('koala.finance')
    .controller('Transactions', Transactions)
    .filter('paymentMethod', paymentMethod)

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  function Transactions(common, $state, $scope, $http, $q, autosave, branchCompany) {
    var vm = this
    var trans = common.$resource('/transaction_logs')

    var autoSaveData = autosave.getItem() || {}

    vm.params = autoSaveData.params || { key: 'username', }

    if (autoSaveData.dateRange) {
      vm.dateRange = _.mapValues(autoSaveData.dateRange, function (v) { return moment(v) })
    } else {
      vm.dateRange = { startDate: moment().subtract(30, 'days').startOf('days'), endDate: moment().add(1, 'months').endOf('days') }
    }

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
    vm.changeTableState = changeTableState
    vm.prev = prev
    vm.next = next
    vm.tranTypes = {
      RECHARGE: '账户加款',
      CASH: '余额提现',
      RESOURCE: '资源购买',
      DAY_BILL: '日账单扣款',
      MONTH_BILL: '月账单扣款',
    }

    vm.currentState = {
      tableState: []
    }

    activate()

    $scope.$watch('vm.params.company', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.sellers =  branchCompany.getSellers(vm.params.company)
        vm.fetchTrans()
      }
    })

    $scope.$watch('vm.params.user_id', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.fetchTrans()
      }
    })

    function activate() {
      branchCompany.getDefaultPromise.then(function(result) {
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

    function fetchTrans(type) {
      vm.currentState = {
        tableState: []
      }

      var params = _.clone(vm.params)

      if (type !== 'page') {
        delete params.max
        delete params.min
      }
      if (!params.value) { delete params.key }
      if (!params.key) { delete params.value }

      params.start_time = vm.dateRange.startDate && vm.dateRange.startDate.format('X')
      params.end_time = vm.dateRange.endDate && vm.dateRange.endDate.format('X')

      trans.get(params, function (data) {
        autosave.setItem({
          "params": vm.params,
          "dateRange": _.mapValues(vm.dateRange, function (v, k) {
            return moment.isMoment(v) ? v.valueOf() : moment.valueOf()
          }),
        })

        vm.transData = data
      })
    }

    function changeTableState(index) {
      vm.currentState.tableState[index] = !vm.currentState.tableState[index]
    }

    function prev() {
      if (!vm.transData.page.since) return
      vm.params.since = vm.transData.page.since
      vm.params.max = null
      vm.fetchTrans('page')
    }

    function next() {
      if (!vm.transData.page.max) return
      vm.params.since = null
      vm.params.max = vm.transData.page.max
      vm.fetchTrans('page')
    }
  }

  function paymentMethod() {
    return function (input) {
      var result
      switch (input) {
        case 'alipay':
          result = '支付宝支付'
          break
        case 'offline_bank':
          result = '线下银行打款'
          break
        case 'offline_cash':
          result = '线下现金处理'
          break
        case 'system':
          result = '系统处理'
          break
        case 'other':
          result = '其它'
          break
        default:
          result = '未知'

      }
      return result
    }
  }
})()
