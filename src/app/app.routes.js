; (function () {
  'use strict'

  angular
    .module('koala')
    .config(routeconfig)

  routeconfig.$inject = ['$stateProvider', 'routeHelperProvider']

  function routeconfig($stateProvider, helper) {
    $stateProvider
    //Global Routes
    //-----------------------------------
      .state('global', {
        title: 'Madoka - Upyun CRM',
        templateUrl: helper.getUrl('global'),
      })
      .state('global.search', {
        title: '搜索结果 | 全局搜索 - Madoka',
        url: '/global/search?q&company&user&region&account_type&call_type&registered',
        views: {
          'main': {
            templateUrl: helper.getUrl('global.search'),
            controller: 'searchCtrl',
          }
        }
      })
      .state('global.changelog', {
        title: 'Madoka - Upyun CRM',
        url: '/global/changelog/',
        views: {
          'changelog': {
            templateUrl: helper.getUrl('global.changelog'),
          }
        }
      })
      .state('global.settings', {
        title: 'Madoka - Upyun CRM',
        url: '/global/settings/',
        views: {
          'main': {
            templateUrl: helper.getUrl('global.settings'),
            controller: 'indivSettingsCtrl as vm',
          }
        }
      })

    //Clients Routes
    //-----------------------------------
      .state('clients', {
        title: 'Madoka - Upyun CRM',
        templateUrl: helper.getUrl('clients'),
      })
      .state('clients.personal', {
        title: '我的客户 - Madoka',
        url: '/clients/personal',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.personal'),
            controller: 'ClientsPersonalCtrl as vm',
          }
        }
      })
      .state('clients.personal.detail', {
        title: '客户详情 | 我的客户 - Madoka',
        url: '/:account_name',
        views: {
          'main@clients': {
            templateUrl: helper.getUrl('clients.personal.detail'),
            controller: 'ClientsPersonalDetailCtrl as vm',
          }
        }
      })
      .state('clients.personal.detail.info', {
        title: '基本信息 | 我的客户 - Madoka',
        url: '/info',
        templateUrl: helper.getUrl('clients.personal.detail.info'),
        controller: 'ClientsPersonalInfoCtrl',
      })
      .state('clients.personal.detail.contact', {
        title: '联系记录 | 我的客户 - Madoka',
        url: '/contact',
        templateUrl: helper.getUrl('clients.personal.detail.contact'),
        controller: 'ClientsPersonalContactCtrl as vm',
      })
      .state('clients.personal.detail.recharge', {
        title: '交易记录 | 我的客户 - Madoka',
        url: '/recharge',
        templateUrl: helper.getUrl('clients.personal.detail.recharge'),
        controller: 'ClientsPersonalRechargeCtrl as vm',
      })
      .state('clients.personal.detail.log', {
        title: '操作日志 | 我的客户 - Madoka',
        url: '/log',
        templateUrl: helper.getUrl('clients.personal.detail.log'),
        controller: 'ClientsPersonalLogCtrl as vm',
      })
      .state('clients.personal.detail.usage', {
        title: '使用情况 | 我的客户 - Madoka',
        url: '/usage',
        templateUrl: helper.getUrl('clients.personal.detail.usage'),
        controller: 'ClientsPersonalUsageCtrl',
        resolve: helper.resolveFor('echarts'),
      })
      .state('clients.potential', {
        title: '潜在客户 - Madoka',
        url: '/clients/potential/',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.potential'),
            controller: 'clientsPotentialCtrl',
          }
        }
      })
      .state('clients.potential_detail', {
        title: '客户详情 | 潜在客户 - Madoka',
        url: '/clients/potential/:id/',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.potential_detail'),
            controller: 'clientsPotentialDetailCtrl',
          }
        }
      })
      .state('clients.registed', {
        title: '注册客户 - Madoka',
        url: '/clients/registed/',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.registed'),
            controller: 'clientsRegistedCtrl',
          }
        }
      })
      .state('clients.registed_detail', {
        title: '客户详情 | 注册客户 - Madoka',
        url: '/clients/registed/:id/',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.registed_detail'),
            controller: 'clientsRegistedDetailCtrl',
          }
        },
        resolve: helper.resolveFor('echarts'),
      })
      .state('clients.public', {
        title: '公海客户 - Madoka',
        url: '/clients/public/',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.public'),
            controller: 'clientsPublicCtrl',
          }
        }
      })
      .state('clients.public_pot_detail', {
        title: '潜在客户 | 公海客户 - Madoka',
        url: '/public/potential/:id/',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.public_pot_detail'),
            controller: 'clientsPotentialDetailCtrl',
          }
        }
      })
      .state('clients.public_reg_detail', {
        title: '注册客户 | 公海客户 - Madoka',
        url: '/public/registed/:id/',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.public_reg_detail'),
            controller: 'clientsRegistedDetailCtrl',
          }
        }
      })
      .state('clients.conflict', {
        title: '冲突客户 - Madoka',
        url: '/clients/conflict/?account_name',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.conflict'),
            controller: 'clientsConflictCtrl',
          }
        }
      })
      .state('clients.conflict_detail', {
        title: '冲突查看 | 冲突客户 - Madoka',
        url: '/clients/conflict/:id/',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.conflict_detail'),
            controller: 'clientsConflictDetailCtrl',
          }
        }
      })
      .state('clients.discarded', {
        title: '丢弃客户 - Madoka',
        url: '/clients/discarded/',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.discarded'),
            controller: 'clientsDiscardedCtrl',
          }
        }
      })
      .state('clients.identity', {
        title: '审核详情 | 身份审核 - Madoka',
        url: '/clients/identity',
        views: {
          'main': {
            templateUrl: helper.getUrl('clients.identity'),
            controller: 'IdentityList as vm',
          }
        }
      })
      //Contact Routes
      //-----------------------------------
      .state('contact', {
        title: 'Madoka - Upyun CRM',
        templateUrl: helper.getUrl('contact'),
      })
      .state('contact.records', {
        title: '联系记录 - Madoka',
        url: '/contact/records?account_name&name',
        views: {
          'main': {
            templateUrl: helper.getUrl('contact.records'),
            controller: 'RecordsList',
          }
        }
      })
      .state('contact.records.new', {
        title: '创建记录 | 联系记录 - Madoka',
        url: '/new?client_name&upyun_account',
        views: {
          'main@contact': {
            templateUrl: helper.getUrl('contact.records.new'),
            controller: 'RecordsNew',
          }
        }
      })
      .state('contact.manage', {
        title: '联联系人管理 - Madoka',
        url: '/contact/manage?name&account_name',
        views: {
          'main': {
            templateUrl: helper.getUrl('contact.manage'),
            controller: 'Manage',
          }
        },
      })
      .state('contact.manage.new', {
        title: '新建联系人 | 联系人管理 - Madoka',
        url: '/new?account_id',
        views: {
          'main@contact': {
            templateUrl: helper.getUrl('contact.manage.new'),
            controller: 'ManageNew',
          }
        },
      })
    //Business Routes
    //-----------------------------------
      .state('business', {
        title: 'Madoka - Upyun CRM',
        templateUrl: helper.getUrl('business'),
      })
      .state('business.usage', {
        title: '概况数据 | 服务使用 - Madoka',
        url: '/business/usage',
        views: {
          'main': {
            templateUrl: helper.getUrl('business.usage'),
            controller: 'UsageList',
          }
        },
      })
      .state('business.usage.detail', {
        title: '使用详情 | 服务使用 - Madoka',
        url: '/:account_name?seed',
        views: {
          'main@business': {
            templateUrl: helper.getUrl('business.usage.detail'),
            controller: 'UsageDetail',
          }
        },
        //依赖echarts
        resolve: helper.resolveFor('echarts'),
      })
      .state('business.orders', {
        title: '订单管理 - Madoka',
        url: '/business/orders?account_name',
        views: {
          'main': {
            templateUrl: helper.getUrl('business.orders'),
            controller: 'OrdersList',
          }
        },
      })
      .state('business.invoices', {
        title: '发票管理 - Madoka',
        url: '/business/invoices?account_name',
        views: {
          'main': {
            templateUrl: helper.getUrl('business.invoices'),
            controller: 'InvoicesList',
          }
        },
      })
      .state('business.invoices.new', {
        title: '新建发票处理 | 发票管理 - Madoka',
        url: '/new',
        views: {
          'main@business': {
            templateUrl: helper.getUrl('business.invoices.new'),
            controller: 'InvoicesNew',
          }
        },
      })
      .state('business.invoices.detail', {
        title: '发票处理详情 | 发票管理 - Madoka',
        url: '/:id',
        views: {
          'main@business': {
            templateUrl: helper.getUrl('business.invoices.detail'),
            controller: 'InvoicesDetail',
          }
        },
      })
      .state('business.invoices.detail.edit', {
        title: '开票编辑 | 发票管理 - Madoka',
        url: '/edit',
        views: {
          'main@business': {
            templateUrl: helper.getUrl('business.invoices.new'),
            controller: 'InvoicesNew',
          }
        },
      })
      .state('business.charges', {
        title: '计费管理 - Madoka',
        url: '/business/charges',
        views: {
          'main': {
            templateUrl: helper.getUrl('business.charges'),
            controller: 'ChargesList as vm',
          }
        },
      })
      .state('business.charges.new', {
        title: '计费配置 | 计费管理 - Madoka',
        url: '/new',
        views: {
          'main@business': {
            templateUrl: helper.getUrl('business.charges.new'),
            controller: 'ChargesNew as vm',
          }
        },
      })
      .state('business.charges.standard', {
        title: '报价配置 | 计费管理 - Madoka',
        url: '/standard',
        views: {
          'main@business': {
            templateUrl: helper.getUrl('business.charges.standard'),
            controller: 'ChargesStandard as vm',
          }
        },
      })
      .state('business.charges.detail', {
        title: '计费详情 | 计费管理 - Madoka',
        url: '/:id',
        views: {
          'main@business': {
            templateUrl: helper.getUrl('business.charges.detail'),
            controller: 'ChargesDetail as vm',
          }
        },
      })
      .state('business.charges.detail.edit', {
        title: '计费管理 | 计费管理 - Madoka',
        url: '/edit',
        views: {
          'main@business': {
            templateUrl: helper.getUrl('business.charges.new'),
            controller: 'ChargesNew as vm',
          }
        },
      })
    //Datahub Routes
    //-----------------------------------
      .state('datahub', {
        title: 'Madoka - Upyun CRM',
        templateUrl: helper.getUrl('datahub'),
      })
      .state('datahub.orderdata', {
        title: '客户购买 - Madoka',
        url: '/datahub/orderdata',
        views: {
          'main': {
            templateUrl: helper.getUrl('datahub.orderdata'),
            controller: 'OrderdataList as vm',
          }
        },
      })
      .state('datahub.clientdata', {
        title: '客户数据 - Madoka',
        url: '/datahub/clientdata',
        views: {
          'main': {
            templateUrl: helper.getUrl('datahub.clientdata'),
            controller: 'ClientdataList as vm',
          }
        },
      })
    //Finance Routes
    //-----------------------------------
      .state('finance', {
        title: 'Madoka - Upyun CRM',
        templateUrl: helper.getUrl('finance'),
      })
      .state('finance.bills', {
        title: '账单管理 - Madoka',
        url: '/finance/bills',
        views: {
          'main': {
            templateUrl: helper.getUrl('finance.bills'),
            controller: 'Bills as vm',
          }
        },
      })
      .state('finance.bills.detail', {
        title: '账单详情 | 账单管理 - Madoka',
        url: '/:id',
        views: {
          'main@finance': {
            templateUrl: helper.getUrl('finance.bills.detail'),
            controller: 'BillsDetail as vm',
          }
        },
      })
      .state('finance.bills.detail.charge', {
        title: '账单扣款 | 账单管理 - Madoka',
        url: '/charge',
        views: {
          'main@finance': {
            templateUrl: helper.getUrl('finance.bills.detail.charge'),
            controller: 'BillsCharge as vm',
          }
        },
      })
      .state('finance.transactions', {
        title: '客户收支 - Madoka',
        url: '/finance/transactions',
        views: {
          'main': {
            templateUrl: helper.getUrl('finance.transactions'),
            controller: 'Transactions as vm'
          }
        },
      })
      .state('finance.transactions.new', {
        title: '创建加款 | 客户收支 - Madoka',
        url: '/new?account_name',
        views: {
          'main@finance': {
            templateUrl: helper.getUrl('finance.transactions.new'),
            controller: 'TransactionsNew as vm'
          }
        },
      })
      .state('finance.refunds', {
        title: '提现管理 - Madoka',
        url: '/finance/refunds',
        views: {
          'main': {
            templateUrl: helper.getUrl('finance.refunds'),
            controller: 'Refunds as vm'
          }
        },
      })
      .state('finance.refunds.new', {
        title: '提现申请 | 提现管理 - Madoka',
        url: '/new',
        views: {
          'main@finance': {
            templateUrl: helper.getUrl('finance.refunds.new'),
            controller: 'RefundsCreate as vm'
          }
        },
      })
      .state('finance.refunds.detail', {
        title: '提现详情 | 提现管理 - Madoka',
        url: '/:id',
        views: {
          'main@finance': {
            templateUrl: helper.getUrl('finance.refunds.detail'),
            controller: 'RefundsDetail as vm'
          }
        },
      })
      .state('finance.orderin', {
        title: '订单收入 - Madoka',
        url: '/finance/orderin',
        views: {
          'main': {
            templateUrl: helper.getUrl('finance.orderin'),
            controller: 'Orderin as vm'
          }
        },
      })
      .state('finance.details', {
        title: '加款管理 - Madoka',
        url: '/finance/details',
        views: {
          'main': {
            templateUrl: helper.getUrl('finance.details'),
            controller: 'Details as vm'
          }
        },
      })
      .state('finance.details.deal', {
        title: '加款处理 | 加款管理 - Madoka',
        url: '/deal?order_id&status',
        views: {
          'main@finance': {
            templateUrl: helper.getUrl('finance.details.deal'),
            controller: 'Deal as vm'
          }
        },
      })
      .state('finance.details.new', {
        title: '创建加款 | 加款管理 - Madoka',
        url: '/new',
        views: {
          'main@finance': {
            templateUrl: helper.getUrl('finance.details.new'),
            controller: 'DetailsNew as vm'
          }
        },
      })
      .state('finance.debts', {
        title: '欠费管理 - Madoka',
        url: '/finance/debts',
        views: {
          'main': {
            templateUrl: helper.getUrl('finance.debts'),
            controller: 'Debts as vm'
          }
        },
      })
      .state('finance.income', {
        title: '服务收入 - Madoka',
        url: '/finance/income',
        views: {
          'main': {
            templateUrl: helper.getUrl('finance.income'),
            controller: 'Income as vm'
          }
        },
      })
    //Admin Routes
    //-----------------------------------
      .state('admin', {
        title: 'Madoka - Upyun CRM',
        templateUrl: helper.getUrl('admin'),
      })
      .state('admin.log', {
        title: '操作日志 - Madoka',
        url: '/admin/log/',
        views: {
          'main': {
            templateUrl: helper.getUrl('admin.log'),
            controller: 'adminLogCtrl',
          }
        }
      })
      .state('admin.roles', {
        title: '角色管理 - Madoka',
        url: '/admin/roles/',
        views: {
          'main': {
            templateUrl: helper.getUrl('admin.roles'),
            controller: 'adminRolesCtrl',
          }
        }
      })
      .state('admin.roles_create', {
        title: '创建角色 | 角色管理 - Madoka',
        url: '/admin/roles/create/',
        views: {
          'main': {
            templateUrl: helper.getUrl('admin.roles_create'),
            controller: 'adminRoleCreateCtrl',
          }
        }
      })
      .state('admin.roles_edit', {
        title: '编辑角色 | 角色管理 - Madoka',
        url: '/admin/roles/:role_id/edit/',
        views: {
          'main': {
            templateUrl: helper.getUrl('admin.roles_edit'),
            controller: 'adminRoleCreateCtrl',
          }
        }
      })
      .state('admin.staffs', {
        title: '员工管理 - Madoka',
        url: '/admin/staffs/',
        views: {
          'main': {
            templateUrl: helper.getUrl('admin.staffs'),
            controller: 'adminStaffsCtrl',
          }
        }
      })
  }
})()

