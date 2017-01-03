angular.module('koala.finance')
  .controller('Orderin', Orderin)

function Orderin($scope, $http, $q, branchCompany) {
  var vm = this
  vm.refresh = refresh
  vm.fetchOrderIncome = fetchOrderIncome
  vm.params = {
    key: 'order_number',
    time_type: 'ORDER_TIME'
  }
  vm.page = {
    size: 20
  }
  vm.time_types = [
    { name: '下单时间', type: 'ORDER_TIME' },
    { name: '付款时间', type: 'PAY_TIME' }
  ]

  vm.regions = [
    { key: '1', value: '华北地区' },
    { key: '2', value: '华东地区' },
    { key: '3', value: '华南地区' },
    { key: '4', value: '港澳台地区' },
    { key: '6', value: '海外地区' },
    { key: '-1', value: '未知区域' }
  ]
  vm.dateRange = {
    startDate: null,
    endDate: null
  }

  activate()

  $scope.$watch('vm.params.company', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      vm.sellers = branchCompany.getSellers(vm.params.company)
      vm.fetchOrderIncome()
    }
  })

  $scope.$watch('vm.params.user_id', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      vm.fetchOrderIncome()
    }
  })

  function activate() {
    branchCompany.getDefaultPromise.then(function (result) {
      vm.sellers = result.defaultSellers
      vm.companys = result.companys
      vm.defaultUserLabel = result.defaultUserLabel
    })
    fetchOrderIncome()
  }

  function refresh() {
    vm.params = {
      key: 'order_number',
      time_type: 'ORDER_TIME'
    }
    vm.dateRange = {
      startDate: null,
      endDate: null
    }
    vm.page = {
      size: 20
    }

    vm.sellers = vm.defaultUserMap
    updateView('user')
    fetchOrderIncome()
  }

  function fetchOrderIncome() {
    var params = _.clone(vm.params)

    if (!params.value) { delete params.key }

    if (vm.dateRange.startDate && vm.dateRange.endDate) {
      params.time_start = moment.isMoment(vm.dateRange.startDate) ? vm.dateRange.startDate.format('X') : vm.dateRange.startDate.getTime() / 1000
      params.time_end = moment.isMoment(vm.dateRange.endDate) ? vm.dateRange.endDate.format('X') : vm.dateRange.endDate.getTime() / 1000
    } else {
      delete params.time_type
    }

    params.size = vm.page.size
    params.from = vm.page.no ? (vm.page.no - 1) * vm.page.size : 0

    $http.get('/order_income', { params: params })
      .success(function (data) {
        vm.orderIncomeData = data
        vm.page.total = data.page.total_page * data.page.size
      })
  }
}