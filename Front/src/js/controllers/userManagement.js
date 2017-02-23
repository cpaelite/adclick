(function () {
  'use strict';

  angular.module('app')
    .controller('UserManagementCtrl', [
      '$scope', '$mdDialog', '$q', 'toastr', 'Plan', 'Invitation',
      UserManagementCtrl
    ]);

  function UserManagementCtrl($scope, $mdDialog, $q, toastr, Plan, Invitation) {
    $scope.app.subtitle = 'UserManagement';

    // init load data
    var initPromises = [], prms;
    var thePlan;
    prms = Plan.get(null, function (plan) {
      thePlan = plan.data.plan;
    }).$promise;
    initPromises.push(prms);

    var theInvitation;
    prms = Invitation.get(null, function (invitation) {
      theInvitation = invitation.data;
    }).$promise;
    initPromises.push(prms);

    function initSuccess() {
      if (thePlan) {
        $scope.plan = thePlan;
      }
      if (theInvitation) {
        $scope.invitation = theInvitation;
      }
      $scope.userCount = ($scope.invitation.users.length - 1) + $scope.invitation.invitations.length;
    }

    $q.all(initPromises).then(initSuccess);

    $scope.sendInvitation = function () {
      var emails = $scope.emails.split(',');
      $scope.invitationCount = ($scope.invitation.users.length - 1) + $scope.invitation.invitations.length + emails.length;
      if ($scope.invitationCount > $scope.plan.userLimit) {
        return;
      }
      Invitation.save({email: emails}, function (result) {
        $scope.invitation.invitations = result.data.invitations;
        if (result.status) {
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
          id: invitation.email
        }, function () {
          $scope.invitation['invitations'].splice(invitation, 1);
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
