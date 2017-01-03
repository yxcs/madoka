angular
  .module('koala.widgets')
  .controller('ClientSearchModal', ClientSearchModal)


ClientSearchModal.$inject = ['$http', '$modalInstance', '$scope', 'type']
function ClientSearchModal($http, $modalInstance, $scope, type) {
  $scope.params = {
    key_type: 'username'
  };

  $scope.fetchClients = function() {
    $scope.params.user_id = $scope.params.user_id || $scope.self.info.user_id;

    $scope.params.contact_since = parseInt(new Date($scope.dateStart).getTime() / 1000) || null;
    $scope.params.contact_max = parseInt(new Date($scope.dateEnd).getTime() / 1000) || null;

    $scope.params.limit = 20;

    if (type === 'both' || type === 'contacts') {
      $http.get('/clients/potential', {
        params: $scope.params
      }).success(function(potential) {
        $scope.clients = potential;
        $http.get('/clients/registed', {
          params: $scope.params
        }).success(function(registed) {
          $scope.clients.clients = $scope.clients.clients.concat(registed.clients);
        });
      });
    }

    if (type === 'potential') {
      $http.get('/clients/potential', {
        params: $scope.params
      }).success(function(data) {
        $scope.clients = data;
      });
    } else if (type === 'registed') {
      $http.get('/clients/registed', {
        params: $scope.params
      }).success(function(data) {
        $scope.clients = data;
      });
    }

    if (type === 'allRegisted') {
      var allRegistedParams = _.clone($scope.params)
      //删除userid
      delete allRegistedParams.user_id
      $http.get('/clients/registed', {
        params: allRegistedParams
      }).success(function(registed) {
        $scope.clients = registed;
        $http.get('/clients/registed', {
          params: angular.extend(angular.copy(allRegistedParams), { allotted: false })
        }).success(function(registedInPublic) {
          registedInPublic.clients.forEach(function(client) {
            client.sell_id = ''
            client.sell_name = ''
          })
          $scope.clients.clients = $scope.clients.clients.concat(registedInPublic.clients)
        })
      })
    }
  }

  $scope.assign = function(client) {
    $modalInstance.close(client)
  }

  $scope.skip = function() {
    $modalInstance.close('cancel')
  }
}