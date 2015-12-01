describe('Mocks', function() {
    beforeEach(function() {
      // create `other` context
      this.otherInjector = Injector.create();
    });

    afterEach(function() {
      this.otherInjector.destroy();
    });

    it('get unmocked values', function(done) {
      this.injector.require(['module/a', 'module/b'], function(a, b) {
        expect(a).toBe('a');
        expect(b).toBe('b');
        done();
      });
    });

    it('mock with a simple value', function(done) {
      this.injector.mock('module/a', 15);

      this.injector.require(['module/a'], function(value) {
        expect(value).toBe(15);
        done();
      });
    });

    it('nested requires with simple value', function() {
      this.injector.mock('module/a', 'A');
      this.injector.mock('module/b', 'B');

      this.injector.require(['module/c'], function(c) {
        expect(c).toBe('AB');
      });
    });

    it('mock different contexts at a time', function(done) {
      this.injector.mock('module/a', 'A');
      this.injector.mock('module/b', 'B');

      this.otherInjector.mock('module/a', 'C');
      this.otherInjector.mock('module/b', 'D');

      this.injector.require(['module/c'], function(c) {
        expect(c).toBe('AB');

        this.otherInjector.require(['module/c'], function(c) {
          expect(c).toBe('CD');
          done();
        });
      }.bind(this));
    });

    it('mock with an object', function(done) {
      var obj = { toString: function() { return 'O'; } };

      this.injector.mock('module/a', obj);

      this.injector.require(['module/a'], function(a) {
        expect(a).toBe(obj);
        done();
      });
    });

    it('mock with a function', function(done) {
      function f() {}

      this.injector.mock('module/a', f);

      this.injector.require(['module/a'], function(a) {
        expect(a).toBe(f);
        done();
      });
    });

    it('supports multiple mocks notations', function(done) {
      this.injector.mock({
        'module/a': 'hello',
        'module/b': 'world'
      });

      this.injector.require(['module/a', 'module/b'], function(a, b) {
        expect(a).toBe('hello');
        expect(b).toBe('world');
        done();
      });
    });

    it('throws error if incorrect mock syntax is used for mock', function() {
      function createMock() {
        this.injector.mock(123);
      }

      expect(createMock.bind(this)).toThrow();
    });

    it('mock mapped (by configuration) modules', function(done) {
      this.injectorWithMap.mock('module/a', 123);

      this.injectorWithMap.require(['module/a'], function(a) {
        expect(a).toBe(123);
        done();
      });
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

    it('mock module required before', function(done) {
      // cache module
      this.injector.require(['module/a'], function() {
        this.injector.mock('module/a', 123);

        this.injector.require(['module/a'], function(a) {
          expect(a).toBe(123);
          done();
        });
      }.bind(this));
    });
  });
