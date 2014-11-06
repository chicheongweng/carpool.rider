angular.module('starter.controllers',[])
.controller('AccountCtrl',['$rootScope','$scope','data','$state',function($rootScope,$scope,data,$state){
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
        $rootScope.state='signin';
        $state.go('tab.dash');
    }
    $scope.signout=function(){
        $rootScope.state='signout';
    }
    $scope.isSignIn=function(){
        return $rootScope.state=='signin';
    }
}])

.controller('DashCtrl',['$scope','$rootScope','data', '$state', function($scope,$rootScope,data,$state){
    $scope.name = data.user.name;
    $scope.phone = data.user.phone;
    $scope.request=function(){
        data.socket.emit('rider:request', {name:data.user.name, phone:data.user.phone});
    }
}])

.controller('MapCtrl', function($scope, $http, $cordovaGeolocation) {
    $scope.msg = "";
    $scope.coords = [0,0];
    $scope.mapVisible = true;

    var init = function () {
        var mapOptions = {};
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        $scope.map = map;
        $cordovaGeolocation.getCurrentPosition().then(function(position) {
            console.log("position = "+position.coords.latitude+":"+position.coords.longitude);
            $scope.msg = position.coords.latitude + ":" + position.coords.longitude;
            updateCenter(parseFloat(position.coords.latitude), parseFloat(position.coords.longitude));
        }, function(err) {
            $scope.msg = "unable to determine location";
        });
    };

    var getGeoLocation = function() {
        console.log("getGeoLocation");
        var coords = {lat: undefined, lng: undefined};
        $cordovaGeolocation.getCurrentPosition().then(function(position) {
            coords.lat =  position.coords.latitude;
            coords.lng =  position.coords.longitude;
        }, function(err) {
        });
        console.log(coords.lat+":"+coords.lng);
        return coords;
    };

    var getAddressFromGeoLocation = function(lat, lng) {
        console.log("calling getAddressFromGeoLocation");
        apiKey = 'AIzaSyAEKs4ZY-sOsDnaq-M27MiOfhWK4dJfDSg';
        $scope.url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&location_type=ROOFTOP&result_type=street_address&key=AIzaSyAEKs4ZY-sOsDnaq-M27MiOfhWK4dJfDSg';
        address = undefined;
        $http.get($scope.url).
            success(function(data, status, headers, config) {
                console.log("data.status "+data.status);
                if (data.status=='OK') {
                    address = data.results[0].formatted_address;
                }
                else {
                    address = "unknown";
                }
        }).
            error(function(data, status, headers, config) {
        });
        return address;
    };

    updateCenter = function(lat, lng) {
        /*var mapOptions = {
            center: new google.maps.LatLng(0,0),
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };*/
        $scope.map.setCenter(new google.maps.LatLng(lat, lng));
        $scope.map.setZoom(16);
        $scope.centerLat = lat;
        $scope.centerLng = lng;
        $scope.address = getAddressFromGeoLocation(lat, lng);
        console.log("scope.address = "+$scope.address);
        $scope.mapVisible =true;
    };

    init();
})
