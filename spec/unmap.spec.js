'use strict';

describe('Unmap', function() {
  it('unmap', function(done) {
    this.injector.map('module/b', 'mock/b');
    this.requireAndCheck(this.injector, {
      'module/b': 'mockB'
    }).then(function() {
      this.injector.unmap('module/b');

      return this.requireAndCheck(this.injector, {
        'module/b': 'b'
      });
    }.bind(this)).then(done);
  });

  it('unmap to original mapping', function(done) {
    this.injectorWithMap.map('module/a', 'mock/b');
    this.requireAndCheck(this.injectorWithMap, {
      'module/a': 'mockB'
    }).then(function() {
      this.injectorWithMap.unmap('module/a');

      return this.requireAndCheck(this.injectorWithMap, {
        'module/a': 'mockA'
      });
    }.bind(this)).then(done);
  });

  it('unmap few modules at once', function(done) {
    this.injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    this.injector.unmap('module/a', 'module/b');

    this.requireAndCheck(this.injector, {
      'module/a': 'a',
      'module/b': 'b'
    }).then(done);
  });

  it('unmap all previously mapped modules', function(done) {
    this.injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    this.injector.unmap();

    this.requireAndCheck(this.injector, {
      'module/a': 'a',
      'module/b': 'b'
    }).then(done);
  });
});
