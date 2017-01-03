/* global BigNumber */
/* global _ */
/* global moment */
; (function () {

  angular.module('koala.clients')
    .controller('ClientsPersonalCtrl', ClientsPersonalCtrl)
    .controller('ClientsPersonalDetailCtrl', ClientsPersonalDetailCtrl)
    .controller('ClientsPersonalInfoCtrl', ClientsPersonalInfoCtrl)
    .controller('ClientsPersonalContactCtrl', ClientsPersonalContactCtrl)
    .controller('ClientsPersonalRechargeCtrl', ClientsPersonalRechargeCtrl)
    .controller('ClientsPersonalUsageCtrl', ClientsPersonalUsageCtrl)
    .controller('ClientsPersonalLogCtrl', ClientsPersonalLogCtrl)
    .service('personal', personal)
    .filter('accountType', accountType)
    .filter('accountStatus', accountStatus)
    .filter('fromNow', fromNow)
    .filter('contactType', contactType)
    .filter('contactMode', contactMode)
    .filter('contactStatus', contactStatus)
    .filter('contactTransform', contactTransform)
    .filter('transtypes', transtypes)

  // 注册用户列表页
  function ClientsPersonalCtrl(personal, $rootScope, $scope, $state, autosave) {
    var vm = this;
    var autoSaveData = autosave.getItem() || {};
    vm.params = {
      key_type: 'username'
    }
    vm.page = {
      page_size : 20
    }
    vm.accountType = personal.accountType
    vm.accountStatus = $rootScope.MAP.account_status

    vm.params = autoSaveData.params || { key_type: 'username'}

    if (autoSaveData.dateRange) {
      vm.dateRange = {
        dateStart : autoSaveData.dateRange.dateStart,
        dateEnd : autoSaveData.dateRange.dateEnd
      }
    } else {
      vm.dateRange = {dateStart: '', dateEnd: ''};
    }

    vm.page_num_to_go = autoSaveData.page_num_to_go || 1

    $scope.$watch('vm.page_num_to_go', function (val, old_val) {
      if (val === old_val) return
      vm.params.page_start = vm.page.page_size * (val - 1 || 0)
      vm.fetchListData()
    })

    vm.fetchListData = function() {

      saveData();
      var params = {};
      _.forEach(vm.params, function(value, keys){
        if(value){
          params[keys] = value;
        }
      })

      if (!params.key) {
        delete params.key
        delete params.key_type
      }

      params.created_since = new Date(vm.dateRange.dateStart).getTime() / 1000 || null;
      params.created_max = new Date(vm.dateRange.dateEnd).getTime() / 1000 + 86399 || null;
      personal.query(params).then(function(result) {
        vm.clients = result.clients_and_accounts
        vm.page = result.page
        vm.totalItems = result.page.page_size * result.page.total_pages
        return result
      })
    };

    vm.fetchListData();

    vm.refresh = function() {
      autosave.removeItem()
      $state.reload()
    };

    function saveData() {
      setTimeout(function () {
        autosave.setItem({
          params: vm.params,
          dateRange: {
            dateStart : vm.dateRange.dateStart,
            dateEnd : vm.dateRange.dateEnd
          },
          page_num_to_go: vm.page_num_to_go
        })
      })
    }
  }

  function ClientsPersonalDetailCtrl($stateParams, personal, $scope, $q, $modal) {

    activate()

    $scope.openContactPersonDetail = openContactPersonDetail

    $scope.$on('update:client', function () {
      activate()
    })

    function activate() {
      personal.setAccount($stateParams.account_name)
      $scope.clientDetailPromise = personal.detail()
      $scope.contactPersonPromise = personal.contactPerson()
      $scope.debtsPromise = personal.debts()
      $scope.haveChargeConfPromise = personal.haveChargeConf()
      $scope.clientDetailPromise.then(function(result) {
        if(_.isEmpty(result)) {
          $scope.notify('danger', '该账号不存在')
          history.back()
        }
      })
    }

    // 查看联系人详情
    function openContactPersonDetail(contact_id, cb) {
      function openModal(contact) {
        $modal
          .open({
            templateUrl: 'app/widgets/template/_modal_contact.html',
            controller: '_modalContactCtrl',
            resolve: {
              contact: function () {
                return contact;
              }
            }
          })
          .result.then(cb)
      }
      $scope.contactPersonPromise.then(function (result) {
        var contact = _.findWhere(result, { contact_id: contact_id })
        if (!contact) {
          $scope.notify('error', '联系人不存在')
        } else {
          openModal(contact)
        }
      })
    }
  }

  function ClientsPersonalInfoCtrl($http, $location, $modal, $rootScope, $scope, $state, $stateParams, personal) {
    $scope.page_type = 'registed';
    $scope.currentTime = new Date().getTime();

    $scope.getRegistedDetail = function () {
      var clientPromise = personal.accountDetail().then(function(result) {
        $scope.inPublic = !result.user_id
        $scope.client = result;
        $scope.isConflict = result.isConflict
        $http.get('/clients/account', { params: { user_id: $scope.self.info.user_id, account_id: result.account.account_id } }).success(function (data) {
          $scope.account = data;
        });

        if ($scope.client.account.trial_expired_at) {
          $scope.client.account.trial_days_left = Math.ceil(($scope.client.account.trial_expired_at * 1000 - new Date().getTime()) / (24 * 3600 * 1000));
        }

        $http.get('/client/contact', { params: { key_type: 'username', key: $scope.client.account.account_name } }).success(function (data) {
          $scope.contacts = data.result.data;
        });

        $http.get('/account/verify_status', { params: { account_name: $scope.client.account.account_name } }).success(function (data) {
          $scope.client.verify_status = data.status
          $scope.client.verify_type = data.type
        })
      })

      clientPromise.then(function () {
        $http.get('/orders', { params: { key_type: 'username', key: $scope.client.account.account_name } })
          .success(function (data) {
            $scope.ordersData = data
          })
      })

      clientPromise.then(function () {
        $http.get('/client/contact_record', { params: { key_type: 'username', key: $scope.client.account.account_name } })
          .success(function (data) {
            $scope.records = data.result
          })
      })
    };

    $scope.getRegistedDetail();

    $scope.viewVerifyDetail = function(account_name) {
      $modal
        .open({
          templateUrl: 'app/clients/identity/identity-detail.html',
          controller: 'IdentityDetail as vm',
          resolve: {
            account_name: function() {
              return $scope.client.account.account_name;
            }
          }
        })
        .result.then(function(op) {
          if (op === 'fin') {
            $scope.getRegistedDetail()
          }
        })
    }

    $scope.changeVerify_Status = function (op) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_update_verify_status.html',
        controller: '_modalUpdateVerifyStatusCtrl',
        backdrop: 'static',
        resolve: {
          op: function () {
            return op;
          },
          account_name: function () {
            return $scope.client.account.account_name;
          }
        }
      });

      modalInstance.result.then(function (op) {
        if (op === 'cancel') return
        $scope.getRegistedDetail();
      });
    }

    $scope.editClient = function () {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_client.html',
        controller: '_modalClientCtrl',
        size: 'lg',
        backdrop: 'static',
        resolve: {
          client: function () {
            return $scope.client;
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.getRegistedDetail();
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
        $scope.getRegistedDetail();
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
        $scope.getRegistedDetail();
      });
    };

    $scope.dissociate = function () {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_dissociate.html',
        controller: '_modalDissociateCtrl',
        resolve: {
          info: function () {
            return {
              name: $scope.client.name,
              account_curr: $scope.client.account,
              account_left: $scope.client.related
            };
          }
        }
      });

      modalInstance.result.then(function (op) {
        if (op !== 'cancel') {
          $scope.getRegistedDetail();
        }
      });
    };

    $scope.drop = function (client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_drop.html',
        controller: '_modalDropCtrl',
        resolve: {
          client: function () {
            return $scope.client;
          }
        }
      });

      modalInstance.result.then(function (result) {
        if (result === 'fin') {
          $state.go('clients.registed');
        } else {
          $scope.getRegistedDetail();
        }
      });
    };

    $scope.pickUp = function (client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_pickup.html',
        controller: '_modalPickupCtrl',
        resolve: {
          client: function () {
            return {
              binding_type: 'pick',
              account_id: client.account.account_id,
              client_id: client.client_id,
              user_id: $scope.self.info.user_id
            };
          }
        }
      });

      modalInstance.result.then(function (result) {
        if (result === 'fin') {
          $state.go('clients.registed_detail', { id: client.account.account_id })
        }
      });
    };

    $scope.dispatch = function (client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_dispatch.html',
        controller: '_modalDispatchCtrl',
        resolve: {
          client: function () {
            return $scope.client;
          }
        }
      });

      modalInstance.result.then(function (reason) {
        if (reason === 'fin') {
          if ($scope.inPublic) {
            $state.go('clients.public');
          } else {
            $state.go('clients.registed');
          }
        } else {
          $scope.getRegistedDetail();
        }
      });
    };

    $scope.updateAccountStatus = function (account_id, account_name, change_type) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_update_account_status.html',
        controller: '_modalUpdateAccountStatusCtrl',
        resolve: {
          updateData: function () {
            return {
              account_id: account_id,
              account_name: account_name || '',
              change_type: change_type,
              trial_days_left: $scope.client.account.trial_days_left || null
            };
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.getRegistedDetail();
      });
    };

    $scope.updateAccount = function (account, type) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_update_account.html',
        controller: '_modalUpdateAccountCtrl',
        resolve: {
          updateData: function () {
            return {
              account: account,
              type: type
            };
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.getRegistedDetail();
      });
    };

    $scope.changeEmailV = function (account) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_verify.html',
        controller: '_modalEmailVerifyCtrl',
        resolve: {
          account: function () {
            return {
              account_id: $scope.client.account.account_id,
              emailV: $scope.client.account.email_validated
            };
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.getRegistedDetail();
      });
    };

    $scope.changePhoneV = function (account) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_verify.html',
        controller: '_modalPhoneVerifyCtrl',
        resolve: {
          account: function () {
            return {
              account_id: $scope.client.account.account_id,
              phoneV: $scope.client.account.mobile_validated
            };
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.getRegistedDetail();
      });
    };

    $scope.resetFirstBuyTime = function (account) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_reset_buy_time.html',
        controller: '_modalResetBuyTimeCtrl',
        resolve: {
          account: function () {
            return {
              account_id: $scope.account.account_id,
              first_buy_time: $scope.account.first_buy_time
            };
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.getRegistedDetail();
      });
    };

    $scope.changeDistributeDtate = function (client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_change_distribute.html',
        controller: '_modalChangeDistributeCtrl',
        resolve: {
          params: function () {
            return {
              client_id: client.client_id,
              distribute_able: client.distribute_able
            };
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.getRegistedDetail();
      });
    };
  }

  function ClientsPersonalContactCtrl(personal, autosave, $scope, $rootScope, $state, $q, $modal) {
    var vm = this
    vm.dateOpts = {
      singleDatePicker: true,
      locale: {
        applyLabel: '确定',
        cancelLabel: '取消',
        fromLabel: '从',
        toLabel: '至',
        customRangeLabel: '自定义日期',
        daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
        monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      }
    }
    vm.dateRange = { startDate: moment(), endDate: moment() }
    vm.addNewContactRecord = addNewContactRecord
    vm.openContactPersonDetail = openContactPersonDetail
    vm.delContact = delContact
    activate()

    function activate() {
      vm.isAddNewContact = false
      vm.viewContactPerson = false
      vm.params = {
        contact_mode : '1',
        contact_type : '3',
        contact_status: '1',
        is_potential: 0
      }
      var autosaveData = autosave.getItem() || {}
      if (autosaveData.content) {
        vm.params.content = autosaveData.content
      }

      $rootScope.initPromise.then(function () {
        vm.params.sale_id = $rootScope.self.info.user_id
        vm.params.sale_name = $rootScope.self.info.name
      })

      $q.all([$scope.clientDetailPromise, $scope.contactPersonPromise]).then(function (results) {
        vm.client = results[0]
        vm.contacts = results[1]
        vm.params.client_id = vm.client.account_id
        vm.params.client_name = vm.client.name
        vm.params.upyun_account = vm.client.account_name
        vm.params.contact_id = vm.contacts[0].contact_id
      })

      autoSaveContact()
      query()
    }

    function openContactPersonDetail(id) {
      function cb() {
        $scope.$emit('update:client')
      }
      $scope.openContactPersonDetail(id, cb)
    }

    function delContact(contact) {
      $modal
        .open({
          templateUrl: 'app/widgets/template/_modal_contact_delete.html',
          controller: '_modalContactDelCtrl',
          resolve: {
            contact: function () {
              return contact
            }
          }
        }).result.then(function () {
          $scope.$emit('update:client')
          activate()
        })
    }

    function addNewContactRecord() {
      vm.params.contact_name = _.findWhere(vm.contacts, { contact_id: vm.params.contact_id }).contact_name
      vm.params.contact_date = vm.dateRange.startDate
      personal.createContactRecord(vm.params).then(function (result) {
        autosave.removeItem()
        $rootScope.notify('success', '联系记录创建成功')
        activate()
        $state.reload()
        $scope.$emit('update:client')
      })
    }

    function query() {
      personal
        .contactRecords()
        .then(function (result) {
          vm.records = result.result.data
        })
    }

    function autoSaveContact() {
      $scope.$watch('vm.params.content', function () {
        autosave.setItem({
          content: vm.params.content,
        })
      })
    }
  }

  function ClientsPersonalRechargeCtrl($rootScope, $scope, personal, $state, $timeout) {
    var vm = this

    vm.prev = prev
    vm.next = next
    vm.trans_types = $rootScope.MAP.trans_types

    vm.refreshDebts = refreshDebts

    activate()

    $scope.$watchGroup(['vm.params.in_out_type', 'vm.dateRange'], function (newValue, oldValue) {
      if (!_.isEqual(newValue, oldValue)) {
        query()
      }
    })

    function activate() {
      vm.params = {}
      vm.state = {}
      vm.dateRange = { startDate: moment().subtract(2, 'months').startOf('day'), endDate: moment().endOf('day') }

      $scope.haveChargeConfPromise.then(function (result) {
        if (result.has_conf) {
          personal.getChargeConfId().then(function (id) {
            vm.state.chargeConfId = id
            vm.state.chargeConfCount = 1
          })
        }
      })
      $scope.debtsPromise.then(function (result) {
        vm.debts = result
      })
      $scope.clientDetailPromise.then(function (result) {
        vm.client = result
      })
      personal.getNoChargeBill().then(function (result) {
        vm.state.noChargeBill = result
        vm.state.noChargeBillCount = result.length
      })
      personal.queryInvoices().then(function (result) {
        vm.state.invoicesCount = [0, 0, 0]
        result.forEach(function (item) {
          if (item.status === '未开票') {
            vm.state.invoicesCount[0]++
          } else if (item.status === '已开票') {
            vm.state.invoicesCount[1]++
          } else if (item.status === '已取消') {
            vm.state.invoicesCount[2]++
          }
        })
      })
      query()
    }

    function query(type) {
      var params = _.assign({}, vm.params)
      if (type !== 'page') {
        _.omit(params, 'max', 'since')
      }

      params.start_time = moment.isMoment(vm.dateRange.startDate) ? vm.dateRange.startDate.unix() : ''
      params.end_time = moment.isMoment(vm.dateRange.endDate) ? vm.dateRange.endDate.unix() : ''

      personal
        .transLog(params)
        .then(function (result) {
          vm.transLogs = result.tran_logs
          vm.page = result.page
          billMatch(getBills)
        })
    }

    function refreshDebts() {
      personal
        .refreshDebts()
        .then(function (result) {
          $scope.notify('success', '同步成功')
          $timeout(function() {
            $scope.$parent.debtsPromise = personal.debts()
            $scope.$parent.debtsPromise.then(function (result) {
              vm.debts = result
            })
          }, 1000)
        })
        .catch(function () {
          $scope.notify('error', '同步失败')
        })
    }

    function prev() {
      if (!vm.page.since) return
      vm.params.since = vm.page.since
      vm.params.max = null
      query('page')
    }

    function next() {
      if (!vm.page.max) return
      vm.params.since = null
      vm.params.max = vm.page.max
      query('page')
    }

    function billMatch(cb) {
      if (!vm.transLogs) vm.transLogs = []
      var haveDayBill = false
      var haveMonthBill = false
      for (var i = 0; i < vm.transLogs.length; i++) {
        var current = vm.transLogs[i]
        if (current.in_out_type === 'DAY_BILL' && !dayEndTime) {
          haveDayBill = true
          var dayEndTime = moment.unix(current && current.tran_create_time).endOf('day')
        }
        if (current.in_out_type === 'DAY_BILL') {
          var dayStartTime = moment.unix(current && current.tran_create_time).startOf('day')
        }
        if (current.in_out_type === 'MONTH_BILL' && !monthEndTime) {
          haveMonthBill = true
          var monthEndTime = moment.unix(current && current.tran_create_time).endOf('day')
        }
        if (current.in_out_type === 'MONTH_BILL') {
          var monthStartTime = moment.unix(current && current.tran_create_time).startOf('day')
        }
      }

      if (monthStartTime) {
        cb({
          start_time: monthStartTime.unix(),
          end_time: monthEndTime.unix(),
          bill_type: 'MONTHLY',
        })
      }
      if (dayStartTime) {
        cb({
          start_time: dayStartTime.unix(),
          end_time: dayEndTime.unix(),
          bill_type: 'DAILY',
        })
      }
    }

    function getBills(params) {
      personal
        .income(params)
        .then(function (result) {
          vm.transLogs = vm.transLogs || []
          for (var i = 0; i < vm.transLogs.length; i++) {
            var current = vm.transLogs[i]
            if ((params.bill_type === 'MONTHLY' && current.in_out_type === 'MONTH_BILL') || (params.bill_type === 'DAILY' && current.in_out_type === 'DAY_BILL')) {
              var bills = result.filter(function (v) {
                var degree = Number(v.pay_time) - Number(current.tran_create_time)
                return degree < 1000 && degree > -1000
              })
              if (bills.length === 1) {
                var bill = bills[0]
                if (current.extra) current.extra = {}
                current.extra.bill = {
                  bill_id: bill.bill_id,
                  bonus_cut: bill.bonus_cut,
                  discount: bill.discount,
                  earn: bill.earn,
                  invoice: bill.invoice,
                  total: bill.total,
                }
              } else if (bills.length > 1) {
                throw new Error('什么鬼!!')
              }
            }
          }
        })
    }

  }

  function ClientsPersonalUsageCtrl($scope, $q, $http, personal, $state, $rootScope, $modal) {
    $scope.clientDetailPromise.then(function (result) {
      $scope.client = result
    })
    $scope.getOverview = function () {
      var survey;
      var account;
      survey = $http.get('/service/account/survey', { params: { user_id: $rootScope.self.info.user_id, account_name: personal.getAccount() } }).success(function (data) {
        $scope.overview = data;
      });
      account = $http.get('/clients/account', { params: { user_id: $rootScope.self.info.user_id, account_name: personal.getAccount() } }).success(function (data) {
        $scope.account = data;
      });
      return $q.all([survey, account])
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

  function UsageStats($filter, $http, $interval, $log, $modal, $rootScope, $scope, $stateParams, $F_stats, $q, $state, $timeout, personal) {
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
      $scope.statsParams.account_name = personal.getAccount()
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

    $scope.$on('usage-detail', function () {
      $scope._getStats();
    })
  }

  function ClientsPersonalLogCtrl(personal, $http, $location, $rootScope, $scope, $state) {
    $scope.features = {
      '客户管理': ['潜在客户', '注册客户', '公海客户', '冲突客户', '丢弃客户', '联系人管理'],
      '客户联系': ['联系记录'],
      '业务管理': ['订单管理', '发票管理', '计费管理'],
      '财务管理': ['账单管理', '客户收支', '提现管理'],
      '系统管理': ['员工帐号', '角色管理'],
    };

    $scope.params = {
      key_type: 'username'
    };

    $scope.date = {
      dateStart: '',
      dateEnd: ''
    };

    //initPromise是$rootScope.init返回promise对象
    $rootScope.initPromise.then(function () {
      if ($rootScope.self.rights && $rootScope.self.rights.indexOf('1_get_user_list') >= 0) {
        $http.get('/users').success(function (data) {
          data.sort(function(a,b) {
            var aName = a.name
            var bName = b.name
            return aName.localeCompare(bName)
          })
          $scope.users = data;
        });
      }
    })

    $scope.fetchCrmLogs = function() {
      var params = _.clone($scope.params)
      var args = [].slice.call(arguments).concat(['since', 'max']),
          param
      if (args.length > -1 && params) {
        for (param in params) {
          if (params.hasOwnProperty(param)) {
            if (args.indexOf(param) > -1) {
              delete params[param]
            }
          }
        }
      }
      if (!params.key) {
        delete params.key
        delete params.key_type
      }
      params.start_time = parseInt(new Date($scope.date.dateStart).getTime() / 1000) || null;
      params.end_time = (parseInt(new Date($scope.date.dateEnd).getTime() / 1000) + 86399) || null;
      personal.log($scope.params).then(function(result) {
        $scope.crmLogs = result;
      })
    };

    $scope.fetchCrmLogsForPage = function() {
      $scope.params.start_time = parseInt(new Date($scope.date.dateStart).getTime() / 1000) || null;
      $scope.params.end_time = (parseInt(new Date($scope.date.dateEnd).getTime() / 1000) + 86399) || null;
      // $http.get('/operation_logs/crm', { params: $scope.params }).success(function(res) {
      //   $scope.crmLogs = res;
      // })
      personal.log($scope.params).then(function(result) {
        $scope.crmLogs = result;
      })
    }

    $scope.prev = function() {
      if(!$scope.crmLogs.page.since) return;
      $scope.params.since = $scope.crmLogs.page.since;
      $scope.params.max = null;
      $scope.fetchCrmLogs();
    };

    $scope.next = function() {
      if(!$scope.crmLogs.page.max) return;
      $scope.params.since = null;
      $scope.params.max = $scope.crmLogs.page.max;
      $scope.fetchCrmLogsForPage();
    };

    $scope.refresh = function() {
      $scope.params = {
        key_type: 'username'
      };
      $scope.date = {
        dateStart: '',
        dateEnd: ''
      };
      $scope.fetchCrmLogsForPage();
    };

    // inits
    $scope.fetchCrmLogs();
  }

  function personal($http) {
    this.setAccount = function (accountName) {
      this.accountName = accountName
    }

    this.getAccount = function () {
      return this.accountName
    }

    // 账号类型
    this.accountType = [{ key: 'personal', value: '个人' }, { key: 'company', value: '公司' }]

    // 返回注册客户列表
    this.query = function (params) {
      return $http
        .get('/my_clients', { params: params })
        .then(function (response) {
          return response.data
        })
    },

    // 注册用户详情
    this.accountDetail = function () {
      return $http
        .get('/clients/client/registed', { params: {
          account_name: this.getAccount()
        }})
        .then(function (response) {
          return response.data
        })
        .then(function(result){
          return result
        })
    }

    // 获取注册用户详情 返回一个对象
    this.detail = function (params) {
      if (!params) params = {}
      var thisParams = _.assign(params, {
        key_type: 'username',
        key: this.getAccount(),
      })
      return $http
        .get('/clients/registed', { params: thisParams })
        .then(function (response) {
          return response.data
        })
        .then(function (result) {
          if (result.clients.length === 0) {
            return $http
              .get('/clients/registed?allotted=false', { params: thisParams })
              .then(function (response) {
                return response.data
              }).then(function (result) {
                return result.clients.length > 0 ? result.clients[0] : {}
              })
          } else {
            return result.clients[0]
          }
        })
    }

    // 联系记录
    this.contactRecords = function (params) {
      if (!params) params = {}
      var thisParams = _.assign(params, {
        key_type: 'username',
        limit: 100,
        key: this.getAccount(),
      })
      return $http
        .get('/client/contact_record', { params: thisParams })
        .then(function (response) {
          return response.data
        })
    }

    // 联系人
    this.contactPerson = function (params) {
      if (!params) params = {}
      var thisParams = _.assign(params, {
        key_type: 'username',
        limit: 100,
        key: this.getAccount(),
      })
      return $http
        .get('/client/contact', { params: thisParams })
        .then(function (response) {
          return response.data
        })
        .then(function (result) {
          return result.result.data
        })
    }

    // 创建联系记录
    this.createContactRecord = function (params) {
      return $http.put('/client/contact_record', params).then(function (response) {
        return response.data
      })
    }

    //欠费管理 返回一个对象
    this.debts = function (params) {
      if (!params) params = {}
      var thisParams = _.assign(params, {
        key: 'username',
        value: this.getAccount(),
      })
      return $http
        .get('/debts', { params: thisParams })
        .then(function (response) {
          return response.data
        })
        .then(function (result) {
          return result.list.length > 0 ? result.list[0] : {}
        })
    }

    // 交易记录
    this.transLog = function (params) {
      if (!params) params = {}
      var thisParams = _.assign(params, {
        key: 'username',
        value: this.getAccount(),
      })
      return $http.get('/transaction_logs', { params: thisParams }).then(function (response) {
        return response.data
      })
    }

    this.refreshDebts = function () {
      var thisParams = {
        account_name: this.getAccount()
      }
      return $http
        .post('/debt/sync', thisParams)
        .then(function (response) {
          return response.data
        })
    }

    // 服务收入
    this.income = function (params) {
      if (!params) params = {}
      var thisParams = _.assign(params, {
        key: 'username',
        size: 100,
        value: this.getAccount(),
      })
      return $http
        .get('/bills/es/income', { params: thisParams })
        .then(function (response) {
          return response.data
        })
        .then(function (result) {
          return result.list
        })
    }

    // 未处理计费配置
    this.haveChargeConf = function () {
      var thisParams = {
        account_name: this.getAccount()
      }
      return $http
        .get('/charge_conf/check', { params: thisParams })
        .then(function (response) {
          return response.data
        })
    }

    // 获取计费配置
    this.getChargeConfId = function () {
      var thisParams = {
        key: this.getAccount(),
        key_type: 'username',
        status: 'PASS',
      }
      return $http
        .get('/charge_confs', { params: thisParams })
        .then(function (response) {
          return response.data
        })
        .then(function (result) {
          return result.charg_confs[0] || {}
        })
        .then(function (result) {
          return result.charge_conf_id
        })
    }

    // 获取未扣款月账单
    this.getNoChargeBill = function () {
      var thisParams = {
        bill_type: 'MONTHLY',
        value: this.getAccount(),
        key: 'username'
      }
      return $http
        .get('/bills/es', { params: thisParams })
        .then(function (response) {
          return response.data
        })
        .then(function (result) {
          return result.list.filter(function (item) {
            return item.is_deductable && !item.is_deducted
          })
        })
    }

    // 发票信息
    this.queryInvoices = function () {
      var thisParams = {
        key: this.getAccount(),
        key_type: 'username',
        limit: 1000,
      }
      return $http
        .get('/invoices', { params: thisParams })
        .then(function (response) {
          return response.data
        })
        .then(function (result) {
          return result.invoices
        })
    }

    // 获取操作日志
    this.log = function (params) {
      var thisParams = _.assign(params, {
        key: this.getAccount(),
        key_type: 'username',
        limit: 1000,
      })
      return $http
        .get('/operation_logs/crm', { params: thisParams })
        .then(function (response) {
          return response.data
        })
    }
  }

  function accountType(personal) {
    return function (input) {
      return _.findWhere(personal.accountType, { key: input }) && _.findWhere(personal.accountType, { key: input }).value
    }
  }

  function accountStatus($rootScope) {
    return function (input) {
      return $rootScope.MAP.account_status[input]
    }
  }

  function fromNow() {
    return function (input) {
      moment.locale('zh-cn', {
        relativeTime: {
          future: "在%s",
          past: "%s前",
          s: "%d秒",
          m: "一分钟",
          mm: "%d分钟",
          h: "一小时",
          hh: "%d小时",
          d: "一天",
          dd: "%d天",
          M: "一个月",
          MM: "%d个月",
          y: "一年",
          yy: "%d年"
        }
      })
      return input ? moment.unix(input).fromNow() : ''
    }
  }

  function contactType($rootScope) {
    return function (input) {
      return $rootScope.MAP.contact_types[input]
    }
  }

  function contactMode($rootScope) {
    return function (input) {
      return $rootScope.MAP.contact_modes[input]
    }
  }

  function contactStatus($rootScope) {
    return function (input) {
      return $rootScope.MAP.contact_status[input]
    }
  }

  function contactTransform($rootScope) {
    return function (input) {
      return input ? input.split(/[\r\t\n\f\v]/g) : []
    }
  }

  function transtypes($rootScope) {
    return function (input) {
      return $rootScope.MAP.trans_types[input]
    }
  }
})();