; (function () {

  angular.module('koala.finance')
    .controller('ClientdataList', ClientdataList)

  function ClientdataList($scope, $http) {
    var vm = this
    vm.nADateRange = { startDate: moment().startOf('month'), endDate: moment() }
    vm.nTDateRange = { startDate: moment(), endDate: moment() }
    vm.nADateOption = {
      ranges: {
        '本月': [moment().startOf('month'), moment()],
        '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
        '本季度': [moment().startOf('quarter'), moment()],
        '本年': [moment().startOf('year'), moment()],
      },
      locale: {
        applyLabel: '应用',
        cancelLabel: '取消',
        fromLabel: '从',
        toLabel: '至',
        customRangeLabel: '自定义日期',
        daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
        monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      }
    }
    vm.nTDateOption = {
      singleDatePicker: true,
      locale: vm.nADateOption.locale
    }

    vm.regions = [
      { key: '1', value: '华北地区' },
      { key: '2', value: '华东地区' },
      { key: '3', value: '华南地区' },
      { key: '4', value: '港澳台地区' },
      { key: '6', value: '海外地区' },
    ]

    vm.nAparams = {}

    vm.nTparams = {}

    vm.fetchNewAccount = fetchNewAccount
    vm.fetchTotalAccountData = fetchTotalAccountData

    activate()

    function activate() {
      fetchNewAccount()
      fetchTotalAccountData()
    }

    function fetchNewAccount() {
      var params = _.clone(vm.nAparams)
      params.start_time = vm.nADateRange.startDate && vm.nADateRange.startDate.format('X')
      params.end_time = vm.nADateRange.endDate && vm.nADateRange.endDate.format('X')
      $http.get('/datahub/new_account_statistic', { params: params })
        .success(function (data) {
          vm.newAccountData = data
        })
    }
    function fetchTotalAccountData() {
      var params = _.clone(vm.nTparams)
      params.start_time = 0
      params.end_time = vm.nTDateRange.endDate && vm.nTDateRange.endDate.format('X')
      $http.get('/datahub/total_account_statistic', { params: params })
        .success(function (data) {
          vm.totalAccountData = data
        })
    }
  }

})();
