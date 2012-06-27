testSupport.requireLib('template');

suite('templates', function() {

  var Template,
      subject;

  suiteSetup(function() {
    Template = Webcals.require('template');
  });

  setup(function() {
    subject = new Template('propget', { prop: 'val' });
  });

  test('initializer', function() {
    assert.equal(subject.rootTag, 'propget');
    assert.deepEqual(subject.activeNamespaces, {});
    assert.deepEqual(subject.rootAttrs, {
      prop: 'val'
    });
  });

  suite('#_registerTag', function() {
    var tag = 'foo';
    var prefix = 'dav';
    var firstOut;

    setup(function() {
      firstOut = subject._registerTag(prefix, tag);
    });

    test('same tag', function() {
      assert.deepEqual(
        subject.activeNamespaces['DAV:'],
        'N0',
        'should register namespace'
      );

      assert.equal(
        subject.rootAttrs['xmlns:N0'],
        'DAV:',
        'should add xmlns to root attrs'
      );

      assert.equal(
        firstOut,
        subject._registerTag(prefix, tag),
        'tag should render the same each time'
      );
    });

    test('second tag', function() {
      var result = subject._registerTag('ical', 'baz');

      assert.equal(
        result,
        'N1:baz'
      );
    });
  });

  suite('#tag', function() {

    test('when given a non-existant namespace', function() {
      var out = subject.tag(['foo', 'bar'], 'content');

      assert.deepEqual(
        subject.activeNamespaces['foo'],
        'N0'
      );

      assert.equal(out, '<N0:bar>content</N0:bar>');
    });

    test('self closing', function() {
      var out = subject.tag('baz', { type: 'text' });
      assert.equal(
        out,
        '<N0:baz type="text" />'
      );
    });

    test('when given a an object /w .render in content', function() {
      var obj = {
        render: function(template) {
          return template.tag('baz');
        }
      };

      var out = subject.tag('foo', obj);

      assert.equal(
        out,
        '<N0:foo><N0:baz /></N0:foo>'
      );
    });

    test('with attrs', function() {
      var out = subject.tag('bar', {
        value: 'val'
      }, 'foo');

      assert.deepEqual(
        subject.activeNamespaces['DAV:'],
        'N0'
      );

      assert.equal(
        out,
        '<N0:bar value="val">foo</N0:bar>'
      );
    });

    test('given an array', function() {
      var out = subject.tag(
        ['bar', 'baz'],
        'foo'
      );

      assert.equal(
        out,
        '<N0:baz>foo</N0:baz>'
      );
    });

    test('given a string', function() {
      var out = subject.tag('baz', 'foo');
      assert.equal(
        out,
        '<N0:baz>foo</N0:baz>'
      );
    });
  });

  test('#render', function() {
    var tag = subject.tag('href', 'value');
    var out = subject.render(tag);
    var output = '';

    output += subject.doctype;
    output += '<N0:propget prop="val" xmlns:N0="DAV:">';
    output += tag;
    output += '</N0:propget>';

    assert.equal(subject.render(tag), output);
  });

});
