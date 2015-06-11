// Set caret position easily in jQuery
// Written by and Copyright of Luke Morton, 2011
// Licensed under MIT
//
// Examples:
//
// Move to position 10
// $('input').caretTo(10);
//
// Move to position just before word
// $('input').caretTo('hello');
//
// Move to position just after word
// $('input').caretTo('hello', true);
//
// Move to offset from word's beginning
// $('input').caretTo('hello', 6);
//
(function ($) {
    // Behind the scenes method deals with browser
    // idiosyncrasies and such
    $.caretTo = function (el, index) {
        if (el.createTextRange) { 
            var range = el.createTextRange(); 
            range.move("character", index); 
            range.select(); 
        } else if (el.selectionStart != null) { 
            el.focus(); 
            el.setSelectionRange(index, index); 
        }
    };
 
    // The following methods are queued under fx for more
    // flexibility when combining with $.fn.delay() and
    // jQuery effects.
 
    // Set caret to a particular index
    $.fn.caretTo = function (index, offset) {
        return this.queue(function (next) {
            if (isNaN(index)) {
                var i = $(this).val().indexOf(index);
                
                if (offset === true) {
                    i += index.length;
                } else if (offset) {
                    i += offset;
                }
                
                $.caretTo(this, i);
            } else {
                $.caretTo(this, index);
            }
            
            next();
        });
    };
 
    // Set caret to beginning of an element
    $.fn.caretToStart = function () {
        return this.caretTo(0);
    };
 
    // Set caret to the end of an element
    $.fn.caretToEnd = function () {
        return this.queue(function (next) {
            $.caretTo(this, $(this).val().length);
            next();
        });
    };
})(jQuery);
