describe('Context', function() {
  it('should allow different contexts', function(done) {
    Promise.all([
      this.requireAndCheck(this.injector, { 'module/a': 'a' }),
      this.requireAndCheck(this.injectorWithMap, { 'module/a': 'mockA' })
    ]).then(done);
  });
});
