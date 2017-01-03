; (function () {
  'use strict'

  angular.module('koala.finance')
    .controller('Bills', Bills)
    .controller('BillsDetail', BillsDetail)
    .controller('BillsCharge', BillsCharge)
    .controller('BillsChargeConfirm', BillsChargeConfirm)
    .filter('byteToGb', byteToGb)
    .filter('bpsToMbps', bpsToMbps)

  //list
  function Bills(common, $scope, $http, $modal, $state, $q, autosave, branchCompany) {
    var vm = this

    var billsEs = common.$resource('/bills/es')
    var autosaveData = autosave.getItem() || {}

    vm.refresh = refresh
    vm.fetchBills = fetchBills
    vm.params = autosaveData.params || { key: 'username', from: 0, size: 20 }
    if (autosaveData.dateRange) {
      vm.dateRange = _.mapValues(autosaveData.dateRange, function (v) {
        return v ? moment(v) : null
      })
    } else {
      vm.dateRange = {
        startDate: moment().subtract(1, 'months').startOf('days'),
        endDate: moment().add(1, 'months').endOf('days'),
      }
    }
    vm.page_num_to_go = autosaveData.page_num_to_go || 1
    vm.tabactive = autosaveData.tabactive || [true, false]

    vm.dateOptionForDay = { dateLimit: { months: 1 } }
    vm.currentState = autosaveData.currentState || { tableState: [] }
    vm.deductState = autosaveData.deductState || void 0
    activate()

    ///////////////////////////////////////////
    $scope.$watch('vm.params.company', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.sellers = branchCompany.getSellers(vm.params.company)
        vm.fetchBills()
      }
    })

    $scope.$watch('vm.params.user_id', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.fetchBills()
      }
    })

    $scope.$watch('vm.page_num_to_go', function (val, old_val) {
      if (val === old_val) return
      vm.params.from = vm.params.size * (val - 1 || 0)
      vm.fetchBills()
    })

    function activate() {
      var date = new Date()
      vm.dateMonth = autosaveData.dateMonth || date.setMonth(date.getMonth() - 1)

      branchCompany.getDefaultPromise.then(function (result) {
        vm.sellers = result.defaultSellers
        vm.companys = result.companys
        vm.defaultUserLabel = result.defaultUserLabel
      })
      vm.params.bill_type = 'DAILY'
    }

    function fetchBills() {
      saveData()

      var params = _.clone(vm.params)
      if (params.bill_type === 'DAILY') {
        params.start_time = parseInt(vm.dateRange.startDate && vm.dateRange.startDate.format('X')) - 2
        params.end_time = parseInt(vm.dateRange.endDate && vm.dateRange.endDate.format('X')) + 2
      }
      if (params.bill_type === 'MONTHLY' && vm.dateMonth) {
        var month = moment(vm.dateMonth).get('month')
        var year = moment(vm.dateMonth).get('year')
        if (month !== undefined) {
          params.start_time = moment({ d: 1, M: month, Y: year }).format('X')
          params.end_time = moment({ d: 1, M: month, Y: year }).add(1, 'months').format('X')
        }
      }

      if (!params.key || !params.value) {
        delete params.key
        delete params.value
      }

      if (params.key === 'bill_id' && params.value) {
        params.bill_id = params.value
        delete params.key
        delete params.value
      }

      if (vm.deductState !== undefined) {
        switch (vm.deductState) {
          case "0":
            params.is_deducted = false
            params.is_deductable = false
            break
          case "1":
            params.is_deducted = true
            params.is_deductable = false
            break
          case "-1":
            params.is_deducted = false
            params.is_deductable = true
            break
          default:
            break
        }
      }

      billsEs.get(params, function (data) {

        vm.billdata = data
        vm.totalItems = data.page.total_page * data.page.size
        vm.currentState.tableState = []

        vm.currentState.tableTotal = false
        vm.currentState.tablePage = false

        vm.billdata.page_statistics = {
          bandwidth_amount: 0,
          bandwidth_fee: 0,
          cdn_request_amount: 0,
          cdn_request_fee: 0,
          flow_amount: 0,
          flow_fee: 0,
          https_amount: 0,
          https_fee: 0,
          storage_amount: 0,
          storage_fee: 0,
          total_fee: 0,
        }
        vm.billdata.list.forEach(function (e) {
          if (e.cdn.service_type === 'FLOW') {
            vm.billdata.page_statistics.flow_fee += e.cdn.fee
            vm.billdata.page_statistics.flow_amount += Number(e.cdn.amount)
          } else if (e.cdn.service_type === 'BANDWIDTH') {
            vm.billdata.page_statistics.bandwidth_fee += e.cdn.fee
            vm.billdata.page_statistics.bandwidth_amount += Number(e.cdn.amount)
          }
          vm.billdata.page_statistics.cdn_request_fee += e.cdn_request.fee
          vm.billdata.page_statistics.cdn_request_amount += Number(e.cdn_request.amount)
          vm.billdata.page_statistics.storage_fee += e.storage.fee
          vm.billdata.page_statistics.storage_amount += Number(e.storage.amount)
          vm.billdata.page_statistics.https_fee += e.https.fee
          vm.billdata.page_statistics.https_amount += Number(e.https.amount)
        })
        vm.billdata.page_statistics.total_fee = vm.billdata.page_statistics.flow_fee + vm.billdata.page_statistics.bandwidth_fee +
        vm.billdata.page_statistics.cdn_request_fee + vm.billdata.page_statistics.storage_fee +
        vm.billdata.page_statistics.https_fee
      })
    }

    function refresh() {
      autosave.removeItem()
      $state.reload()
    }

    function saveData() {
      setTimeout(function () {
        autosave.setItem({
          params: vm.params,
          currentState: vm.currentState,
          dateRange: _.mapValues(vm.dateRange, function (v) {
            return moment.isMoment(v) ? moment(v).valueOf() : ''
          }),
          dateMonth: vm.dateMonth,
          tabactive: vm.tabactive,
          page_num_to_go: vm.page_num_to_go,
          deductState: vm.deductState
        })
      })
    }
  }

  ////////////////////////////////////////////////////////

  function BillsDetail(common, $stateParams) {
    var vm = this
    var billDetail = common.$resource('/bill/detail')
    var billMonth = common.$resource('/bills/es')

    $stateParams.type = 'MONTHLY'
    //不能改名字
    vm.flag = {
      isPfFLOW: false,
      isPfBANDWIDTH: false,
      isPfCDN_REQUEST_COUNT: false,
      isPfSTORAGE: false,
      isPfHTTPS: false,
      isMonth: false,
    }
    vm.detail = {}

    activate()

    function activate() {
      getBillDetail().then(function () {
        if (vm.detail.bill_type === 'DAILY' && _.isArray(vm.detail.preferential.resource)) {
          vm.detail.preferential.resource.forEach(function (e) {
            vm.flag['isPf' + e.service_type] = true
          })
        } else if (vm.detail.bill_type === 'MONTHLY') {
          vm.flag.isMonth = true
          vm.detail.preferential.resource.forEach(function (e) {
            vm.flag['isPf' + e.service_type] = true
          })
          var params = {
            key: 'username',
            value: vm.detail.account_name,
            bill_type: 'DAILY',
            start_time: vm.detail.start_time,
            end_time: vm.detail.end_time,
          }
          getMonthBill(params)
        }

      })
    }

    function getBillDetail() {
      return billDetail.get({ bill_id: $stateParams.id }, function (data) {
        vm.detail = data
      }).$promise
    }

    function getMonthBill(params) {
      billMonth.get(params, function (data) {
        vm.monthDetail = data
      })
    }
  }

  function BillsCharge(common, $stateParams, $modal) {
    var vm = this
    var billDetail = common.$resource('/bill/detail')
    vm.postBillCharge = postBillCharge

    activate()

    function activate() {
      getBillDetail().then(function () {
        if (vm.detail.cdn.service_type === 'FLOW') {
          vm.chargeParams = {
            f: vm.detail.cdn.fee,
            r: vm.detail.cdn_request.fee,
            s: vm.detail.storage.fee,
            h: vm.detail.https.fee,
            p: vm.detail.preferential.cash,
            t: vm.detail.total_cost,
            real: vm.detail.reality_pay,
          }
        } else if (vm.detail.cdn.service_type === 'BANDWIDTH') {
          vm.chargeParams = {
            b: vm.detail.cdn.fee,
            r: vm.detail.cdn_request.fee,
            s: vm.detail.storage.fee,
            h: vm.detail.https.fee,
            p: vm.detail.preferential.cash,
            t: vm.detail.total_cost,
            real: vm.detail.reality_pay,
          }
        }
        vm.params = {
          account_name: vm.detail.account_name,
          bill_time: vm.detail.bill_time,
          total_cost: vm.detail.total_cost,
          reality_money: vm.chargeParams.real,
          bill_id: vm.detail.bill_id,
        }
      })
    }

    function postBillCharge() {
      $modal
        .open({
          templateUrl: 'app/finance/bills/bills-charge-create.html',
          controller: 'BillsChargeConfirm as vm',
          backdrop: 'static',
          resolve: {
            chargeParmas: function () { return _.clone(vm.params) },
          }
        })
    }

    function getBillDetail() {
      return billDetail.get({ bill_id: $stateParams.id }, function (data) {
        vm.detail = data
      }).$promise
    }
  }

  function BillsChargeConfirm(common, $modalInstance, $state, chargeParmas) {
    var vm = this
    var transNew = common.$resource('/bill/opt', '', {
      create: { method: 'POST' }
    })

    vm.skip = skip
    vm.submit = submit
    vm.params = chargeParmas
    vm.counter = 5

    countdown()

    function submit() {
      var params = _.clone(vm.params)
      vm.disableSubmit = true

      transNew.create(params, function () {
        vm.disableSubmit = false
        $modalInstance.close('fin')
        $state.go('^.^')
      }, function () {
        vm.disableSubmit = false
        $modalInstance.close('cancel')
      })
    }

    function skip() {
      $modalInstance.close('cancel')
    }

    function countdown() {
      common.$timeout(function () {
        vm.counter--
        if (vm.counter > 0) { countdown() }
      }, 1000)
    }
  }

  function byteToGb() {
    return function (input) {
      if (input === undefined) {
        return undefined
      }
      return new Big(input).div(1073741824).toFixed(2).toString()
    }
  }

  function bpsToMbps() {
    return function (input) {
      if (input === undefined) {
        return undefined
      }
      return new Big(input).div(1048576).toFixed(2).toString()
    }
  }
})()
