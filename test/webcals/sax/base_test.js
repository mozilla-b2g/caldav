testSupport.lib('responder');
testSupport.lib('sax');
testSupport.lib('sax/base');

suite('webcals/sax/base', function() {

  var data,
      subject,
      parser,
      Parse,
      Base,
      handler;


  suiteSetup(function() {
    Parse = Webcals.require('sax');
    Base = Webcals.require('sax/base');
  });

  setup(function() {
    //we omit the option to pass base parser
    //because we are the base parser
    subject = new Parse();
  });

  test('#create', function() {
    function childText() {}

    var Child = Base.create({
      ontext: childText
    });

    assert.equal(Child.ontext, childText);
    assert.equal(Child.tagField, Base.tagField);

    assert.isTrue(
      Base.isPrototypeOf(Child),
      'should have base in proto chain'
    );

    assert.equal(Child._super, Base);

    var ChildChild = Child.create();

    assert.isTrue(
      Child.isPrototypeOf(ChildChild),
      'should have child in childchild protochain'
    );

    assert.isTrue(
      Base.isPrototypeOf(ChildChild),
      'should have base in childchild protochain'
    );

    assert.equal(ChildChild._super, Child);

  });

  suite('base parser', function() {
    var xml, data;

    testSupport.defineSample('xml/simple.xml', function(data) {
      xml = data;
    });

    //base baser does not
    //care about attrs at this point
    var expected = {
      simple: {
        a: [
          { value: 'Foo' },
          { value: 'Foo\n    bar' }
        ],
        div: {
          span: {
            value: 'span'
          }
        }
      }
    };

    test('simple tree', function(done) {
      subject.once('complete', function(data) {
        assert.deepEqual(
          data, expected,
          "expected \n '" + JSON.stringify(data) + "'\n to equal \n '" +
          JSON.stringify(expected) + '\n"'
        );
        done();
      });
      subject.write(xml).close();
    });
  });

});
