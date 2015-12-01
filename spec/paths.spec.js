describe('Paths', function() {
  it('supports maps', function() {
    expect(this.injectorWithPath.require('o/a')).toBe('a');
    this.injectorWithPath.map('o/a', 'm/a');
    expect(this.injectorWithPath.require('o/a')).toBe('mockA');
  });

  it('supports mocks', function() {
    expect(this.injectorWithPath.require('o/a')).toBe('a');
    this.injectorWithPath.mock('o/a', 123);
    expect(this.injectorWithPath.require('o/a')).toBe(123);
  });
});
