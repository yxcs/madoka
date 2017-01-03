; (function () {
  angular
    .module('koala.core')
    .factory('autosave', autosave)

  function autosave($window, $location) {
    var storage = $window.sessionStorage
    return {
      setItem: function (data) {
        var path = $location.path()
        return storage.setItem(path, JSON.stringify(data))
      },
      getItem: function () {
        var path = $location.path()
        return JSON.parse(storage.getItem(path))
      },
      removeItem: function () {
        var path = $location.path()
        return storage.removeItem(path)
      },
      dateToNum: function (date) {
        var result = moment(date).valueOf()
        return result === "Invalid date" ? "" : result
      }
    }
  }
})()