/*global define*/
'use strict';

define([], function () {

  function UsersController($scope, $stateParams, $state, $modal, $aside, $q, $http, confirmationDialogService, Identify3D, usersData, currentUser){

    var self = this;

    self.dummyPromise = null;

    self.currentUser = currentUser;
    self.users = usersData;

    self.noneFound = self.users.length === 0;

    self.totalFound = 1 //,usersData.total_items || 0;

    self.pager = {
      totalItems: usersData.total_pages * usersData.max_items_per_page,
      itemPerPage: usersData.max_items_per_page,
      currentPage: $stateParams.pageNum,
      maxSize: 100
    };

    self.navigateToPage = function(){
      var blockingUI = $q.defer();
      self.myPromise = blockingUI.promise;

      $state.go(".", {pageNum: self.pager.currentPage}, {reload: false});
    }

    self.archiveJob = function(designId) {
      confirmationDialogService('md', 'Are you sure you want to archive?', true, false)
      .result
      .then(function (userResponse) {
        console.log('archive now', designId);

        return archiveJob(designId);

      }, function (userResponse) {
        //this should never happen i.e cancelButton=false
      });
    }

    var archiveJob = function(designId){
      var blockingUI = $q.defer();
      self.myPromise = blockingUI.promise;

      function unblockAndNavigateToParentWithReload(){
        blockingUI.resolve();
        $state.go(".", $stateParams, {reload: true});
      }

      Identify3D.doBureauArchiveJob(designId)
      .then(function(data){

        unblockAndNavigateToParentWithReload();

      },function(meta){

        confirmationDialogService('md', meta.error, false, true)
        .result
        .then(function (response) {
          blockingUI.reject();
        }, function (response) {
          //this should never happen i.e cancelButton=false
        });

      });
    }

    self.filterBy = function() {
      self.noneFound = false;
      self.orders = null;

      var blockingUI = $q.defer();
      self.myPromise = blockingUI.promise;

      console.log(self.prescriptionStatus);
      $state.go(".", {pageNum: 1, keyword: "", createdAfter:0, createdBefore:0, prescriptionStatus: self.prescriptionStatus}, {reload: false});
    }

    self.openAfterCal = function($event) {
     $event.preventDefault();
     $event.stopPropagation();
     self.isAfterCalOpen = true;
    };

    self.openBeforeCal = function($event) {
     $event.preventDefault();
     $event.stopPropagation();
     self.isBeforeCalOpen = true;
    };


    self.deleteUser = function(userId) {
      confirmationDialogService('md', 'Are you sure you want to delete user?', true, false)
      .result
      .then(function (userResponse) {
        console.log("delete", userId);

        return Identify3D.doBureauUserDelete({
          user: userId,
        }).then(function(data){

          $state.go(".", $stateParams, {reload: true});

        });

      }, function (userResponse) {
        //this should never happen i.e cancelButton=false
      });
    }

  }

  return {'UsersController': ['$scope', '$stateParams', '$state', '$modal', '$aside', '$q', '$http', 'confirmationDialogService', 'Identify3DObject', 'usersData', 'currentUser', UsersController]};
});
