; (function () {
  'use strict'

  angular
    .module('koala')
    .run(appInit)
    .run(changeTitle)

  function appInit(common, $cookies, $http, $location, $rootScope, $state, $stateParams, notify, $q, APP_DATA_MAP, ENVAPI, desktopNotify, stroage) {

    activate()

    $rootScope.MAP = APP_DATA_MAP
    $rootScope.app = {};
    $rootScope.self = {};
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.current = {};

    $rootScope.init = init

    $rootScope.notify = function (level, msg) {
      notify({
        message: msg,
        classes: 'alert-' + level,
        templateUrl: 'app/widgets/template/angular-notify.html'
      });
    };

    function activate() {
      $rootScope.initPromise = init()
      desktopNotify.init()
      stroage.setAllItem()
    }

    function init() {
      var getRights = $q.defer()
      var getSellers = $q.defer()

      var getUser = $http.get('/user').success(function (data) {
        $rootScope.self = $rootScope.self || {};
        $rootScope.self.info = data;

        $cookies.self_info = JSON.stringify(data);

        $http.get('/comperence/rights', { params: { user_id: data.user_id } }).success(function (rights) {
          $rootScope.self.rights = rights;
          // for elm display check
          $rootScope.self.rights_check = {};
          rights.forEach(function (itm) {
            $rootScope.self.rights_check[itm] = true;
          });
          getRights.resolve()
        });

        // fetch all sellers
        $http.get('/users/sellers').success(function (data) {
          var filterData = ['合作客户', '特殊客户', '特殊商务支持', '内部测试', '薛嘉懂', '张莉(离职)', '万玉燕(离职)', 'our80', 'our81']
          var notSpecialData = []
          var specialData = []
          for (var i = 0; i < data.length; i++) {
            var filterDataIndex = filterData.indexOf(data[i].name)
            if (filterDataIndex > -1) {
              specialData[filterDataIndex] = data[i]
            } else {
              notSpecialData.push(data[i])
            }
          }
          notSpecialData.sort(function (a, b) {
            var aName = a.name
            var bName = b.name
            return aName.localeCompare(bName)
          })

          $rootScope.sellers = notSpecialData.concat(_.compact(specialData));
          $rootScope.sellersMap = {};
          data.forEach(function (itm) {
            $rootScope.sellersMap[itm.user_id] = itm.name;
          });
          getSellers.resolve()
        });

        // fetch region sellers
        $http.get('/users/sellers', { params: { region_id: data.region_id } }).success(function (data) {
          $rootScope.regionSellers = data;
          $rootScope.regionSellersMap = {};
          data.forEach(function (itm) {
            $rootScope.regionSellersMap[itm.user_id] = itm.name;
          });
        });

      });

      desktopNotify.requestPermission()
      return $q.all([getUser, getRights.promise, getSellers.promise])
    };

    // common dicts
    $rootScope.client_status = [
      { name: '未处理', value: 'untreated' },
      { name: '已联系', value: 'contacted' },
      { name: '需跟进', value: 'need_follow' },
      { name: '失败', value: 'fail' }
    ];

    $rootScope.$on('oauth:error', function (event, rejection) {
      return common.$window.location.href = '/login.html'
    })
  }

  function changeTitle($location, $rootScope, $timeout) {
    $rootScope.$on('$stateChangeStart', startListener)
    $rootScope.$on('$stateChangeSuccess', successListener)

    function startListener(event, toState) {
      $timeout(function () {
        $rootScope.title = 'loading...'
      })
    }

    function successListener(event, toState) {
      $timeout(function () {
        $rootScope.title = toState.title
          ? toState.title
          : 'Madoka - Upyun CRM'
      })
    }
  }

})()



