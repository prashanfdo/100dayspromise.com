'use strict';

angular.module('sourceApp')
    .controller('TimelineCtrl', function($scope, Promises, $timeout, $stateParams, $state, $window) {
        function calcRemaining() {
            setTimeout(function() {
                var milis = initDayMilis + (milisPerDay * 104) - new Date().getTime();
                var seconds = Math.floor(milis / 1000);
                milis = milis % 1000;
                var minutes = Math.floor(seconds / 60);
                seconds = seconds % 60;
                var hours = Math.floor(minutes / 60);
                minutes = minutes % 60;
                var days = Math.floor(hours / 24);
                hours = hours % 24;
                $scope.$apply(function() {
                    $scope.stats.remainingTime = days + ' d ' + hours + ' h ' + minutes + ' m ' + seconds + ' s';
                });
                calcRemaining();
            }, 1000);
        }

        function isDayPassed(i) {
            return initDayMilis + (i * milisPerDay) < todayStartMilis;
        }

        function daysPassedCount(dayMilis,i) {
            return Math.floor((todayStartMilis - dayMilis) / milisPerDay);
        }

        function preparePromises() {
            _.forEach(Promises, function(item) {
                var splits = item.dateStr.split('/');
                item.date = new Date(2015, parseInt(splits[0]) - 1, parseInt(splits[1]));
                var dateMilis = item.date.getTime();
                item.day = (dateMilis - initDayMilis) / milisPerDay;
            });
        }

        function loadSocialButtons(day, element) {
            if (day.event && !day.socialButtonsLoaded) {
                $window.twttr.widgets.load(element);
                $window.FB.XFBML.parse(element);
                //$window.gapi.plusone.go(element);
                day.socialButtonsLoaded = true;
            }
        }

        var _state = $scope.state = {};
        var today = new Date();//2015, 0, 12);
        //var todayMilis = today.getTime();
        var todayStartMilis = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        var initDay = new Date(2015, 0, 10);
        var initDayMilis = initDay.getTime();
        var milisPerDay = 24 * 60 * 60 * 1000;
        preparePromises();
        $scope.days = [];
        for (var i = 0; i < 104; i++) {
            var date = new Date(initDayMilis + milisPerDay * i);
            var dayPassed = isDayPassed(i);
            var daysPassedCountVal = isDayPassed && daysPassedCount(date.getTime(),i) || 0;
            var isToday = date.getTime() === todayStartMilis; 
            $scope.days.push({
                event: _.find(Promises, {
                    day: i
                }),
                dayNo: i + 1,
                dayPassed: dayPassed,
                daysPassedCount: daysPassedCountVal,
                isToday:isToday,
                date: date
            });
        }
        $scope.stats = {
            total: Promises.length,
            completed: _.countBy(Promises, function(item) {
                return item.done;
            }).true,
            late: _.countBy($scope.days, function(item) {
                return item.dayPassed && item.event && !item.event.done;
            }).true || 0,
        };
        calcRemaining();
        var urlDay = $stateParams.day.match(/[0-9]{1,3}/);
        if (urlDay) {
            urlDay = parseInt(urlDay[0]);
            _state.selectedDay = $scope.days[urlDay - 1];
            $timeout(function() {
                loadSocialButtons(_state.selectedDay, $('.day[data-day-no="' + _state.selectedDay.dayNo + '"]')[0]);
            }, 400);
        }
        $timeout(function() {
            var el = $('.site-share-buttons')[0];
            $window.twttr.widgets.load(el);
            //$window.gapi.plusone.go(el);
        }, 1500);
        $timeout(function() {
            _.forEach($('.day.late'), function(ele) {
                var dayNo = parseInt($(ele).attr('data-day-no'));
                var day = $scope.days[dayNo - 1];
                loadSocialButtons(day, ele);
            });
        }, 3200);
        $timeout(function() {
            _.forEach($('.day.done'), function(ele) {
                var dayNo = parseInt($(ele).attr('data-day-no'));
                var day = $scope.days[dayNo - 1];
                loadSocialButtons(day, ele);
            });
        }, 5000);
        $scope.setSelectedDay = function(day) {
            if (!_state.selectedDay || _state.selectedDay !== day) {
                var selectedDay = _state.selectedDay;
                if (selectedDay) {
                    selectedDay.quickHide = true;
                    $timeout(function() {
                        selectedDay.quickHide = false;
                    }, 1000);
                }
                _state.selectedDay = day;
                loadSocialButtons(_state.selectedDay, $('.day[data-day-no="' + _state.selectedDay.dayNo + '"]')[0]);
            } else {
                _state.selectedDay = null;
            }
            $state.transitionTo('timeline', {
                day:_state.selectedDay ? 'day-' + (day.dayNo + 1) : ''
            }, {
                location: true,
                inherit: true,
                relative: $state.$current,
                notify: false
            });
        };
        $scope.isSlectedDay = function(day) {
            return _state.selectedDay === day;
        };
        $scope.loadSocialButtons = function(day, e) {
            if (day.event && !day.socialButtonsLoaded && !day.socialButtonsTO) {
            	day.socialButtonsTO = $timeout(function  () {
            		loadSocialButtons(day, e.delegateTarget);
            	},350); 
            }
        };
        $scope.stopLoadSocialButtons = function(day) {
            $timeout.cancel(day.socialButtonsTO);
            day.socialButtonsTO = undefined;
        };
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Agust', 'September', 'October', 'November', 'December','Jan', 'Feb', 'Mar', 'Apr',];

        $scope.getDateName = function(date) {
            var monthDate = date.getDate();
            return months[date.getMonth()] + ' ' + (monthDate > 9 && monthDate || '0' + monthDate);
        };
        $scope.getShortDateName = function(date) {
            var monthDate = date.getDate();
            return months[date.getMonth()+12] + ' ' + (monthDate > 9 && monthDate || '0' + monthDate);
        };
        $scope.getActionTextOfDay = function(day) {
            if (day.event) {
                if (day.dayPassed) {
                    return !!day.event.done ? 'Show your gratitude. Congratulate the President.' : 'Raise your voice. Remind the President.';
                } else {
                    return 'Show your anticipation for the change.';
                }
            }
            return '';
        };
        $scope.getTweetTextOfDay = function(day) {
            if (day.event) {
                if (day.dayPassed) {
                    return !!day.event.done ? '@SLPresMaithri Thank you for fulfilling the Promise' : '@SLPresMaithri the Promise you made late ' + day.daysPassedCount + 'day' + (day.daysPassedCount > 1 ? 's':'');
                } else {
                    return '@SLPresMaithri I hope this promise will be fulfilled soon.';
                }
            }
            return '';
        };
    });
