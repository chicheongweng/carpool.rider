angular.module('starter.controllers',[]).controller('AccountCtrl',['$scope','USER','$state',function($scope,USER,$state){
    $scope.user={};
    $scope.signin=function(){
        USER.name=$scope.user.name;
        USER.phone=$scope.user.phone;
        $state.go('tab.dash');
    }
}]).controller('DashCtrl',['$scope','$rootScope','USER', '$state', 'SOCKET_URL', function($scope,$rootScope,USER,$state,SOCKET_URL){
    $scope.name = USER.name;
    $scope.phone = USER.phone;
    $scope.request=function(){
        socket = io.connect(SOCKET_URL);
        socket.emit('rider:request', {name:USER.name, phone:USER.phone});
        socket.close();
    }
}]);
