/** VERSION =============================================================== *
 *  jq-drt.extend.js  ^  dvdrtrgn  ^  2011-08-28 .. 2011-12-12
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
(function($){

    // begin HELPERS
    /**
     * Always wrap val in an array and try swapping in #control.val()
     * for any given potential index number in that array
     * @param me {controls}
     * @param val {mixed}
     * return {array}
     */
    function normalizeVal(me, val){
        var a, i, tmp;
        if (me.attr('type').match('select')){
            me = me.children();
        }
        if (typeof val !== 'object'){
            val = [val];
        }
        for (i = 0; i < val.length; i++){
            a = val[i];
            if (typeof a === 'number' && a < me.length) {
                tmp = me.eq(a).val();
                if (tmp) {
                    val[i] = tmp;
                }
            }
        }
        return val;
    }
    function serializeVal(me){
        // help jquery to do with checkboxes as select-multi
        return {
            val: function(){
                var arr = [], i;
                for (i = 0; i < me.length; i++){
                    arr.push( me[i].value );
                }
                return arr;
            }
        };
    }
    // end HELPERS

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
     *  Identify here if we are on a targeted browser /or/ reference platform
     */
    $.standard = function (){
        return (!this.browser.msie); // possible other tests
    };

    /**
     * Solidly attach new sheets
     */
    $.linkStyle= function (href, cb){
        var ele = this('<link rel="stylesheet" type="text/css">')
        ;
        if ( $.standard() || !document.createStyleSheet ){
            ele.appendTo($('head')) // append first! then add href
            .attr('href', href);
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
     * Generic (cross-domain/non-XHR) script loader, no XSS headache
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
     * @param val {mixed}
     * @return {mixed}
     */
    $.fn.formVal = function(val){
        var fN = '$.fn.fldVal'
        ,   me = $.findObj(this)    // get all
        ,   i
        ;
        if (!me.length || !me.attr('form')){
            throw new Error(fN + ' : no form : ' + me[0]);
        }

        if (val !== undefined){ // SET
            if (arguments.length > 1){
                val = Tools.args.arr(arguments);
            }
            if (me.attr('disabled')){
                return clog(fN, me, 'disabled');
            }
            val = normalizeVal(me, val);

            switch(me.attr('type')){
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
            switch(me.attr('type')){
                case 'submit':
                    return null;
                case 'radio':
                case 'checkbox':
                    me = me.filter(':checked');
                    if (me.length >1) {
                        me = serializeVal(me);
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

})(jQuery);
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
