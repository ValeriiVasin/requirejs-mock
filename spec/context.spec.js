describe('Context', function() {
  it('should allow different contexts', function() {
    expect(this.injector.require('module/a')).toBe('a');
    expect(this.injectorWithMap.require('module/a')).toBe('mockA');
  });
});
