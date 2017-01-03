; (function () {
  'use strict'

  angular
    .module('koala.finance')
    .controller('Refunds', Refunds)
    .controller('RefundsCreate', RefundsCreate)
    .controller('RefundsDetail', RefundsDetail)
    .controller('RefundsDelete', RefundsDelete)
    .controller('RefundsEdit', RefundsEdit)

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function Refunds(common, $state, $modal, $scope, $http, $q, autosave, branchCompany) {
    var vm = this
    var refunds = common.$resource('/refunds')

    var autosaveData = autosave.getItem() || {}

    vm.params = autosaveData.params || { key: 'username', status: 'INIT', }
    vm.tabactive = autosaveData.tabactive || [true, false, false]
    if (autosaveData.dateRange) {
      vm.dateRange = _.mapValues(autosaveData.dateRange, function (v) {
        return v ? moment(v) : null
      })
    } else {
      vm.dateRange = { startDate: moment().subtract(7, 'days').startOf('days'), endDate: moment().add(1, 'months').endOf('days') }
    }

    vm.refresh = refresh
    vm.prev = prev
    vm.next = next

    vm.editRefund = editRefund
    vm.deleteRefund = deleteRefund

    vm.currentState = {
      tableState: []
    }
    vm.refundStatus = { INIT: '未处理', DONE: '已处理', CANCEL: '已取消' }
    vm.regions = [{ key: '1', value: '华北地区' }, { key: '2', value: '华东地区' }, { key: '3', value: '华南地区' }, { key: '4', value: '港澳台地区' }, { key: '6', value: '海外地区' }, { key: '-1', value: '未知区域' }]

    vm.fetchRefunds = fetchRefunds
    activate()

    $scope.$watch('vm.params.company', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.sellers =  branchCompany.getSellers(vm.params.company)
        vm.fetchRefunds()
      }
    })

    $scope.$watch('vm.params.user_id', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.fetchRefunds()
      }
    })

    function activate() {
      branchCompany.getDefaultPromise.then(function(result) {
        vm.sellers = result.defaultSellers
        vm.companys = result.companys
        vm.defaultUserLabel = result.defaultUserLabel
      })
      fetchRefunds()
    }

    function fetchRefunds(type) {
      saveData()
      vm.currentState = {
        tableState: []
      }

      var params = _.clone(vm.params)

      if (type != 'page') {
        delete params.since
        delete params.max
      }

      if (!params.value) { delete params.key }
      if (!params.key) { delete params.value }

      params.start_time = vm.dateRange.startDate && vm.dateRange.startDate.format('X')
      params.end_time = vm.dateRange.endDate && vm.dateRange.endDate.format('X')

      refunds.get(params, function (data) {
        vm.refundData = data
      })
    }

    function prev() {
      if (!vm.refundData.page.since) return
      vm.params.since = vm.refundData.page.since
      vm.params.max = null
      vm.fetchRefunds('page')
    }

    function next() {
      if (!vm.refundData.page.max) return
      vm.params.since = null
      vm.params.max = vm.refundData.page.max
      vm.fetchRefunds('page')
    }

    function refresh() {
      autosave.removeItem()
      $state.reload()
    }

    function editRefund(refund_id) {
      $modal
        .open({
          templateUrl: 'app/finance/refunds/refunds-edit.html',
          controller: 'RefundsEdit as vm',
          resolve: {
            id: function () {
              return refund_id
            }
          }
        })
        .result.then(function (result) {
          if (result === 'fin') {
            $state.reload()
          }
        })
    }

    function deleteRefund(refund_id) {
      $modal
        .open({
          templateUrl: 'app/finance/refunds/refunds-delete.html',
          controller: 'RefundsDelete as vm',
          resolve: {
            id: function () {
              return refund_id
            }
          }
        })
        .result.then(function (result) {
          if (result === 'fin') {
            $state.reload()
          }
        })
    }

    function saveData() {
      setTimeout(function() {
        autosave.setItem({
          params: vm.params,
          dateRange: _.mapValues(vm.dateRange, function (v) {
            return moment.isMoment(v) ? moment(v).valueOf() : ''
          }),
          tabactive: vm.tabactive,
          page_num_to_go: vm.page_num_to_go
        })
      })
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function RefundsCreate(common, $scope, $modal, $state) {
    var vm = this
    var refundCreate = common.$resource('/refund', '', { create: { method: 'PUT' } })

    vm.params = {}
    vm.searchClient = searchClient
    vm.postRefunds = postRefunds
    vm.client = {}

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
      });

      modalInstance.result.then(function (client) {
        vm.params.account_name = client.account_name
        vm.client.name = client.name
        vm.client.sell_name = client.sell_name
        vm.client.balance = client.balance
        vm.client.refundable = client.refundable
      })
    }

    function postRefunds() {
      var params = vm.params
      refundCreate.create(params, function (data) {
        if (data.result) {
          $state.go('finance.refunds')
        } else {
          $scope.notify('danger', '不知道是什么错=.=')
        }
      }, function () {
        console.log('出错了')
      })
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function RefundsDetail(common, $stateParams) {
    var vm = this
    vm.getRefundsDetail = getRefundsDetail


    activate()

    function activate() {
      getRefundsDetail()
    }

    function getRefundsDetail() {
      return common.rest.one("refund").get({ id: $stateParams.id })
    }

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function RefundsDelete(common, id, $modalInstance, $scope) {
    var vm = this
    var refundDelete = common.$resource('/refund/opt', '', { delete: { method: 'POST' } })

    vm.id = id
    vm.skip = skip
    vm.submit = submit

    function submit() {
      refundDelete.delete({ opt_type: 'DELETE', refund_id: id }, function () {
        $modalInstance.close('fin');
      }, function () {
        $scope.notify('danger', '居然会有错！')
      })
    }

    function skip() {
      $modalInstance.close('cancel')
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function RefundsEdit(common, id, $modalInstance, $scope) {
    var vm = this
    var refundDelete = common.$resource('/refund/opt', '', { cancel: { method: 'POST' }, save: { method: 'POST' } })

    vm.id = id
    vm.skip = skip
    vm.submit = submit

    activate()

    function activate() {
      vm.opt_type = 'SURE'
    }

    function submit() {
      if (!vm.remark) {
        $scope.notify('danger', '说明不能为空')
        return
      }
      if (vm.opt_type === "SURE") {
        refundDelete.save({ opt_type: 'SURE', refund_id: id, remark: vm.remark }, function () {
          $modalInstance.close('fin');
        }, function () {
          $scope.notify('danger', '居然会有错！')
        })
      } else if (vm.opt_type === 'CANCEL') {
        refundDelete.cancel({ opt_type: 'CANCEL', refund_id: id, remark: vm.remark }, function () {
          $modalInstance.close('fin');
        }, function () {
          $scope.notify('danger', '居然会有错！')
        })
      }
    }

    function skip() {
      $modalInstance.close('cancel')
    }
  }
})()
