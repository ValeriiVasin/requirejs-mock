describe('Paths', function() {
  it('supports maps', function(done) {
    // expect(this.injectorWithPath.require('o/a')).toBe('a');
    this.requireAndCheck(this.injectorWithPath, { 'o/a': 'a' }).then(function() {
      this.injectorWithPath.map('o/a', 'm/a');
      this.requireAndCheck(this.injectorWithPath, { 'o/a': 'mockA'}).then(done);
    }.bind(this));
  });

  it('supports mocks', function() {
    this.requireAndCheck(this.injectorWithPath, { 'o/a': 'a' }).then(function() {
      this.injectorWithPath.mock('o/a', 123);
      this.requireAndCheck(this.injectorWithPath, { 'o/a': 123 }).then(done);
    }.bind(this));
  });
});
