angular.module('starter.directives',[]).directive('request',['$rootScope','SOCKET_URL',function($rootScope,SOCKET_URL){
    return{
        replace:true,
        restrict:'AE',
        scope:{

        },
        link:function(scope,elem,attrs){
            scope.messages = [];
            socket = io.connect(SOCKET_URL);
            socket.emit('rider:signin');
            socket.on('request',function(data){
                scope.$apply(function(){
                    scope.messages.unshift(data);
                });
            });
        },
        templateUrl:'templates/request.html'
    }
}]);
