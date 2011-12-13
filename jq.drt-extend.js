/** VERSION =============================================================== *
 *  jq-drt.extend.js  ^  dvdrtrgn  ^  2011-08-28 .. 2011-12-12
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
(function($){

    // PRIVATE scope
    /**
     * A normalized value is an array of values
     * that swaps index numbers with values at list[index]
     *
     * @param list {nodelist}
     * @param vals {array}
     * @return {array}
     */
    function normalVal(list, vals){
        var a, i, tmp;
        // deal at the atomic level (option elements)
        if (list.prop('type').match('select')){
            list = list.children();
        }
        if (typeof vals !== 'object'){
            vals = [vals];
        }
        for (i = 0; i < vals.length; i++){
            // for each number in array that is smaller than list length
            a = vals[i];
            if (typeof a === 'number' && a < list.length) {
                tmp = list.eq(a).val();
                if (tmp) vals[i] = tmp;
            // if we get a value at that index replace it with an actual value
            }
        }
        return vals;
    }
    /**
     *  Force jquery handle radios/checkboxes as $(select-multi).val()
     *      given a collection in argument
     *      make pseudo-jq object with val method that
     *      extracts to an array the value props in collection
     *  @param list {nodelist} live collection
     *  @return {pseudo.jq} a highly specific pseudo-jq
     */
    function serialVal(list){
        // deal at the atomic level (option elements)
        if (list.prop('type').match('select')){
            return list;
        }
        return {
            val: function(){
                var arr = [], i;
                for (i = 0; i < list.length; i++){
                    arr.push( list[i].value );
                }
                return arr; // return all values in collection
            }
        };
    }
    // end PRIVATE
    /**
     *  Seek and load module css
     *
     *  @param nom {string} name of mod
     *  @param cb {function} callback when loaded
     *  @return {element} the link to style
     */
    $.loadCssFor = function (nom, cb){
        var href = $.jsPath(nom)
        ,   ele
        ;
        href += '/' + nom + '.css';
        ele = $.linkStyle(href);

        $(cb); // callback
        return ele;
    };

    /**
     *  Identify here if we are on a compliant browser
     *
     *  @return {bool}
     */
    $.standard = function (){
        // possible other tests
        return (!this.browser.msie);
    };

    /**
     * Solidly attach new sheets
     */
    $.linkStyle= function (href, cb){
        var ele = this('<link rel="stylesheet" type="text/css">')
        ;
        if ( $.standard() || !document.createStyleSheet ){
            ele.appendTo($('head'))
            .attr('href', href);    // append first! then add href
        } else {
            ele = (function (path){
                return document.createStyleSheet(path);
            })(href);
        }
        console.log('jQuery.linkStyle', href, $.standard() || 'IE style');

        $(cb); // callback
        return $(ele);
    };

    /**
     * Get path to script by name
     *
     * @param nom {string} to search for
     */
    $.jsPath = function (nom){
        return (function(nom){
            var ele = $('script[src*="'+nom+'."]')
            ;
            if (!ele.length) {
                throw new Error('No script with path fragment: '+ nom);
            }
            if (ele.length > 1){
                console.warn('Multiple scripts with that path fragment');
            }
            return ele.eq(0).attr('src').split('/').slice(0,-1).join('/');
        })(nom);
    };

    /**
     * Generic (cross-domain/non-XHR) script loader
     * no XSS headache
     *
     * @param url {string} path to script
     * @param id {string} optional element id
     */
    $.loadJs = function (url, id) {
        var scr = document.createElement('script')
        ;
        scr.setAttribute('type', 'text/javascript');
        scr.setAttribute('charset', 'utf-8');
        if (id) {
            scr.setAttribute('id', id);
        }
        scr.setAttribute('src', url);
        document.getElementsByTagName('head')[0].appendChild(scr);
    };

    /**
     * Keep these fields in sync with one another
     *
     * @param fld1 {element}
     * @param fld2 {element}
     */
    $.syncPair = function (fld1, fld2) { // replicate another field
        fld1 = $.findObj(fld1);
        fld2 = $.findObj(fld2);
        fld1.data('sync',fld2);
        fld2.data('sync',fld1);

        var take = function(){
            var me = $(this)
            ,   yo = me.data('sync');
            me.formVal(yo.formVal());
        };
        var tell = function(){
            var me = $(this)
            ,   yo = me.data('sync');
            yo.trigger('take');
        };
        fld1.add(fld2).bind('take', take).bind('change', tell);
    // $.syncPair('_type_INFO_Home_City', '_type_INFO_NewWork_PosNum');
    };

    /**
     * Extend jquery to simulate mm findObj
     *
     * @param str {string/element} name
     * @return {jq}
     */
    $.findObj = function(str){
        var all = [];
        if (typeof str !== 'string'){
            str = (str.name || (str[0] && str[0].name) || 'null');
        }
        if (str){
            all = $('[name="'+ str +'"]');  // name
        }
        if (all.length) {
            return all;
        }
        all = $('#'+str);   // id
        if (all.length) {
            return all;
        }
        all = $('.'+ str);  // class
        if (all.length) {
            return all;
        }
        all = $(str);       // tag
        if (all.length) {
            return all;
        }
        return false;
    };

    /* - - - - - - - */
    // fn extensions
    /* - - - - - - - */

    /**
     * JQ mod to deliver field values
     *
     * @param val {mixed}
     * @return {mixed}
     */
    $.fn.formVal = function(val){
        var fN = '$.fn.fldVal'
        ,   me = $.findObj(this)    // get all
        ,   i
        ;
        if (!me.length || !me.prop('form')){
            throw new Error(fN + ' : no form : ' + me[0]);
        }

        if (val !== undefined){ // SET
            if (arguments.length > 1){
                val = Tools.args.arr(arguments);
            }
            if (me.attr('disabled')){
                return clog(fN, me, 'disabled');
            }
            val = normalVal(me, val);

            switch(me.prop('type')){
                case 'submit':
                    return me;
                case 'radio': case 'checkbox':
                    me.val(val);
                    for (i = 0; i < val.length; i++) { // ghostClick
                        me.filter("[value='"+val[i]+"']").click();
                    }
                    return me.val(val); /// set after click to prevent unclick
                case 'select-multiple': // multi
                    return me.focus().val(val);
                // case 'select-one':
                // case 'text':
                // case 'textarea':
                default:
                    return me.val(val[0]);
            }
        } else { // GET
            switch(me.prop('type')){
                case 'submit':
                    return null;
                case 'radio':
                case 'checkbox':
                    me = me.filter(':checked');
                    if (me.length >1) {
                        me = serialVal(me);
                    }
                    return me.val();
                // case 'select-one':
                // case 'select-multiple':
                // case 'text':
                // case 'textarea':
                default:
                    return me.val();
            }
        }
    };

    /**
     * JQ mod to deliver the drtField object
     * this only works from an instance of $
     *
     * @param idx {string number element}
     * @return {drtField}
     */
    $.fn.drt = function(idx){
        if (typeOf(idx) === 'string') {
            idx = {
                id: idx
            };
        } else {
            idx = this[(idx||0) % this.length];
        }
        return theForm[idx.id || idx.name];
    };
    $.fn.ext = {
        test : {
            normalVal: normalVal,
            serialVal: serialVal
        }
    };
    // regress for <jq 1.6
    $.fn.prop = $.fn.prop ? $.fn.prop : $.fn.attr;

})(jQuery);
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
