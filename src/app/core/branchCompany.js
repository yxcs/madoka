; (function () {
  angular
    .module('koala.core')
    .factory('branchCompany', branchCompany)

  function branchCompany(common, $http, $modal, $state, $q, $window, $location, $rootScope) {

    var companys = [
      { type: 'BEIJING', name: '北京公司', sellers: [] },
      { type: 'SHANGHAI', name: '上海公司', sellers: [] },
      { type: 'GUANGZHOU', name: '广州公司', sellers: [] },
      { type: 'HOMELESS', name: '无所属公司', sellers: [] }
    ]

    var BEIJINGPromise = $http.get('/users/sellers', { params: { company: 'BEIJING' } })
      .success(function (data) {
        companys[0].sellers = data
      })

    var SHANGHAIPromise = $http.get('/users/sellers', { params: { company: 'SHANGHAI' } })
      .success(function (data) {
        companys[1].sellers = data
      })

    var GUANGZHOUPromise = $http.get('/users/sellers', { params: { company: 'GUANGZHOU' } })
      .success(function (data) {
        companys[2].sellers = data
      })

    var HOMELESSPromise = $http.get('/users/sellers', { params: { company: 'HOMELESS' } })
      .success(function (data) {
        companys[3].sellers = data
      })

    var getCurrentUserBranchCompanyPromise = (function () {
      return $q.all([BEIJINGPromise, SHANGHAIPromise, GUANGZHOUPromise, HOMELESSPromise, $rootScope.initPromise]).then(function () {
        return getBranchCompanyFromId($rootScope.self.info.user_id)
      })
    })()


    return {
      companys: companys,
      getDefaultPromise: getDefault(),
      getSellers: getSellers,
      getCompany: getCompany,
    }

    function getDefault() {
      return $q.all([BEIJINGPromise,
        SHANGHAIPromise,
        GUANGZHOUPromise,
        HOMELESSPromise,
        $rootScope.initPromise,
        getCurrentUserBranchCompanyPromise])
        .then(function (result) {
          var currentUserBranchCompany = result[result.length - 1]
          var defaultUser = ""
          var defaultSellers = []
          if ($rootScope.self.rights_check['7_read_all_client']) {
            defaultUser = "所有销售"
            defaultSellers = $rootScope.sellers
          } else if ($rootScope.self.rights_check['7_read_my_subordinate_client']) {
            defaultUser = "下属销售"
            defaultSellers = currentUserBranchCompany.sellers || $rootScope.sellers
          } else if ($rootScope.self.rights_check['7_read_my_client']) {
            defaultUser = "当前用户"
            defaultSellers = $rootScope.sellers.filter(function (v) {
              return v.name === $rootScope.self.info.name
            })
          }

          return {
            defaultUserLabel: defaultUser,
            defaultSellers: defaultSellers,
            companys: companys,
          }
        })
    }

    function getBranchCompanyFromId(id) {
      var result = {}
      companys.some(function (branchCompany) {
        if (_.pluck(branchCompany.sellers, "user_id").indexOf(id) > -1) {
          result = branchCompany
          return true
        }
      })
      return result
    }

    function getSellers(company) {
      if (!company) return $rootScope.sellers

      var sellers = []
      companys.some(function (branchCompany) {
        if (company === branchCompany.type) {
          sellers = branchCompany.sellers
          return true
        }
        return false
      })
      return sellers
    }

    function getCompany(sellersId) {
      return getBranchCompanyFromId(sellersId)
    }

  }
})()