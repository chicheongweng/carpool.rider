angular.module('starter.controllers',[])
.controller('TabCtrl', function($scope, data) {
    $scope.isSignIn = function() {
        return data.connstate.state=='signin';
    }
})
.controller('AccountCtrl', function($rootScope,$scope,data,$state, localstorage, $cordovaOauth, LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET){
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
    console.log("signing in ...");
    console.log("LINKEDIN_CLIENT_ID = "+LINKEDIN_CLIENT_ID);
    console.log("LINKEDIN_CLIENT_SECRET = "+LINKEDIN_CLIENT_SECRET);
    $cordovaOauth.linkedin(LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, ["r_basicprofile"], "csrf token you make").then(
        function(result) {
            console.log("Linkedin Login Successful");
                var access_token = result.access_token;
                var expire_date = result.expires_in;
                $scope.user.name = 'johntherider';
                $scope.user.phone = '68681234';
                data.user.name=$scope.user.name;
                data.user.phone=$scope.user.phone;
                data.connstate.state='signin';
                localstorage.set('name', data.user.name);
                localstorage.set('phone', data.user.phone);
                localstorage.set('connstate',data.connstate.state);
                data.socket.emit('rider:signin', {user:$scope.user, device:data.device});
                $state.go('tab.dash');
        },
            function(data, status) {
            console.log("Linkedin Login Failed");
        });

        /*
        if (!$scope.user.name||!$scope.user.phone) {
            return;
        }
        data.user.name=$scope.user.name;
        data.user.phone=$scope.user.phone;
        data.connstate.state='signin';
        localstorage.set('name', data.user.name);
        localstorage.set('phone', data.user.phone);
        localstorage.set('connstate',data.connstate.state);
        data.socket.emit('rider:signin', {user:$scope.user, device:data.device});
        $state.go('tab.dash');
        */
    }
    $scope.signout=function(){
        $rootScope.messages = [];
        $rootScope.requestDisabled = false;
        data.socket.emit('rider:signout', {user:$scope.user, device:data.device});
        data.connstate.state='signout';
        localstorage.remove('state');
        localstorage.remove('connstate');
    }
    $scope.isSignIn=function(){
        return data.connstate.state=='signin';
    }
})

.controller('DashCtrl',['$rootScope','$scope','data', '$state', 'localstorage', 'geo', function($rootScope,$scope,data,$state,localstorage,geo){
    localstorage.set('state','tab.dash');
    $scope.state = $state;
    $scope.lat = undefined;
    $scope.lng = undefined;
    $scope.device = data.device
    $scope.name = data.user.name;
    $scope.phone = data.user.phone;
    geo.getGeoLocation(function(lat, lng){
        geo.getAddressFromGeoLocation(lat, lng, function(address) {
            $scope.lat = lat;
            $scope.lng = lng;
            $scope.address = address;
        });
    }, function(err) {
        $scope.address = "unknown";
    });
    $scope.request=function(){
        if ($scope.lat && $scope.lng) {
            pos = {lat:$scope.lat, lng:$scope.lng};
            $rootScope.requestDisabled = true;
            data.socket.emit('rider:request', {user:data.user, address:$scope.address, device:data.device, pos:pos}, function(data) { $rootScope.requestDisabled = false; });
        }
        else {
            geo.getGeoLocation(function(lat, lng){
            pos = {lat:lat, lng:lng};
            data.socket.emit('rider:request', {user:data.user, address:$scope.address, device:data.device, pos:pos});
            });
        }
                
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

    var updateMarker = function(lat, lng, map) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat,lng),
            map: map,
            title: 'Current Location'
        });
    };

    var init = function () {
        var mapOptions = {};
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        $scope.map = map;
        geo.getGeoLocation(function(lat, lng){
            $scope.msg = lat + ":" + lng;
            updateCenter(lat, lng);
            updateMarker(lat, lng, map);
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
