; (function () {
  'use strict'

  angular
    .module('koala.finance')
    .controller('Details', Details)
    .controller('DetailsNew', DetailsNew)
    .controller('DetailsConfirm', DetailsConfirm)
    .controller('Deal', Deal)
    .controller('DealPass', DealPass)
    .controller('DealCancel', DealCancel)
    .controller('DealDelete', DealDelete)

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  function Details(common, $state, $scope, $http, $q, autosave, branchCompany, $modal) {
    var vm = this
    var autoSaveData = autosave.getItem() || {}
    vm.params ={status : 'PASS'}

    vm.params = autoSaveData.params || { key: 'username', status: 'PASS',}
    vm.tabactive = autoSaveData.tabactive || [true, false, false]
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

    vm.currentState = {
      tableState: []
    }

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
    };

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

    $scope.$watchGroup(['vm.params.account_type',
      'vm.params.user_id',
      'vm.params.region_id',
      'vm.params.company',
      'vm.params.status',
      'vm.dateRange'], function (newValue, oldValue) {
        if (newValue !== oldValue) {
          fetchTrans()
          if(vm.params.status === 'PENDING') {
            getCount()
          }
        }
      })

    function activate() {
      branchCompany.getDefaultPromise.then(function (result) {
        vm.sellers = result.defaultSellers
        vm.companys = result.companys
        vm.defaultUserLabel = result.defaultUserLabel
      })
      fetchTrans()
      getCount()
    }

    function refresh() {
      autosave.removeItem()
      $state.reload()
    }

    function fetchTrans(type) {
      saveData()

      var params = _.clone(vm.params)

      if (params.value && params.key === 'order_id') {
        params.order_id = params.value
        params = _.pick(params, 'order_id', 'status')
      } else {
        if (params.value && params.key) {
          if (params.value && params.key === 'username') {
            params.account_name = params.value
            params = _.pick(params, 'account_name', 'order_type', 'order_key', 'status')
          } else {
            params = _.pick(params, 'key', 'value', 'status')
          }
        }
        params.start_time = vm.dateRange.startDate && vm.dateRange.startDate.format('X')
        params.end_time = vm.dateRange.endDate && vm.dateRange.endDate.format('X')
      }

      $http.get('/charges', {params: params}).success(function (data) {

        vm.transData = data
        vm.totalItems = data.page.total_page * data.page.size
        vm.size = data.page.size
        vm.pageTatol = {
          pay: 0,
          bonus: 0,
          money: 0,
          balance: 0,
        }
        _.each(data.list, function (myData) {
          vm.pageTatol.pay += Number(myData.pay)
          vm.pageTatol.bonus += Number(myData.bonus)
          vm.pageTatol.money += Number(myData.money)
          vm.pageTatol.balance += Number(myData.balance)
        })

      })

    }

    function getCount() {
      var params = _.omit(vm.params, 'status')
      params.status = 'PENDING'

      if (params.value && params.key === 'order_id') {
        params.order_id = params.value
        params = _.pick(params, 'order_id', 'status')
      } else {
        if (params.value && params.key) {
          if (params.value && params.key === 'username') {
            params.account_name = params.value
            params = _.pick(params, 'account_name', 'order_type', 'order_key', 'status')
          } else {
            params = _.pick(params, 'key', 'value', 'status')
          }
        }
        params.start_time = vm.dateRange.startDate && vm.dateRange.startDate.format('X')
        params.end_time = vm.dateRange.endDate && vm.dateRange.endDate.format('X')
      }
      
      $http.get('/charges', {params: params}).success(function(data) {
        vm.pNum = data.page.count
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
          "tabactive": vm.tabactive,
        })
      })
    }

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  function DetailsNew(common, $modal, $state, $scope, $http, $stateParams, personal) {
    var vm = this
    vm.searchClient = searchClient
    vm.params = {
      pay_type: 'alipay',
      bonus: 0,
    }

    vm.client = {}
    vm.confirmDetails = confirmDetails
    vm.back = back
    vm.isBonus = false

    if ($stateParams.account_name) {
      personal.setAccount($stateParams.account_name)
      personal.detail().then(function(result) {
        accountCallback(result)
      })
    }

    $scope.$watch('vm.isBonus', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.params.bonus = 0
      }
    })

    function searchClient() {

      var modalInstance = $modal.open({
        templateUrl: 'app/widgets/template/clientSearchModalView.html',
        controller: 'ClientSearchModal',
        backdrop: 'static',
        resolve: {
          type: function () {
            return 'allRegisted'
          }
        }
      })

      modalInstance.result.then(function (client) {
        if (client !== 'cancel') {
          accountCallback(client)
        }
      })
    }

    function accountCallback(client) {
      vm.params.account_name = client.account_name
      if (client.balance.toString().split('.')[1]) {
        if (client.balance.toString().split('.')[1].length <= 2) {
          vm.client.balance = client.balance
        } else {
        alert('余额数据错误！必须为两位小数')
        }
      } else {
        vm.client.balance = client.balance
      }
      // 校验是否存在计费配置
      checkCharge(client.account_name)
      vm.client.name = client.name
      vm.client.sell_name = client.sell_name
    }

    function checkCharge(clientname) {
      $http.get('/charge_conf/check', {params: {
        account_name: clientname
      }}).then(function(result) {
        if (result.data.has_conf) {
          vm.isBonus = false
          vm.chargeConfClient = true
        } else {
          vm.chargeConfClient = false
        }
      })
    }

    function back() {
      $state.go('^')
    }

    function confirmDetails() {

      if (!vm.params.account_name) return
      if (isNaN(vm.client.balance)) return
      if (!vm.params.pay_type) return
      if (isNaN(vm.params.pay) || vm.params.pay < 0) return
      if (isNaN(vm.params.bonus) || vm.params.bonus < 0) return

      $modal
        .open({
          templateUrl: 'app/finance/details/details-create.html',
          controller: 'DetailsConfirm as vm',
          backdrop: 'static',
          resolve: {
            detailsParmas: function () { return _.clone(vm.params) },
            balance: function () { return vm.client.balance }
          }
        })
    }

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  function DetailsConfirm(common, $modalInstance, $state, detailsParmas, $scope, balance) {
    var vm = this
    var detailsNew = common.$resource('/charge', '', {
      create: { method: 'PUT' }
    })

    vm.balance = balance
    vm.skip = skip
    vm.submit = submit
    vm.params = detailsParmas
    vm.counter = 5
    vm.payMap = {
      alipay: "支付宝支付",
      offline_bank: "线下银行打款",
      offline_cash: "线下现金处理",
      system: "系统处理",
      other: "其它",
    }
    countdown()

    function submit() {
      var params = _.clone(vm.params)
      vm.disableSubmit = true

      if (!vm.params.account_name) return
      if (isNaN(vm.balance)) return
      if (!vm.params.pay_type) return
      if (isNaN(vm.params.pay) || vm.params.pay < 0) return
      if (isNaN(vm.params.bonus) || vm.params.bonus < 0) return

      detailsNew.create(params, function () {
        vm.disableSubmit = false
        $modalInstance.close('fin')
        $state.go('finance.details')
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

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function Deal(common, $modal, $state, $scope, $http, $stateParams) {
    var vm = this

    vm.dealPass = dealPass
    vm.dealCancel = dealCancel
    vm.dealDelete = dealDelete

    vm.order_id = $stateParams.order_id
    vm.status = $stateParams.status

    vm.payType = {
      alipay : '支付宝支付',
      offline_bank : '线下银行打款',
      offline_cash : '线下现金支付',
      system : '系统处理',
      other : '其他'
    }

    $http.get('/charges', {params: {order_id: vm.order_id, status: vm.status}}).success(function (data) {
      vm.dealData = data.list[0]
    })

    function dealPass(dealData) {
      $modal
        .open({
          templateUrl: 'app/finance/details/details-deal-success.html',
          controller: 'DealPass as vm',
          resolve: {
            dealData: function () {
              return dealData
            }
          }
        })
        .result.then(function (result) {
          if (result === 'fin') {
            $state.reload()
          }
        })
    }

    function dealCancel(order_id) {
      $modal
        .open({
          templateUrl: 'app/finance/details/details-deal-cancel.html',
          controller: 'DealCancel as vm',
          resolve: {
            id: function () {
              return order_id
            }
          }
        })
        .result.then(function (result) {
          if (result === 'fin') {
            $state.reload()
          }
        })
    }

    function dealDelete(order_id) {
      $modal
        .open({
          templateUrl: 'app/finance/details/details-deal-delete.html',
          controller: 'DealDelete as vm',
          resolve: {
            id: function () {
              return order_id
            }
          }
        })
        .result.then(function (result) {
          if (result === 'fin') {
            $state.reload()
          }
        })
    }

  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function DealPass(common, $scope, $modal, $state, $modalInstance, $http, dealData) {
    var addPass = common.$resource('/charge/process', '', { add: { method: 'POST' } })

    var vm = this
    vm.counter = 5

    vm.dealData = dealData

    vm.skip = skip
    vm.submit = submit

    function submit() {
      addPass.add({order_id: vm.dealData.order_id, action: 'PASS'}, function () {
        $state.go('finance.details')
        $modalInstance.close('fin');
      }, function () {
        $scope.notify('danger', '出错了！')
      })
    }

    function skip() {
      $modalInstance.close('cancel')
    }

    countdown()
    function countdown() {
      common.$timeout(function () {
        vm.counter--
        if (vm.counter > 0) { countdown() }
      }, 1000)
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  function DealCancel(common, $scope, $modal, $state, $modalInstance, $http, id) {
    var addCancel = common.$resource('/charge/process', '', { cancel: { method: 'POST' } })
    var vm = this

    vm.skip = skip
    vm.submit = submit

    function submit() {

      addCancel.cancel({order_id: id, action: 'CANCEL', reason : vm.reason}, function () {
        $state.go('finance.details')
        $modalInstance.close('fin');
      }, function () {
        $scope.notify('danger', '出错了！')
      })
    }

    function skip() {
      $modalInstance.close('cancel')
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function DealDelete(common, $scope, $modal, $state, $modalInstance, $http, id) {
    var addDelete = common.$resource('/charge/process', '', { delete: { method: 'POST' } })
    var vm = this
    vm.id = id

    vm.skip = skip
    vm.submit = submit

    function submit() {
      addDelete.delete({order_id: id, action: 'DELETE'}, function () {
        $state.go('finance.details')
        $modalInstance.close('fin')
      }, function () {
        $scope.notify('danger', '出错了！')
      })
    }

    function skip() {
      $modalInstance.close('cancel')
    }
  }


})()
