;(function () {
  angular
    .module('koala.business')
    .controller('ChargesList', ChargesList)
    .controller('ChargesStandard', ChargesStandard)
    .controller('ChargesNew', ChargesNew)
    .controller('ChargesDetail', ChargesDetail)
    .controller('ChargesPass', ChargesPass)
    .controller('ChargesReject', ChargesReject)
    .controller('ChargesDelete', ChargesDelete)

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function ChargesList(common, $state, autosave) {
    var vm = this
    var charges = common.$resource('/charge_confs')

    var autosaveData = autosave.getItem() || {}

    vm.params = autosaveData.params || { key_type: 'username',status: 'PASS', }
    if (autosaveData.dateRange) {
      vm.dateRange = _.mapValues(autosaveData.dateRange, function (v) {
        return v ? moment(v) : null
      })
    } else {
      vm.dateRange = { startDate: null, endDate: null }
    }

    vm.tabactive =  autosaveData.tabactive || [true, false, false]

    vm.chargeConfs = {}

    vm.refresh = refresh
    vm.fetchCharge = fetchCharge
    vm.translate = translate
    vm.prev = prev
    vm.next = next

    vm.user = {
      name: 'awesome user'
    }
    activate()

    /*函数声明*/
    function activate() {
      //fetchCharge('page')
    }

    function fetchCharge(type) {
      saveData()
      var params = _.clone(vm.params)
      if (type !== 'page') {
        delete params.since
        delete params.max
      }
      if (!params.key) {
        delete params.key
        delete params.key_type
      }
      params.start_time = vm.dateRange.startDate ? vm.dateRange.startDate.format('X') : null
      params.end_time = vm.dateRange.endDate ? vm.dateRange.endDate.format('X') : null

      charges.get(params, function (data) {
        vm.chargeConfs = data
      })
    }

    function translate(str) {
      if (_.isString(str)) {
        var service_type = {
          FLOW: '流量',
          BANDWIDTH: '带宽',
          STORAGE: '存储',
          HTTPS: 'HTTPS',
        }
        var amount_cal_type = {
          MONTHLY_95: '月95峰值计费',
          DAILY_95: '月日95峰值计费',
          DAILY_95_AVERAGE: '月日均95峰值计费',
          DAILY_BANDWIDTH: '月日均带宽峰值计费',
          DAILY_HIGHEST: '日带宽峰值计费',
          TOP_1: '第1峰值',
          TOP_2: '第2峰值',
          TOP_3: '第3峰值',
          TOP_4: '第4峰值',
          TOP_5: '第5峰值',
          TOP_6: '第6峰值',
          TOP_7: '第7峰值',
          TOP_8: '第8峰值',
          TOP_9: '第9峰值',
          MONTHLY: '月使用流量计费',
          DAILY: '日使用流量计费',
          YEARLY: '年使用流量计费'
        }
        return '' + service_type[str.split('-')[0]] + '-' + amount_cal_type[str.split('-')[1]]
      }
    }

    function prev() {
      if (!vm.chargeConfs.page.since) return
      vm.params.since = vm.chargeConfs.page.since
      vm.params.max = null
      vm.fetchCharge('page')
    }

    function next() {
      if (!vm.chargeConfs.page.max) return
      vm.params.since = null
      vm.params.max = vm.chargeConfs.page.max
      vm.fetchCharge('page')
    }

    function refresh() {
      autosave.removeItem()
      $state.reload()
    }

    function saveData() {
      setTimeout(function() {
        autosave.setItem({
          params: vm.params,
          tabactive: vm.tabactive,
          dateRange: _.mapValues(vm.dateRange, function (v) {
            return moment.isMoment(v) ? moment(v).valueOf() : ''
          }),
        })
      })
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function ChargesStandard(common) {
    var vm = this
    var standard = common.$resource('/charge_conf/standard')


    vm.standardConf = {}

    activate()

    function activate() {
      standard.get(function (data) {
        vm.standardConf = data
      })
    }
  }

  function ChargesNew(common, $modal, $scope, $stateParams, $state, editableOptions) {
    var vm = this
    editableOptions.theme = 'bs3'

    var standardConfs = common.$resource('/charge_conf/standard')
    var ift = Number.MAX_SAFE_INTEGER
    var cdnFlowPrice, cdnBandWidth, cdnRequest, storagePrice, httpsPrice, defaultcdnFlowLadder
    var createConfs = common.$resource('/charge_conf', '', { create: { method: 'PUT' }, update: { method: 'POST' } })
    var getCreateDetail = common.$resource('/charge_conf/detail')

    var isEdit = $stateParams.id ? true : false
    vm.ift = ift
    vm.currentState = {
      client: {},
      min_guarantee: [
        { value: 'false', text: '不配置保底' },
        { value: 'true', text: '配置保底' },
      ],
      tops: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      TOP_N: 0,
      pay_period_unit: "DAY",
    }
    vm.searchClient = searchClient
    vm.addUnitPriceLadder = addUnitPriceLadder
    vm.saveTable = saveTable
    vm.deleteTableEle = deleteTableEle
    vm.submit = submit


    var active = activate()

    //初始化
    active.then(function () {
      var getDetailPromise

      if (isEdit) {
        getDetailPromise = getCreateDetail.get({charge_conf_id: $stateParams.id}, function(data) {
          var confs = JSON.parse(JSON.stringify(data))
          vm.params = _.pick(confs, 'account_name', 'charge_type', 'period_type', 'can_arrear', 'pact_number', 'pay_period', 'remark', 'cdn', 'cdn_request', 'https', 'storage')
          vm.currentState.pay_period_num = parseInt(confs.pay_period && vm.params.pay_period.split('_')[0])
          vm.currentState.pay_period_unit = confs.pay_period && vm.params.pay_period.split('_')[1]
          vm.currentState.client.name = confs.client_name
          vm.currentState.client.sell_name = confs.user_name
        }).$promise
      } else {
        vm.params = {
          charge_type: 'DELAY_PAY',
          period_type: 'DAILY',
          can_arrear: false,
          cdn: {
            service_type: 'FLOW',
            price_type: 'COSTOM_PRICE', //cdn 只有独立报价
            ladder_type: 'STANDARD_LADDER',
            period_bill_type: 'DAILY',
            amount_cal_type: null,
            unit_price_ladder: [{ min: 0, max: ift, unit_price: cdnFlowPrice, is_min_guarantee: false }],
          },
          cdn_request: {
            service_type: 'CDN_REQUEST_COUNT',
            period_bill_type: 'DAILY',
            price_type: 'STANDARD_PRICE',
            ladder_type: 'STANDARD_LADDER',
            unit_price_ladder: [{ min: 0, max: ift, unit_price: cdnRequest, is_min_guarantee: false }]
          },
          storage: {
            service_type: 'STORAGE',
            price_type: 'STANDARD_PRICE',
            ladder_type: 'STANDARD_LADDER',
            period_bill_type: 'DAILY',
            unit_price_ladder: [{ min: 0, max: ift, unit_price: storagePrice, is_min_guarantee: false }]
          },
          https: {
            service_type: 'HTTPS',
            price_type: 'STANDARD_PRICE',
            period_bill_type: 'DAILY',
            ladder_type: 'STANDARD_LADDER',
            unit_price_ladder: [{ min: 0, max: ift, unit_price: httpsPrice, is_min_guarantee: false }
            ]
          }
        }
        getDetailPromise = common.$q(function(resolve){resolve()})
      }

      getDetailPromise.then(function() {
        //结算方式切换
        $scope.$watchGroup(['vm.params.period_type',
          'vm.params.cdn.service_type',
          'vm.params.cdn_request.price_type',
          'vm.params.storage.price_type',
          'vm.params.https.price_type',
        ], function (newValue, oldValue) {
          if(angular.equals(newValue, oldValue)) return
          changeState(newValue, oldValue)
        })

        $scope.$watch('vm.params.cdn.amount_cal_type', function (newValue, oldValue) {
          if (vm.params.cdn.service_type === "BANDWIDTH") {
            var possibleValues = ['MONTHLY_95', 'DAILY_95', 'DAILY_95_AVERAGE', 'DAILY_BANDWIDTH', 'DAILY_HIGHEST']
            if (/TOP_\d+/.test(newValue)) {
              vm.currentState.TOP_N = newValue.replace(/TOP_/, '')
            } else if (possibleValues.indexOf(newValue) > -1) {
              vm.currentState.TOP_N = 0
            } else {
              throw new Error('error')
            }
          }
        })

        $scope.$watch('vm.params.cdn.ladder_type', function (newValue, oldValue) {
          if (vm.params.cdn.ladder_type === "GUARANTEE_LADDER") {
            vm.params.cdn.unit_price_ladder[0].is_min_guarantee = true
          }
        })

        $scope.$watch('vm.params.cdn.service_type', function (newValue, oldValue) {
          if (vm.params.cdn.ladder_type === "GUARANTEE_LADDER") {
            vm.params.cdn.unit_price_ladder[0].is_min_guarantee = true
          }
        })
      })

    })

    //激活函数
    function activate() {
      return standardConfs.get(function (data) {
        cdnFlowPrice = data.cdn.unit_price
        cdnBandWidth = 42 //默认42吧。。
        cdnRequest = data.cdn_request.unit_price
        storagePrice = data.storage.unit_price
        httpsPrice = data.https.unit_price
        defaultcdnFlowLadder = [{ min: 0, max: ift, unit_price: cdnFlowPrice, is_min_guarantee: false }]
      }).$promise
    }

    //提交
    function submit() {
      var params = _.clone(vm.params)

      //付费周期
      if (_.isNumber(vm.currentState.pay_period_num) && vm.currentState.pay_period_num >= 0) {
        params.pay_period = '' + vm.currentState.pay_period_num + '_' + vm.currentState.pay_period_unit
      }

      if (isEdit) {
        params.charge_conf_id = $stateParams.id
        createConfs.update(params, function () {
          $state.go('^.^')
        }, function () {
        })
      } else {
        createConfs.create(params, function () {
          $state.go('^')
        }, function () {
        })
      }
    }

    //增加价格阶梯
    function addUnitPriceLadder(type) {
      var u = vm.params[type].unit_price_ladder
      var inserted = {
        min: null,
        max: null,
        unit_price: null,
        is_min_guarantee: false
      }

      if (_.isArray(u)) {
        u.push(inserted)
      } else {
        u = [{ min: 0, max: ift, unit_price: cdnFlowPrice, is_min_guarantee: false }]
      }

      vm.params[type].unit_price_ladder = u
    }

    //改变参数
    function changeState(n, o) {
      //按日计费 && 流量计费
      if (vm.params.period_type === 'DAILY') {
        if (vm.params.cdn.service_type === 'FLOW') {
          vm.params.cdn.period_bill_type = 'DAILY'
          vm.params.cdn.unit_price_ladder[0].is_min_guarantee = false
          vm.params.cdn.amount_cal_type = null
        } else if (vm.params.cdn.service_type === 'BANDWIDTH') {
          vm.params.cdn.period_bill_type = 'DAILY'
          vm.params.cdn.amount_cal_type = 'DAILY_HIGHEST'
        }
      } else if (vm.params.period_type === 'MONTHLY') {
        if (vm.params.cdn.service_type === 'FLOW') {
          vm.params.cdn.amount_cal_type = null
          vm.params.cdn.unit_price_ladder[0].is_min_guarantee = false
        } else if (vm.params.cdn.service_type === 'BANDWIDTH') {
          vm.params.cdn.period_bill_type = 'MONTHLY'
        }
      }

      if (vm.params.cdn_request.price_type === 'STANDARD_PRICE') {
        vm.params.cdn_request.unit_price_ladder = [{ min: 0, max: ift, unit_price: cdnRequest, is_min_guarantee: false }]
      }
      if (vm.params.storage.price_type === 'STANDARD_PRICE') {
        vm.params.storage.unit_price_ladder = [{ min: 0, max: ift, unit_price: storagePrice, is_min_guarantee: false }]
      }
      if (vm.params.https.price_type === 'STANDARD_PRICE') {
        vm.params.https.unit_price_ladder = [{ min: 0, max: ift, unit_price: httpsPrice, is_min_guarantee: false }]
      }

    }

    //配置客户
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
      })
      modalInstance.result.then(function (client) {
        vm.params.account_name = client.account_name
        vm.currentState.client.name = client.name
        vm.currentState.client.sell_name = client.sell_name
      })
    }

    //保存表格
    function saveTable(type, u) {
      vm.params[type].unit_price_ladder = tidyLadder(type, u)
    }

    //整理表格格式
    function tidyLadder(type, u) {
      if (_.isArray(u) && u.length > 0) {
        for (var i = 0; i < u.length; i++) {
          u[i].min = filterInt(u[i].min)
          u[i].unit_price = u[i].unit_price ? parseFloat(u[i].unit_price) : 0
          if (i === 0) {u[i].min = 0}
          if(i === (u.length - 1)) {
            u[i].max = ift
          } else {
            u[i].max = filterInt(u[i + 1].min)
          }
        }
        return u
      } else {
        return getDefaultLaddy(type)
      }
    }

    //校验函数
    function checkLadder(u) {

    }

    function deleteTableEle(index, u) {
      u.splice(index, 1)
    }

    function getDefaultLaddy(type) {
      if (type === 'cdn') {
        if (vm.params.cdn.service_type === "FLOW") return [{
          min: 0,
          max: ift,
          unit_price: cdnFlowPrice,
          is_min_guarantee: false
        }]
        if (vm.params.cdn.service_type === "BANDWIDTH") return [{
          min: 0,
          max: ift,
          unit_price: cdnBandWidth,
          is_min_guarantee: false
        }]
      }
      if (type === 'cdn_request') {
        return [{ min: 0, max: ift, unit_price: cdnRequest, is_min_guarantee: false }]
      }
      if (type === 'storage') {
        return [{ min: 0, max: ift, unit_price: storagePrice, is_min_guarantee: false }]
      }
      if (type === 'https') {
        return [{ min: 0, max: ift, unit_price: httpsPrice, is_min_guarantee: false }]
      }
    }

    function filterInt(value) {
      if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
        return Number(value);
      return -1;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function ChargesDetail(common, $stateParams, $state, $modal) {
    var vm = this
    var detail = common.$resource('/charge_conf/detail')

    vm.passCharge = passCharge
    vm.rejectCharge = rejectCharge
    vm.deleteCharge = deleteCharge
    vm.transPayPeriod = transPayPeriod
    vm.dicMap = {
      charge_type: {
        'PRE_PAY': '预付费',
        'DELAY_PAY': '后付费'
      },
      period_type: {
        'DAILY': '按日结算',
        'MONTHLY': '按月结算',
      },
      can_arrear: {
        true: '收费使用',
        false: '欠费使用',
      },
      service_type: {
        FLOW: '流量',
        BANDWIDTH: '带宽',
        STORAGE: '使用存储',
        HTTPS: 'HTTPS Get 请求次数',
        CDN_REQUEST_COUNT: '动态流出请求',
      },
      period_bill_type: {
        MONTHLY: '月',
        DAILY: '日',
        YEARLY: '年'
      },
      amount_cal_type: {
        MONTHLY_95: '月95峰值计费',
        DAILY_95: '月日95峰值计费',
        DAILY_95_AVERAGE: '月日均95峰值计费',
        DAILY_BANDWIDTH: '月日均带宽峰值计费',
        DAILY_HIGHEST: '日带宽峰值计费',
        TOP_1: '第1峰值',
        TOP_2: '第2峰值',
        TOP_3: '第3峰值',
        TOP_4: '第4峰值',
        TOP_5: '第5峰值',
        TOP_6: '第6峰值',
        TOP_7: '第7峰值',
        TOP_8: '第8峰值',
        TOP_9: '第9峰值'
      },
      price_type: {
        COSTOM_PRICE: '独立报价',
        STANDARD_PRICE: '标准报价'
      },
      ladder_type: {
        STANDARD_LADDER: '标准阶梯计费价',
        ADD_UP_LADDER: '阶梯超额累计计费价',
        GUARANTEE_LADDER: '保底外阶梯计费',
      },
      pay_period: {
        DAY: '天',
        WEEK: '周',
        MONTH: '月',
        SEASON: '季度'
      },
      charge_conf_status: {
        'PASS': '已启用',
        'REJECT': '审核拒绝',
        'INIT': '待审核'
      }
    }

    activate()

    //////////////////////////
    function activate() {
      detail.get({ charge_conf_id: $stateParams.id }, function (data) {
        vm.chargeConf = data
      })
    }

    function transPayPeriod(str) {
      if (_.isString(str)) {
        return '' + str.split('_')[0] + vm.dicMap.pay_period[str.split('_')[1]]
      }
    }

    function passCharge(chargeId) {
      $modal
        .open({
          templateUrl: 'app/business/charges/charges-pass.html',
          controller: 'ChargesPass',
          backdrop: 'static',
          resolve: {
            chargeId: function () {
              return chargeId;
            }
          }
        })
        .result.then(function (result) {
          if (result === 'fin') {
            $state.go('^')
          }
        })
    }

    function rejectCharge(chargeId) {
      $modal.open({
        templateUrl: 'app/business/charges/charges-reject.html',
        controller: 'ChargesReject',
        backdrop: 'static',
        resolve: {
          chargeId: function () {
            return chargeId;
          }
        }
      })
        .result.then(function (result) {
          if (result === 'fin') {
            $state.go('^')
          }
        })
    }

    function deleteCharge(chargeId) {
      $modal
        .open({
          templateUrl: 'app/business/charges/charges-delete.html',
          controller: 'ChargesDelete',
          backdrop: 'static',
          resolve: {
            chargeId: function () {
              return chargeId;
            }
          }
        })
        .result.then(function (result) {
          if (result === 'fin') {
            $state.go('^')
          }
        })
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function ChargesPass($scope, $http, $modalInstance, chargeId) {
    $scope.chargeId = chargeId
    $scope.skip = skip
    $scope.submit = submit

    function submit() {
      $http.post('/charge_conf/auditing', { charge_conf_id: $scope.chargeId, opt_type: 'PASS' }).success(function (data) {
        $modalInstance.close('fin')
      })
    }

    function skip() {
      $modalInstance.close('cancel')
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function ChargesReject($scope, $http, $modalInstance, chargeId) {
    $scope.chargeId = chargeId
    $scope.skip = skip
    $scope.submit = submit

    function submit() {
      $http.post('/charge_conf/auditing', { charge_conf_id: chargeId, opt_type: 'REJECT' }).success(function (data) {
        $modalInstance.close('fin')
      })
    }

    function skip() {
      $modalInstance.close('cancel')
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function ChargesDelete($scope, $http, $modalInstance, chargeId) {
    $scope.chargeId = chargeId
    $scope.skip = skip
    $scope.submit = submit

    function submit() {
      $http.post('/charge_conf/auditing', { charge_conf_id: chargeId, opt_type: 'DELETE' }).success(function (data) {
        $modalInstance.close('fin')
      })
    }

    function skip() {
      $modalInstance.close('cancel')
    }
  }
})()