; (function () {
  'use strict'

  angular
    .module('koala.contact')
    .controller('RecordsList', RecordsList)
    .controller('RecordsNew', RecordsNew)
    .controller('RecordsDetail', RecordsDetail)


  function RecordsList($http, $location, $modal, $rootScope, $scope, $state, $stateParams) {
    $scope.params = {
      key_type: 'username'
    };

    if ($stateParams.name) {
      if ($stateParams.account_name) {
        $scope.params = {
          key_type: 'username',
          key: $stateParams.account_name
        }
      } else if ($stateParams.name) {
        $scope.params = {
          key_type: 'name',
          key: $stateParams.name
        }
      }
    }

    $scope.daterange = { startDate: null, endDate: null };

    $scope.getRecords = function (key_type, key) {
      var params = angular.copy($scope.params);

      if (key_type && key) {
        params.key_type = key_type;
        params.key = key;
      }

      params.contact_date_gt = parseInt(new Date($scope.daterange.startDate).getTime() / 1000) || null;
      params.contact_date_lt = parseInt(new Date($scope.daterange.endDate).getTime() / 1000) || null;
      params.limit = 20;

      delete params.since
      delete params.max

      $http.get('/client/contact_record', { params: params }).success(function (data) {
        $scope.records = data.result;
      });
    };

    $scope.getRecordsForPage = function (key_type, key) {
      var params = angular.copy($scope.params);
      if (key_type && key) {
        params.key_type = key_type;
        params.key = key;
      }
      params.contact_date_gt = parseInt(new Date($scope.daterange.startDate).getTime() / 1000) || null;
      params.contact_date_lt = parseInt(new Date($scope.daterange.endDate).getTime() / 1000) || null;
      params.limit = 20;
      $http.get('/client/contact_record', { params: params }).success(function (data) {
        $scope.records = data.result;
      });
    };



    $scope.viewDetail = function (record) {
      var modalInstance = $modal.open({
        templateUrl: 'app/contact/records/records-detail.html',
        controller: 'RecordsDetail',
        size: 'lg',
        resolve: {
          record: function () {
            return record;
          }
        }
      });

      modalInstance.result.then(function () {

      });
    };

    $scope.prev = function () {
      if (!$scope.records.page.since) return;
      $scope.params.since = $scope.records.page.since;
      $scope.params.max = null;
      $scope.getRecordsForPage();
    };

    $scope.next = function () {
      if (!$scope.records.page.max) return;
      $scope.params.since = null;
      $scope.params.max = $scope.records.page.max;
      $scope.getRecordsForPage();
    };

    $scope.refresh = function () {
      $state.reload()
    };

    $scope.getRecordsForPage()

  }

  function RecordsNew($http, $modal, $scope, $state, $stateParams) {
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      $scope.stateInfo = {
        event: event,
        toState: toState,
        toParams: toParams,
        fromParams: fromParams,
        fromState: fromState
      }
    })
    $scope.record = {
      sale_id: $scope.self.info.user_id,
      sale_name: $scope.self.info.name
    };

    if ($stateParams.client_name !== void 0) {
      $scope.record.client_name = $stateParams.client_name
      if ($stateParams.upyun_account) {
        $http.get('/clients/registed', {
          params: {
            key_type: 'username',
            key: $stateParams.upyun_account
          }
        }).success(function (data) {
          var client = data.clients[0]
          $scope.record.client_name = client.name;
          $scope.record.client_id = client.client_id;
          $scope.record.sale_id = client.sell_id;
          $scope.record.upyun_account = client.account_name;
          $scope.record.is_potential = 0
          $http.get('/client/contact', { params: { key_type: 'client_id', key: client.client_id } }).success(function (data) {
            $scope.contacts = data.result.data;
          });
        });
      } else {
        $http.get('/clients/potential', {
          params: {
            key_type: 'name',
            key: $stateParams.client_name
          }
        }).success(function (data) {
          var client = data.clients[0]
          $scope.record.client_name = client.name;
          $scope.record.client_id = client.client_id;
          $scope.record.sale_id = client.sell_id;
          $scope.record.upyun_account = client.account_name;
          $scope.record.is_potential = 1
          $http.get('/client/contact', { params: { key_type: 'client_id', key: client.client_id } }).success(function (data) {
            $scope.contacts = data.result.data;
          });
        });
      }
    }

    $scope.searchClient = function () {
      var modalInstance = $modal.open({
        templateUrl: 'app/widgets/template/clientSearchModalView.html',
        controller: 'ClientSearchModal',
        backdrop: 'static',
        resolve: {
          type: function () {
            return 'both';
          }
        }
      });

      modalInstance.result.then(function (client) {
        $scope.record.client_name = client.name;
        $scope.record.client_id = client.client_id;
        $scope.record.sale_id = client.sell_id;
        $scope.record.upyun_account = client.account_name;

        $scope.record.is_potential = client.account_name ? 0 : 1;

        $http.get('/client/contact', { params: { key_type: 'client_id', key: client.client_id } }).success(function (data) {
          $scope.contacts = data.result.data;
        });
      });
    };

    $scope.selectContact = function (contact) {
      $scope.record.contact_id = contact.contact_id;
    };

    $scope.submit = function () {
      $scope.record.next_contact_date = $scope.record.contact_date;
      $http.put('/client/contact_record', $scope.record).success(function (data) {
        if ($scope.stateInfo.fromState.name === '') {
          $state.go('contact.record')
        } else {
          $state.go($scope.stateInfo.fromState, $scope.stateInfo.fromParams)
        }
      });
    };

    $scope.skip = function () {
      if ($scope.stateInfo.fromState.name === '') {
        $state.go('contact.record')
      } else {
        $state.go($scope.stateInfo.fromState, $scope.stateInfo.fromParams)
      }
    }
  }


  function RecordsDetail($http, $modalInstance, $scope, record) {
    $scope.record = record;
    $scope.submit = function () { };
    $scope.skip = function () { $modalInstance.close('cancel'); };
  }

})()