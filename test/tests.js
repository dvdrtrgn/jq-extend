/*  VERSION -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- *
 *  hrs3143:test/tests.js  ^  david.turgeon @ wf  ^  2011-12-10 ..
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/*
Demo
    equal
    deepEqual
    strictEqual
 */
var vars;
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
$(function(){
    vars = {
        priv: $.fn.ext.test,
        menu: $('#Menu-1'),
        radi: $.findObj('Radio')
    }

    module("EXT");
    test('total opts', function(){
        equal(vars.menu.children().length, 8,'8 atomized options in select');
    });

    test('normalVal', function(){
        deepEqual(
            vars.priv.normalVal( vars.menu, [1,9,3] ),
            ['Aaa', 9, 'Ccc'],
            'matching and swapping probable integers in value array'
            );
    });

    test('serialVal', function(){
        deepEqual(
            vars.priv.serialVal( vars.menu ).val(),
            vars.menu.val(),
            'transform compound-input argument into static val method'
            );
        notDeepEqual(
            vars.radi.val(),
            vars.priv.serialVal( vars.radi ).val(),
            'jq NEEDS to serialize compound-inputs like it does with <select>'
            );
    });
});
