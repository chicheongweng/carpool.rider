angular.module('starter.controllers',[])
.controller('AccountCtrl',['$rootScope','$scope','data','$state', 'localstorage', function($rootScope,$scope,data,$state, localstorage){
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
        data.user.name=$scope.user.name;
        data.user.phone=$scope.user.phone;
        $rootScope.connstate='signin';
        localstorage.set('connstate','signin');
        $state.go('tab.dash');
    }
    $scope.signout=function(){
        $rootScope.connstate='signout';
        localstorage.set('connstate','signout');
    }
    $scope.isSignIn=function(){
        return $rootScope.connstate=='signin';
    }
}])

.controller('DashCtrl',['$scope','$rootScope','data', '$state', 'localstorage', function($scope,$rootScope,data,$state, localstorage){
    localstorage.set('state','tab.dash');
    $scope.name = data.user.name;
    $scope.phone = data.user.phone;
    $scope.request=function(){
        data.socket.emit('rider:request', {name:data.user.name, phone:data.user.phone});
    }
}])

.controller('MapCtrl', function($scope, $http, $cordovaGeolocation, localstorage) {
    localstorage.set('state','tab.map');
    $scope.msg = "";
    $scope.coords = [0,0];
    $scope.mapVisible = true;

    var getAddressFromGeoLocation = function(lat, lng) {
        apiKey = 'AIzaSyAEKs4ZY-sOsDnaq-M27MiOfhWK4dJfDSg';
        $scope.url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&location_type=ROOFTOP&result_type=street_address&key=AIzaSyAEKs4ZY-sOsDnaq-M27MiOfhWK4dJfDSg';
        address = undefined;
        $http.get($scope.url).
            success(function(data, status, headers, config) {
                if (data.status=='OK') {
                    $scope.address = data.results[0].formatted_address;
                }
                else {
                    $scope.address = "unknown";
                }
        }).
            error(function(data, status, headers, config) {
        });
    };

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

    var getGeoLocation = function() {
        $cordovaGeolocation.getCurrentPosition().then(function(position) {
            $scope.msg = position.coords.latitude + ":" + position.coords.longitude;
            var lat = parseFloat(position.coords.latitude);
            var lng = parseFloat(position.coords.longitude);
            updateCenter(lat, lng);
            getAddressFromGeoLocation(lat, lng);
        }, function(err) {
            $scope.msg = "unable to determine location";
        });
    };

    var init = function () {
        var mapOptions = {};
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        $scope.map = map;
        getGeoLocation();
    };

    init();
})
