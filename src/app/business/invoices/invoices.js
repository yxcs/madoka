; (function () {
  'use strict'

  angular.
    module('koala.business')
    .controller('InvoicesList', InvoicesList)
    .controller('InvoicesNew', InvoicesNew)
    .controller('InvoicesDetail', InvoicesDetail)
    .controller('InvoicesSearch', InvoicesSearch)
    .controller('InvoicesDelete', InvoicesDelete)
    .controller('InvoicesDeal', InvoicesDeal)
    .controller('InvoicesNumberUpdate', InvoicesNumberUpdate)
    .controller('BillsSearch', BillsSearch)
    .controller('OrdersSearch', OrdersSearch)


  function InvoicesList($http, $location, $rootScope, $scope, $state, $modal, autosave, $stateParams) {
    var autosaveData = autosave.getItem() || {}
    if ($stateParams.account_name) {
      $scope.params = { key_type: 'username', key: $stateParams.account_name }
      $scope.daterange = { startDate: null, endDate: null };
      $scope.tabactive = [true, false, false]
    } else {
      $scope.params = autosaveData.params || { key_type: 'username', status: 'INIT' }

      if (autosaveData.daterange) {
        $scope.daterange = _.mapValues(autosaveData.daterange, function (v) {
          return v ? moment(v) : null
        })
      } else {
        $scope.daterange = { startDate: null, endDate: null };
      }
      $scope.tabactive = autosaveData.tabactive || [true, false, false]
    }

    $scope.fetchInvoices = function (type) {
      var params = _.clone($scope.params)

      if (type !== 'page') {
        params = _.omit(params, 'max', 'since')
      }

      params.start_time = parseInt(new Date($scope.daterange.startDate).getTime() / 1000) || null;
      params.end_time = parseInt(new Date($scope.daterange.endDate).getTime() / 1000) || null;

      $http.get('/invoices', { params: params }).success(function (data) {
        autosave.setItem({
          params: $scope.params,
          tabactive: $scope.tabactive,
          daterange: _.mapValues($scope.daterange, function (v) {
            return moment.isMoment(v) ? moment(v).valueOf() : ''
          })
        })
        $scope.invoicesData = data;
      });
    };

    $scope.lazyfetch = _.debounce($scope.fetchInvoices, 2)

    $scope.refresh = function () {
      $scope.params = {
        key_type: 'username',
        status: 'INIT'
      };
      $scope.tabactive[0] = true
      $scope.daterange = { startDate: null, endDate: null };
      $scope.lazyfetch();
    };

    $scope.prev = function () {
      if (!$scope.invoicesData.page.since) return;
      $scope.params.since = $scope.invoicesData.page.since;
      $scope.params.max = null;
      $scope.lazyfetch('page');
    };

    $scope.next = function () {
      if (!$scope.invoicesData.page.max) return;
      $scope.params.since = null;
      $scope.params.max = $scope.invoicesData.page.max;
      $scope.lazyfetch('page');
    };



    $scope.searchOrdersStatus = function () {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/invoices/invoices-search.html',
        controller: 'InvoicesSearch',
        backdrop: 'static'
      });

      modalInstance.result.then(function () {

      });
    };

    $scope.lazyfetch('page');

  }

  function InvoicesNew(common, $http, $location, $modal, $rootScope, $scope, $state, $stateParams, $timeout, Upload, LOCATION) {
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      $scope.stateInfo = {
        event: event,
        toState: toState,
        toParams: toParams,
        fromParams: fromParams,
        fromState: fromState
      };
    });

    $scope._needUpdate = {};

    // get China province and city json
    $scope.provinces = LOCATION

    if ($stateParams.id) {
      $scope.method = 'POST';

      $http.get('/invoice', { params: { invoice_id: $stateParams.id } }).success(function (data) {
        $scope.invoice = data;
        $scope.invoice.tag_type = $scope.invoice.order_numbers ? 'ORDER_TAG' : 'INVOICE_TAG';
      });
    } else {
      $scope.method = 'PUT';
    }

    $scope.getCities = function () {
      $scope.cities = $scope.provinces.filter(function (itm) {
        return $scope.invoice.province === itm.name;
      })[0].sub;
    };

    $scope.invoice = {
      province: '请选择'
    };

    $scope.files = {};
    $scope.progressPercentage = {
      business_licence_pic: 0,
      tax_regist_pic: 0,
      rate_payer_pic: 0,
      open_licence_pic: 0
    };

    $scope.searchBills = function () {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/invoices/bills-search.html',
        controller: 'BillsSearch',
        size: 'lg',
        backdrop: 'static'
      });

      modalInstance.result.then(function (orders) {
        if (_.isObject(orders)) {
          $scope.invoice.account_name = orders.account_name
          $scope.invoice.order_numbers = " - "
          $scope.invoice.sum = orders.sum
          $scope.invoice.tag_type = 'INVOICE_TAG'
        }
      });
    }

    $scope.searchClient = function () {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/invoices/orders-search.html',
        controller: 'OrdersSearch',
        size: 'lg',
        backdrop: 'static'
      });

      modalInstance.result.then(function (orders) {
        $scope.invoice.account_name = orders.account_name
        $scope.invoice.order_numbers = orders.order
        $scope.invoice.sum = orders.sum
        $scope.invoice.tag_type = 'ORDER_TAG'
      });
    };

    $scope.$watchGroup(['invoice.account_name', 'invoice.invoice_type'], function (data) {
      if (data[0] && data[1]) {
        $http.get('/client/invoice_default', { params: { account_name: $scope.invoice.account_name, invoice_type: $scope.invoice.invoice_type } }).success(function (data) {

          if (data.result.data[0]) {
            $scope._needUpdate.invoice = true;

            if (!$stateParams.id) {
              $scope.invoice = angular.extend($scope.invoice, data.result.data[0]);
            } else {
              $scope.invoice.invoice_default_id = data.result.data[0].invoice_default_id;
            }

            if ($scope.invoice.open_type === 'PERSONAL') {
              $scope.invoice.title = '个人';
            }
          }

        });

        $http.get('/invoice/address', { params: { account_name: $scope.invoice.account_name } }).success(function (data) {
          if (!_.isEmpty(data)) $scope._needUpdate.address = true;

          if (!$stateParams.id) {
            $scope.invoice = angular.extend($scope.invoice, data);
          };

          if ($scope.invoice.province) {
            $scope.getCities();
          }
        });
      };

    })
    var remainTitle = ''
    $scope.change_type = function () {
      if ($scope.invoice.open_type === 'PERSONAL') {
        remainTitle = $scope.invoice.title
        $scope.invoice.title = '个人';
        $scope.invoice.invoice_type = 'VAT_NORMAL';
      }
      if ($scope.invoice.open_type === 'COMPANY') {
        if ($scope.invoice.title === '个人') {
          $scope.invoice.title = remainTitle
        }
      }
    };

    $scope.$watch('files.business_licence_pic', function (file) {
      $scope.upload(file, 'business_licence_pic');
    });

    $scope.$watch('files.tax_regist_pic', function (file) {
      $scope.upload(file, 'tax_regist_pic');
    });

    $scope.$watch('files.rate_payer_pic', function (file) {
      $scope.upload(file, 'rate_payer_pic');
    });

    $scope.$watch('files.open_licence_pic', function (file) {
      $scope.upload(file, 'open_licence_pic');
    });

    $scope.upload = function (files, key) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          if (!file.$error) {
            Upload.upload({
              url: '/invoice/pic_upload',
              method: 'POST',
              file: file,
              fileFormDataName: 'image'
            }).progress(function (evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              $scope.progressPercentage[key] = progressPercentage;
            }).success(function (data, status, headers, config) {
              $timeout(function () {
                $scope.invoice.domain = data.domain;
                $scope.invoice[key + '_upt'] = data.upt;
                $scope.invoice[key] = data.url;
              }, 500);
            });
          }
        }
      }
    };

    $scope.submit = function () {
      if ($scope.invoice.tag_type === 'INVOICE_TAG') {
        delete $scope.invoice.order_numbers
      }
      var setInvoice = common.$q.defer()
      var setPost = common.$q.defer()

      if ($scope.setDeafaultInvoiceInfo) {
        $http({
          url: '/client/invoice_default',
          method: $scope._needUpdate.invoice ? 'POST' : 'PUT',
          data: $scope.invoice
        }).success(function (data) {
          setInvoice.resolve()
        }).error(function (data) {
          $scope.notify('danger', '默认发票资料设置失败')
          setInvoice.reject()
        })
      } else {
        setInvoice.resolve()
      }

      if ($scope.setDefaultPostInfo) {
        $http({
          url: '/invoice/address',
          method: $scope._needUpdate.address ? 'POST' : 'PUT',
          data: $scope.invoice
        }).success(function (data) {
          setPost.resolve()
        }).error(function (data) {
          $scope.notify('danger', '默认发票邮寄地址设置失败')
          setPost.reject()
        })
      } else {
        setPost.resolve()
      }

      common.$q.all([setInvoice.promise, setPost.promise]).then(function () {
        $http({
          url: '/invoice',
          method: $scope.method,
          data: $scope.invoice
        }).success(function (data) {
          $state.go('^')
          $scope.notify('danger', '发票创建成功')
        }).error(function (data) {
          $scope.notify('danger', '发票创建失败')
        })
      }, function () {
        console.log('error')
      })
    };

  }


  function InvoicesDetail($http, $location, $modal, $rootScope, $scope, $state, $stateParams, Lightbox) {

    $scope.openLightboxModal = function (index) {
      Lightbox.openModal($scope.images, index);
    };

    $scope.getInvoice = function () {
      $http.get('/invoice', { params: { invoice_id: $stateParams.id } }).success(function (data) {
        $scope.invoice = data;

        $scope.images = [
          {
            'url': 'http://' + data.domain + data.business_licence_pic + '?_upt=' + data.business_licence_pic_upt,
            'thumbUrl': 'http://' + data.domain + data.business_licence_pic + '?_upt=' + data.business_licence_pic_upt
          },
          {
            'url': 'http://' + data.domain + data.tax_regist_pic + '?_upt=' + data.tax_regist_pic_upt,
            'thumbUrl': 'http://' + data.domain + data.tax_regist_pic + '?_upt=' + data.tax_regist_pic_upt
          },
          {
            'url': 'http://' + data.domain + data.rate_payer_pic + '?_upt=' + data.rate_payer_pic_upt,
            'thumbUrl': 'http://' + data.domain + data.rate_payer_pic + '?_upt=' + data.rate_payer_pic_upt
          },
          {
            'url': 'http://' + data.domain + data.open_licence_pic + '?_upt=' + data.open_licence_pic_upt,
            'thumbUrl': 'http://' + data.domain + data.open_licence_pic + '?_upt=' + data.open_licence_pic_upt
          }
        ]
      });
    };

    $scope.getInvoice();

    $scope.deal = function (invoice_id) {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/invoices/invoices-deal.html',
        controller: 'InvoicesDeal',
        backdrop: 'static',
        resolve: {
          invoice_id: function () {
            return invoice_id;
          }
        }
      });

      modalInstance.result.then(function (client) {
        $scope.getInvoice();
      });
    };

    $scope.delete = function (invoice_id) {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/invoices/invoices-delete.html',
        controller: 'InvoicesDelete',
        resolve: {
          invoice_id: function () {
            return invoice_id;
          }
        }
      });

      modalInstance.result.then(function (client) {
        $state.go('^');
      });
    };

    $scope.update = function (invoice) {
      var modalInstance = $modal.open({
        templateUrl: 'app/business/invoices/invoices-number-update.html',
        controller: 'InvoicesNumberUpdate',
        resolve: {
          invoice: function () {
            return {
              invoice_id: invoice.invoice_id,
              invoice_number: invoice.invoice_number,
              invoice_time: invoice.invoice_time
            };
          }
        }
      });

      modalInstance.result.then(function (client) {
        $scope.getInvoice();
      });
    };
  }


  function InvoicesSearch($http, $modalInstance, $scope) {
    $scope.params = {
      order_number: ''
    }
    $scope.preparams = {
      order_number: ''
    }
    $scope.searchResultArr = []
    $scope.searchInvoiceStatus = function () {
      if ($scope.params.order_number && $scope.preparams.order_number !== $scope.params.order_number) {
        $http.get('/orders/order/invoice', { params: $scope.params }).success(function (data) {
          $scope.searchResult = data
          $scope.searchResultArr.push(data)
        });
        $scope.preparams.order_number = $scope.params.order_number
      }
    }

    $scope.skip = function () {
      $modalInstance.close();
    };
  }


  function InvoicesDelete($http, $modalInstance, $scope, invoice_id) {
    $scope.submit = function () {
      $http.delete('/invoice', { params: { invoice_id: invoice_id } }).success(function (data) {
        $modalInstance.close('fin');
      });
    };
    $scope.skip = function () {
      $modalInstance.close('cancel');
    };
  }

  function InvoicesDeal($http, $modalInstance, $scope, invoice_id) {
    $scope.invoice = {
      invoice_id: invoice_id
    };

    $scope.submit = function () {
      var params = angular.copy($scope.invoice);
      if (params.invoice_time) {
        params.invoice_time = parseInt(new Date($scope.invoice.invoice_time).getTime() / 1000);
      }

      $http.post('/invoice/opt', params).success(function (data) {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function () {
      $modalInstance.close('cancel');
    };
  }


  function InvoicesNumberUpdate($http, $modalInstance, $scope, invoice) {
    $scope.invoice = angular.copy(invoice);
    // wtf
    $scope.invoice.invoice_time = new Date($scope.invoice.invoice_time * 1000);
    $scope.submit = function () {
      var params = angular.copy($scope.invoice);
      if (params.invoice_time) {
        params.invoice_time = parseInt(new Date($scope.invoice.invoice_time).getTime() / 1000);
      }
      $http.post('/invoice/number', params).success(function (data) {
        $modalInstance.close('fin');
      });
    };
    $scope.skip = function () {
      $modalInstance.close('cancel');
    };
  }


  function OrdersSearch($http, $modalInstance, $scope, $rootScope) {

    $scope.params = {
      invoice_status: 'INIT',
      status: 'DONE',
      key_type: 'username',
      key: ''
    };
    $scope.selection = {}
    $scope.invoiceAmount = 0

    $scope.fetchOrders = function () {

      delete $scope.params.max
      delete $scope.params.since

      $scope.params.limit = 10;

      if ($scope.params.key) {
        $http.get('/orders', { params: $scope.params }).success(function (data) {
          $scope.ordersData = data;
          $scope.selection = {}
          $scope.clientDetail = {}

          if ($scope.ordersData.orders.length) {
            $http.get('/clients/registed', { params: { key: $scope.params.key, key_type: 'username' } }).success(function (data) {
              if (data.clients.length) {
                $scope.clientDetail = data.clients[0];
              } else {
                $rootScope.notify('danger', '不可能查不到账号呀:)')
              }
            });
          } else {
            $http.get('/clients/registed', { params: { key: $scope.params.key, key_type: 'username' } }).success(function (data) {
              if (data.clients.length) {
                $rootScope.notify('danger', '没有查询到该帐号未开票订单信息')
              } else {
                $rootScope.notify('danger', '该账号不存在')
              }
            });
          }
        });
      }
    }

    $scope.fetchOrdersForPage = function () {
      $scope.params.limit = 10;
      if ($scope.params.key) {
        $http.get('/orders', { params: $scope.params }).success(function (data) {
          $scope.ordersData = data;
        });
      }
    }

    $scope.$watch('selection', function (selection) {
      $scope.invoiceAmount = 0
      angular.forEach(selection, function (amount, order) {
        if (amount) {
          $scope.invoiceAmount += amount
        }
      });
    }, true);
    $scope.prev = function () {
      if (!$scope.ordersData.page.since) return;
      $scope.params.since = $scope.ordersData.page.since;
      $scope.params.max = null;
      $scope.fetchOrdersForPage();
    };

    $scope.next = function () {
      if (!$scope.ordersData.page.max) return;
      $scope.params.since = null;
      $scope.params.max = $scope.ordersData.page.max;
      $scope.fetchOrdersForPage();
    };

    $scope.submit = function () {
      var ordersArr = []
      var sumArr = []
      angular.forEach($scope.selection, function (amount, order) {
        if (amount) {
          ordersArr.push(order)
          sumArr.push(amount)
        }
      });
      if (ordersArr.length <= 0) {
        $rootScope.notify('danger', '请选择订单')
      } else {
        $modalInstance.close({
          order: ordersArr,
          sum: (sumArr.reduce(function (a, b) {
            return a + b * 100
          }, 0)) / 100,
          account_name: $scope.clientDetail.account_name
        });
      }
    };

    $scope.skip = function () {
      $modalInstance.close();
    };
  }


  function BillsSearch($http, $modalInstance, $scope, $rootScope) {

    $scope.params = {
      invoice_status: 'INIT',
      status: 'DONE',
      key_type: 'username',
      key: ''
    };



    $scope.fetchClientInfo = function () {
      if ($scope.params.key) {
        $scope.clientDetail = {}
        $http.get('/clients/registed', {
          params: {
            key: $scope.params.key,
            key_type: 'username'
          }
        }).success(function (data) {
          if (data.clients.length) {
            $scope.clientDetail = data.clients[0];
            $http.get('/invoice/freeze_money', {
              params: {
                account_name: data.clients[0].account_name
              }
            }).success(function (data) {
              $scope.clientDetail.freeze_money = data.freeze_money
            })
          } else {
            $rootScope.notify('danger', '查不到账号)')
          }
        })

      }
    }

    $scope.submit = function () {
      $modalInstance.close({
        account_name: $scope.clientDetail.account_name,
        sum: $scope.clientDetail.sum
      });
    };

    $scope.skip = function () {
      $modalInstance.close('cancel');
    };
  }

})()








