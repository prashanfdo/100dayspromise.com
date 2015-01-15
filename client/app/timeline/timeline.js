'use strict';

angular.module('sourceApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('timeline', {
                url: '/',
                templateUrl: 'app/timeline/timeline.html',
                controller: 'TimelineCtrl'
            });
    })
    .directive('vaTooltip', ['$http', '$templateCache', '$compile', '$parse', '$timeout', function($http, $templateCache, $compile, $parse, $timeout) {
        return {
            restrict: 'A',
            scope: true,
            compile: function(tElem) { 
                if (!tElem.attr('tooltip-html-unsafe')) {
                    tElem.attr('tooltip-html-unsafe', '{{tooltip}}');
                }
                return function(scope, element, attrs) {
                    scope.tooltip = attrs.vaTooltip;
                    var tplUrl = $parse(scope.tooltip)(scope);

                    function loadTemplate() {
                            $http.get(tplUrl, {
                                cache: $templateCache
                            }).success(function(tplContent) {
                                var container = $('<div/>');
                                container.html($compile(tplContent.trim())(scope));
                                $timeout(function() {
                                    scope.tooltip = container.html();
                                });
                            });
                        } 
                    element.removeAttr('va-tooltip'); 
                    $compile(element)(scope); 
                    if (angular.isDefined(attrs.tooltipUpdater)) {
                        scope.$watch(attrs.tooltipUpdater, function() {
                            loadTemplate();
                        });
                    } else {
                        loadTemplate();
                    }
                };
            }
        };
    }]);
