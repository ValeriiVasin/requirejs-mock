describe('Undef', function() {
  it('undef one module', function(done) {
    // module/c will be cached
    this.injector.require(['module/c'], function(c) {
      expect(c).toBe('ab');

      this.injector.map('module/a', 'mock/a');
      this.injector.map('module/b', 'mock/b');

      // from cache
      this.injector.require(['module/c'], function(c) {
        expect(c).toBe('ab');

        // remove from cache
        this.injector.undef('module/c');

        this.injector.require(['module/c'], function(c) {
          expect(c).toBe('mockAmockB');
          done();
        });
      }.bind(this));
    }.bind(this));
  });

  it('undef few modules at once', function() {
    spyOn(this.injector.context.require, 'undef').and.callThrough();

    this.injector.undef('module/a', 'module/b');

    expect(this.injector.context.require.undef).toHaveBeenCalledWith('module/a');
    expect(this.injector.context.require.undef).toHaveBeenCalledWith('module/b');
  });

  it('cleanup mocks if module has been mocked before', function() {
    this.injector.mock('module/a', 123);
    this.injector.undef('module/a');

    expect(this.injector._isMocked('module/a')).toBe(false);
  });
});
