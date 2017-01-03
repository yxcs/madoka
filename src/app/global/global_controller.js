angular.module('koala.global')
  .factory('globalSearch', ['$http', function ($http) {
    return {
      records: function (params) {
        return $http
          .get('/es/records', { params: params })
          .then(function (response) {
            return response.data
          })
      },
      search: function (word) {
        return $http
          .get('/es/search', { params: { query: word } })
          .then(function (response) {
            return response.data
          })
      },
      getLength: function (val) {
        var needLen = 0
        if (/^[0-9]/.test(val)) {
          needLen = 5
        } else if (/^[\u0391-\uffe5]/.test(val)) {
          needLen = 2
        } else {
          needLen = 3
        }
        if (val && val.length >= needLen) {
          return true
        }
        return false
      },
    }
  }])
  .controller('sidebar', ['$http', '$rootScope', '$scope', '$stateParams',
    function ($http, $rootScope, $scope, $stateParams) {

    }
  ])
  .controller('searchCtrl', ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$q', 'globalSearch', 'branchCompany',
    function ($http, $rootScope, $scope, $state, $stateParams, $q, globalSearch, branchCompany) {

      $scope.search = search
      $scope.isDisabled = true
      $scope.isForbidden = false
      $scope.page_num_to_go = 1
      $scope.refresh = refresh
      $scope.params = {
        query: '',
        from: 0,
        size: 20
      }

      activate()

      $scope.clientType = {
        pri_potential_other: '私海 · 潜在客户',
        pri_registered_other: '私海 · 注册客户',
        pub_potential: '公海 · 潜在客户',
        pub_registered: '公海 · 注册客户',
        pri_potential_mine: '私海 · 潜在客户',
        pri_registered_mine: '私海 · 注册客户',
        conflict: '冲突客户'
      }

      $scope.regions = [
        { key: '1', value: '华北地区' },
        { key: '2', value: '华东地区' },
        { key: '3', value: '华南地区' },
        { key: '4', value: '港澳台地区' },
        { key: '6', value: '海外地区' },
        { key: '-1', value: '未知区域' }
      ]

      function activate() {
        $scope.params.query = $stateParams.q
        $scope.params.company = $stateParams.company
        $scope.params.user_id = $stateParams.user
        $scope.params.region_id = $stateParams.region
        $scope.params.account_type = $stateParams.account_type
        $scope.params.call_type = $stateParams.call_type
        $scope.params.registered = $stateParams.registered
        branchCompany.getDefaultPromise.then(function (result) {
          $scope.sellers = result.defaultSellers
          $scope.companys = result.companys
          $scope.defaultUserLabel = result.defaultUserLabel
        })
        records($scope.params)
      }

      $scope.orderConflict = function (client) {
        return client.type === 'conflict' ? 0 : 1
      }

      $scope.$watch('params.query', function (val, old_val) {
        if (!globalSearch.getLength(val)) {
          $scope.isDisabled = true
          return
        }
        $scope.isDisabled = false
      })

      $scope.$watchGroup([
        'params.company',
        'params.user_id',
        'params.region_id',
        'params.user_id',
        'params.account_type',
        'params.call_type',
        'params.registered',
      ], function (val, old_val) {
        if (val[0] !== old_val[0]) {
          $scope.sellers = branchCompany.getSellers($scope.params.company)
        }
        if (val !== old_val) {
          records($scope.params)
        }
      })

      function search() {
        $state.go('global.search', {
          q: $scope.params.query,
          company: $scope.params.company,
          user: $scope.params.user_id,
          region: $scope.params.region_id,
          account_type: $scope.params.account_type,
          call_type: $scope.params.call_type,
          registered: $scope.params.registered,
        })
      }

      $scope.$watch('page_num_to_go', function (val, old_val) {
        if (val === old_val) return
        $scope.params.from = $scope.page.size * (val - 1 || 0)
        records($scope.params)
      })

      function refresh() {
        $state.go('global.search', {
          q: $scope.params.query,
          company: null,
          user: null,
          region: null,
          account_type: null,
          call_type: null,
          registered: null,
        }, { reload: true })
      }

      function records(params) {
        return globalSearch
          .records(params)
          .then(function (result) {
            $scope.clients = result.cliens
            $scope.page = result.page
            $scope.totalItems = result.page.size * result.page.total_page
            $scope.resultTotal = result.total;
          })
      }
    }
  ])
  .controller('navCtrl', ['$http', '$cookies', '$modal', '$rootScope', '$scope', '$state', 'globalSearch', '$timeout',
    function ($http, $cookies, $modal, $rootScope, $scope, $state, globalSearch, $timeout) {
      $scope.search = {
        keyword: ''
      }
      $scope.isDisabled = true
      $scope.referral = function () {
        var modalInstance = $modal.open({
          templateUrl: 'app/global/views/_modal_get_referral.html',
          controller: '_modalGetLinkCtrl',
          resolve: {
            link: function () {
              return 'https://console.upyun.com/#/register/?referral=' + $rootScope.self.info.user_id;
            }
          }
        });

        modalInstance.result.then(function () {
        });
      };

      $scope.logout = function () {
        $http.get('/user/logout').success(function (data) {
          localStorage.clear()
          $cookies.remove('uuid')
          $cookies.remove('self_info')
          $cookies.remove('token')
          window.location.href = 'logout.html';
        });
      };

      $scope.swtfyw = function (word) {
        $state.go('global.search', { q: word });
      };

      $scope.reload = function () {
        $state.reload();
      };

      $scope.orderClient = function (client) {
        return client.account_name ? 1 : 0
      }

      $scope.goDetail = function (client) {
        if (client.account_name) {
          $state.go('clients.personal.detail.info', { account_name: client.account_name })
        } else {
          $state.go('clients.potential_detail', { id: client.client_id })
        }
      }

      $scope.searchThrottle = _.debounce(searchClient, 300)

      function searchClient(val) {

        $scope.searchResult = null

        if (!globalSearch.getLength($scope.search.keyword)) {
          $scope.searchResult = null
          $scope.isDisabled = true
          return
        }
        $scope.isDisabled = false

        return globalSearch
          .search(val)
          .then(function (result) {
            $scope.searchResult = result
            return result
          })
      }
    }
  ])
  .controller('_modalGetLinkCtrl', ['$http', '$modalInstance', '$rootScope', '$scope', 'link',
    function ($http, $modalInstance, $rootScope, $scope, link) {

      $scope.link = link;

      $scope.skip = function () {
        $modalInstance.close('cancel');
      };

    }
  ])
  .controller('indivSettingsCtrl', ['$http', '$scope', '$state', '$rootScope', 'stroage', '$window',
    function($http, $scope, $state, $rootScope, stroage, $window) {
      var vm = this

      vm.mess = {}
      vm.submitMess = submitMess
      vm.reset = reset
      vm.params = stroage.getItem()

      activate()

      function activate() {
        getMessage()
      }

      function getMessage() {

        _.forEach(vm.params, function(item) {
          if(item.user_id === $rootScope.self.info.user_id) {
            vm.checkMessage = item
          }
        })

      }

      function submitMess() {
        var data = _.map(vm.params, function(item) {
                    if(item.user_id === vm.checkMessage.user_id) {
                      item = vm.checkMessage
                    }
                  return item
                })
        stroage.setItem(data)
        $rootScope.notify('success', '通知设置修改成功')
      }

      function reset() {
        $window.history.back()
      }
    }

  ])

