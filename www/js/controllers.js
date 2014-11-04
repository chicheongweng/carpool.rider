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
    }
}])

.controller('MapCtrl', function($scope, $http, $cordovaGeolocation) {
    console.log("init map");
    $scope.msg = "";
    $scope.coords = [0,0];
    $scope.mapVisible = true;

    var init = function () {
        var mapOptions = {};
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        $scope.map = map;

        // get coords
        $cordovaGeolocation.getCurrentPosition().then(function(position) {
            // Position here: position.coords.latitude, position.coords.longitude
            console.log("setting map");
            $scope.msg = position.coords.latitude + ":" + position.coords.longitude;
            $scope.updateCenter(parseFloat(position.coords.latitude), parseFloat(position.coords.longitude));
        }, function(err) {
            $scope.msg = "unable to determine location";
        });
    };

    $scope.updateCenter = function(lat, lng) {
        /*var mapOptions = {
            center: new google.maps.LatLng(0,0),
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };*/
        $scope.map.setCenter(new google.maps.LatLng(lat, lng));
        $scope.map.setZoom(16);
        $scope.centerLat = lat;
        $scope.centerLng = lng;
        apiKey = 'AIzaSyAEKs4ZY-sOsDnaq-M27MiOfhWK4dJfDSg';
        $scope.url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&location_type=ROOFTOP&result_type=street_address&key=AIzaSyAEKs4ZY-sOsDnaq-M27MiOfhWK4dJfDSg';
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
        $scope.mapVisible =true;
    };


    init();
})
