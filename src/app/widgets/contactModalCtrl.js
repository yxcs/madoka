; (function () {
  'use strict'

  angular
    .module('koala.widgets')
    .controller('_modalContactCtrl', _modalContactCtrl)
    .controller('_modalContactDelCtrl', _modalContactDelCtrl)

  function _modalContactCtrl($http, $modalInstance, $scope, contact) {
    // 直接引用会导致Bug!!!!
    $scope.contact = contact ? _.assign({}, contact) : {};

    $scope.submit = function () {
      $http.post('/client/contact', $scope.contact).success(function (data) {
        if (data.result === true) {
          $modalInstance.close('fin');
        }
      });
    };
    $scope.skip = function () {
      $modalInstance.close('cancel');
    };
  }

  function _modalContactDelCtrl($http, $modalInstance, $scope, contact) {
    $scope.contact = angular.copy(contact) || {};

    $scope.submit = function () {
      $http.delete('/client/contact', { params: { client_id: contact.client_id, contact_id: contact.contact_id, sale_id: contact.sale_id } }).success(function (data) {
        $modalInstance.close('fin');
      });
    };

    $scope.skip = function () {
      $modalInstance.close('cancel');
    };
  }

})()