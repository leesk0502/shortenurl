requirejs.config({
	"appDir": "/assets/scripts",
	"shim": {
		"jquery": {
			"exports": "jquery"
		}   
	},  
	"paths": {
		"jquery": "//code.jquery.com/jquery-1.11.0.min"
	}
});

require(['jquery', 'selection'], function($, selection){
	$(function(){
		$("#url").keyup(function(key){
			if( key.keyCode == 13 ){
				$("#shorten_btn").click();
			}
		});
		$("#shorten_btn").click(function(){
			$.ajax({
				'url' : '/api/regist',
				'type':'POST',
				'contentType': 'application/json',
				'data':JSON.stringify({ 
					'url':$('#url').val() 
				}),
				'dataType':'json',
				'success':function(result){
					if( result.result ){
						$("#title").html(window.location.href+result.en);
						selection.setSelectionRange(document.getElementById('title', 0, $("#title").html().length));
					}
				},
				'error':function(e){
				}
			});
		});
	});
});
