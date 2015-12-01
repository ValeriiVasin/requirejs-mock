describe('Map', function() {
  it('single module mapping', function() {
    this.injector.map('module/a', 'mock/a');
    expect(this.injector.require('module/a')).toBe('mockA');
  });

  it('multiple modules mapping', function() {
    this.injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    expect(this.injector.require('module/a')).toBe('mockA');
    expect(this.injector.require('module/b')).toBe('mockB');
  });

  it('not overrides existed mapping', function() {
    this.injectorWithMap.map('module/b', 'mock/b');

    expect(this.injectorWithMap.require('module/a')).toBe('mockA');
    expect(this.injectorWithMap.require('module/b')).toBe('mockB');
  });

  it('allows remap during the execution', function() {
    this.injector.map('module/a', 'mock/a');
    expect(this.injector.require('module/a')).toBe('mockA');

    this.injector.map('module/a', 'mock/b');
    expect(this.injector.require('module/a')).toBe('mockB');
  });

  it('works on nested require calls', function() {
    this.injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    expect(this.injector.require('module/c')).toBe('mockAmockB');
  });

  it('works on nested require calls with relative path', function() {
    this.injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    expect(this.injector.require('module/c_local')).toBe('mockAmockB');
  });

  it('throws if trying to map mocked before module', function() {
    function mockAndMap() {
      this.injector.mock('module/a', 123);
      this.injector.map('module/a', 'mock/a');
    }

    expect(mockAndMap.bind(this)).toThrow();
  });
});
