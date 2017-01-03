; (function () {
  'use strict'

  angular
    .module('koala.finance')
    .controller('Income', Income)

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  function Income(common, $state, $scope, $http, $q, autosave, branchCompany) {
    var vm = this
    var trans = common.$resource('/bills/es/income')
    var autoSaveData = autosave.getItem() || {}

    vm.params = autoSaveData.params || { key: 'username', bill_type: 'DAILY', }
    vm.page_num_to_go = autoSaveData.page_num_to_go || 1
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

    activate()

    $scope.$watch('vm.page_num_to_go', function (val, old_val) {
      if (val === old_val) return
      vm.params.from = vm.size * (val - 1 || 0)
      fetchTrans()
    })

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

    $scope.$watchGroup(['vm.params.bill_type',
      'vm.params.account_type',
      'vm.params.user_id',
      'vm.params.region_id',
      'vm.params.company',
      'vm.dateRange'], function (newValue, oldValue) {
        if (newValue !== oldValue) {
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

    function fetchTrans(type) {
      saveData()

      var params = _.clone(vm.params)

      if (type !== 'page') {
        params = _.omit(params, 'max', 'min')
      }


      if (params.value && params.key === 'bill_id') {
        params.bill_id = params.value
        params = _.pick(params, 'bill_id')
      } else {
        params.start_time = vm.dateRange.startDate && vm.dateRange.startDate.format('X')
        params.end_time = vm.dateRange.endDate && vm.dateRange.endDate.format('X')
      }

      trans.get(params, function (data) {
        vm.transData = data
        vm.totalItems = data.page.total_page * data.page.size
        vm.size = data.page.size
        vm.pageTotal = {
          total: 0,
          discount: 0,
          invoice: 0,
          bonus_cut: 0,
          earn: 0,
        }

        _.each(data.list, function (myData) {
          vm.pageTotal.total += Number(myData.total)
          vm.pageTotal.discount += Number(myData.discount)
          vm.pageTotal.invoice += Number(myData.invoice)
          vm.pageTotal.bonus_cut += Number(myData.bonus_cut)
          vm.pageTotal.earn += Number(myData.earn)
        })
      })
    }

    function saveData() {
      common.$timeout(function () {
        autosave.setItem({
          "params": vm.params,
          "dateRange": _.mapValues(vm.dateRange, function (v, k) {
            return moment.isMoment(v) ? v.valueOf() : moment.valueOf()
          }),
          "page_num_to_go": vm.page_num_to_go,
        })
      })
    }

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
})()
