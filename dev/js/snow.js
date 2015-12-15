;(function($){
	/*canvas 雪花效果*/
	$.fn.snow=function(){
		if($(this)[0].nodeName==='CANVAS'){
			var canvas=$(this)[0];
			resize.call(canvas);
			var dResize=_.debounce(_.bind(resize,canvas),200);
			$(window).on('resize',function(){
				dResize(canvas);
			});
		}
		/*重置canvas的大小*/
		function resize(){
			this.width=$("body").width();
			this.height=$("body").height();
		}
	}
})(jQuery);