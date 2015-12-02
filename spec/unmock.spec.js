describe('Unmock', function() {
  beforeEach(function() {
    this.injector.mock({
        'module/a': 123,
        'module/b': 345,
        'module/c': 678
    });
  });

  it('unmock module value', function(done) {
    this.injector.unmock('module/a');

    this.requireAndCheck(this.injector, {
      'module/a': 'a'
    }).then(done);
  });

  it('unmock few modules', function(done) {
    this.injector.unmock('module/a', 'module/b');

    this.requireAndCheck(this.injector, {
      'module/a': 'a',
      'module/b': 'b',
      'module/c': 678
    }).then(done);
  });

  it('unmock all mocked modules', function(done) {
    this.injector.unmock();

    this.requireAndCheck(this.injector, {
      'module/a': 'a',
      'module/b': 'b',
      'module/c': 'ab'
    }).then(done);
  });

  it('unmock mapped module', function(done) {
    this.injectorWithMap.mock('module/a', 123);
    this.injectorWithMap.unmock('module/a');

    this.requireAndCheck(this.injectorWithMap, {
      'module/a': 'mockA'
    }).then(done);
  });
});
