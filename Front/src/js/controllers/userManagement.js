(function () {
  'use strict';

  angular.module('app')
    .controller('UserManagementCtrl', [
      '$scope', '$mdDialog', '$q', 'toastr', 'Profile', 'Plan', 'Invitation', 'ChangePlan',
      UserManagementCtrl
    ]);

  function UserManagementCtrl($scope, $mdDialog, $q, toastr, Profile, Plan, Invitation, ChangePlan) {
    $scope.app.subtitle = 'UserManagement';

    $scope.initState = 'init';

    $scope.userLimit = $scope.permissions.setting.userManagement.userLimit;

    // init load data
    var initPromises = [], prms;

    var theProfile;
    prms = Profile.get(null, function (profile) {
      theProfile = profile.data;
    }).$promise;
    initPromises.push(prms);

    var thePlan;
    prms = Plan.get(null, function (plan) {
      thePlan = plan.data.plan;
    }).$promise;
    initPromises.push(prms);

    var theInvitation;
    prms = Invitation.get(null, function (invitation) {
      theInvitation = invitation.data.invitations;
    }).$promise;
    initPromises.push(prms);

    function fillUsers(invitations) {
      $scope.users = [];
      $scope.pendingUsers = [];
      $scope.invitationUserCount = 0;
      if (invitations.length > 0) {
        invitations.forEach(function (invitation) {
          if (invitation.status) {
            $scope.users.push(invitation);
          } else {
            $scope.pendingUsers.push(invitation);
          }
        });
        $scope.invitationUserCount = $scope.users.length + $scope.pendingUsers.length;
      }
    }

    function initSuccess() {
      if (theProfile) {
        $scope.profile = theProfile;
      }
      if (thePlan) {
        $scope.plan = thePlan;
      }
      if (theInvitation) {
        fillUsers(theInvitation);
      }
      $scope.initState = 'success';
    }

    function initError() {
      $scope.initState = 'error';
    }

    $q.all(initPromises).then(initSuccess, initError);

    $scope.sendInvitation = function () {
      if(!$scope.emails) return;
      var emails = $scope.emails.split(',');
      $scope.invitationCount = $scope.invitationUserCount + emails.length;
      if ($scope.invitationCount > $scope.userLimit) {
        $scope.errMessage = true;
        return;
      }

      var regexp = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      var valid = true;
      emails.forEach(function (email) {
        if (!regexp.test(email)) {
          valid = false;
        }
      });
      $scope.emailForm.email.$setValidity('email', valid);
      if (!valid) {
        return;
      }
      $scope.invitationSaveStatus = true;
      Invitation.save({invitationEmail: emails}, function (result) {
        $scope.invitationSaveStatus = false;
        if (result.status) {
          fillUsers(result.data.invitations);
          toastr.success('invitations success!');
        } else {
          toastr.error('invitations error!');
        }
        $scope.emails = '';
      });
    };
    $scope.deleteInvitation = function (invitation, type, ev) {
      $mdDialog.show({
        bindToController: true,
        targetEvent: ev,
        clickOutsideToClose: false,
        controllerAs: 'ctrl',
        controller: ['$mdDialog', '$scope', userDeleteCtrl],
        focusOnOpen: false,
        locals: {
          invitation: invitation,
          type: type
        },
        templateUrl: 'tpl/user-delete-dialog.html'
      }).then(function () {
        Invitation.delete({
          id: invitation.id
        }, function () {
          $scope.errMessage = false;
          if(type == 'list') {
            $scope.users.splice(invitation, 1);
          } else {
            $scope.pendingUsers.splice(invitation, 1);
          }
          $scope.invitationUserCount = $scope.users.length + $scope.pendingUsers.length;
        });
      });
    };

    $scope.upgradePlan = function() {
      ChangePlan.showDialog(thePlan.id, false, function() {
      }, {upgrade: true, level: thePlan.level});
    };
  }

  function userDeleteCtrl($mdDialog, $scope) {
    $scope.invitation = this.invitation;
    this.cancel = $mdDialog.cancel;
    this.ok = function () {
      $mdDialog.hide();
    };
  }
})();
