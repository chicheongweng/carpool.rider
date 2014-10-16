angular.module('starter.controllers',[]).controller('AccountCtrl',['$scope','USER','$state',function($scope,USER,$state){
    $scope.user={};
    $scope.update=function(){
        USER.name=$scope.user.name;
        USER.phone=$scope.user.phone;
        $state.go('tab.dash');
    }
}]).controller('DashCtrl',['$scope','$rootScope','USER', '$state', function($scope,$rootScope,USER,$state){

    $rootScope.$on('event:file:selected',function(event,data){
        //console.log(data.image)
    });

}]);
