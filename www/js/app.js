function getUUID() {
    var d = new Date().getTime();
    var u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return u.toUpperCase();
};

angular.module('starter', ['ionic', 'ngCordova', 'ngCordovaOauth', 'google-maps', 'starter.config', 'starter.controllers', 'starter.services', 'starter.directives'])

.run(function($ionicPlatform, $rootScope, $state, $window, $cordovaNativeAudio, $cordovaDevice, MEDIA_FILE) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    $cordovaNativeAudio.preloadSimple('rider', 'audio/rider.mp3')
    .then(function (msg) {
        console.log(msg);
    }, function (error) {
        alert(error);
    });
    /*
    var device = $cordovaDevice.getDevice();
    var src = MEDIA_FILE;

    if (typeof device != "undefined") {
        if (device.platform.toLowerCase() === "android") {
            src = '/android_asset/www/' + src;
        }
        console.log("media src = " + src);
        $rootScope.mediaSrc = new Media(src, null, function onError(e) { console.log("error playing sound: " + JSON.stringify(e)); });
        //$rootScope.mediaSrc.play();
    } else {
        console.log("no sound API to play: " + src);
    }
    */

    var state = $window.localStorage['state'] || 'tab.account';
    $state.go(state);

  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: 'templates/tabs.html',
      controller: 'TabCtrl'
    })

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab-dash.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl'
        }
      }
    })

    .state('tab.map', {
        url: '/map',
        views: {
            'tab-map': {
                templateUrl: 'templates/tab-map.html',
                controller: 'MapCtrl'
            }
        }
    });
})

.factory('localstorage', ['$window', function($window) {
    return {
        remove: function(key) {
            $window.localStorage.removeItem(key);
        },
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}])

.factory('geo', function($http, $cordovaGeolocation, GOOGLEMAP_API_KEY) {
    return {
        getAddressFromGeoLocation: function(lat, lng, callback) {
            apiKey = GOOGLEMAP_API_KEY;
            url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&location_type=ROOFTOP&result_type=street_address&key='+apiKey;
            $http.get(url).
                success(function(data, status, headers, config) {
                    if (data.status=='OK') {
                        address = data.results[0].formatted_address;
                    }
                    else {
                        address = "unknown";
                    };
                    callback && callback(address);
            });
        },

        getGeoLocation: function(callback, callbackerr) {
            $cordovaGeolocation.getCurrentPosition().then(function(position) {
                var lat = parseFloat(position.coords.latitude);
                var lng = parseFloat(position.coords.longitude);
                callback && callback(lat, lng);
            }, function(err) {
                callbackerr && callbackerr("unable to determine location");
            });
        },
    }
})

.factory('data', function ($cordovaDevice, $window, $rootScope, $cordovaNativeAudio, $cordovaKeychain, GOOGLEMAP_API_KEY) {
    $rootScope.requestDisabled = false;
    var URL = 'uber.ratecoworkers.com:8001';
    var device;
    var socket;
    var access_token = null;
    var expires_in = 0;
    var user = { 
        name:$window.localStorage['name'] || undefined,
        phone:$window.localStorage['phone'] || undefined
    }
    var connstate = {
        state:$window.localStorage['connstate'] || 'signout'
    }
    $rootScope.messages = []; 
    try {
        device = $cordovaDevice.getDevice();
        device.uuid = device.uuid.toLowerCase();
        if (device.platform == 'iOS') {
        console.log("calling $cordovaKeychain");
        $cordovaKeychain.getForKey('uuid','servicename')
        .then(
            function(value) {
            console.log("$cordovaKeychain getForKey succeeded");
            device.uuid = value;
            },
            function(err) {
                console.log("$cordovaKeychain getForKey failed");
                $cordovaKeychain.setForKey('uuid','servicename',device.uuid.toLowerCase())
                .then(function(value) {
                    console.log("$cordovaKeychain setForKey succeeded");
                },
                function(err) {
                    console.log("$cordovaKeychain setForKey failed");
                });
            });
        }
    }
    catch(err) {
        device = {available: true,
            platform: undefined,
            version: undefined,
            uuid: getUUID(),
            cordova: undefined,
            model: undefined
        };
    }; 
    console.log('io.connect '+URL);
    socket = io.connect(URL, {'reconnection limit': 5000, 'max reconnection attempts': Infinity});
    socket.on('connect', function() {
        console.log('connect');
        if (connstate.state == 'signin') {
            socket.emit('driver:update', {user:user, device:device});
        }
    });
    socket.on('disconnect', function() {
        console.log('disconnect');
        socketConnectTimeInterval = setInterval(function () {
            socket.socket.reconnect();
            if(socket.socket.connected) {
                if (connstate.state=='signin') {
                    socket.emit('rider:update', {user:user, device:device});
                }
                clearInterval(socketConnectTimeInterval);
            }
        }, 3000);
    });
    socket.on('connect_failed', function() {
        console.log('connect_failed');
        socketConnectTimeInterval = setInterval(function () {
            socket.socket.reconnect();
            if(socket.socket.connected) {
                if (connstate.state=='signin') {
                    socket.emit('rider:update', {user:user, device:device});
                }
                clearInterval(socketConnectTimeInterval);
            }
        }, 3000);
    });
    socket.on('requestack:accepted', function(data, callback) {
        console.log('requestack:accepted');
        $rootScope.$apply(function(){
            data.date = Date();
            data.status = "accepted";
            $rootScope.messages.unshift(data);
            $rootScope.requestDisabled = false;
        });
        callback(true);
        $cordovaNativeAudio.play('rider');
    });
    socket.on('requestack:ignored', function(data, callback) {
        console.log('requestack:ignored');
        callback(true);
        $rootScope.$apply(function(){
            data.date = Date();
            data.status = "ignored";
            $rootScope.messages.unshift(data);
            $rootScope.requestDisabled = false;
        });
        $cordovaNativeAudio.play('rider');
    });
    socket.on('requestack:unavail', function(data, callback) {
        console.log('requestack:unavail');
        callback(true);
        $rootScope.$apply(function(){
            data.date = Date();
            data.status = "unavail";
            $rootScope.messages.unshift(data);
            $rootScope.requestDisabled = false;
        });
        $cordovaNativeAudio.play('rider');
    });

    return {
        apiKey: GOOGLEMAP_API_KEY,
        device: device,
        user: user,
        URL: URL,
        params: {'reconnection limit': 5000},
        socket: socket,
        connstate: connstate,
        state: $window.localStorage['state'] || 'tab.account',
    };
});

