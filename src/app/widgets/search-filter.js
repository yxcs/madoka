;
(function () {
  'use strict';

  angular
    .module('koala.widgets')
    .directive('searchFilter', searchFilter);

  function searchFilter(common, $q, $http, $timeout, $rootScope) {

    var directive = {
      link: link,
      restrict: 'E',
      templateUrl: 'app/widgets/search-filter.tpl.html',
      scope: {
        label: '@',
        options: '=',
        onClick: '&onClick',
        search: '=ngModel',
        searchType: '=searchType'
      },
    }

    return directive

    function link($scope, element, attr) {
      var DEFAULT_LABEL = '搜索'
      var DEFAULT_RANGE = ['pri_potential_mine', 'pub_potential', 'pri_potential_other', 'pub_registered', 'pri_registered_mine', 'pri_registered_other']
      var DEFAULT_RANGE_P = ['pub_potential', 'pri_potential_mine', 'pri_potential_other']
      var DEFAULT_RANGE_PUBLIC_P = ['pub_potential']
      var DEFAULT_RANGE_PUBLIC_R = ['pub_registered']
      var DEFAULT_RANGE_R = ['pub_registered', 'pri_registered_mine', 'pri_registered_other']

      var rangeMap = {
        all: DEFAULT_RANGE,
        potential: DEFAULT_RANGE_P,
        registered: DEFAULT_RANGE_R,
        none: [],
      }
      $scope.getPreSearch = getPreSearch
      $scope.datas = ''
      $scope.show = show
      $scope.clickSearch = clickSearch
      $scope.searchOnClick = searchOnClick

      init()

      function init() {
        $scope.label = $scope.label || DEFAULT_LABEL
        $scope.options = $scope.options || {}
        $scope.range = DEFAULT_RANGE_R
        $scope.defaultParams = {}
        $rootScope.initPromise.then(function() {
          if (!$rootScope.self.rights_check['1_get_private_latent_clients'] && !$rootScope.self.rights_check['1_get_latent_client_detail']) {
            $scope.defaultParams.registered = 1
          }
          if (!$rootScope.self.rights_check['1_get_register_client_detail'] && !$rootScope.self.rights_check['1_get_private_register_clients']) {
            $scope.defaultParams.registered = 0
          }
          if (!$rootScope.self.rights_check['1_get_register_client_detail'] && !$rootScope.self.rights_check['1_get_private_latent_clients']) {
            $scope.defaultParams.user_id = self.info.user_id
          }
        })
        if ($scope.options.range) {
          $scope.range = rangeMap[$scope.options.range]
        }
      }

      function show(account_name) {
        $scope.search = account_name
      }

      function searchOnClick() {
        $scope.closeTip = true
        if ($scope.options.range === 'potential') {
          $scope.searchType = 'name'
        } else {
          $scope.searchType = 'username'
        }
        if ($scope.options.extraKeyType && $scope.options.extraKeyType.length && /\d{15,25}/.test($scope.search)) {
          $scope.searchType = $scope.options.extraKeyType[0]
        }
        $timeout(function () { $scope.onClick() })
      }

      function clickSearch(name, accountName) {
        if (!accountName) {
          $scope.search = name
          $scope.searchType = 'name'
        } else {
          $scope.search = accountName
          $scope.searchType = 'username'
        }

        $timeout(function () { $scope.onClick() })
      }

      function getPreSearch() {
        $scope.closeTip = false
        if ($scope.options.range === 'none') return
        if (!$scope.search) return
        if ($scope.options.extraKeyType && $scope.options.extraKeyType.length) {
          if (/\d{15,25}/.test($scope.search)) {
            return
          }
        }
        $scope.datas = ''
        var params = { "query": $scope.search }
        pre(params)
          .then(function (result) {
            $scope.datas = result.cliens.filter(function (data) {
              return $scope.range.indexOf(data.type) > -1
            })
          })
      }

      function pre(params) {
        var thisParams = _.assign({}, $scope.defaultParams, params)
        return $http.get('/es/records', { params: thisParams }).then(function (response) { return response.data })
      }

    }

  }
})()