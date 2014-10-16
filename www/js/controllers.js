angular.module('starter.controllers',[]).controller('AccountCtrl',['$scope','USER','$state',function($scope,USER,$state){
    $scope.user={};
    $scope.update=function(){
        USER.name=$scope.user.name;
        USER.phone=$scope.user.phone;
        $state.go('tab.dash');
    }
}]).controller('DashCtrl',['$scope','$rootScope','USER', '$state', 'SOCKET_URL', function($scope,$rootScope,USER,$state,SOCKET_URL){
    $scope.request=function(){
        socket = io.connect(SOCKET_URL);
        socket.emit('rider:request', {name:USER.name, phone:USER.phone});
    }
}]);
