angular.module('starter.controllers',[]).controller('AccountCtrl',['$rootScope','$scope','USER','$state',function($rootScope, $scope,USER,$state){
    $scope.user={};
    if (USER.name) {
        $scope.user.name = USER.name;
    }
    if (USER.phone) {
        $scope.user.phone = USER.phone;
    }
    $scope.signin=function(){
        USER.name=$scope.user.name;
        USER.phone=$scope.user.phone;
        $rootScope.state='signin';
        $state.go('tab.dash');
    }
    $scope.signout=function(){
        $rootScope.state='signout';
    }
    $scope.isSignIn=function(){
        return $rootScope.state=='signin';
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
