angular.module('starter.controllers',[])
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
        if (data.signinFlag) {
            data.socket.socket.reconnect();
        } else {
            data.socket = io.connect(data.URL, data.params);
            data.socket.on('connect', function() {
                data.socket.emit('rider:signin', {user:$scope.user, device:data.device});
            });
            data.signinFlag = true;
        }
        $state.go('tab.dash');
    }
    $scope.signout=function(){
        data.socket.disconnect();
        data.connstate='signout';
        data.listenerAdded = false;
        localstorage.remove('state');
        localstorage.remove('connstate');
    }
    $scope.isSignIn=function(){
        return data.connstate=='signin';
    }
}])

.controller('DashCtrl',['$scope','data', '$state', 'localstorage', function($scope,data,$state, localstorage){
    localstorage.set('state','tab.dash');
    $scope.state = $state;
    $scope.device = data.device
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
