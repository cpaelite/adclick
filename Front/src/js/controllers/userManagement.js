(function () {
  'use strict';

  angular.module('app')
    .controller('UserManagementCtrl', [
      '$scope', '$mdDialog', '$q', 'toastr', 'Profile', 'Plan', 'Invitation',
      UserManagementCtrl
    ]);

  function UserManagementCtrl($scope, $mdDialog, $q, toastr, Profile, Plan, Invitation) {
    $scope.app.subtitle = 'UserManagement';

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
      $scope.invitationUserCount = $scope.users.length + $scope.pendingUsers.length;
    }

    $q.all(initPromises).then(initSuccess);

    $scope.sendInvitation = function () {
      var emails = $scope.emails.split(',');
      $scope.invitationCount = $scope.invitationUserCount + emails.length;
      if ($scope.invitationCount > $scope.plan.userLimit) {
        $scope.errMessage = true;
        return;
      }

      var regexp = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      var valid = true;
      emails.forEach(function (email) {
        if (!regexp.test(email)) {
          valid = false;
        }
      });
      if (!valid) {
        $scope.emailForm.email.$setValidity('email', valid);
        return;
      }

      Invitation.save({invitationEmail: emails}, function (result) {
        if (result.status) {
          fillUsers(result.data.invitations);
          toastr.success('invitations success!');
        } else {
          toastr.error('invitations error!');
        }
        $scope.email = '';
      });
    };
    $scope.deleteInvitation = function (invitation, ev) {
      $mdDialog.show({
        bindToController: true,
        targetEvent: ev,
        clickOutsideToClose: false,
        controllerAs: 'ctrl',
        controller: ['$scope', '$mdDialog', 'toastr', userDeleteCtrl],
        focusOnOpen: false,
        locals: {
          invitation: invitation
        },
        templateUrl: 'tpl/user-delete-dialog.html'
      }).then(function () {
        Invitation.delete({
          id: invitation.id
        }, function () {
          $scope.pendingUsers.splice(invitation, 1);
          $scope.invitationUserCount = $scope.users.length + $scope.pendingUsers.length;
        });
      });

    }
  }

  function userDeleteCtrl($scope, $mdDialog) {
    this.cancel = $mdDialog.cancel;
    this.ok = function () {
      $mdDialog.hide();
    };
  }
})();
