angular.module('starter.controllers',[])
.controller('TabCtrl',['$scope', 'data', function($scope, data) {
    $scope.isSignIn = function() {
        return data.connstate == 'signin';
    }
}])
.controller('AccountCtrl',['$scope','data','$state', 'localstorage', function($scope,data,$state, localstorage){
    localstorage.set('state','tab.account');
    $scope.device = data.device;
    $scope.user={};
    if (data.user.name) {
        $scope.user.name = data.user.name;
    }
    if (data.user.phone) {
        $scope.user.phone = data.user.phone;
    }
    $scope.signin=function(){
        if (!$scope.user.name||!$scope.user.phone) {
            return;
        }
        data.user.name=$scope.user.name;
        data.user.phone=$scope.user.phone;
        data.connstate='signin';
        localstorage.set('name', data.user.name);
        localstorage.set('phone', data.user.phone);
        localstorage.set('connstate',data.connstate);
        data.socket.emit('rider:signin', {user:$scope.user, device:data.device});
        $state.go('tab.dash');
    }
    $scope.signout=function(){
        data.socket.emit('rider:signout', {user:$scope.user, device:data.device});
        data.connstate='signout';
        localstorage.remove('state');
        localstorage.remove('connstate');
    }
    $scope.isSignIn=function(){
        return data.connstate=='signin';
    }
}])

.controller('DashCtrl',['$scope','data', '$state', 'localstorage', 'geo', function($scope,data,$state, localstorage, geo){
    localstorage.set('state','tab.dash');
    $scope.state = $state;
    $scope.device = data.device
    $scope.name = data.user.name;
    $scope.phone = data.user.phone;
    geo.getGeoLocation(function(lat, lng){
        geo.getAddressFromGeoLocation(lat, lng, function(address) {
            $scope.address = address;
        });
    }, function(err) {
        $scope.address = "unknown";
    });
    $scope.request=function(){
        data.socket.emit('rider:request', {name:data.user.name, phone:data.user.phone});
    }
}])

.controller('MapCtrl', function($scope, $http, localstorage, data, geo) {
    localstorage.set('state','tab.map');
    $scope.msg = "";
    $scope.coords = [0,0];
    $scope.mapVisible = true;

    var updateCenter = function(lat, lng) {
        /*var mapOptions = {
            center: new google.maps.LatLng(0,0),
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };*/
        $scope.map.setCenter(new google.maps.LatLng(lat, lng));
        $scope.map.setZoom(16);
        $scope.centerLat = lat;
        $scope.centerLng = lng;
        $scope.mapVisible =true;
    };

    var init = function () {
        var mapOptions = {};
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        $scope.map = map;
        geo.getGeoLocation(function(lat, lng){
            $scope.msg = lat + ":" + lng;
            updateCenter(lat, lng);
            geo.getAddressFromGeoLocation(lat, lng, function(address) {
                $scope.address = address;
            });
        }, function(err) {
            $scope.msg = err;
            $scope.address = "unknown";
        });
    };

    init();
})
