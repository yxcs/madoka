;
(function () {
  'use strict';

  angular
    .module('koala.widgets')
    .directive('slCompanys', slCompanys);

  function slCompanys() {
    var template = '<select class="form-control" ng-options="company.type as company.name for company in vm.companys">' +
      '<option value=""> 全部 </option>' +
      '</select>'

    var directive = {
      restrict: 'EA',
      template: template,
      replace: 'true',
      link: link,
    }

    return directive

    function link($scope, element, attrs) {

    }
  }
})()