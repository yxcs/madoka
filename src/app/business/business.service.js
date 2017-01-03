; (function () {
  'use strict'

  angular
    .module('koala.business')
    .factory('$F_stats', F_statsService)

  F_statsService.$inject = ['$filter', '$http', '$interval', '$q']

  function F_statsService($filter, $http, $interval, $q) {
    var stats = {};

    function isEmpty(obj) {
      for (var name in obj) {
        if (obj.hasOwnProperty(name)) {
          return false;
        }
      }
      return true;
    }

    stats.query = function (params) {

      // check if there is end_day params,
      // if not, assign current day.
      if (!params.end_day) {
        params.end_day = moment().format('YYYY-MM-DD');
      }

      // check if there is a period params,
      // if not, assign 1 day
      if (!params.period) {
        params.period = 1;
      }

      // test if the end_day is today
      var _today = moment(params.end_day).isSame(moment(), 'day');

      // if is today, set end_time to current time,
      // else set end_time to the end of that day
      if (_today) {
        params.end_time = moment().toISOString();
      } else {
        params.end_time = moment(params.end_day).add(24, 'hours').toISOString();
      }

      // if period is one day and end_day is today, set start_time to the begining of today,
      // else set start_time to the day of start_day
      if (params.period === 1 && _today) {
        params.start_time = moment().set('hour', 0).set('minute', 0).set('second', 0).toISOString();
      } else {
        if (params.start_day) {
          params.start_time = moment(params.start_day).toISOString();
        } else {
          params.start_time = moment(params.end_day).set('hour', 0).set('minute', 0).set('second', 0).subtract(params.period - 1, 'days').toISOString();
        }
      }

      var result = {
        stats: {}
      };
      var deferred = $q.defer();
      $http.get('/service/statistics/', { params: params }).
        success(function (response) {

          var br_dataset = {
            columns: {
              bandwidth: {},
              request: {}
            },
            unit: {}
          };

          var transfer_dataset = {
            columns: {
              transfer: {}
            },
            unit: {}
          };

          var bandwidth_date = [];
          var bandwidth = [];
          var request_date = [];
          var request = [];
          var transfer_date = [];
          var transfer = [];

          // info under chart
          var extra = {
            flow: new BigNumber(0),
            reqs: new BigNumber(0),
            bandwidth: new BigNumber(0)
          };

          response.data.forEach(function (itm) {
            var time = $filter('date')(new Date(itm.time * 1000), 'yyyy-MM-dd HH:mm');

            bandwidth_date.push([time, itm.bandwidth]);
            bandwidth.push(itm.bandwidth);
            request_date.push([time, itm.rps]);
            request.push(itm.rps);
            transfer_date.push([time, itm.bytes]);
            transfer.push(itm.bytes);

            extra.flow = extra.flow.plus(itm.bytes);
            extra.reqs = extra.reqs.plus(itm.reqs);
          });
          extra.reqs = extra.reqs.toNumber();
          extra.bandwidth = Math.max.apply(null, bandwidth);

          // assign extra data
          result.extra = extra;

          // calc the unit
          var subm_bw;
          var _maxBw = Math.max.apply(null, bandwidth);
          var _maxReq = Math.max.apply(null, request);

          if (_maxBw > 1024 * 1024 * 1024 && _maxReq / (_maxBw / (1024 * 1024 * 1024)) < 100) {
            br_dataset.unit.bandwidth = 'Gb';
            subm_bw = 1024 * 1024 * 1024;
          } else if (_maxBw > 1024 * 1024 && _maxReq / (_maxBw / (1024 * 1024)) < 100) {
            br_dataset.unit.bandwidth = 'Mb';
            subm_bw = 1024 * 1024;
          } else if (_maxBw > 1024 && _maxReq / (_maxBw / 1024) < 100) {
            br_dataset.unit.bandwidth = 'Kb';
            subm_bw = 1024;
          } else {
            br_dataset.unit.bandwidth = 'b';
            subm_bw = 1;
          }

          // assign data
          br_dataset.columns.bandwidth.data = bandwidth_date.map(function (itm) {
            return { x: itm[0], y: Number(new BigNumber(itm[1]).div(subm_bw).toFixed(2)) };
          });
          br_dataset.columns.request.data = request_date.map(function (itm) {
            return { x: itm[0], y: Number(new BigNumber(itm[1])) };
          });

          // calc transfer unit
          var subm_trans;
          var _maxTrans = Math.max.apply(null, transfer);

          if (_maxTrans > 1024 * 1024 * 1024) {
            transfer_dataset.unit.transfer = 'GB';
            subm_trans = 1024 * 1024 * 1024;
          } else if (_maxTrans > 1024 * 1024) {
            transfer_dataset.unit.transfer = 'MB';
            subm_trans = 1024 * 1024;
          } else if (_maxTrans > 1024) {
            transfer_dataset.unit.transfer = 'KB';
            subm_trans = 1024;
          } else {
            transfer_dataset.unit.transfer = 'B';
            subm_trans = 1;
          }

          transfer_dataset.columns.transfer.data = transfer_date.map(function (itm) {
            return { x: itm[0], y: Number(new BigNumber(itm[1]).div(subm_trans).toFixed(2)) };
          });

          // process peak data
          result.peaks_dataset = {
            peaks: [],
            total: {
              flow: new BigNumber(0),
              req: new BigNumber(0)
            }
          };
          response.peaks.forEach(function (itm) {
            result.peaks_dataset.total.flow = result.peaks_dataset.total.flow.plus(itm.bytes);
            result.peaks_dataset.total.req = result.peaks_dataset.total.req.plus(itm.reqs);
          });

          result.peaks_dataset.total.req = result.peaks_dataset.total.req.toNumber();
          result.peaks_dataset.peaks = angular.copy(response.peaks);

          result.stats.br_dataset = br_dataset;
          result.stats.transfer_dataset = transfer_dataset;

          // set default data if return no data
          Object.keys(result.stats).forEach(function (chart) {
            Object.keys(result.stats[chart].columns).forEach(function (key) {
              var columnData = result.stats[chart].columns[key];
              if (!columnData.data || columnData.data.length === 0) {
                columnData.data = [{ x: 0, y: 0 }];
              }
            });
          });

          deferred.resolve(result);
        }).
        error(function (err) {
          deferred.reject(err);
        });
      return deferred.promise;
    };

    stats.latest = function () {
      var params = {
        start_day: $filter('date')(new Date().getTime() - 60000 * 5, 'yyyy-MM-dd HH:mm:ss'),
        end_day: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
      };

      var deferred = $q.defer();
      $http.get('/api/nstats/', { params: params }).success(function (data) {
        var pick = data.data.pop();
        var result = {};

        if (pick) {
          result = {
            health: Number((((pick._200 + pick._206 + pick._301 + pick._302 + pick._304) / pick.cnt) * 100).toFixed(2)),
            hit: Number(((pick.hit / pick.cnt) * 100).toFixed(2)),
            rate: Number((pick.size / (pick.time / 1000)).toFixed(2)),
            consume: Number(pick.time === 0 ? 0 : (pick.time / pick.cnt).toFixed(2))
          };

          result.healths = [];

          var codes = [200, 206, 301, 302, 304, 400, 403, 404, 411, 499, 500, 502, 503, 504];
          codes.forEach(function (code) {
            result.healths.push({
              code: code,
              num: pick['_' + code],
              percent: Number((pick['_' + code] / pick.cnt * 100).toFixed(2)) || 0
            });
          });
        }

        deferred.resolve(result);

      }).error(function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    stats.history = function (dateRange) {

      var params = {
        statistic_degree: 1,
        province: 'full',
        rangeunit: '1m'
      };

      params = angular.extend(params, dateRange);

      var result = {};

      var deferred = $q.defer();
      $http.get('/api/nstats/', { params: params }).success(function (data) {

        var health_dataset = [{
          datapoints: []
        }];
        var hit_dataset = [{
          datapoints: []
        }];
        var speed_dataset = [{
          datapoints: []
        }];
        var time_dataset = [{
          datapoints: []
        }];
        var size_dataset = [{
          datapoints: []
        }];

        Object.keys(data).forEach(function (key) {
          var time = $filter('date')(new Date(moment(key).valueOf()), 'yyyy-MM-dd HH:mm');

          health_dataset[0].datapoints.push({ x: time, y: Number((data[key].health_degree * 100).toFixed(2)) });

          hit_dataset[0].datapoints.push({ x: time, y: Number((data[key].hit_degree * 100).toFixed(2)) });

          speed_dataset[0].datapoints.push({ x: time, y: Number((data[key].avg_download_speed / 1024).toFixed(2)) });

          time_dataset[0].datapoints.push({ x: time, y: Number((data[key].avg_time_spend).toFixed(2)) });

          size_dataset[0].datapoints.push({ x: time, y: Number((data[key].avg_size / 1024).toFixed(2)) });
        });

        result.health_dataset = health_dataset;
        result.hit_dataset = hit_dataset;
        result.speed_dataset = speed_dataset;
        result.time_dataset = time_dataset;
        result.size_dataset = size_dataset;

        // set default data if return no data
        Object.keys(result).forEach(function (chart) {
          if (!result[chart].data || result[chart].data.length === 0) {
            result[chart].data = [{ x: 0, y: 0 }];
          }
        });

        deferred.resolve(result);
      }).error(function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    stats.map = function () {
      var _current = new Date();

      var params = {
        account_id: Franky.app.user.user_id,
        province: 'full',
        statistic: 1,
        rangeunit: '1m',
        last_num: 1
      };

      var deferred = $q.defer();
      $http.get('/api/nstats/', { params: params }).success(function (data) {
        deferred.resolve(data);
      }).error(function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    };

    return stats;
  }

})()