describe('Unmap', function() {
  it('unmap', function() {
    this.injector.map('module/b', 'mock/b');
    expect(this.injector.require('module/b')).toBe('mockB');
    this.injector.unmap('module/b');
    expect(this.injector.require('module/b')).toBe('b');
  });

  it('unmap to original mapping', function() {
    this.injectorWithMap.map('module/a', 'mock/b');
    expect(this.injectorWithMap.require('module/a')).toBe('mockB');
    this.injectorWithMap.unmap('module/a');
    expect(this.injectorWithMap.require('module/a')).toBe('mockA');
  });

  it('unmap few modules at once', function() {
    this.injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    this.injector.unmap('module/a', 'module/b');

    expect(this.injector.require('module/a')).toBe('a');
    expect(this.injector.require('module/b')).toBe('b');
  });

  it('unmap all previously mapped modules', function() {
    this.injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    this.injector.unmap();

    expect(this.injector.require('module/a')).toBe('a');
    expect(this.injector.require('module/b')).toBe('b');
  });
});
