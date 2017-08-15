(function () {
  'use strict';

  angular.module('app')
    .controller('MainCtrl', [
      '$scope', '$translate', '$auth', 'authService', '$rootScope', '$mdMedia', '$mdSidenav', 'Permission', 'Preference', 'Country', '$localStorage', 'Group', '$cookies', 'toastr', 'Condition', 'AccountGroup', 'Profile', 'Timezone', '$mdDialog',
      MainCtrl
    ]);

  function MainCtrl($scope, $translate, $auth, authService, $rootScope, $mdMedia, $mdSidenav, Permission, Preference, Country, $localStorage, Group, $cookies, toastr, Condition, AccountGroup, Profile, Timezone, $mdDialog) {
    // add ie/smart classes to html body
    $scope.isIE = !!navigator.userAgent.match(/MSIE/i);
    $scope.$watch(function () {
      return $mdMedia('gt-sm');
    }, function (gtsm) {
      $scope.screenGtSmall = gtsm;
    });

    // Hide or Show the 'left' sideNav area
    $scope.toggleLeftNav = function () {
      $mdSidenav('left').toggle();
    };


    // config
    $scope.app = {
      name: 'NewBidder',
      version: '0.0.1',
      // for chart colors
      color: {
        primary: '#7266ba',
        info: '#23b7e5',
        success: '#27c24c',
        warning: '#fad733',
        danger: '#f05050',
        light: '#e8eff0',
        dark: '#3a3f51',
        black: '#1c2b36'
      }
    }

    // translate
    $scope.lang = {isopen: false};
    $scope.langs = {en: 'English', zh: 'Chinese'};
    $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
    $scope.setLang = function (langKey, $event) {
      // set the current lang
      $scope.selectLang = $scope.langs[langKey];
      // You can change the language during runtime
      $translate.use(langKey);
      $scope.lang.isopen = !$scope.lang.isopen;
    };

    $rootScope.currentUser = null;
    $scope.showLogin = false;

    $scope.$on("event:auth-loginRequired", function () {
      // this event can be emitted when stateChangeStart or $http response with 401 status
      console.log("need auth: get event:auth-loginRequired");
      $scope.showLogin = true;
      toastr.clear();
      toastr.error('Account Exception, Please Contact support@newbidder.com', {
        timeOut: 7000,
        positionClass: 'toast-top-center'
      });
      $scope.logout();
    });
    $scope.$on("event:auth-loginSuccess", function () {
      // this event can be emitted after user login
      $scope.showLogin = false;

      var payload = $auth.getPayload();

      if (!$localStorage.currentUser) {
        $localStorage.currentUser = angular.copy(payload);
      }

      if ($rootScope.currentUser && $rootScope.currentUser.id == payload.id) {
        $rootScope.currentUser = $localStorage.currentUser;
        authService.loginConfirmed(payload);
      } else {
        authService.loginConfirmed(payload, function () {
          return false;
        });
        $rootScope.currentUser = $localStorage.currentUser;

        // load user preferences
        Preference.get(null, function(res) {
          if (!res.status)
            return;
          $scope.preferences = res.data;
          // 根据时区获取报表时间
          if (!$localStorage.reportDate) {
            $localStorage.reportDate = {
              datetype: "1",
              fromDate: moment().utcOffset($scope.preferences.reportTimeZone).format('YYYY-MM-DD'),
              fromTime: "00:00",
              toDate: moment().utcOffset($scope.preferences.reportTimeZone).add(1, 'days').format('YYYY-MM-DD'),
              toTime: "00:00"
            }
          }
        });

        // 国家信息
        Country.query(null, function (result) {
          // if (!result.status)
          // return;
          $rootScope.countries = result;
          var countryMap = {};
          result.forEach(function(country) {
            countryMap[country.value] = country;
          });
          $rootScope.countryMap = countryMap;
        });

        var clientId = $cookies.get('clientId');
        // 用户组信息
        Group.get(null, function (result) {
          if (!result.status)
            return;
          var groups = result.data.groups;
          $rootScope.groups = groups;
          groups.forEach(function (group) {
            if (group.groupId == clientId) {
              $rootScope.currentGroup = group;
              $localStorage.currentUser.firstname = group.firstname;
              return;
            }
          });
        });

        Profile.get(null, function(oData) {
          if(oData.status == 1) {
            $rootScope.profile = oData.data;
            $rootScope.profileTimezone = oData.data.timezoneId + ',' + oData.data.timezone;
          }
        });

        Timezone.get(null, function (timezone) {
          $rootScope.timezones = timezone.data.timezones;
        });

        if(!$rootScope.allConditions) {
          Condition.query({}, function(result) {
            $rootScope.allConditions = result;
          });
        }
      }
    });

    $rootScope.changeGroup = $scope.changeGroup = function (group) {
      //$cookies.put("clientId", group.groupId);
      AccountGroup.save({'clientId': group.groupId}, function(result) {
        if (result.status) {
          $rootScope.currentGroup = group;
          $localStorage.currentUser.firstname = group.firstname;
          window.location.reload();
        }
      });
    };

    $rootScope.changeTimezone = function(timezone) {
      var p = $rootScope.profile;
      var oData = {
        companyname: p.companyname,
        firstname: p.firstname,
        homescreen: p.homescreen,
        lastname: p.lastname,
        tel: p.tel
      };
      timezone.replace(/^(.*),(.*)$/, function(tz, $1, $2) {
        oData.timezoneId = $1;
        oData.timezone = $2;
      });

      Profile.save(oData, function(response) {
        if (response.status) {
          Profile.get(null, function(oData) {
            if(oData.status == 1) {
              $rootScope.profile = oData.data;
              $rootScope.profileTimezone = oData.data.timezoneId + ',' + oData.data.timezone;
            }
          });
        }
      });
    };

    // this event can be emitted when $http response with 403 status
    // or on '$stateChangeStart'
    $scope.$on("event:auth-forbidden", function () {
      toastr.clear();
      toastr.error('Account Exception, Please Contact support@newbidder.com', {
        timeOut: 7000,
        positionClass: 'toast-top-center'
      });
      $scope.logout();
    });

    $rootScope.logout = $scope.logout = function () {
      if ($auth.isAuthenticated()) {
        $auth.logout().then(function () {
          $scope.$state.go('access.signin');
        });
      } else {
        $scope.$state.go('access.signin');
      }
      delete $localStorage.currentUser;
      delete $localStorage.reportDate;
      $rootScope.currentUser = null;
      $rootScope.profile = null;
      $rootScope.profileTimezone = null;
      $cookies.remove('token');
      $cookies.remove('clientId');
    };

    $rootScope.addFunds = function() {
      $mdDialog.show({
        bindToController: true,
        clickOutsideToClose: false,
        controllerAs: 'ctrl',
        focusOnOpen: false,
        controller: ['$mdDialog', function($mdDialog) {
          this.close = function() {
            $mdDialog.hide();
          };
        }],
        templateUrl: 'tpl/add-funds-dialog.html?' + +new Date(),
        escapeToClose: false
      });
    };

    if ($auth.isAuthenticated()) {
      $scope.$broadcast("event:auth-loginSuccess");
    }

    $scope.goCoupon = function () {
      $scope.$state.go('setApp.subscriptions');
    };

    $scope.emailCon = 'support@newbidder.com';
    $scope.skypeCon = 'live:support_44609';
    $scope.qqCon = '490922827';
    $scope.copyCon = function(){
      toastr.success('copy success',{ timeOut: 4000, positionClass: 'toast-top-center' });
    };
  }

})();
