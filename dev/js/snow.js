var stage=new createjs.Stage('canvas');
var snowContainer=new createjs.Container();
stage.addChild(snowContainer);
/*重置canvas宽高*/
resizeCan();
var dResize=_.debounce(resizeCan,200);
$(window).on('resize',function(){
	dResize();
});
function resizeCan(){
	canvas.width=canvas.parentNode.offsetWidth;
	canvas.height=canvas.parentNode.offsetHeight;
}

createjs.Ticker.setFPS(30);
createjs.Ticker.addEventListener('tick',stage);
createjs.Ticker.addEventListener('tick',goSnow);

function goSnow(){
	var len=snowContainer.children.length;
	if(len<=60){
		var x=Math.random()*canvas.width;
		var y=-Math.random()*20;
		var r=Math.random()*3+3;
		var o=Math.random()*0.2+0.8;
		var s=createSnow(x,y,r,o);
		s.alpha=Math.random()*0.5+0.5;
		snowContainer.addChild(s);
	}
	for(var i=0;i<snowContainer.children.length;i++){
		var s=snowContainer.children[i];
		s.y+=2;
		s.alpha-=Math.random()*0.02;
		if(s.alpha<=0 || s.y>=canvas.height){
			snowContainer.removeChild(s);
		}
	}
}
// 创建雪花
function createSnow(x,y,r,opacity){
	var snow=new createjs.Shape();
	snow.graphics.beginFill("rgb(255,255,255)").drawCircle(x,y,r);
	snow.alpha=opacity;
	return snow;
}