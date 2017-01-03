; (function () {
  'use strict'

  angular.
    module('koala.business')
    .controller('OrdersList', OrdersList)
    .controller('OrdersSync', OrdersSync)
    .controller('OrdersRefund', OrdersRefund)
    .controller('OrdersView', OrdersView)
    .controller('OrdersComfirm', OrdersComfirm)
    .controller('OrdersCancel', OrdersCancel)

  function OrdersList($http, $location, $modal, $rootScope, $scope, $state, $stateParams) {

    $scope.daterange = { startDate: null, endDate: null };

    $scope.time_types = [
      { name: '下单时间', type: 'create_time' },
      { name: '付款时间', type: 'pay_time' }
    ];

    $scope.time_type = $scope.time_types[0].type

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if ($stateParams.account_name) {
        $scope.params = {
          key_type: 'username',
          key: toParams.account_name
        };
      } else {
        $scope.params = {
          key_type: 'order_number'
        };
      }

      lazyfetch('page');

    });


    $scope.fetchOrders = function (type) {
      if (type !== 'page') {
        delete $scope.params.max
        delete $scope.params.since
      }
      $scope.params.time_type = $scope.time_type
      $scope.params.start = parseInt(new Date($scope.daterange.startDate).getTime() / 1000) || null;
      $scope.params.end = parseInt(new Date($scope.daterange.endDate).getTime() / 1000) || null;
      if ($scope.params.start == null && $scope.params.end == null) {
        delete $scope.params.time_type
      }
      $http.get('/orders', { params: $scope.params }).success(function (data) {
        $scope.ordersData = data;
      });
    };

    var lazyfetch = _.debounce($scope.fetchOrders, 10)

    $scope.confirm = function (order) {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/orders/orders-confirm.html',
        controller: 'OrdersComfirm',
        resolve: {
          order: function () {
            return order;
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.fetchOrders();
      });
    };

    $scope.cancel = function (order) {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/orders/orders-cancel.html',
        controller: 'OrdersCancel',
        resolve: {
          order: function () {
            return order;
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.fetchOrders();
      });
    };

    $scope.view = function (order) {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/orders/orders-view.html',
        controller: 'OrdersView',
        resolve: {
          order: function () {
            return order;
          }
        }
      });

      modalInstance.result.then(function () {

      });
    };

    $scope.refund = function (order) {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/orders/orders-refund.html',
        controller: 'OrdersRefund',
        resolve: {
          order: function () {
            return order;
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.fetchOrders();
      });
    };

    $scope.sync = function (order) {
      $http.post('/orders/order/sync', { order_number: order.order_number }).success(function (data) {
        $scope.fetchOrders();
      });
    };

    $scope.prev = function () {
      if (!$scope.ordersData.page.since) return;
      $scope.params.since = $scope.ordersData.page.since;
      $scope.params.max = null;
      $scope.fetchOrders('page');
    };

    $scope.next = function () {
      if (!$scope.ordersData.page.max) return;
      $scope.params.since = null;
      $scope.params.max = $scope.ordersData.page.max;
      $scope.fetchOrders('page');
    };

    $scope.refresh = function () {
      $scope.daterange = { startDate: null, endDate: null };
      $scope.params = {
        key_type: 'order_number'
      };
      $scope.fetchOrders();
    };
  }


  function OrdersSync($http, $modalInstance, $scope) {
    $scope.submit = function () {
      $http.post('/orders/order/sync', { order_number: $scope.order.order_number }).success(function (data) {
        if (data.result === true) {
          $modalInstance.close('fin');
        }
      });
    };
    $scope.skip = function () {
      $modalInstance.close('cancel');
    };
  }

  function OrdersRefund($http, $modalInstance, $scope, order) {

    $http.get('/orders/order', { params: { order_number: order.order_number } }).success(function (data) {
      $scope.order = data;
    });


    $scope.submit = function () {
      var data = {
        operation: 'refund',
        order_number: order.order_number,
        remark: $scope.order.remark
      };

      $http.post('/orders/order', data).success(function (data) {
        if (data.result === true) {
          $modalInstance.close('fin');
        }
      });
    };

    $scope.skip = function () {
      $modalInstance.close('cancel');
    };
  }


  function OrdersComfirm($http, $modalInstance, $scope, order) {
    $scope.order = order;
    $scope.submit = function () {
      var data = {
        operation: 'sure',
        order_number: order.order_number,
        pay_type: $scope.order.pay_type,
        remark: $scope.order.remark
      };

      $http.post('/orders/order', data).success(function (data) {
        if (data.result === true) {
          $modalInstance.close('fin');
        }
      });
    };

    $scope.skip = function () {
      $modalInstance.close('cancel');
    };

  }


  function OrdersCancel($http, $modalInstance, $scope, order) {

    $scope.order = order;

    $scope.submit = function () {
      var data = {
        operation: 'deny',
        order_number: order.order_number,
        remark: $scope.order.remark
      };

      $http.post('/orders/order', data).success(function (data) {
        if (data.result === true) {
          $modalInstance.close('fin');
        }
      });
    };

    $scope.skip = function () {
      $modalInstance.close('cancel');
    };

  }


  function OrdersView($http, $modalInstance, $scope, order) {

    $http.get('/orders/order', { params: { order_number: order.order_number } }).success(function (data) {
      $scope.order = data;
    });


    $scope.skip = function () {
      $modalInstance.close('cancel');
    };

  }

})()
