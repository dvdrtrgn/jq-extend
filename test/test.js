/*  VERSION -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- *
 *  jq-extend/test.js  ^  dvdrtrgn ^  2011-12-10 .. 2011-12-21
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/*
Demo
    the value functions of the jq-extend ($.ext)
 */
var etc;
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
$(function(){
    etc = {
        _my_: $.fn.ext.priv,
        menu: $('#Menu-0'),
        radi: $.findObj('Radio')
    };

    module("general");

    test('total opts', function(){
        equal(etc.menu.children().length, 5,'5 sub-value options in Menu.');
    });

    //

    module("$.fn.ext privates");

    test('serialVal', function(){
        deepEqual(
            etc._my_.serialVal( etc.menu ).val(),
            etc.menu.val(),
            'Mimic transforming the compound-input argument \n\
             (in this case Menu) into value array.'
            );
        notDeepEqual(
            etc.radi.val(),
            etc._my_.serialVal( etc.radi ).val(),
            'Work with other sub-values (in this case Radio[0,1])\n\
             as jq does with "select-multiples" but FAILS otherwise.'
            );
    });

    test('normalVal', function(){
        deepEqual(
            etc._my_.normalVal( etc.menu, [-9,0,2,9] ),
            [-9,'blank','opt_v2', 9],
            'Match and swap the (possible) value indexes in array\n\
             [-9,0,2,9] from Menu.'
            );
    });
});
