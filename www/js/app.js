function getUUID() {
    var d = new Date().getTime();
    var u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return u.toUpperCase();
};

angular.module('starter', ['ionic', 'ngCordova', 'google-maps', 'starter.controllers', 'starter.services', 'starter.directives'])

.run(function($ionicPlatform, $rootScope, $state) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    $rootScope.state='signout';
    $state.go('tab.account')
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
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

.factory('data', function ($cordovaDevice) {
    var device
    try {
        device = $cordovaDevice.getDevice();
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
    return {
        device: device,
        uuid: undefined,
        user: {name: undefined, phone: undefined},
        socket: io.connect('54.251.92.139:8000'),
        listenerAdded: false
    };
});
