function getUUID() {
    var d = new Date().getTime();
    var u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return u.toUpperCase();
};

function checkConnection() {
    if (window.cordova) {
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN]  = false;
        states[Connection.ETHERNET] = true;
        states[Connection.WIFI]     = true;
        states[Connection.CELL_2G]  = true;
        states[Connection.CELL_3G]  = true;
        states[Connection.CELL_4G]  = true;
        states[Connection.CELL]     = true;
        states[Connection.NONE]     = false;
        return states[networkState];
    } else {
        return navigator.onLine;
    };
};

angular.module('starter', ['ionic', 'ngCordova', 'google-maps', 'starter.controllers', 'starter.services', 'starter.directives'])

.run(function($ionicPlatform, $rootScope, $state, $window) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    $rootScope.online = checkConnection();
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function() {
            $rootScope.online = false;
        });
    }, false);
    $window.addEventListener("online", function () {
        $rootScope.$apply(function() {
            $rootScope.online = true;
        });
    }, false);

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

.factory('geo', function($http, $cordovaGeolocation) {
    return {
        getAddressFromGeoLocation: function(lat, lng, callback) {
            apiKey = 'AIzaSyAEKs4ZY-sOsDnaq-M27MiOfhWK4dJfDSg';
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

.factory('data', function ($cordovaDevice, $window) {
    var URL = '54.251.92.139:8001';
    var uuid = $window.localStorage['uuid'] || getUUID();
    var device;
    var socket;
    var name = $window.localStorage['name'] || undefined;
    var phone = $window.localStorage['phone'] || undefined;
    var connstate = $window.localStorage['connstate'] || 'signout';
    try {
        device = $cordovaDevice.getDevice();
        device.uuid = device.uuid.toLowerCase();
    }
    catch(err) {
        device = {available: true,
            platform: undefined,
            version: undefined,
            uuid: uuid,
            cordova: undefined,
            model: undefined
        };
    }; 
    socket = io.connect(URL, {'reconnection limit': 5000});
    return {
        apiKey: 'AIzaSyAEKs4ZY-sOsDnaq-M27MiOfhWK4dJfDSg',
        device: device,
        uuid: uuid,
        user: { 
            name: name,
            phone: phone
        },
        URL: URL,
        params: {'reconnection limit': 5000},
        socket: socket,
        connstate: connstate,
        state: $window.localStorage['state'] || 'tab.account',
    };
});

