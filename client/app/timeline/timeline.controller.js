'use strict';

angular.module('sourceApp')
    .controller('TimelineCtrl', function($scope, Promises, $timeout) {
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

        function preparePromises() {
            _.forEach(Promises, function(item) {
                var splits = item.dateStr.split('/');
                item.date = new Date(2015, parseInt(splits[0]) - 1, parseInt(splits[1]));
                var dateMilis = item.date.getTime();
                item.day = (dateMilis - initDayMilis) / milisPerDay;
            });
        }

        var _state = $scope.state = {};
        var today = new Date();
        //var todayMilis = today.getTime();
        var todayStartMilis = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        var initDay = new Date(2015, 0, 10);
        var initDayMilis = initDay.getTime();
        var milisPerDay = 24 * 60 * 60 * 1000;
        preparePromises();
        $scope.days = [];
        for (var i = 0; i < 104; i++) {
            $scope.days.push({
                event: _.find(Promises, {
                    day: i
                }),
                dayPassed: isDayPassed(i),
                date: new Date(initDayMilis + milisPerDay * i)
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
        _state.selectedDay = $scope.days[i];
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
            } else {
                _state.selectedDay = null;
            }
        };
        $scope.isSlectedDay = function(day) {
            return _state.selectedDay === day;
        };
        $scope.loadSocailButtons = function  (day,e) {
        	if(!day.socialButtonsLoaded){ 
        		Socialite.load($(e.target));
        	}	
        };
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Agust', 'September', 'October', 'November', 'December'];

        $scope.getDateName = function(date) {
            var monthDate = date.getDate();
            return months[date.getMonth()] + ' ' + (monthDate > 9 && monthDate || '0' + monthDate);
        };
    });
