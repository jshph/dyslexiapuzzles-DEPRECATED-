var g_cursor_pos = 0;
var g_last_div_pos_in_pixel = 0;
var g_input_text = '';
var g_q_elem;
var g_timeout;
var g_is_first_click = true;
var g_is_first_keypress = true;
var g_button_trigger_event = g_mobile_or_tablet ? 'touchstart' : 'click';
var g_half_char_div_width = 5.0;
var g_check_answer_on = false;
var g_debounce_limit_in_ms = 500;
var g_autocomplete_max_num_items_desktop = 5;
var g_autocomplete_max_num_items_mobile = 3;
var g_upper = false;

if (typeof String.prototype.trim !== 'function'){
    String.prototype.trim = function(){
        return this.replace(/^\s+|\s+$/g, ''); 
    }
}

if (typeof AndroidInterface !== "undefined"){
	$("#ads").hide();
}

if (is_homepage()){
	if (typeof AndroidInterface !== "undefined"){
		AndroidInterface.enterInputMode();
	}
}

if (is_answer_page()){
	if (typeof AndroidInterface !== "undefined"){
		AndroidInterface.exitInputMode();
	}

	$("#term_preview_div").css("visibility", "hidden");
	$("#term_preview_div").height('80px');		

	var q = encodeURIComponent($("#term_input").text());
	get_steps(q);
}

MathJax.Hub.Register.StartupHook("End",function(){
	if (is_answer_page()){
		if (g_mobile_or_tablet){
			g_input_text = $("#q_input").text();
			g_cursor_pos = g_input_text.length; 
			update_input_div_for_mobile();
		}
	}
	if ($('#term_preview').length){
		$('#term_preview').css({'visibility': 'visible'});
	}	
});

MathJax.Hub.Config({    
	displayAlign: "left",
	showProcessingMessages: false,
	messageStyle: "none",
	"HTML-CSS": { scale: 100, linebreaks: { automatic: true, width: "container"} }
});

$("#q").on("click", function(e){
	if (!g_mobile_or_tablet)
		return;
	
	if (!g_is_first_click || is_answer_page()){
		if (e.pageX > g_last_div_pos_in_pixel + g_half_char_div_width){
			g_cursor_pos = g_input_text.length;
			update_input_div_for_mobile();
		}
	}
	
	if (g_is_first_click && is_homepage()){
		$("#q").prepend("<span id='typed-cursor' class='blinking'>|</span>");
		$("#main_logo").hide();
		$("#social_links").hide();
		$("#app_download_links").hide();
		$("#homepage_content").hide();
		$("#examples_section").hide();
		$("#term_preview_div").height('80px');
		keyboard_on();
		g_is_first_click = false;
	}
});

function switch_homepage_to_answer_mode_on_first_input(){
	if (g_is_first_keypress && is_homepage()){
		$("#main_logo").hide();
		$("#social_links").hide();
		$("#app_download_links").hide();
		$("#homepage_content").hide();
		$("#examples_section").hide();
		$("#ads").show();		
		$(".term_input_td").attr('align', 'left');
		$("#term_preview_div").height('80px');		
		$('body').css('overflowY', 'scroll');		
		g_is_first_keypress = false;
	}
}

$("#q").on("propertychange input keyup paste", function(e){
	if (g_mobile_or_tablet)
		return;
		
	switch_homepage_to_answer_mode_on_first_input();
});

$("#q").on(g_button_trigger_event, "span", function(e){
	if (!g_mobile_or_tablet)
		return;

	var span_id = $(this).attr("id");
	var span_num = span_id.substr(2);
	var pos = parseInt(span_num, 10);

	var offset = $(this).offset();
	if (e.pageX - offset.left < g_half_char_div_width){
		pos--;
	}

	if (pos > g_cursor_pos){
		g_cursor_pos = pos;
	}
	else{
		g_cursor_pos = parseInt(pos) + 1;
	}

	if (g_input_text[g_cursor_pos] == '?'){
		g_cursor_pos++;
	}

	update_input_div_for_mobile();
});

$("#steps").on("click", "#check_answer_button", function(e){
	check_answer_toggle();
});

$("#control_link").on("click", function(e){
	$('body').css('overflowY', 'auto'); 
	show_control(true);
	$("#ads").hide();
	$("#steps").hide();
	$("#div_below_steps").hide();
	if (typeof AndroidInterface !== "undefined"){
		AndroidInterface.enterInputMode();
	}
});

$('#submit_solve').on("click", function(e){
	var text;
	if (g_mobile_or_tablet){
		text = g_input_text;
	}
	else{
		text = $('#q').val();
	}
	text = prepare_q_for_url(text);
	window.location.href = "/answer.php?q=" + encodeURIComponent(text);
});

function prepare_q_for_url(q){
	q = replace_all('\u00F7', '#', q);
	return q;
}

$('body').on('keypress', '#q', function(args){
	if (args.keyCode == 13){
		$('#submit_solve').click();
		return false;
	}
});

$(document).ready(function(){
	// Homepage has no feedback
	if (!is_homepage()){
		load_feedback_js();
	}

	// Focus on homepage
	if (!g_mobile_or_tablet){
		if (is_homepage() || is_answer_page()){
			$("#q").focus();
			$("#q").caretToEnd();
		}
	}

	// Mobile/tablet specific
	if (g_mobile_or_tablet)
	{
		$('#keyboard_nav').show();
	}
});

function is_answer_page(){
	return $("#answer_page").length > 0;
}

function is_homepage(){
	return $("#homepage").length > 0;
}

function load_feedback_js(){
	$('#feedback_submit').click(function(){
		$.post("/ajax/send_feedback.php", $("#feedback_form").serialize(), function(response){
			$('#feedback_success').html(response);
		});
		$("#feedback_message").val('');
			return false;
	});

	$('#feedback_message').keypress(function(event){
		if (event.keyCode == '13'){
			event.preventDefault();
			$('#feedback_submit').trigger('click');
		}
	});
}

function load_social_js(){
	// exit on no social buttons
	var social_buttons_div = document.getElementById('social_buttons');
	if (social_buttons_div == null)
		return;

	// google plus
	(function(){
        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/platform.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();

	// twitter
	!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.asybc=true;js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

	// facebook
	document.getElementById('facebook_share').onclick = function(){
		var url = 'https://www.facebook.com/sharer/sharer.php?u=';
		url += encodeURIComponent(location.href);
		window.open(url, 'fbshare', 'width=640,height=320');
	};
}

function show_hide_steps(shID){
	var elem = document.getElementById(shID);
	var button = document.getElementById('button-'+shID);
	if (elem){
		if (elem.style.display != 'none'){
			elem.style.display = 'none';
			button.innerHTML = '<div id=\'button-$workspace_id\' style=\'display:inline;\'>More Steps &#x25BC;</div>';
		}
		else {
			elem.style.display = 'block';
			button.innerHTML = '<div id=\'button-$workspace_id\' style=\'display:inline;\'>Less Steps &#x25B2;</div>';
		}
	}
	var elem = document.getElementById(shID+'-button');
	if (elem){
		if (elem.style.display != 'none'){
			elem.style.display = 'none';
		}
		else {
			elem.style.display = 'block';
		}
	}
}

(function($){
	$.fn.getCursorPosition = function(){
		var input = this.get(0);
		if (!input) return;
		if ('selectionStart' in input){
			return input.selectionStart;
		} 
		else if (document.selection){
			input.focus();
			var sel = document.selection.createRange();
			var selLen = document.selection.createRange().text.length;
			sel.moveStart('character', -input.value.length);
			return sel.text.length - selLen;
		}
	};

	$.fn.selectRange = function(start, end){
		var e = document.getElementById($(this).attr('id')); 
		if (!e){
			return;
		}
		else if (e.setSelectionRange){ 
			e.focus(); e.setSelectionRange(start, end); 
		}
		else if (e.createTextRange){ 
			var range = e.createTextRange(); range.collapse(true); 
			range.moveEnd('character', end); range.moveStart('character', start); 
			range.select(); 
		}
		else if (e.selectionStart){ 
			e.selectionStart = start; 
			e.selectionEnd = end; 
		}
	};
})(jQuery);

(function(){
	var QUEUE = MathJax.Hub.queue;  // shorthand for the queue
	var math = null;                // the element jax for the math output.

	//
	//  Get the element jax when MathJax has produced it.
	//
	QUEUE.Push(function(){
		math = MathJax.Hub.getAllJax("term_preview")[0];
	});

	//
	//  The onchange event handler that typesets the
	//  math entered by the user
	//
	window.updateMath = function (t){
		if (t == "invalid")
			return;

		t = t.replace(/\&lt\;/g, '<');		
		t = t.replace(/\&gt\;/g, '>');

		var steps = document.getElementById("steps");
		if (steps != null){
			$("#steps").hide();
			$("#div_below_steps").hide();
		}

		QUEUE.Push(["Text", math, "\\displaystyle{"+t+"}"]);
	}
})();

function get_now(){
	var num_ms_since_epoch = (new Date()).getTime();
	return num_ms_since_epoch;
}

function debounce(threshold, execAsap, func, arg){
	function delayed(){
		if (!execAsap){
			func(arg);
		}
		g_timeout = null; 
	};

	if (g_timeout)
		clearTimeout(g_timeout);
	else if (execAsap){
		func(arg);	
	}
	g_timeout = setTimeout(delayed, threshold || 100); 
}

function get_latex(str){
	if (window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}
	else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
			updateMath(xmlhttp.responseText.trim());
		}
	}

	str = encodeURIComponent(str);
	xmlhttp.open("GET", "ajax/get_latex.php?q="+str, true);
	xmlhttp.send();
}

function get_steps(q){
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	}
	else{  
		// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
			var steps = document.getElementById("steps");
			if (steps != null){
				steps.innerHTML = xmlhttp.responseText;
				MathJax.Hub.Queue(
					["Typeset", MathJax.Hub, "steps"],
					function(){
						$("#loading_dialog").css("display", "none");
						$("#steps").html("<div class='solution_heading'>Solution</div>" + $("#steps").html());
						$("#steps").css("visibility", "visible");
						$("#div_below_steps").show();
						load_social_js();
						load_feedback_js();
					}
				);
			}
		}
	}

	xmlhttp.open("GET", "ajax/get_steps.php?q="+q, true);
	xmlhttp.send();
}

function get_check_answer(q, a){
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	}
	else{  
		// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
			$('#check_answer_div').html(xmlhttp.responseText);
			MathJax.Hub.Queue(
				["Typeset", MathJax.Hub],
				function(){
					$("#check_answer_div").show();
				}
			);
		}
	}
	var encoded_q = encodeURIComponent(q);
	var encoded_a = encodeURIComponent(a);
	xmlhttp.open("GET", "ajax/get_steps.php?q="+encoded_q+"&a="+encoded_a, true);
	xmlhttp.send();
}

$("#q").each(function(){
	var elem = $(this);

	// Save current value of element
	elem.data('oldVal', elem.val());

	// Look for changes in the value
	elem.bind("propertychange input paste", function(event){
		var newVal = elem.val();
		if (elem.data('oldVal') != newVal){
			debounce(g_debounce_limit_in_ms, false, get_latex, get_q_value());
			elem.data('oldVal', newVal);
		}
	});

	elem.bind("click", function(){
		snap_to_question_mark(elem);
	});
});

$('.typeahead').on('typeahead:cursorchange', function(evt, item){
	if (item){
		$('#q').caretTo(item.name, true);
		highlight_question_mark();		
		update_latex();	
	}
});

function highlight_question_mark(){	
	var qm_idx = $('#q').val().indexOf('?');
	if (qm_idx == -1)
		return;

	$('#q').selectRange(qm_idx, qm_idx+1);
}

function snap_to_question_mark(q){
	var val = q.val();
	if (val.indexOf('?') >= 0){
		var pos = q.getCursorPosition();
		if (pos >= 0){
			if (val[pos] == '?'){
				q.selectRange(pos, pos+1);
			}
			else if (val[pos-1] == '?'){
				q.selectRange(pos-1, pos);
			}
		}
	}
}

function check_answer_toggle(){
	if (g_check_answer_on){
		$('#check_answer_button').html("Check Answer &#9658;");
		$("#check_answer_div").hide();
	}
	else{
		var q = $("#term_input").text();
		var a = $("#answer").text();
		get_check_answer(q, a);
		$('#check_answer_button').html("Check Answer &#9650;");
	}
	g_check_answer_on = !g_check_answer_on;
}

$("#choose_method_button").on("click", function(e){
	var popup_top;
	if (g_is_first_keypress && is_homepage()){
		popup_top = 80;
	}
	else{
		var term_preview_top = $('#term_preview_div').position().top;
		popup_top = parseInt(term_preview_top, 10) + 20;
	}
	$('.choose_method_popup > div').css('margin-top', popup_top + 'px');
	$("#open_choose_method_popup").addClass("choose_method_popup_active");
});

$("#choose_method_popup_close").on("click", function(e){
    $("#open_choose_method_popup").removeClass("choose_method_popup_active");
});

function keyboard_on(){
	$('#keyboard_link').html("Math Keyboard &#9650;");
	$('#keyboard').show();
	$('.tt-menu').css('margin-top', '157px');
}

function keyboard_off(){
	$('#keyboard_link').html("Math Keyboard &#9660;");
	$('#keyboard').hide();
	$('.tt-menu').css('margin-top', '5px');	
}

function get_q_elem(){
	if (!g_q_elem)
	{
		g_q_elem = document.getElementById('q');
	}
	return g_q_elem;
}

function get_q_value(){
	if (g_mobile_or_tablet){
		return g_input_text;
	}
	else{
		var elem = get_q_elem();
		return elem.value;
	}
}

function insert_text_mobile(text){
	if (g_upper){
		if (/^[a-z]$/.test(text)){
			text = text.toUpperCase();
		}
	}
	
	var end = (g_input_text[g_cursor_pos-1] == '?') ? g_cursor_pos-1 : g_cursor_pos;
	g_input_text = g_input_text.substr(0, end) + text + g_input_text.substr(g_cursor_pos);
	g_cursor_pos = Number(end) + Number(text.length);
	if (text.length > 1){
		var n = text.indexOf('?');
		if (n != -1){
			g_cursor_pos = end + n + 1;
		}
		else if (text.substr(text.length-2, 2) == '()'){
			g_cursor_pos--;
		}
	}
	
	update_input_div_for_mobile();
}

function insert_text_desktop(text){
	switch_homepage_to_answer_mode_on_first_input();
	
	var pos = $('#q').getCursorPosition();	
	var before_cursor = $('#q').val().substr(0, pos);
	var after_cursor =  $('#q').val().substr(pos);

	var new_text = before_cursor + text + after_cursor;
	$('#q').typeahead('val', new_text);
	$('#q').caretTo(pos + new_text.length);
	
	if (question_mark_at_cursor()){
		remove_question_mark_at_cursor();
		if (br == "ie"){ 
			txtarea.focus();
			var range = document.selection.createRange();
			range.moveStart('character', -txtarea.value.length);
			range.moveStart('character', strPos);
			range.moveEnd ('character', 0);
			range.select();
		}
		else if (br == "ff"){
			txtarea.selectionStart = strPos;
			txtarea.selectionEnd = strPos;
			txtarea.focus();
		}
	}

	if (text.indexOf('?') != -1){
		var qm_idx = $('#q').val().indexOf('?');
		$('#q').selectRange(qm_idx, qm_idx+1);
	}
}

function question_mark_at_cursor(){
	var q = get_q_value();
	var pos = $('#q').getCursorPosition();
	return (q[pos] == '?');
}

function remove_question_mark_at_cursor(){
	var old_val = $('#q').val();
	var pos = $('#q').getCursorPosition();
	var new_val = old_val.substring(0, pos) + old_val.substring(pos + 1);
	$('#q').val(new_val);
}

function insert_text(text){
	if (g_mobile_or_tablet)
		insert_text_mobile(text);
	else
		insert_text_desktop(text);
	update_latex();
}

function update_latex(){
	var value = get_q_value();
	debounce(g_debounce_limit_in_ms, false, get_latex, value);
	$("#q").data('oldVal', value);
}

function get_text_with_cursor(){
	return g_input_text.substr(0, g_cursor_pos) + '$' + g_input_text.substr(g_cursor_pos);
}

function backspace(){
	if (g_cursor_pos == 0)
		return;

	g_input_text = g_input_text.substr(0, g_cursor_pos-1) + g_input_text.substr(g_cursor_pos);
	g_cursor_pos--;
	update_input_div_for_mobile();

	update_latex();
}

function clear_text(){
	g_cursor_pos = 0;
	g_input_text = "";
	update_input_div_for_mobile();

	$('#q').val('');
	
	update_latex();
}

function update_last_div_pos_in_pixel(len){
	g_last_div_pos_in_pixel = 0;
	if (len > 1){
		var id = "#qi" + (len-2);
		if ($(id).offset()){
			g_last_div_pos_in_pixel = $(id).offset().left;
		}
	}
}

function update_clear_button(){
	if (g_input_text.length >= 1){
		$('#nav_clear').show();
	}
	else
		$('#nav_clear').hide();
}

function update_autocomplete(){
	var r = get_autocomplete_items(g_input_text);
	if (g_input_text == '' || r.num_items == 0){
		$('#mobile_autocomplete_box').hide();
	}
	else{	
		var autocomp_item_height = 27;
		var total_height = autocomp_item_height * r.num_items;	
		$('#mobile_autocomplete_box').css('top', '-' + total_height + 'px');	
		
		$('#mobile_autocomplete_box').html(r.str);		
		$('#mobile_autocomplete_box').show();
	}
}

function show_method_help(){
	var examples_str = get_method_examples(g_input_text);
	if (examples_str){
		$('#mobile_method_help_box').html("<div class='autocomp_method_examples_heading_mobile'>Ex.</div><div class='autocomp_method_examples_mobile'>" + examples_str + "</div>");		
		$('#mobile_method_help_box').show();		
	}
}

function hide_method_help(){
	$('#mobile_method_help_box').hide();
}

function get_method_examples(text){
	var len = g_autocomp_methods.length;	
	for (i=0; i<len; i++)
	{
		method = g_autocomp_methods[i];
        if (text == method.command){
			return method.examples;
		}
	}
	return false;
}

function get_autocomplete_items(text){
	substrRegex = make_regex(escape_regex(text));
	var str = '';
	var num_items = 0;	
	var len = g_autocomp_methods.length;
	
	for (i=0; i<len; i++)
	{
		method = g_autocomp_methods[i];
        var test_str = method.command + ' ' + method.desc;
        if (substrRegex.test(test_str)){					
			str += "<div data-method='" + method.command + "' class='mobile_autocomplete_row'>" 
				+      "<div class='mobile_autocomplete_item'>" + method.command + "</div>"
				+      "<div class='mobile_autocomplete_arrow'>" + '&#8601;' + "</div>"
				+      "<div style='clear:both;'></div>"
				+  "</div>";			
			num_items++;
			if (num_items >= g_autocomplete_max_num_items_mobile)
				break;
		}
	}
	
    var r = {
        num_items: num_items,
        str: str,
    };
	return r;
}

$("#mobile_autocomplete_box").on(g_button_trigger_event, "div.mobile_autocomplete_row", function(e){
	var method = $(this).data('method');
	clear_text();
	insert_text_mobile(method);
	$('#mobile_autocomplete_box').hide();
	show_method_help();
});

function update_input_div_for_mobile(){
	var t = get_text_with_cursor();
	var formatted_t = format_input(t);
	$('#q').html(formatted_t);
	update_last_div_pos_in_pixel(t.length);
	update_clear_button();
	
	if ($('#q').height() > 30){
		$('#q').css('top', '0px');
	}
	else{
		$('#q').css('top', '15px');
	}
	
	update_autocomplete();
	hide_method_help();	
}

$("#keyboard_link").on("click", function(e){
	if ($('#keyboard').is(":visible"))
		keyboard_off();
	else
		keyboard_on();
});

$("#iphone_link").on("click", function(e){
	$("#openIphonePopup").addClass("iphone_popup_active");
});

$("#iphone_popup_close").on("click", function(e){
	$("#openIphonePopup").removeClass("iphone_popup_active");
});

$("#nav_up").on(g_button_trigger_event, function(e){
    upper();
});

$("#nav_backspace").on(g_button_trigger_event, function(e){
    backspace();
});

$("#nav_clear").on(g_button_trigger_event, function(e){
    clear_text();
});

$("#keyboard_english td").on(g_button_trigger_event, function(e){
	var id = $(this).attr('id');
	if (!id)
		return;
		
	var text = id.substr(5);
	if (text == 'space')
		insert_text(' ');
	else
		insert_text(text);
	
	if (g_upper)
		lower();
});

$("#method_container div").on(g_button_trigger_event, function(e){
	$("#open_choose_method_popup").removeClass("choose_method_popup_active");	
	var method = $(this).data('command');
	var str = method + ' ';
	clear_text();
    insert_text(str);
});

$("#keyboard_math td").on(g_button_trigger_event, function(e){
	var id = $(this).attr('id');
	if (!id)
		return;
	
	switch (id){
		case 'k_plus':
			insert_text('+');
			break;
		case 'k_minus':
			insert_text('-');
			break;
		case 'k_br_l':
			insert_text('(');
			break;
		case 'k_br_r':
			insert_text(')');
			break;
		case 'k_n1':
			insert_text('1');
			break;
		case 'k_n2':
			insert_text('2');
			break;
		case 'k_n3':
			insert_text('3');
			break;
		case 'k_multi':
			insert_text('*');
			break;
		case 'k_div':
			insert_text('\u00F7');
			break;
		case 'k_pow':
			insert_text_for_power('^', '(?)^(?)');
			break;
		case 'k_pow2':
			insert_text_for_power('^2', '(?)^2');
			break;
		case 'k_pow3':
			insert_text_for_power('^3', '(?)^3');
			break;
		case 'k_n4':
			insert_text('4');
			break;
		case 'k_n5':
			insert_text('5');
			break;
		case 'k_n6':
			insert_text('6');
			break;
		case 'k_frac':
			insert_text('(?)/(?)');
			break;
		case 'k_mixed_frac':
			insert_text('(?)&(?)/(?)');
			break;
		case 'k_sqrt':
			insert_text('sqrt(?)');
			break;
		case 'k_root':
			insert_text('root(?,?)');
			break;
		case 'k_n7':
			insert_text('7');
			break;
		case 'k_n8':
			insert_text('8');
			break;
		case 'k_n9':
			insert_text('9');
			break;
		case 'k_slash':
			insert_text('/');
			break;
		case 'k_equal':
			insert_text('=');
			break;
		case 'k_n0':
			insert_text('0');
			break;
		case 'k_period':
			insert_text('.');
			break;
		case 'k_pct':
			insert_text('%');
			break;
		case 'k_ln':
			insert_text('ln(?)');
			break;
		case 'k_gt':
			insert_text('>');
			break;
		case 'k_lt':
			insert_text('<');
			break;
		case 'k_x':
			insert_text('x');
			break;
		case 'k_y':
			insert_text('y');
			break;
		case 'k_abs':
			insert_text('|?|');
			break;
		case 'k_log':
			insert_text('log(?)');
			break;
		case 'k_logb':
			insert_text('log(?,?)');
			break;
		case 'k_ge':
			insert_text('>=');
			break;
		case 'k_le':
			insert_text('<=');
			break;
		case 'k_cos':
			insert_text('cos(?)');
			break;
		case 'k_sin':
			insert_text('sin(?)');
			break;
		case 'k_tan':
			insert_text('tan(?)');
			break;
		default:
			break;
	}
});

function insert_text_for_power(partial, full){
	if (g_mobile_or_tablet){
		if (has_potential_base(g_input_text, g_cursor_pos))
			insert_text(partial);
		else
			insert_text(full);
	}
	else{
		var pos = $('#q').getCursorPosition();
		if (has_potential_base(get_q_value(), pos))
			insert_text(partial);
		else
			insert_text(full);
	}
}

function has_potential_base(q, pos){
	if (!q)
		return false;
	
	if (q.length == 0)
		return false;

	var my_char = q[pos-1];
	switch (my_char){
		case '+':
		case '-':
		case '*':
		case '/':
		case '^':
			return false;
		default:
			return true;
	}
}

function format_input(t){
	var should_highlight = false;
	if (t[g_cursor_pos-1] == '?'){
		should_highlight = true;
	}

	var len = t.length;
	var new_t = '';
	var qi = 0;
	for (var i=0; i<len; i++){
		if (i == g_cursor_pos-1 && should_highlight){
			new_t += "<span id='qi" + qi + "'>" + "<div class='question_mark'>?</div>" + "</span>";
			qi++;
		}
		else if (t[i] != '$'){
			var ch;
			if (t[i] == ' ')
				ch = '&nbsp;'
			else
				ch = t[i];
			new_t += "<span id='qi" + qi + "'>" + ch + "</span>";
			qi++;
		}
		else{
			new_t += "<span id='typed-cursor' class='blinking'>|</span>";
		}
	}

	new_t = new_t.replace(/\?/g, "&nbsp;?&nbsp;");
	return new_t;
}

function escape_regex(str){
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replace_all(a, b, str){
	return str.replace(new RegExp(escape_regex(a), 'g'), b);
}

function upper(){
	$('#keyboard_english').addClass('uppercase');
	g_upper = true;
}

function lower(){
	$('#keyboard_english').removeClass('uppercase');
	g_upper = false;	
}

function show_control(show){
	if (show){
		$('#control').show();
		$('#modify_button_div').hide();
	}
	else{
		$('#control').hide();
		$('#modify_button_div').show();
	}
}

function get_grouped_input(){
	var pos = $('#q').getCursorPosition();	
	var before_cursor = $('#q').val().substr(0, pos);
	var after_word =  $('#q').val().substr(pos);

	var pattern = new RegExp('[a-z]+$');
	var matches = pattern.exec(before_cursor);
	if (!matches)
		return false;

	var word_at_cursor = matches[0];
	var before_word = before_cursor.substr(0, before_cursor.length - word_at_cursor.length);

	var input = {
		before_word: before_word,
		word_at_cursor: word_at_cursor,
		after_word: after_word,
    };

	return input;
}

function make_regex(t){
	var pattern;
	if (t.length > 1)
		pattern = '(^|\ )' + t;		
	else
		pattern = '(^|\ )' + t + '[a-z]';
	return new RegExp(pattern, 'i'); 
}

var substringMatcher = function(){
  return function findMatches(q, cb){
    var matches, substringRegex;
    matches = [];
    substrRegex = make_regex(escape_regex(q));
    $.each(g_autocomp_methods, function(i, method){
        var test_str = method.name + ' ' + method.desc;		
        if (substrRegex.exec(test_str)){
			if (matches.length < 3){
                matches.push(method);
			}
        }
    });
 
	var input = get_grouped_input();
	if (input && input.word_at_cursor.length > 1){
		var substrRegex = make_regex(input.word_at_cursor);
		$.each(g_autocomp_funcs, function(i, func){
			var test_str = func.name + ' ' + func.desc;
			if (substrRegex.test(test_str)){
				var command = input.before_word + func.name + input.after_word;
				func.command = command;
				matches.push(func);
				if (matches.length >= g_autocomplete_max_num_items_desktop)
					return;
			}
		});
	}

    cb(matches);
  };
};

var g_autocomp_funcs = [
{
	type: 'shortcut',
	name: 'cos(?)',
	desc: 'cosine',
},
{
	type: 'shortcut',
	name: 'cos(x)',
	desc: 'cosine of x',
},
{
	type: 'shortcut',
	name: 'cos(90 degree)',
	desc: 'cosine of 90 degrees',
},
{
	type: 'shortcut',
	name: 'cos(PI)',
	desc: 'cosine of PI',
},
{
	type: 'shortcut',
	name: 'sin(?)',
	desc: 'sine',
},
{
	type: 'shortcut',
	name: 'sin(x)',
	desc: 'sine of x',
},
{
	type: 'shortcut',
	name: 'sin(90 degree)',
	desc: 'sine of 90 degrees',
},
{
	type: 'shortcut',
	name: 'sin(PI)',
	desc: 'sine of PI',
},
{
	type: 'shortcut',
	name: 'tan(?)',
	desc: 'tangent',
},
{
	type: 'shortcut',
	name: 'tan(x)',
	desc: 'tangent of x',
},
{
	type: 'shortcut',
	name: 'tan(90 degree)',
	desc: 'tangent of 90 degrees',
},
{
	type: 'shortcut',
	name: 'tan(PI)',
	desc: 'tangent of PI',
},
{
	type: 'shortcut',
	name: 'sec(?)',
	desc: 'secant',
},
{
	type: 'shortcut',
	name: 'sec(x)',
	desc: 'secant of x',
},
{
	type: 'shortcut',
	name: 'sec(90 degree)',
	desc: 'secant of 90 degrees',
},
{
	type: 'shortcut',
	name: 'sec(PI)',
	desc: 'secant of PI',
},
{
	type: 'shortcut',
	name: 'csc(?)',
	desc: 'cosecant',
},
{
	type: 'shortcut',
	name: 'csc(x)',
	desc: 'cosecant of x',
},
{
	type: 'shortcut',
	name: 'csc(90 degree)',
	desc: 'cosecant of 90 degrees',
},
{
	type: 'shortcut',
	name: 'csc(PI)',
	desc: 'cosecant of PI',
},
{
	type: 'shortcut',
	name: 'cot(?)',
	desc: 'cotangent',
},
{
	type: 'shortcut',
	name: 'cot(x)',
	desc: 'cotangent of x',
},
{
	type: 'shortcut',
	name: 'cot(90 degree)',
	desc: 'cotangent of 90 degrees',
},
{
	type: 'shortcut',
	name: 'cot(PI)',
	desc: 'cotangent of PI',
},
{
	type: 'shortcut',
	name: 'sqrt(?)',
	desc: 'square root',
},
{
	type: 'shortcut',
	name: 'sqrt(x)',
	desc: 'square root of x',
},
{
	type: 'shortcut',
	name: '(?)^(1/3)',
	desc: 'cube root',
},
{
	type: 'shortcut',
	name: 'x^(1/3)',
	desc: 'cube root of x',
},
{
	type: 'shortcut',
	name: '|?|',
	desc: 'absolute value',
},
{
	type: 'shortcut',
	name: '|x|',
	desc: 'absolute value of x',
},
];

var g_autocomp_methods = [
{
	type: 'method',
	name: 'complete the square ',
	command: 'complete the square ',
	desc: 'Convert to the form a(x+h)^2+k',
	examples: '"complete the square 3x^2+5x"<br/>"complete the square x^2+2x"',
},
{
	type: 'method',
	name: 'differentiate ',
	command: 'differentiate ', 		
	desc: 'Find the derivative.',
	examples: '"differentiate 3x+4"<br/>"differentiate 2y+x for x"',
},
{
	type: 'method',
	name: 'integrate ', 
	command: 'integrate ', 
	desc: 'Find the integral.',
	examples: '"integrate 3x+4"<br/>"integrate 3x+4 from 1 to 2"<br/>"integrate 2y+x for x"',
},
{
	type: 'method',
	name: 'expand ', 
	command: 'expand ', 
	desc: 'Expand an expression. Includes FOIL.',
	examples: '"expand y(y+2)"<br/>"expand (x+3)(x+2)"',
},
{
	type: 'method',
	name: 'factor ', 
	command: 'factor ', 
	desc: 'Factor an expression (by grouping, by GCF, etc).',
	examples: '"factor y^3+2y"<br/>"factor x^2+5x+6"',
},
{
	type: 'method',
	name: 'GCF ', 
	command: 'GCF ', 
	desc: 'Find the Greatest Common Factor of a list of integers.',
	examples: '"GCF 10 20 50"<br/>"GCF 5 15 30"',
},
{
	type: 'method',
	name: 'LCM ', 
	command: 'LCM ', 
	desc: 'Find the Least Common Multiple of a list of integers.',
	examples: '"LCM 3 4 5"<br/>"LCM 5 15 30"',
},
{
	type: 'method',
	name: 'partial fraction ', 
	command: 'partial fraction ', 
	desc: 'Apply partial fraction decomposition.',
	examples: '"partial fraction (2x-3)/(x^3+x)"<br/>"partial fraction u/(1+u)^2"',
},
{
	type: 'method',
	name: 'polynomial division ', 
	command: 'polynomial division ', 
	desc: 'Apply polynomial long division.',
	examples: '"polynomial division (x^2+2)/x"<br/>"polynomial division (y^3+2y^2+3)/(y^2)"',
},
{
	type: 'method',
	name: 'prime factorization ', 
	command: 'prime factorization ', 
	desc: 'Apply prime factorization to an integer.',
	examples: '"prime factorization 72"<br/>"prime factorization 436"',
},
{
	type: 'method',
	name: 'solve ', 
	command: 'solve ', 
	desc: 'Solve an equation.',
	examples: '"solve 3x+4=8"<br/>"solve x+y=7 for y"<br/>"solve x^2+5x+6=0"',
},
{
	type: 'method',
	name: 'simplify ', 
	command: 'simplify ', 
	desc: 'Reduce an expression to its minimal form.',
	examples: '"simplify 3x+5x"<br/>"simplify 2/(2+x)+3/(2+x)"',
},
{
	type: 'method',
	name: 'to decimal', 
	command: '? to decimal', 
	desc: 'Convert a number (ex. fraction) to decimal.',
	examples: '"1/3 to decimal"<br/>"PI to decimal"',
},
{
	type: 'method',
	name: 'to fraction', 
	command: '? to fraction', 
	desc: 'Convert a number (ex. decimal) to fraction.',
	examples: '"0.25 to fraction"<br/>"13.48 to fraction"',
},
{
	type: 'method',
	name: 'to mixed fraction', 
	command: '? to mixed fraction', 
	desc: 'Convert a fraction to mixed fraction.',
	examples: '"17/3 to mixed fraction"<br/>"200/7 to mixed fraction"',
},
{
	type: 'method',
	name: 'to improper fraction', 
	command: '? to improper fraction', 
	desc: 'Convert a fraction to improper fraction.',
	examples: '"4 3/5 to improper fraction"<br/>"3 1/24 to improper fraction"',
},
{
	type: 'method',
	name: 'radian to degree', 
	command: '? radian to degree', 
	desc: 'Convert radian to degree.',
	examples: '"PI/2 radian to degree"<br/>"3PI radian to degree"',
},
{
	type: 'method',
	name: 'degree to radian', 
	command: '? degree to radian', 
	desc: 'Convert degree to radian.',
	examples: '"180 degree to radian"<br/>"90 degree to radian"',
},
{
	type: 'method',
	name: 'long division ', 
	command: '', 
	desc: 'Simply enter "x/y" for x divided by y.',
	examples: '"17/3"<br/>"250/30"',
},
];
 
$('#outer_q .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1,
},
{
    name: 'methods',
	display: 'command',
    source: substringMatcher(),
    templates: {
        suggestion: function(data){
            if (data.type == 'method'){
                return "<div style='border-bottom: 1px solid #ddd; padding-bottom: 5px;'>"
						+ "<div class='autocomp_method_name'>" + data.name + "</div>"
						+ "<div class='autocomp_method_desc'>" + data.desc + "</div>"						  
						+ "<div class='autocomp_method_arrow'>&#8598;</div>"
						+ "<div style='clear:both;'></div>"
						+ "<div class='autocomp_method_examples_heading'>Examples:</div>" 
						+ "<div class='autocomp_method_examples'>" + data.examples + "</div>"
						+ "</div>";
                    }
            else{
                return "<div style='border-bottom: 1px solid #ddd; padding-bottom: 5px;'>"
						+ "<div class='autocomp_func_name'>" + data.name + "</div>"
						+ "<div class='autocomp_func_desc'>" + data.desc + "</div>"
						+ "<div class='autocomp_method_arrow'>&#8598;</div>"
						+ "<div style='clear:both;'></div>"
						+ "</div>";
            }
        }
    }
});

