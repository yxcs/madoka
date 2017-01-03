angular.module('koala.datahub')
  .controller('Orderdata', Orderdata)

function Orderdata($scope, $http, $q) {
  var vm = this
  vm.fetchOrderData = fetchOrderData
  vm.refresh = refresh
  vm.updateView = updateView

  vm.filter_fields = {
    reality_money: '实付金额',
    deal_count: '成交次数'
  }
  vm.buy_types = {
    first_year: '首年',
    second_year: '次年'
  }
  vm.regions = [
    { key: '1', value: '华北地区' },
    { key: '2', value: '华东地区' },
    { key: '3', value: '华南地区' },
    { key: '4', value: '港澳台地区' },
    { key: '6', value: '海外地区' },
    { key: '-1', value: '未知区域' }
  ]
  vm.all_buy_types = {
    first_year: '首年购买',
    second_year: '次年购买',
    no_buy: '没有购买',
    reset: '重置',
  }
  vm.call_types = ['call_in', 'call_out']
  vm.dateOptionForMonth = {
    minMode: 'month'
  }
  vm.params = {
    key_type: 'username',
    filter_field: 'reality_money'
  }
  vm.params.month = moment().subtract(1, 'months').format("YYYY-MM")

  activate()

  function activate() {
    $scope.initPromise.then(function () {
      getSellersAndCompany().then(function () {
        if ($scope.self.rights_check['7_read_all_client']) {
          vm.defaultUser = "所有销售"
          vm.defaultUserMap = $scope.sellers
        } else if ($scope.self.rights_check['7_read_my_subordinate_client']) {
          vm.defaultUser = "下属销售"
          if (vm.company === 'BEIJING') {
            vm.defaultUserMap = vm.beijingSellers
          } else if (vm.company === 'SHANGHAI') {
            vm.defaultUserMap = vm.shanghaiSellers
          } else if (vm.company === 'HOMELESS') {
            vm.defaultUserMap = vm.homelessSellers
          } else {
            vm.defaultUserMap = $scope.sellers
          }
        } else if ($scope.self.rights_check['7_read_my_client']) {
          vm.defaultUser = "当前用户"
          vm.defaultUserMap = $scope.sellers.filter(function (v) {
            return v.name === $scope.self.info.name
          })
        } else {
          vm.defaultUser = "没有查看权限"
        }
        vm.sellers = vm.defaultUserMap
        updateView('user')
      })
    })
    fetchOrderData()
  }

  function getSellersAndCompany() {
    var getBEIJING,
      getSHANGHAI,
      getHOMELESS

    var deferred = $q.defer();

    getBEIJING = $http.get('/users/sellers', { params: { company: 'BEIJING' } })
      .success(function (data) {
        vm.beijingSellers = data
      })
    getSHANGHAI = $http.get('/users/sellers', { params: { company: 'SHANGHAI' } })
      .success(function (data) {
        vm.shanghaiSellers = data
      })
    getHOMELESS = $http.get('/users/sellers', { params: { company: 'HOMELESS' } })
      .success(function (data) {
        vm.homelessSellers = data
      })

    $q.all([getBEIJING, getSHANGHAI, getHOMELESS]).then(function () {
      if (_.pluck(vm.beijingSellers, "user_id").indexOf($scope.self.info.user_id) > -1) {
        vm.company = 'BEIJING'
        deferred.resolve()
      } else if (_.pluck(vm.shanghaiSellers, "user_id").indexOf($scope.self.info.user_id) > -1) {
        vm.company = 'SHANGHAI'
        deferred.resolve()
      } else if (_.pluck(vm.homelessSellers, "user_id").indexOf($scope.self.info.user_id) > -1) {
        vm.company = 'HOMELESS'
        deferred.resolve()
      } else {
        vm.company = ''
        deferred.resolve()
      }
    })

    return deferred.promise
  }

  function updateView(type) {
    if (type === 'company') {
      if (vm.params.company === 'BEIJING') {
        vm.sellers = vm.beijingSellers
      } else if (vm.params.company === 'SHANGHAI') {
        vm.sellers = vm.shanghaiSellers
      } else if (vm.params.company === 'HOMELESS') {
        vm.sellers = vm.homelessSellers
      } else {
        vm.sellers = vm.defaultUserMap
      }
    }
    else if (type === 'user') {
      if (_.pluck(vm.beijingSellers, "user_id").indexOf(vm.params.user_id) > -1) {
        vm.companys = [{ type: 'BEIJING', name: '北京公司' }]
      } else if (_.pluck(vm.shanghaiSellers, "user_id").indexOf(vm.params.user_id) > -1) {
        vm.companys = [{ type: 'SHANGHAI', name: '上海公司' }]
      } else if (_.pluck(vm.homelessSellers, "user_id").indexOf(vm.params.user_id) > -1) {
        vm.companys = [{ type: 'HOMELESS', name: '无所属公司' }]
      } else {
        vm.companys = [
          { type: 'BEIJING', name: '北京公司' },
          { type: 'SHANGHAI', name: '上海公司' },
          { type: 'HOMELESS', name: '无所属公司' }
        ]
      }
    }
  }

  function fetchOrderData(op) {
    var params = _.clone(vm.params)
    if (!params.month) { $scope.notify('danger', '请填写月份'); return }
    params.month = _.isDate(params.month) ? moment(params.month).format("YYYYMM") : params.month.replace('-', '')
    if (!params.key) { delete params.key_type }
    if (!params.min && !params.max) {
      delete params.filter_field
    }

    $http.get('/datahub/orders', { params: params })
      .success(function (data) {
        vm.orderData = data
        vm.orderData.page_statistics = {
          order_count: 0,
          deal_count: 0,
          order_money: 0,
          reality_money: 0,
        }
        data.clients.forEach(function (client) {
          vm.orderData.page_statistics.order_count += _.isNumber(client.order_count) ? client.order_count : parseInt(client.order_count)
          vm.orderData.page_statistics.deal_count += _.isNumber(client.deal_count) ? client.deal_count : parseInt(client.deal_count)
          vm.orderData.page_statistics.order_money += _.isNumber(client.order_money) ? client.order_money : parseFloat(client.order_money)
          vm.orderData.page_statistics.reality_money += _.isNumber(client.reality_money) ? client.reality_money : parseFloat(client.reality_money)
        })
      })
  }

  function refresh() {
    vm.params = {
      key_type: 'username',
      filter_field: 'reality_money'
    }
    vm.params.month = moment().subtract(1, 'months').format("YYYY-MM")
    vm.sellers = vm.defaultUserMap
    updateView('user')
    fetchOrderData('refresh')
  }
}
