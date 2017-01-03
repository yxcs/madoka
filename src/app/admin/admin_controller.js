angular.module('koala.admin')
.controller('adminLogCtrl', ['$http', '$location', '$rootScope', '$scope', '$state',
  function($http, $location, $rootScope, $scope, $state) {

    $scope.features = {
      '客户管理': ['潜在客户', '注册客户', '公海客户', '冲突客户', '丢弃客户', '联系人管理', '身份审核'],
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
      $http.get('/operation_logs/crm', { params: params }).success(function(res) {
        $scope.crmLogs = res;
      });
    };

    $scope.fetchCrmLogsForPage = function() {
      $scope.params.start_time = parseInt(new Date($scope.date.dateStart).getTime() / 1000) || null;
      $scope.params.end_time = (parseInt(new Date($scope.date.dateEnd).getTime() / 1000) + 86399) || null;
      $http.get('/operation_logs/crm', { params: $scope.params }).success(function(res) {
        $scope.crmLogs = res;
      });
    };

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

}])
.controller('adminRolesCtrl', ['$http', '$location', '$modal', '$rootScope', '$scope', '$state',
  function($http, $location, $modal, $rootScope, $scope, $state) {

    $scope.getRoles = function() {
      $http.get('/competence/roles').success(function(data) {
        $scope.roles = data;
      });
    };

    $scope.getRoles();

    $scope.manage = function(role_id) {
      var modalInstance = $modal.open({
        templateUrl: 'app/admin/views/_modal_manage.html',
        controller: '_modalManageCtrl',
        size: 'lg',
        resolve: {
          role_id: function() {
            return role_id;
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getRoles();
      });
    };


    $scope.del = function(role) {
      var modalInstance = $modal.open({
        templateUrl: 'app/admin/views/_modal_del_role.html',
        controller: '_modalDelRoleCtrl',
        resolve: {
          role: function() {
            return role;
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getRoles();
      });
    };

}])
.controller('_modalManageCtrl', ['$http', '$modalInstance', '$rootScope', '$scope', 'role_id',
  function($http, $modalInstance, $rootScope, $scope, role_id) {

    $scope.added = 'Y';

    $scope.getMembers = function(added) {
      $http.get('/competence/user_roles', { params: { is_add: added, role_id: role_id}}).success(function(data) {
        $scope.members = data;
      });
    };

    $scope.getMembers('Y');


    $scope.add = function(user_id) {
      $http.put('/competence/user_roles', { user_id: user_id, role_ids: role_id.toString()}).success(function(data) {
        if (data.result) {
          $scope.added = 'Y';
          $scope.getMembers('Y');
              //fetch sellers
          $http.get('/users/sellers').success(function(data) {
            $rootScope.sellers = data;
            $rootScope.sellersMap = {};
            data.forEach(function(itm) {
              $rootScope.sellersMap[itm.user_id] = itm.name;
            });
          });
        }
      });
    };

    $scope.remove = function(user_id) {
      $http.delete('/competence/user_role', { params: { user_id: parseInt(user_id), role_id: parseInt(role_id)} }).success(function(data) {
        if (data.result) {
          $scope.added = 'N';
          $scope.getMembers('N');
        }

        //fetch sellers
        $http.get('/users/sellers').success(function(data) {
          $rootScope.sellers = data;
          $rootScope.sellersMap = {};
          data.forEach(function(itm) {
            $rootScope.sellersMap[itm.user_id] = itm.name;
          });
        });
      });
    };



    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalDelRoleCtrl', ['$http', '$modalInstance', '$scope', 'role',
  function($http, $modalInstance, $scope, role) {

    $scope.submit = function() {
      $http.delete('/competence/role', { params: {role_id: role.role_id} }).success(function(data) {
        if (data.result) {
          $modalInstance.close('fin');
        }
      });
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

    $scope.role = role;

}])
.controller('adminRoleCreateCtrl', ['$http', '$location', '$rootScope', '$scope', '$state', '$stateParams',
  function($http, $location, $rootScope, $scope, $state, $stateParams) {

    $scope.permissons = {};
    $scope.role = {};
    $scope.modules = {};

    if ($stateParams.role_id) {
      $http.get('/competence/role', { params: { role_id: $stateParams.role_id }}).success(function(data) {
        $scope.role = data.role;
        data.role.rights.split(',').forEach(function(itm) {
          $scope.permissons[itm] = true;
        });

        data.role.show_rights.split(',').forEach(function(itm) {
          $scope.modules[itm] = true;
        });
      });
    }



    function groupBy(data, id) {
      return Object.keys(data).filter(function(key) {
        return key.indexOf(id) === 0;
      }).reduce(function(memo, curr) {
        return memo.concat({ key: curr, value: data[curr] });
      }, []);
    }

    $http.get('/reflect/show').success(function(data) {
      $scope.shows = groupBy(data, '0_');
    });

    $http.get('/reflect/rights').success(function(data) {
      $scope.viewPerms = groupBy(data, '1_');
      $scope.clientProfiles = groupBy(data, '2_');
      $scope.clientManages = groupBy(data, '3_');
      $scope.accountManages = groupBy(data, '4_');
      $scope.sas = groupBy(data, '5_');
      $scope.chargeconfs = groupBy(data, '6_');
      $scope.dataviews = groupBy(data, '7_');
      $scope.finances = groupBy(data, '8_');
    });

    $scope.submit = function() {
      $scope.role.rights = Object.keys($scope.permissons).filter(function(key) {
        return $scope.permissons[key] === true;
      }).join();

      $scope.role.show_rights = Object.keys($scope.modules).filter(function(key) {
        return $scope.modules[key] === true;
      }).join();

      $http({
        method: $stateParams.role_id ? 'POST': 'PUT',
        url: '/competence/role',
        data: $scope.role
      }).success(function(data) {
        if (data.result) {
          $state.go('admin.roles');
        }
      });
    };

}])
.controller('adminStaffsCtrl', ['$http', '$location', '$modal', '$rootScope', '$scope', '$state',
  function($http, $location, $modal, $rootScope, $scope, $state) {

    $scope.roles = {};
    $http.get('/competence/roles').success(function(data) {
      data.forEach(function(role) {
        $scope.roles[role.role_id] = role.role_name;
      });
    });


    $scope.getStaffs = function() {
      $http.get('/users').success(function(data) {
        $scope.staffs = data.map(function(itm) {
          if (itm.region_id) {
            itm.region_ids = itm.region_id.split(',');
          };
          return itm;
        });

        $scope.staffsEnabled = data.filter(function(item) {
          return item.status === 1;
        });

        $scope.staffsDisabled = data.filter(function(item) {
          return item.status === 0;
        });
      });
    };

    $scope.getStaffs();

    $scope.manageMess = function(user_id) {
      var modalInstance = $modal.open({
        templateUrl: 'app/admin/views/_modal_assign_message.html',
        controller: '_modalAssignMessage',
        resolve: {
          user_id: function() {
            return user_id;
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getStaffs();
      });
    }

    $scope.addRole = function(user_id) {
      var modalInstance = $modal.open({
        templateUrl: 'app/admin/views/_modal_add_role.html',
        controller: '_modalAddRoleCtrl',
        resolve: {
          user_id: function() {
            return user_id;
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getStaffs();
      });
    };

    $scope.assignRegion = function(user) {
      var modalInstance = $modal.open({
        templateUrl: 'app/admin/views/_modal_assign_region.html',
        controller: '_modalAssignRegionCtrl',
        resolve: {
          user: function() {
            return user;
          }
        }
      });

      modalInstance.result.then(function() {
        $scope.getStaffs();
      });
    };

    $scope.viewPerms = function(user_id) {
      var modalInstance = $modal.open({
        templateUrl: 'app/admin/views/_modal_view_role.html',
        controller: '_modalViewRoleCtrl',
        resolve: {
          user_id: function() {
            return user_id;
          }
        }
      });

      modalInstance.result.then(function() {

      });
    };

    $scope.disable = function(user_id) {
      $http.delete('/user', { params: { user_id: user_id }}).success(function(data) {
        if (data.status) {
          $scope.getStaffs();
        }
      });
    };

    $scope.enable = function(user_id) {
      $http.post('/user/status', { user_id: user_id }).success(function(data) {
        if (data.status) {
          $scope.getStaffs();
        }
      });
    };

}])
.controller('_modalAddRoleCtrl', ['$http', '$modalInstance', '$scope', 'user_id',
  function($http, $modalInstance, $scope, user_id) {

    $scope.roles_checked = {};

    $http.get('/competence/user_roles/no', { params: { user_id: user_id} }).success(function(data) {
      $scope.roles = data;
    });

    $scope.submit = function() {
      var role_ids = Object.keys($scope.roles_checked).filter(function(id) {
        return $scope.roles_checked[id] === true;
      }).join();

      $http.put('/competence/user_roles', { user_id: user_id, role_ids: role_ids}).success(function(data) {
        if (data.result) {
          $modalInstance.close('fin');
        }
      });

    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalAssignRegionCtrl', ['$http', '$modalInstance', '$scope', 'user',
  function($http, $modalInstance, $scope, user) {

    $scope.params = {
      user_id: user.user_id
    };

    $scope.region_id = {};

    if (user.region_id) {
      user.region_id.split(',').forEach(function(id) {
        $scope.region_id[id] = true;
      });
    };

    $scope.submit = function() {
      $scope.params.region_id = Object.keys($scope.region_id).filter(function(id) {
        return !!$scope.region_id[id];
      }).join(',');

      $http.post('/users/sellers_region', $scope.params).success(function(data) {
        if (data.status) {
          $modalInstance.close('fin');
        }
      });

    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalViewRoleCtrl', ['$http', '$modalInstance', '$scope', 'user_id',
  function($http, $modalInstance, $scope, user_id) {

    function groupBy(data, id) {
      return data.filter(function(key) {
        return key.indexOf(id) === 0;
      }).reduce(function(memo, curr) {
        return memo.concat(curr);
      }, []);
    }

    $http.get('/reflect/show').success(function(data) {
      $scope.moduleNames = data;
    });

    $http.get('/reflect/rights').success(function(data) {
      $scope.rightNames = data;
    });

    $http.get('/comperence/rights', { params: { user_id: user_id} }).success(function(data) {
      $scope.shows = groupBy(data, '0_');
      $scope.viewPerms = groupBy(data, '1_');
      $scope.clientProfiles = groupBy(data, '2_');
      $scope.clientManages = groupBy(data, '3_');
      $scope.accountManages = groupBy(data, '4_');
      $scope.sas = groupBy(data, '5_');
      $scope.chargeconfs = groupBy(data, '6_');
      $scope.dataviews = groupBy(data, '7_');
      $scope.finances = groupBy(data, '8_');
    });



    $scope.submit = function() {

      $modalInstance.close('fin');
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
])
.controller('_modalAssignMessage', ['$http', '$modalInstance', '$scope', 'user_id', '$rootScope', '$state', 'stroage',
  function($http, $modalInstance, $scope, user_id, $rootScope, $state, stroage) {

    $scope.mess = {}
    $scope.user_id = user_id
    $scope.params = stroage.getItem()

    activate()

    function activate() {
      getMessage()
    }

    function getMessage() {
      _.forEach($scope.params, function(item) {
        if(item.user_id === $scope.user_id) {
          $scope.checkMessage = item
        }
      })
    }

    $scope.submit = function() {
      var data = _.map($scope.params, function(item) {
                  if(item.user_id === $scope.checkMessage.user_id) {
                    item = $scope.checkMessage
                  }
                return item
              })
      stroage.setItem(data)
      $rootScope.notify('success', '通知设置修改成功')

      $modalInstance.close('fin');
    };

    $scope.skip = function() {
      $modalInstance.close('cancel');
    };

  }
]);

