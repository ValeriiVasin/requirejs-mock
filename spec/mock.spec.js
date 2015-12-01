describe('Mock', function() {
  it('mock with a simple value', function() {
    this.injector.mock('module/a', 15);
    expect(this.injector.require('module/a')).toBe(15);
  });

  it('nested requires with simple value', function() {
    this.injector.mock('module/a', 'A');
    this.injector.mock('module/b', 'B');

    expect(this.injector.require('module/c')).toBe('AB');
  });

  it('mock different contexts at a time', function() {
    this.injector.mock('module/a', 'A');
    this.injector.mock('module/b', 'B');

    this.otherInjector.mock('module/a', 'C');
    this.otherInjector.mock('module/b', 'D');

    expect(this.injector.require('module/c')).toBe('AB');
    expect(this.otherInjector.require('module/c')).toBe('CD');
  });

  it('mock with an object', function() {
    var obj = { toString: function() { return 'O'; } };

    this.injector.mock('module/a', obj);
    expect(this.injector.require('module/a')).toBe(obj);
  });

  it('mock with a function', function() {
    function f() {}

    this.injector.mock('module/a', f);
    expect(this.injector.require('module/a')).toBe(f);
  });

  it('supports multiple mocks notations', function() {
    this.injector.mock({
      'module/a': 'hello',
      'module/b': 'world'
    });

    expect(this.injector.require('module/a')).toBe('hello');
    expect(this.injector.require('module/b')).toBe('world');
  });

  it('throws error if incorrect mock syntax is used for mock', function() {
    function createMock() {
      this.injector.mock(123);
    }

    expect(createMock.bind(this)).toThrow();
  });

  it('mock mapped (by configuration) modules', function() {
    this.injectorWithMap.mock('module/a', 123);
    expect(this.injectorWithMap.require('module/a')).toBe(123);
  });

  it('throws if mocking module that previously mocked', function() {
    function mockMocked() {
      this.injector.mock('module/a', 123);
      this.injector.mock('module/a', 456);
    }

    expect(mockMocked.bind(this)).toThrow();
  });

  it('throws error if trying to mock and map in same time', function() {
    function mapAndMock() {
      this.injector.map('module/a', 'mock/a');
      this.injector.mock('module/a', 123);
    }

    expect(mapAndMock.bind(this)).toThrow();
  });

  it('mock module cached before', function() {
    // cache module
    this.injector.require('module/a');
    this.injector.mock('module/a', 123);

    expect(this.injector.require('module/a')).toBe(123);
  });
});
