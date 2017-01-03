angular.module('koala.clients')
.controller('clientsPotentialCtrl', ['$http', '$location', '$modal', '$rootScope', '$scope', '$state',
  function($http, $location, $modal, $rootScope, $scope, $state) {

    // search params
    $scope.params = {
      key_type: "name"
    };

    $scope.daterange = {startDate: null, endDate: null};

    $scope.fetchClients = function() {
      $scope.params.user_id = $scope.params.user_id || '';

      // covert time to timestamp
      $scope.params.created_since = parseInt(new Date($scope.daterange.startDate).getTime() / 1000) || null;
      $scope.params.created_max = parseInt(new Date($scope.daterange.endDate).getTime() / 1000) || null;
      $scope.params.limit = 20;

      $http.get('/clients/potential', {
        params: $scope.params
      }).success(function(data) {
        $scope.clientsData = data;
      });
    };

    $scope.createPotentialClient = function() {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_client.html',
        controller: '_modalClientCtrl',
        size: 'lg',
        backdrop: 'static',
        resolve: {
          client: function() {
            return {};
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.fetchClients();
      });
    };

    $scope.prev = function() {
      if (!$scope.clientsData.page.since) return;
      $scope.params.since = $scope.clientsData.page.since;
      $scope.params.max = null;
      $scope.fetchClients();
    };

    $scope.next = function() {
      if (!$scope.clientsData.page.max) return;
      $scope.params.since = null;
      $scope.params.max = $scope.clientsData.page.max;
      $scope.fetchClients();
    };


    $scope.refresh = function() {
      $scope.daterange = {startDate: null, endDate: null};

      $scope.params = {
        key_type: "name"
      };
      $scope.fetchClients();
    };

    _.defer(function () {
      if (history.state) {
        $scope.params = history.state.params
        $scope.daterange = history.state.daterange
      }
      $scope.fetchClients();
    })

    $scope.go = function (state, params) {
      var historyState = {
        params: $scope.params,
        daterange: _.mapValues($scope.daterange,function(date) {return _.isString(date) ? date : date && date.format('YYYY-MM-DD')})
      }
      history.pushState(historyState, '')
      $state.go(state, params)
    }

  }
])
.controller('_modalClientCtrl', ['$http', '$modalInstance', '$scope', 'client', 'LOCATION',
  function($http, $modalInstance, $scope, client, location) {

    // get China province and city json
    $scope.provinces = location;

    $scope.getCities = function() {
      $scope.cities = $scope.provinces.filter(function(itm) {
        return Number($scope.client.province) == itm.id;
      })[0].sub;

      if ($scope.cities.length > 0) {
        $scope.client.city = $scope.cities[0].id
      }
    };

    $scope.main_business = [
      {
        "name":"移动应用",
        "sub":[{"name":"社交通讯"},{"name":"资讯阅读"},{"name":"生活消费"},{"name":"音乐视频"},{"name":"摄影美化"},{"name":"地图导航"},{"name":"学习办公"},{"name":"其他"}]
      },
      {
        "name":"门户网站",
        "sub":[{"name":"政府"},{"name":"企业官网"},{"name":"社区"},{"name":"论坛"},{"name":"博客"},{"name":"其他"}]
      },
      {
        "name":"行业服务",
        "sub":[{"name":"金融"},{"name":"医疗"},{"name":"教育"},{"name":"旅游"},{"name":"SAAS"},{"name":"其他"}]
      },
      {
        "name":"电子商务",
        "sub":[{"name":"B2C"},{"name":"C2C"},{"name":"B2B"},{"name":"O2O"},{"name":"团购"},{"name":"其他"}]
      },
      {
        "name":"音视频",
        "sub":[{"name":"网络电视"},{"name":"视频监控"},{"name":"在线视频"},{"name":"其他"}]
      },
      {
        "name":"游戏领域",
        "sub":[{"name":"网页游戏"},{"name":"手机端游戏"},{"name":"客户端游戏"}]
      },
      {
        "name":"其他",
        "sub":[{"name":"其他"}]
      }
    ];

    $scope.getBusiness = function() {
      var filter = $scope.main_business.filter(function(itm) {
        return $scope.client.category === itm.name;
      })[0];

      if (filter) {
        $scope.business_types = filter.sub;
        $scope.client.business = $scope.business_types[0].name
      }
    };

    $scope.client = angular.copy(client) || {};

    // split main_business two params
    if ($scope.client.main_business) {
      $scope.client.category = $scope.client.main_business.split(',')[0];
    }

    // detect main business
    if ($scope.client.category) {
      $scope.getBusiness();
      $scope.client.business = $scope.client.main_business.split(',')[1];
    }

    // detect cities
    if ($scope.client.province && /^[0-9]+$/g.test($scope.client.province)) {
      $scope.getCities();
    }

    // copy user_id
    $scope.client.user_id = $scope.self.info.user_id;
    //客户名称可以不存在，这里是bug,改为client_id试试
    //$scope.edit = !!client.name;
    $scope.edit = !!client.client_id;

    if (!$scope.edit) {
      $scope.client.status = 'untreated';
    }

    $scope.check = {};

    $scope.isExists = function(type, value) {
      $http.get('/clients/client/check', { params: { type: type, value: value } }).success(function(data) {
        $scope.check['is_' + type + '_exists'] = data.is_exists;
      });
    };

    $scope.submit = function() {
      var config;
      // combine two params to one
      $scope.client.main_business = $scope.client.category + ',' + $scope.client.business;

      if ($scope.edit) {
        delete $scope.client.client_type;

        config = {
          url: '/clients/client',
          method: 'POST',
          data: $scope.client
        };
      } else {
        config = {
          url: '/clients/client',
          method: 'PUT',
          data: $scope.client
        };
      }

      $http(config).success(function(data) {
        if (!$scope.edit) {
          $scope.contact.is_potential = 1;
          $scope.contact.client_id = data.client_id;
          $scope.contact.created_by = $scope.self.info.user_id;

          $http.put('/client/contact', $scope.contact).success(function(data) {
            $modalInstance.close($scope.client);
          });
        } else {
          $modalInstance.close($scope.client);
        }
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('clientsPotentialDetailCtrl', ['$http', '$location', '$modal', '$rootScope', '$scope', '$state', '$stateParams',
  function($http, $location, $modal, $rootScope, $scope, $state, $stateParams) {

    $scope.page_type = 'potential';

    // detect if current is in the public sea
    $scope.inPublic = $location.path().indexOf('public') >= 0;

    $scope.getClientInfo = function() {
      var clientPromise = $http.get('/clients/client/potential', {
        params: {
          client_id: $stateParams.id
        }
      }).success(function(data) {
        $scope.client = data;
      });

      $http.get('/client/contact', { params: { key_type: 'client_id', key: $stateParams.id } }).success(function(data) {
        $scope.contacts = data.result.data;
      });

      clientPromise.then(function() {
          $http.get('/client/contact_record',{ params: {key_type: 'name', key: $scope.client.name}})
            .success(function(data) {
              $scope.records = data.result
            })
        }
      )
    };

    $scope.getClientInfo();

    $scope.editClient = function() {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_client.html',
        controller: '_modalClientCtrl',
        size: 'lg',
        backdrop: 'static',
        resolve: {
          client: function() {
            return $scope.client;
          }
        }
      });

      modalInstance.result.then(function(client) {
        $scope.client = angular.extend($scope.client, client);
      });
    };

    $scope.drop = function(client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_drop.html',
        controller: '_modalDropCtrl',
        resolve: {
          client: function() {
            return client;
          }
        }
      });

      modalInstance.result.then(function(result) {
        if (result === 'fin') {
          $state.go('clients.potential');
        } else {
          $scope.getClientInfo()
        }
      });
    };

    $scope.pickUp = function(client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_pickup.html',
        controller: '_modalPickupCtrl',
        resolve: {
          client: function() {
            return {
              binding_type: 'pick',
              account_id: client.account_id,
              client_id: client.client_id,
              user_id: $scope.self.info.user_id
            };
          }
        }
      });

      modalInstance.result.then(function() {
        if ($scope.inPublic) {
          $state.go('clients.public_pot_detail', { id: client.client_id });
        } else {
          $state.go('clients.potential_detail', { id: client.client_id });
        }

      });
    };

    $scope.dispatch = function(client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_dispatch.html',
        controller: '_modalDispatchCtrl',
        resolve: {
          client: function() {
            return $scope.client;
          }
        }
      });

      modalInstance.result.then(function() {
        if ($scope.inPublic) {
          $state.go('clients.public');
        } else {
          $state.go('clients.potential');
        }
      });
    };

    $scope.updateClient = function() {
      $http.post('/clients/client', $scope.client).success(function(data) {
        $scope.getClientInfo();
      });
    };

    $scope.editContact = function(contact) {
      var modalInstance = $modal.open({
        templateUrl: 'app/widgets/template/_modal_contact.html',
        controller: '_modalContactCtrl',
        resolve: {
          contact: function() {
            return contact;
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getClientInfo();
      });
    };

    $scope.delContact = function(contact) {
      var modalInstance = $modal.open({
        templateUrl: 'app/widgets/template/_modal_contact_delete.html',
        controller: '_modalContactDelCtrl',
        resolve: {
          contact: function() {
            return contact;
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getClientInfo();
      });
    };

  }
])
.controller('_modalDropCtrl', ['$http', '$modalInstance', '$scope', '$state', 'client', '$rootScope', '$timeout',
  function($http, $modalInstance, $scope, $state, client, $rootScope, $timeout) {
    $scope.drop_reasons = {
      1: '不需要',
      2: '不对口',
      3: '未备案',
      4: '联系不上',
      5: '价格问题',
      6: '功能问题',
      7: '选择其他服务',
      8: '项目未完成',
      9: '目前量不大',
      10: '其他',
      12: '重复帐号'
    }
    $scope.client = client;
    var reasons_map = {
        1: '客户不需要情况描述',
        2: '服务不对口情况描述',
        3: '具体情况描述',
        4: '具体情况描述',
        5: '理想价格区间',
        6: '需要的功能',
        7: '选择了什么服务商',
        8: '具体情况描述',
        9: '具体情况描述',
        10: '具体原因描述',
        12: '对应管理账户信息'
    }
    $scope.reason_info = '请选择丢弃原因'

    $scope.drop = {
      client_id: client.client_id,
      user_id: client.user_id
    };

    $scope.update = function() {
      //$scope.drop.remarks = ''
      $scope.reason_info = reasons_map[$scope.drop.reason] || '请选择丢弃原因'
    }
    $scope.submit = function() {
      if(!$scope.drop.reason) {$rootScope.notify('danger', '请选择丢弃原因');return false}
      if($scope.drop.remarks && $scope.drop.remarks.trim().length > 0) {
        $http.put('/drops/drop', $scope.drop).success(function (data) {
          $modalInstance.close('fin');
        });
      } else {
        $rootScope.notify('danger', '请输入详细丢弃原因');
      }
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

    //禁止复制粘贴,怎么又得要用timeout啊!怎么破
    $timeout(function () {
      $('#forbidCopyEvent')
        .on({
        "keydown": function (event) {
        },
        "contextmenu": false,
        "cut copy paste": function(e) {
          e.preventDefault();
         }
        })
    })

  }
])
.controller('_modalDispatchCtrl', ['$http', '$modalInstance', '$scope', 'client',
  function($http, $modalInstance, $scope, client) {

    $scope.client = angular.copy(client);

    $scope.submit = function() {
      $http.post('/clients/client/binding', {
        binding_type: 'allot',
        account_id: $scope.client.account ? $scope.client.account.account_id : null,
        client_id: $scope.client.client_id,
        user_id: $scope.client.user_id
      }).success(function(data) {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalPickupCtrl', ['$http', '$modalInstance', '$scope', '$state', 'client',
  function($http, $modalInstance, $scope, $state, client) {

    $scope.submit = function() {
      $http.post('/clients/client/binding', client).success(function(data) {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('clientsRegistedCtrl', ['$http', '$location', '$rootScope', '$scope', '$state', 'autosave',
  function($http, $location, $rootScope, $scope, $state, autosave) {
    var autosaveData = autosave.getItem() || {}

    $scope.params = autosaveData.params || { key_type: 'username' }

    $scope.dateType = autosaveData.dateType || 'contact';

    if (autosaveData.daterange) {
      $scope.daterange = _.mapValues(autosaveData.daterange, function (v) {
        return v ? moment(v) : null
      })
    } else {
      $scope.daterange = {startDate: null, endDate: null};
    }

    $scope.fetchRegs = function() {
      var params = _.clone($scope.params)

      autosave.setItem({
        params: params,
        dateType: $scope.dateType,
        daterange: _.mapValues($scope.daterange, function (v) {
          return moment.isMoment(v) ? moment(v).valueOf() : ''
        }),
      })

      params.user_id = params.user_id || '';

      if ($scope.dateType === 'last_buy_time') {
        params.contact_since = null;
        params.contact_max = null;
        params.order_since = parseInt(new Date($scope.daterange.startDate).getTime() / 1000) || null;
        params.order_max = parseInt(new Date($scope.daterange.endDate).getTime() / 1000) || null;
      } else {
        params.order_since = null;
        params.order_max = null;
        params.contact_since = parseInt(new Date($scope.daterange.startDate).getTime() / 1000) || null;
        params.contact_max = parseInt(new Date($scope.daterange.endDate).getTime() / 1000) || null;
      }

      $http.get('/clients/registed', {
        params: params
      }).success(function(data) {
        $scope.clients = data;
      });
    };


    $scope.prev = function() {
      if (!$scope.clients.page.since) return;
      $scope.params.since = $scope.clients.page.since;
      $scope.params.max = null;
      $scope.fetchRegs();
    };

    $scope.next = function() {
      if (!$scope.clients.page.max) return;
      $scope.params.since = null;
      $scope.params.max = $scope.clients.page.max;
      $scope.fetchRegs();
    };



    $scope.refresh = function() {
      autosave.removeItem()
      $state.reload()
    };

    _.defer(function () {
      // init
      $scope.fetchRegs();
    })

    $scope.go = function (state, params) {
      $state.go(state, params)
    }

  }
])
.controller('clientsRegistedDetailCtrl', ['$http', '$location', '$modal', '$rootScope', '$scope', '$state', '$stateParams',
  function($http, $location, $modal, $rootScope, $scope, $state, $stateParams) {
    $scope.broadcastActive = function() {
      $scope.$broadcast('usage-detail')
    }
    // control the detail page, which elements should displayed
    $scope.page_type = 'registed';

    // detect if current is in the public sea
    $scope.inPublic = $location.path().indexOf('public') >= 0;

    // TODO:
    $scope.currentTime = new Date().getTime();

    $scope.getRegistedDetail = function() {
      var params = /[a-zA-Z_\-]/.test($stateParams.id) ? { account_name: $stateParams.id } : { account_id: $stateParams.id };

      var clientPromise = $http.get('/clients/client/registed', { params: params }).success(function(data) {
        if (!data.user_id && !$scope.inPublic) {
          $state.go('clients.public_reg_detail', {id: data.client_id})
        }
        if (data.user_id && $scope.inPublic) {
          $state.go('clients.registed_detail',{id: data.account.account_id})
        }
        $scope.client = data;
        $scope.isConflict = data.isConflict
        $http.get('/clients/account', { params: { user_id: $scope.self.info.user_id, account_id: data.account.account_id}}).success(function(data) {
          $scope.account = data;
        });

        if ($scope.client.account.trial_expired_at) {
          $scope.client.account.trial_days_left = Math.ceil(($scope.client.account.trial_expired_at * 1000 - new Date().getTime()) / (24 * 3600 * 1000));
        }

        $http.get('/client/contact', { params: { key_type: 'username', key: $scope.client.account.account_name } }).success(function(data) {
          $scope.contacts = data.result.data;
        });

        $http.get('/account/verify_status', { params: { account_name: $scope.client.account.account_name } }).success(function (data) {
          $scope.client.verify_status = data.status
          $scope.client.verify_type = data.type
         })
      });

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
          op: function() {
            return op;
          },
          account_name: function() {
            return $scope.client.account.account_name;
          }
        }
      });

      modalInstance.result.then(function(op) {
        if (op === 'cancel') return
        $scope.getRegistedDetail();
      });
    }

    $scope.editClient = function() {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_client.html',
        controller: '_modalClientCtrl',
        size: 'lg',
        backdrop: 'static',
        resolve: {
          client: function() {
            return $scope.client;
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getRegistedDetail();
      });
    };

    $scope.editContact = function(contact) {
      var modalInstance = $modal.open({
        templateUrl: 'app/widgets/template/_modal_contact.html',
        controller: '_modalContactCtrl',
        resolve: {
          contact: function() {
            return contact;
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getRegistedDetail();
      });
    };

    $scope.delContact = function(contact) {
      var modalInstance = $modal.open({
        templateUrl: 'app/widgets/template/_modal_contact_delete.html',
        controller: '_modalContactDelCtrl',
        resolve: {
          contact: function() {
            return contact;
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getRegistedDetail();
      });
    };

    $scope.dissociate = function() {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_dissociate.html',
        controller: '_modalDissociateCtrl',
        resolve: {
          info: function() {
            return {
              name: $scope.client.name,
              account_curr: $scope.client.account,
              account_left: $scope.client.related
            };
          }
        }
      });

      modalInstance.result.then(function(op) {
        if(op !== 'cancel') {
          $scope.getRegistedDetail();
        }
      });
    };

    $scope.drop = function(client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_drop.html',
        controller: '_modalDropCtrl',
        resolve: {
          client: function() {
            return $scope.client;
          }
        }
      });

      modalInstance.result.then(function(result) {
        if (result === 'fin') {
          $state.go('clients.registed');
        } else {
          $scope.getRegistedDetail();
        }
      });
    };

    $scope.pickUp = function(client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_pickup.html',
        controller: '_modalPickupCtrl',
        resolve: {
          client: function() {
            return {
              binding_type: 'pick',
              account_id: client.account.account_id,
              client_id: client.client_id,
              user_id: $scope.self.info.user_id
            };
          }
        }
      });

      modalInstance.result.then(function(result) {
        if(result === 'fin') {
            $state.go('clients.registed_detail', { id: client.account.account_id })
        }
      });
    };

    $scope.dispatch = function(client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_dispatch.html',
        controller: '_modalDispatchCtrl',
        resolve: {
          client: function() {
            return $scope.client;
          }
        }
      });

      modalInstance.result.then(function(reason) {
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

    $scope.updateAccountStatus = function(account_id, account_name, change_type) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_update_account_status.html',
        controller: '_modalUpdateAccountStatusCtrl',
        resolve: {
          updateData: function() {
            return {
              account_id: account_id,
              account_name: account_name || '',
              change_type: change_type,
              trial_days_left: $scope.client.account.trial_days_left || null
            };
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getRegistedDetail();
      });
    };

    $scope.updateAccount = function(account, type) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_update_account.html',
        controller: '_modalUpdateAccountCtrl',
        resolve: {
          updateData: function() {
            return {
              account: account,
              type: type
            };
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getRegistedDetail();
      });
    };

    $scope.changeEmailV = function(account) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_verify.html',
        controller: '_modalEmailVerifyCtrl',
        resolve: {
          account: function() {
            return {
              account_id: $scope.client.account.account_id,
              emailV: $scope.client.account.email_validated
            };
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getRegistedDetail();
      });
    };

    $scope.changePhoneV = function(account) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_verify.html',
        controller: '_modalPhoneVerifyCtrl',
        resolve: {
          account: function() {
            return {
              account_id: $scope.client.account.account_id,
              phoneV: $scope.client.account.mobile_validated
            };
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getRegistedDetail();
      });
    };

    $scope.resetFirstBuyTime = function(account) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_reset_buy_time.html',
        controller: '_modalResetBuyTimeCtrl',
        resolve: {
          account: function() {
            return {
              account_id: $scope.account.account_id,
              first_buy_time: $scope.account.first_buy_time
            };
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getRegistedDetail();
      });
    };

    $scope.changeDistributeDtate = function(client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_change_distribute.html',
        controller: '_modalChangeDistributeCtrl',
        resolve: {
          params: function() {
            return {
              client_id: client.client_id,
              distribute_able: client.distribute_able
            };
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getRegistedDetail();
      });
    };

  }
])

.controller('_modalUpdateVerifyStatusCtrl', ['$http', '$modalInstance', '$scope', 'op', 'account_name',
  function($http, $modalInstance, $scope, op, account_name) {
    $scope.op = op
    $scope.submit = function() {
      var data = {
        opt_type: op,
        account_name: account_name
      };
      $http.post('/account/verify', data).success(function() {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalDissociateCtrl', ['$http', '$modalInstance', '$scope', 'info',
  function($http, $modalInstance, $scope, info) {

    $scope.info = info;

    $scope.submit = function() {
      var data = {
        binding_type: 'free',
        account_id: info.account_curr.account_id
      };
      $http.post('/clients/client/binding', data).success(function() {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalEmailVerifyCtrl', ['$http', '$modalInstance', '$scope', 'account',
  function($http, $modalInstance, $scope, account) {

    $scope.data = {
      change_type: 'validate_email',
      change_value: account.emailV,
      account_id: account.account_id
    };

    $scope.submit = function() {
      $http.post('/clients/upyun/account', $scope.data).success(function(data) {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalPhoneVerifyCtrl', ['$http', '$modalInstance', '$scope', 'account',
  function($http, $modalInstance, $scope, account) {

    $scope.data = {
      change_type: 'validate_mobile',
      change_value: account.phoneV,
      account_id: account.account_id
    };

    $scope.submit = function() {
      $http.post('/clients/upyun/account', $scope.data).success(function(data) {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalUpdateAccountCtrl', ['$http', '$modalInstance', '$scope', 'updateData',
  function($http, $modalInstance, $scope, updateData) {

    $scope.update_type = updateData.type;
    $scope.account = {};
    $scope.account.account_name = updateData.account.account_name;
    $scope.account[$scope.update_type] = updateData.account[$scope.update_type];

    $scope.submit = function() {
      $http.post('/accounts/account', $scope.account).success(function(data) {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalUpdateAccountStatusCtrl', ['$http', '$modalInstance', '$scope', 'updateData',
  function($http, $modalInstance, $scope, updateData) {

    $scope.updateData = angular.copy(updateData);

    if (updateData.change_type === 'passwd') {
      $scope.updateData.change_value = '123456';
    }

    $scope.submit = function() {
      if($scope.updateData.change_type === 'lock' && !$scope.updateData.change_value) {
        $scope.notify('danger', '请输入停用理由')
        return
      }
      $http.post('/clients/upyun/account', $scope.updateData).success(function(data) {
        if (data.status === true) {
          $modalInstance.close('fin');
        }
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalResetBuyTimeCtrl', ['$http', '$modalInstance', '$scope', 'account',
  function($http, $modalInstance, $scope, account) {

    $scope.account = angular.copy(account);

    $scope.submit = function() {
      $http.post('/clients/account/reset_first_buy', { account_id: $scope.account.account_id }).success(function() {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalChangeDistributeCtrl', ['$http', '$modalInstance', '$scope', 'params',
  function($http, $modalInstance, $scope, params) {

    $scope.params = params;

    $scope.submit = function() {
      $http.post('/client/distribute_state', $scope.params).success(function() {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalClientSearchCtrl', ['$http', '$modalInstance', '$scope', 'type',
  function($http, $modalInstance, $scope, type) {

    $scope.params = {
      key_type: 'username'
    };

    $scope.fetchClients = function() {
      $scope.params.user_id = $scope.params.user_id || $scope.self.info.user_id;

      // covert time to timestamp
      $scope.params.contact_since = parseInt(new Date($scope.dateStart).getTime() / 1000) || null;
      $scope.params.contact_max = parseInt(new Date($scope.dateEnd).getTime() / 1000) || null;

      $scope.params.limit = 20;

      // TODO
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
            $scope.clients.clients = $scope.clients.clients.concat(registedInPublic.clients);
          });
        });
      }

    };

    $scope.assign = function(client) {
      $modalInstance.close(client);
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('clientsPublicCtrl', ['$http', '$location', '$modal', '$rootScope', '$scope', '$state',
  function($http, $location, $modal, $rootScope, $scope, $state) {

    $scope.params = {
      key_type: 'name',
      allotted: false,
      limit: 20
    };

    $scope.date = {
      dateType: 'created',
      daterange: {startDate: null, endDate: null}
    };

    $scope.wtf = [true, false]

    $scope.fetchPublicReg = function() {
      if ($scope.self.info.region_id) {
        $scope.params.region_ids = JSON.stringify($scope.self.info.region_id.split(','))
      } else {
        $scope.params.region_ids = '[""]'
      }
      var params = angular.copy($scope.params);

      if ($scope.date.dateType === 'created') {
        params.contact_max = null;
        params.contact_since = null;
        params.created_since = parseInt(new Date($scope.date.daterange.startDate).getTime() / 1000) || null;
        params.created_max = parseInt(new Date($scope.date.daterange.endDate).getTime() / 1000) || null;
      } else {
        params.created_since = null;
        params.created_max = null;
        params.contact_since = parseInt(new Date($scope.date.daterange.startDate).getTime() / 1000) || null;
        params.contact_max = parseInt(new Date($scope.date.daterange.endDate).getTime() / 1000) || null;
      }

      $http.get('/clients/registed', { params: params }).success(function(data) {
        $scope.registedData = data;
      });
    };

    $scope.fetchPublicPotential = function() {
      if ($scope.self.info.region_id) {
        $scope.params.region_ids = JSON.stringify($scope.self.info.region_id.split(','))
      } else {
        $scope.params.region_ids = '[""]'
      }
      var params = angular.copy($scope.params);

      if ($scope.date.dateType === 'created') {
        params.contact_max = null;
        params.contact_since = null;
        params.created_since = parseInt(new Date($scope.date.daterange.startDate).getTime() / 1000) || null;
        params.created_max = parseInt(new Date($scope.date.daterange.endDate).getTime() / 1000) || null;
      } else {
        params.created_since = null;
        params.created_max = null;
        params.contact_since = parseInt(new Date($scope.date.daterange.startDate).getTime() / 1000) || null;
        params.contact_max = parseInt(new Date($scope.date.daterange.endDate).getTime() / 1000) || null;
      }

      $http.get('/clients/potential', { params: params }).success(function(data) {
        $scope.potentialData = data;
      });
    };



    $scope.pickUp = function(client) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_pickup.html',
        controller: '_modalPickupCtrl',
        resolve: {
          client: function() {
            return {
              binding_type: 'pick',
              account_id: client.account_id,
              client_id: client.client_id,
              user_id: $scope.self.info.user_id
            };
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.fetchPublicReg();
        $scope.fetchPublicPotential();
      });
    };

    $scope.regPrev = function() {
      if (!$scope.registedData.page.since) return;
      $scope.params.since = $scope.registedData.page.since;
      $scope.params.max = null;
      $scope.fetchPublicReg();
    };

    $scope.regNext = function() {
      if (!$scope.registedData.page.max) return;
      $scope.params.since = null;
      $scope.params.max = $scope.registedData.page.max;
      $scope.fetchPublicReg();
    };

    $scope.potentialPrev = function() {
      if (!$scope.potentialData.page.since) return;
      $scope.params.since = $scope.potentialData.page.since;
      $scope.params.max = null;
      $scope.fetchPublicPotential();
    };

    $scope.potentialNext = function() {
      if (!$scope.potentialData.page.max) return;
      $scope.params.since = null;
      $scope.params.max = $scope.potentialData.page.max;
      $scope.fetchPublicPotential();
    };


    $scope.refresh = function(type) {
      $scope.date = {
        dateType: 'created',
        daterange: {startDate: null, endDate: null}
      };

      $scope.params = {
        key_type: 'name',
        allotted: false,
        limit: 20
      };

      if (type === 'registed') {
        $scope.fetchPublicReg();
      } else {
        $scope.fetchPublicPotential();
      }

    };

    _.defer(function () {
      if (history.state) {
        $scope.params = history.state.params
        $scope.date = history.state.date
        $scope.wtf = history.state.wtf
      }
      $scope.fetchPublicReg();
      $scope.fetchPublicPotential();
    })
    $scope.go = function (state, params) {
      var historyState = {
        params: $scope.params,
        date: {
          dateType: $scope.date.dateType,
          daterange: _.mapValues($scope.date.daterange,function(date) {return _.isString(date) ? date : date && date.format('YYYY-MM-DD')})
        },
        wtf: $scope.wtf
      }
      history.pushState(historyState, '')
      $state.go(state, params)
    }
  }
])
.controller('clientsConflictCtrl', ['$http', '$location', '$modal', '$rootScope', '$scope', '$state', '$stateParams',
  function($http, $location, $modal, $rootScope, $scope, $state, $stateParams) {
    $scope.params = {
      limit: 20,
      key_type: 'username'
    };

    if($stateParams.account_name) {
      $scope.params = {
        limit: 20,
        key_type: 'username',
        key: $stateParams.account_name
      };
    }

    $scope.daterange = {startDate: null, endDate: null};

    $scope.getConflicts = function(type) {
      if (type !== 'page') {
        delete $scope.params.since
        delete $scope.params.max
      }
      $scope.params.created_since = parseInt(new Date($scope.daterange.startDate).getTime() / 1000) || null;
      $scope.params.created_max = parseInt(new Date($scope.daterange.endDate).getTime() / 1000) || null;

      $http.get('/conflicts', { params: $scope.params }).success(function(data) {
        $scope.conflictsData = data;
      });
    };

    $scope.getConflicts();

    $scope.dispatch = function(conflict_id) {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_conflict_dispatch.html',
        controller: '_modalConflictDispatchCtrl',
        resolve: {
          conflict_id: function() {
            return conflict_id;
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getConflicts();
      });
    };

    $scope.prev = function() {
      if (!$scope.conflictsData.page.max) return;
      $scope.params.max = $scope.conflictsData.page.max;
      $scope.params.since = null;
      $scope.getConflicts('page');
    };

    $scope.next = function() {
      if (!$scope.conflictsData.page.since) return;
      $scope.params.max = null;
      $scope.params.since = $scope.conflictsData.page.since;
      $scope.getConflicts('page');
    };

    $scope.refresh = function() {
      $scope.params = {
        limit: 20,
        key_type: 'username'
      };

      $scope.daterange = {startDate: null, endDate: null};

      $scope.getConflicts();
    }

  }
])
.controller('clientsConflictDetailCtrl', ['$http', '$modal', '$scope', '$state', '$stateParams',
  function($http, $modal, $scope, $state, $stateParams) {

    $scope.params = {};

    $scope.conflictDescs = {
      name: '客户名称',
      phone: '手机号',
      email: '邮箱',
      website: '网站地址'
    };

    $scope.getConflict = function() {
      $http.get('/conflict', { params: { conflict_id: $stateParams.id } }).success(function(data) {
        $scope.conflict = data;
      });
    };

    $scope.getConflict();

    $scope.ignore = function() {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_conflict_ignore.html',
        controller: '_modalConflictIgnoreCtrl',
        resolve: {
          conflict_id: function() {
            return $stateParams.id;
          }
        }
      });

      modalInstance.result.then(function(op) {
        if (op !== 'cancel') {
          $state.go('clients.conflict');
        }
      });
    };

    $scope.merge = function() {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_conflict_merge.html',
        controller: '_modalConflictMergeCtrl',
        resolve: {
          conflict_id: function() {
            return $stateParams.id;
          },
          isRegisted: function() {
            return $scope.conflict.client_type === 'registed' ?　true : false
          }
        }
      });

      modalInstance.result.then(function(op) {
        if (op !== 'cancel') {
          $state.go('clients.conflict');
        }
      });
    };

    $scope.dispatch = function() {
      var modalInstance = $modal.open({
        templateUrl: 'app/clients/views/_modal_conflict_dispatch.html',
        controller: '_modalConflictDispatchCtrl',
        resolve: {
          conflict_id: function() {
            return $stateParams.id;
          }
        }
      });

      modalInstance.result.then(function() {
          $scope.getConflict();
      });
    };


  }
])
.controller('clientsDiscardedCtrl', ['$http', '$location', '$rootScope', '$scope', '$state',
  function($http, $location, $rootScope, $scope, $state) {

    $scope.params = {
      key_type: 'username'
    };

    $scope.daterange = {startDate: null, endDate: null};

    $scope.fetchDiscardeds = function() {
      // covert time to timestamp
      $scope.params.start_time = parseInt(new Date($scope.daterange.startDate).getTime() / 1000) || null;
      $scope.params.end_time = parseInt(new Date($scope.daterange.endDate).getTime() / 1000) || null;

      $http.get('/drops', {
        params: $scope.params
      }).success(function(data) {
        $scope.discardeds = data;
      });
    };

    $scope.fetchDiscardeds();

    $scope.prev = function() {
      if (!$scope.discardeds.page.since) return;
      $scope.params.since = $scope.discardeds.page.since;
      $scope.params.max = null;
      $scope.fetchDiscardeds();
    };

    $scope.next = function() {
      if (!$scope.discardeds.page.max) return;
      $scope.params.since = null;
      $scope.params.max = $scope.discardeds.page.max;
      $scope.fetchDiscardeds();
    };

    $scope.refresh = function() {
      $scope.daterange = {startDate: null, endDate: null};

      $scope.params = {
        key_type: 'username'
      };
      $scope.fetchDiscardeds();
    };

  }
])
.controller('_modalConflictDispatchCtrl', ['$http', '$modalInstance', '$scope', 'conflict_id',
  function($http, $modalInstance, $scope, conflict_id) {

    $http.get('/conflict', { params: { conflict_id: conflict_id } }).success(function(data) {
      $scope.conflict = data;
    });

    $scope.submit = function() {
      $scope.params.conflict_id = conflict_id;
      $http.post('/conflict/distribute', $scope.params).success(function(data) {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalConflictIgnoreCtrl', ['$http', '$modalInstance', '$scope', 'conflict_id',
  function($http, $modalInstance, $scope, conflict_id) {

    $scope.submit = function() {
      $http.post('/conflict/ignore', { conflict_id: conflict_id}).success(function(data) {
        if (data.status === true) {
          $modalInstance.close('fin');
        }
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalConflictMergeCtrl', ['$http', '$modalInstance', '$scope', 'conflict_id','isRegisted',
  function($http, $modalInstance, $scope, conflict_id, isRegisted) {
    $scope.isRegisted = isRegisted

    $scope.submit = function() {
      $http.post('/conflict/connect', { conflict_id: conflict_id }).success(function(data) {
        if (data.status === true) {
          $modalInstance.close('fin');
        }
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('tabsContactRecordCtrl', ['common' ,'$http', '$scope', '$modal', '$state', function (common, $http, $scope, $modal, $state) {

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
    modalInstance.result.then(function (param) {
    });
  };
  $scope.go = function (state, params) {
    $state.go(state, params)
  }

}])
.controller('tabsBusinessOrdersCtrl', ['common', '$http', '$scope', '$modal', '$state', function (common, $http, $scope, $modal, $state) {

  var refreshData = function () {
    $http.get('/orders', { params: { key_type: 'username', key: $scope.client.account.account_name } })
      .success(function (data) {
        $scope.ordersData = data
      })
  }
  $scope.confirm = function (order) {
    var modalInstance = $modal.open({
      templateUrl: 'app/business/orders/orders-confirm.html',
      controller: 'OrdersConfirm',
      resolve: {
        order: function () {
          return order;
        }
      }
    });

    modalInstance.result.then(function (param) {
      if (param !== "cancel") {
        refreshData()
      }
    });
  };

  $scope.cancel = function (order) {
    var modalInstance = $modal.open({
      templateUrl: 'app/business/orders/orders-cancel.html',
      controller: 'OrdersCancel',
      resolve: {
        order: function () {
          return order;
        }
      }
    });

    modalInstance.result.then(function (param) {
      if (param !== "cancel") {
        refreshData()
      }
    });
  };

  $scope.view = function (order) {
    var modalInstance = $modal.open({
      templateUrl: 'app/business/orders/orders-view.html',
      controller: 'OrdersView',
      resolve: {
        order: function () {
          return order;
        }
      }
    });

    modalInstance.result.then(function () {

    });
  };

  $scope.refund = function (order) {
    var modalInstance = $modal.open({
      templateUrl: 'app/business/orders/orders-refund.html',
      controller: 'OrdersRefund',
      resolve: {
        order: function () {
          return order;
        }
      }
    });

    modalInstance.result.then(function (param) {
      if (param !== "cancel") {
        refreshData()
      }
    });
  };

  $scope.sync = function (order) {
    $http.post('/orders/order/sync', { order_number: order.order_number }).success(function (data) {
      refreshData()
    });
  };



  $scope.go = function (state, params) {
    $state.go(state, params)
  }

}]);

