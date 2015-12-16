$(function(){
	var oLis=$("#js_selector").find("li");
	var randTimer=null;

	//开场动画
	var posArr=[];
	oLis.each(function(idx,ele){
		posArr.push({
			left:$(ele).position().left,
			top:$(ele).position().top
		});
	});
	oLis.css('position','absolute');
	rePost();
	//步骤
	var step=0,isRunning=false;
	$("#stepBtn").on('click',function(){
		var oBtn=$(this);
		clearInterval(randTimer);
		if(!isRunning){
			if(step>2){
				step=0;
			}
			else{
				step++;
			}
			randTimer=setInterval(function(){
				var rand=_.random(0,oLis.length-1);
				oLis.removeClass('active');
				oLis.eq(rand).addClass('active');
			},40);
		}
		else{
			var oActive=$("#js_selector").find("li.active");
			oActive.delay(200).fadeOut(600,function(){
				oActive.remove();
				oLis=$("#js_selector").find("li");
			});
		}
		isRunning=!isRunning;
	});

	function rePost(){
		oLis.each(function(idx,ele){
			$(ele).css({
				left:posArr[idx].left,
				top:posArr[idx].top
			});
		});
	}
});