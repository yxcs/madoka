; (function () {
  'use strict'

  angular
    .module('koala.business')
    .controller('UsageList', UsageList)
    .controller('UsageSync', UsageSync)
    .controller('UsageDetail', UsageDetail)
    .controller('UsageStats', UsageStats)


  function UsageList($timeout, $http, $location, $rootScope, $scope, $state, $modal, autosave) {
    $scope.getOverview = function () {
      $http.get('/service/survey', { params: { user_id: $scope.self.info.user_id } }).success(function (data) {
        $scope.overview = data;
      });
    };

    $rootScope.initPromise.then(function () {
      $scope.getOverview();
    })

    var autosaveDate = autosave.getItem() || {}

    $scope.params = autosaveDate.params || {
      key_type: 'username',
      filter_field: 'flow_day_average'
    };

    $scope.account_status = autosaveDate.account_status || null

    // page_num_to_go 莫名其妙为变成1
    $timeout(function() {
      $scope.page_num_to_go = autosaveDate.page_num_to_go || null
    })

    $scope.fetchClients = function (key_type, key) {
      if (key_type && key) {
        $scope.params.key_type = key_type;
        $scope.params.key = key;
      }
      var params = _.clone($scope.params)
      if (!params.key) { delete params.key_type }
      if (_.isUndefined(params.min) && _.isUndefined(params.max)) {
        delete params.filter_field
      }

      $http.get('/services', { params: params }).success(function (data) {
        autosave.setItem({
          params: $scope.params,
          account_status: $scope.account_status,
          page_num_to_go: $scope.page_num_to_go,
        })

        $scope.clientsData = data;
      });
    };

    var lazyfetch = _.debounce($scope.fetchClients, 50)

    $scope.orderBy = function (order_column) {
      if ($scope.params.order_type && $scope.params.order_column === order_column) {
        $scope.params.order_type === "asc" ? $scope.params.order_type = "desc" : $scope.params.order_type = "asc"
      } else {
        $scope.params.order_type = "desc"
      }
      $scope.params.order_column = order_column
      lazyfetch();
    };

    $scope.$watch('page_num_to_go', function (val, old) {
      if (val !== old) {
        $scope.params.page_num = val;
        lazyfetch();
      }
    });

    $scope.refresh = function () {
      autosave.removeItem()
      $state.reload()
    };

    $scope.sync = function (account_name) {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/usage/usage-sync.html',
        controller: 'UsageSync',
        resolve: {
          account_name: function () {
            return account_name;
          }
        }
      });

      modalInstance.result.then(function (cm) {
        if (cm !== 'cancel') {
          lazyfetch()
        }
      });
    }

    lazyfetch();
  }

  function UsageSync($http, $modalInstance, $scope, account_name) {
    $scope.submit = function () {
      $http.post('/service/sync', { account_name: account_name }).success(function (data) {
        if (data.result === true) {
          $modalInstance.close('fin');
        }
      }).
        error(function (data, status, headers, config) {
          $scope.notify('danger', '实时数据同步失败')
        })
    };

    $scope.skip = function () {
      $modalInstance.close('cancel');
    };

  }

  function UsageDetail($http, $location, $modal, $rootScope, $scope, $stateParams, $q, $state, $interval, $timeout) {
    var getAccountNamePromise = (function() {
      var deferred  = $q.defer()
      if ($state.current.name === 'clients.registed_detail') {
        var stop = $interval(function() {
          if ($scope.$parent.account && $scope.$parent.account.account_name) {
            deferred.resolve()
            $interval.cancel(stop)
          }
        }, 50)
      } else {
        deferred.resolve()
      }
      return deferred.promise
    })()

    $scope.getOverview = function () {
      var survey;
      var account;
      if ($stateParams.account_name) {
        survey = $http.get('/service/account/survey', { params: { user_id: $rootScope.self.info.user_id, account_name: $stateParams.account_name || $scope.$parent.account.account_name} }).success(function (data) {
          $scope.overview = data;
        });

        account = $http.get('/clients/account', { params: { user_id: $rootScope.self.info.user_id, account_name: $stateParams.account_name || $scope.$parent.account.account_name} }).success(function (data) {
          $scope.account = data;
        });
        return $q.all([survey, account])
      } else {
        getAccountNamePromise.then(function() {
          survey = $http.get('/service/account/survey', { params: { user_id: $rootScope.self.info.user_id, account_name: $scope.$parent.account.account_name} }).success(function (data) {
            $scope.overview = data;
          });
          account = $http.get('/clients/account', { params: { user_id: $rootScope.self.info.user_id, account_name: $scope.$parent.account.account_name} }).success(function (data) {
            $scope.account = data;
          });
        })
        return $q.all([survey, account, getAccountNamePromise])
      }
    };

    $scope.getOverviewPromise = $scope.getOverview();

    $scope.sync = function (account_name) {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/usage/usage-sync.html',
        controller: 'UsageSync',
        resolve: {
          account_name: function () {
            return account_name;
          }
        }
      });

      modalInstance.result.then(function (cm) {
        if (cm !== 'cancel') {
          $state.go('.', { seed: new Date().getTime() })
        }
      });
    }
  }
  function UsageStats($filter, $http, $interval, $log, $modal, $rootScope, $scope, $stateParams, $F_stats, $q, $state, $timeout) {
    /*一些初始参数*/
    $scope.dateRange = { startDate: null, endDate: null };
    $scope.dateOption = {
      dateLimit: { days: 30 }
    }
    $scope.disabled = false

    $scope.statsParams = {
      bucket_name: $stateParams.name,
      domain: '',
      period: 1,
      start_day: $filter('date')(new Date(new Date().getTime() - 86400000), 'yyyy-MM-dd'),
      end_day: $filter('date')(new Date(), 'yyyy-MM-dd')
    };

    $scope.dataset = {
      br_dataset: [{
        name: '带宽',
        symbolSize: 0,
        datapoints: [{ x: 0, y: 0 }]
      }, {
          name: '每秒请求',
          symbolSize: 0,
          datapoints: [{ x: 0, y: 0 }]
        }],
      transfer_dataset: [{
        name: '流量',
        symbolSize: 0,
        datapoints: [{ x: 0, y: 0 }]
      }]
    };

    $scope.options = {
      title: '',
      theme: 'tech',
      height: '85%',
      forceClear: true,
      legend: {
        orient: 'horizontal',
        x: 'center',
        y: 'top'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          var res = params[0][1];
          for (var i = 0, l = params.length; i < l; i++) {
            res += '<br/>' + params[i][0] + ' : ' + params[i][2];
            res += (params[i][0] === '带宽') ? ' ' + $scope.options.yAxisUnit.bandwidth : '';
            res += (params[i][0] === '每秒请求') ? ' ' + $scope.options.yAxisUnit.request : '';
            res += (params[i][0] === '流量') ? ' ' + $scope.options.yAxisUnit.transfer : '';
          }
          return res;
        }
      },
      calculable: true,
      xAxis: {
        axisLabel: {
          formatter: function (value) {
            return value.toString().substr(11);
          }
        }
      },
      yAxisUnit: {
        bandwidth: 'Kb',
        request: '次',
        transfer: 'KB'
      }
    };
    /*一些初始参数*/

    $scope._getStats = function () {
      var deferred = $q.defer();

      $F_stats.query($scope.statsParams).then(function (data) {
        $scope.peaks_dataset = data.peaks_dataset;

        $scope.$watch('statsParams', function () {
          $scope.options.xAxis = {
            axisLabel: {
              formatter: function (value) {
                if ($scope.statsParams.period === 1)
                  return value.toString().substr(11); // format: hh:mm
                else if ($scope.statsParams.period <= 7 && $scope.statsParams.period > 1)
                  return value.toString().substr(5, 11); // format: MM-DD hh:mm
                else if ($scope.statsParams.period > 7)
                  return value.toString().substr(5, 5); // format: MM-DD
              }
            }
          }
        });

        $scope.dataset = {
          br_dataset: [{
            name: '带宽',
            symbol: 'none',
            datapoints: data.stats.br_dataset.columns.bandwidth.data
          }, {
              name: '每秒请求',
              symbol: 'none',
              datapoints: data.stats.br_dataset.columns.request.data
            }],
          transfer_dataset: [{
            name: '流量',
            datapoints: data.stats.transfer_dataset.columns.transfer.data
          }]
        };

        $scope.options.yAxisUnit = {
          bandwidth: data.stats.br_dataset.unit.bandwidth,
          request: '次',
          transfer: data.stats.transfer_dataset.unit.transfer
        };
        deferred.resolve()
      }, function (err) {
        deferred.reject()
      }, function (update) {
      });

      return deferred.promise
    };


    // init
    $scope.getOverviewPromise.then(function () {
      $scope.statsParams.account_name = $scope.account ? $scope.account.account_name : $scope.$parent.account.account_name
      $scope._getStats();
    })
    // if (angular.isDefined($rootScope.stopStatInterval)) {
    //   $interval.cancel($rootScope.stopStatInterval);
    //   $rootScope.stopStatInterval = undefined;
    //   $rootScope.stopStatInterval = $interval($scope._getStats, 300000);
    // } else {
    //   $rootScope.stopStatInterval = $interval($scope._getStats, 300000);
    // }
    ;

    $scope.sortStates = {};
    $scope.sort_by = '+date';
    $scope.sortBy = function (key) {
      function createSortFn(sort_key, sym) {
        return function (data) {
          var value = new BigNumber(data[sort_key]).div(1024 * 1024).toNumber();
          return sym === '-' ? -value : value;
        }
      }

      if (!$scope.sortStates[key]) {
        $scope.sortStates[key] = '+' + key;
      } else {
        $scope.sortStates[key] = $scope.sortStates[key] === '+' + key ? '-' + key : '+' + key;
      }

      // control the sort arrow
      $scope.sort_by_key = $scope.sortStates[key];

      if (key === 'date') {
        $scope.sort_by = $scope.sortStates[key];
      } else {
        if ($scope.sortStates[key].indexOf('-') < 0) {
          $scope.sort_by = createSortFn(key);
        } else {
          $scope.sort_by = createSortFn(key, '-');
        }
      }

    };

    $scope.xAxisTickFormatFunction = function () {
      return function (d) {
        if ($scope.statsData._today == true) {
          return d3.time.format('%H:%M')(new Date(d));
        } else {
          return d3.time.format('%m/%d')(new Date(d));
        }
      }
    };


    $scope.chartTitleTime = $filter('date')(new Date(), 'yyyy-MM-dd');
    $scope.filterByDateRange = function (num) {
      $scope.disabled = true
      $scope.dateRange = { startDate: null, endDate: null };
      if (num && num > 1) {
        var dayFrom = new Date().getTime() - 86400000 * (num - 1);
        $scope.chartTitleTime = $filter('date')(new Date(dayFrom), 'yyyy-MM-dd') + ' 至 ' + $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.statsParams.period = num;
        $scope.statsParams.unit = 'hour';
      } else {
        $scope.chartTitleTime = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.statsParams.period = 1;
      }

      $scope.dateEnd = new Date();
      $scope.dateStart = new Date($scope.dateEnd.getTime() - 86400000 * ($scope.statsParams.period - 1));

      $scope.statsParams.start_day = $filter('date')($scope.dateStart, 'yyyy-MM-dd');
      $scope.statsParams.end_day = $filter('date')($scope.dateEnd, 'yyyy-MM-dd');

      $scope._getStats().then(function () { $scope.disabled = false }, function () { $scope.disabled = false });
    };

    $scope.filterByCustomDateRange = function () {
      $scope.disabled = true
      $scope.radiorange = null
      $scope.dateStart = parseInt(new Date($scope.dateRange.startDate).getTime()) || null;
      $scope.dateEnd = parseInt(new Date($scope.dateRange.endDate).getTime()) || null;



      $scope.statsParams.start_day = $scope.dateRange.startDate.format("YYYY-MM-DD")
      $scope.statsParams.end_day = $scope.dateRange.endDate.format("YYYY-MM-DD")

      $scope.statsParams.period = parseInt(($scope.dateEnd - $scope.dateStart) / 86400000) || 1;
      if (isNaN($scope.statsParams.period) || $scope.statsParams.period > 31 || $scope.statsParams.period <= 0) {
        console.log('请输入正确的日期范围，小于30天')
        return
      } else {
        $scope.chartTitleTime = $scope.dateRange.startDate.format("YYYY-MM-DD") + ' 至 ' + $scope.dateRange.endDate.format("YYYY-MM-DD")
      }

      $scope.canSelect = false
      $scope._getStats().then(function () { $scope.disabled = false }, function () { $scope.disabled = false });
    };

    $scope.getOverviewPromise.then(function () {
      $http.get('/service/account/bucket/domain', { params: { account_name: $scope.account.account_name } }).
        success(function (data) {
          $scope.buckets = data
        })
    })

    $scope.view = {}
    $scope.fetchStats = function () {
      var args = [].slice.call(arguments)
      var remain = []
      remain.push($scope.statsParams.bucket_name)
      remain.push($scope.statsParams.domain)
      $scope.statsParams.bucket_name = args[0]
      $scope.statsParams.domain = args[1]
      $scope._getStats().then(function () {
        $scope.view.bucket_name = args[0]
        $scope.view.domain = args[1]
      }, function () {
        $scope.statsParams.bucket_name = $scope.view.bucket_name
        $scope.statsParams.domain = $scope.view.domain
      })
    }

    $scope.$on('usage-detail', function() {
      $scope._getStats();
    })
  }
})()