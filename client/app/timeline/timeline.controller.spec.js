'use strict';

describe('Controller: TimelineCtrl', function () {

  // load the controller's module
  beforeEach(module('sourceApp'));

  var TimelineCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TimelineCtrl = $controller('TimelineCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
