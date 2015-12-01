describe('Unmock', function() {
  beforeEach(function() {
    this.injector.mock({
        'module/a': 123,
        'module/b': 345,
        'module/c': 678
    });
  });

  it('unmock module value', function() {
    this.injector.unmock('module/a');

    expect(this.injector.require('module/a')).toBe('a');
  });

  it('unmock few modules', function() {
    this.injector.unmock('module/a', 'module/b');

    expect(this.injector.require('module/a')).toBe('a');
    expect(this.injector.require('module/b')).toBe('b');
    expect(this.injector.require('module/c')).toBe(678);
  });

  it('unmock all mocked modules', function() {
    this.injector.unmock();

    expect(this.injector.require('module/a')).toBe('a');
    expect(this.injector.require('module/b')).toBe('b');
    expect(this.injector.require('module/c')).toBe('ab');
  });

  it('unmock mapped module', function() {
    this.injectorWithMap.mock('module/a', 123);
    this.injectorWithMap.unmock('module/a');

    expect(this.injectorWithMap.require('module/a')).toBe('mockA');
  });
});
