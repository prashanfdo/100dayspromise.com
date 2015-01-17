'use strict';

angular.module('sourceApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'btford.socket-io',
        'ui.router',
        'ui.bootstrap',
        'angularMoment'
    ])
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        $urlRouterProvider
            .otherwise('/');

        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
    })

.factory('authInterceptor', function($rootScope, $q, $cookieStore, $location) {
        return {
            // Add authorization token to headers
            request: function(config) {
                config.headers = config.headers || {};
                if ($cookieStore.get('token')) {
                    config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
                }
                return config;
            },

            // Intercept 401s and redirect you to login
            responseError: function(response) {
                if (response.status === 401) {
                    $location.path('/login');
                    // remove any stale tokens
                    $cookieStore.remove('token');
                    return $q.reject(response);
                } else {
                    return $q.reject(response);
                }
            }
        };
    })
    .run(function($rootScope, $location, $window) {
        $rootScope.$on('$stateChangeStart', function() {});
        $rootScope.$on('$stateChangeSuccess', function() {
            $window.ga('send', 'pageview', {
                page: $location.path()
            });
        });
    });
