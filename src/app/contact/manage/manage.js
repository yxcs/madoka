; (function () {
  'use strict'

  angular
    .module('koala.contact')
    .controller('Manage', Manage)
    .controller('ManageNew', ManageNew)

  function Manage($http, $location, $modal, $rootScope, $scope, $state, $stateParams) {

    $scope.params = {
      key_type: 'username',
      is_potential: 0
    };

    if ($stateParams.name) {
      $scope.params = {
        key_type: 'name',
        is_potential: 1,
        key: $stateParams.name
      };
    }
    if ($stateParams.account_name) {
      $scope.params = {
        key_type: 'username',
        is_potential: 0,
        key: $stateParams.account_name
      };
    }

    $scope.daterange = { startDate: null, endDate: null };

    $scope.fetchContacts = function () {
      // covert time to timestamp
      $scope.params.date_gt = parseInt(new Date($scope.daterange.startDate).getTime() / 1000) || null;
      $scope.params.date_lt = parseInt(new Date($scope.daterange.endDate).getTime() / 1000) || null;
      $scope.params.limit = 20;

      $http.get('/client/contact', { params: $scope.params }).success(function (data) {
        $scope.contacts = data.result;
      });
    };

    $scope.delContact = function (contact) {
      var modalInstance = $modal.open({
        templateUrl: 'app/widgets/template/_modal_contact_delete.html',
        controller: '_modalContactDelCtrl',
        resolve: {
          contact: function () {
            return contact;
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.fetchContacts();
      });
    };

    $scope.editContact = function (contact) {
      var modalInstance = $modal.open({
        templateUrl: 'app/widgets/template/_modal_contact.html',
        controller: '_modalContactCtrl',
        resolve: {
          contact: function () {
            return contact;
          }
        }
      });

      modalInstance.result.then(function () {

      });
    };

    $scope.goClientDetail = function (account_name) {
      $state.go('clients.registed_detail', { id: account_name });
    };

    $scope.prev = function () {
      if (!$scope.contacts.page.since) return;
      $scope.params.since = $scope.contacts.page.since;
      $scope.params.max = null;
      $scope.fetchContacts();
    };

    $scope.next = function () {
      if (!$scope.contacts.page.max) return;
      $scope.params.since = null;
      $scope.params.max = $scope.contacts.page.max;
      $scope.fetchContacts();
    };

    $scope.refresh = function () {
      $scope.daterange = { startDate: null, endDate: null };

      $scope.params = {
        key_type: 'username',
        is_potential: 0
      };
      $scope.fetchContacts();
    };

    $scope.fetchContacts();
  }


  function ManageNew($filter, $http, $modal, $scope, $state, $stateParams) {

    $scope.contact = {};
    
      
    
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      $scope.stateInfo = {
        event: event,
        toState: toState,
        toParams: toParams,
        fromParams: fromParams,
        fromState: fromState
      };
      if ($stateParams.account_id !== void 0) {
           $http.get('/clients/client/registed', { params: { account_id: $stateParams.account_id } }).success(function (data) {
            $scope.contact.is_potential = 0;
            $scope.contact.client_name = data.name;
            $scope.contact.client_id = data.client_id;
            $scope.contact.sale_id = data.user_id;
            $scope.contact.upyun_account = data.account.account_name;
            $scope.contact.created_by = $scope.self.info.user_id;
          });
      }else if ($scope.stateInfo.fromParams && $scope.stateInfo.fromParams.id && $scope.stateInfo.fromState.name) {
        if ($scope.stateInfo.fromState.name.indexOf('potential') >= 0) {
          $http.get('/clients/client/potential', {
            params: {
              client_id: $scope.stateInfo.fromParams.id
            }
          }).success(function (data) {
            $scope.contact.is_potential = 1;
            $scope.contact.client_name = data.name;
            $scope.contact.client_id = data.client_id;
            $scope.contact.sale_id = data.user_id;
            $scope.contact.created_by = $scope.self.info.user_id;
          });
        } else {
          $http.get('/clients/client/registed', { params: { account_id: $scope.stateInfo.fromParams.id } }).success(function (data) {
            $scope.contact.is_potential = 0;
            $scope.contact.client_name = data.name;
            $scope.contact.client_id = data.client_id;
            $scope.contact.sale_id = data.user_id;
            $scope.contact.upyun_account = data.account.account_name;
            $scope.contact.created_by = $scope.self.info.user_id;
          });
        }
      }

    });

    // seems needless
    $scope.searchClient = function () {
      var modalInstance = $modal.open({
        templateUrl: 'app/widgets/template/clientSearchModalView.html',
        controller: 'ClientSearchModal',
        resolve: {
          type: function () {
            return 'both';
          }
        }
      });

      modalInstance.result.then(function (client) {
        if (client.account_name) {
          $scope.contact.is_potential = 0;
        } else {
          $scope.contact.is_potential = 1;
        }

        $scope.contact.client_name = client.name;
        $scope.contact.client_id = client.client_id;
        $scope.contact.sale_id = client.sell_id;
        $scope.contact.upyun_account = client.account_name;
        $scope.contact.created_by = $scope.self.info.user_id;
      });
    };


    $scope.submit = function () {
      $scope.contact.birthday = $filter('date')(new Date($scope.contact.birthday), 'yyyy-MM-dd');
      $http.put('/client/contact', $scope.contact).success(function (data) {
        $state.go('^');
      });
    };

    $scope.cancel = function () {
      $state.go('^');
    };
  }

})()




