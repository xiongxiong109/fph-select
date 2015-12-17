$(function(){
	var randTimer=null;
	var cacheData=[];
	var posArr=[];
	var step=0;
	var oBtn=$("#stepBtn");
	//初始化生成li
	$.getJSON('./data/list.json',function(data){
		cacheData=$.extend([],data);
		createLi(cacheData);
	});

	/*图片hover*/
	var dBindInfo=_.debounce(bindInfo,500);
	$("#js_selector").delegate("li","mouseenter",function(){
		dBindInfo.call($(this));
	});
	$("#js_selector").delegate("li","mouseleave",function(){
		$("#js_selector").find('li').filter('[class=active]').trigger('mouseenter');
	});
	/*li点击*/
	$("#js_selector").delegate("li","click",function(){
		$(this).addClass('active');
		$(this).siblings('li').removeClass('active');
		oBtn.removeAttr("disabled");
	});

	/*步骤点击*/
	oBtn.on("click",function(){
		/*状态机*/
		switch (step){
			case 0: //第一步,选择左边角色
			$("#mask").show();
			hideLi();
			break;
			case 1: //第二步开始进行随机参数
			randLi();
			break;
			case 2: //停止抽取
			reloadLi();
			// $("#mask").hide();
			break;
		}
	});
	/*functions*/
	function bindInfo(){
		var oLi=$(this);
		var headImg=$("#cardOneImg");
		headImg.parent().addClass('active');
		headImg.attr('src',oLi.find('img').attr('src')).hide().fadeIn();
		$("#cardOne").hide().text( oLi.data('name') ).fadeIn();
	}

	//随机抽取后入栈操作
	function reloadLi(){
		clearInterval(randTimer);
		step=0;
		oBtn.text(oBtn.data('s'+step)).attr('disabled','disabled');
		setTimeout(function(){
			hideLi();//剔除li
			showLis();//排列li
			pushInfo();//消息入栈
		},200);
	}

	//入栈
	function pushInfo(){
		
	}
	// 随机li
	function randLi(){
		var oLis=$("#js_selector").find('li');
		var headImg=$("#cardTwoImg");
		var cardTwo=$("#cardTwo");
		cardTwo.show();
		clearInterval(randTimer);
		randTimer=setInterval(function(){
			var randIdx=_.random(0,oLis.length-1);
			oLis.removeClass('active');
			oLis.eq(randIdx).addClass('active');
			cardTwo.text(oLis.eq(randIdx).data('name'));
			headImg.attr('src',oLis.eq(randIdx).find('img').attr('src'));
		},20);
		step++;
		oBtn.text(oBtn.data('s'+step));
	}
	//删除active的li
	function hideLi(){
		var oLis=$("#js_selector").find('li');
		oLis.filter('[class=active]').hide(400,function(){
			$(this).remove();
			showLis();
			step++;
			oBtn.text(oBtn.data('s'+step));
		});
	}
	// 创建li
	function createLi(data){
		var strArr=[];
		$.each(data,function(idx,obj){
			strArr.push('<li data-name="'+obj.name+'"><img src="'+obj.src+'" alt="" /></li>');
		});
		$("#js_selector").html(strArr.join(''));
		showLis();
	}
	// 排列li
	function showLis(){
		var oLis=$("#js_selector").find("li");
		var maxW=$("#js_selector").width();
		var unitW=oLis.outerWidth(true);
		var unitH=oLis.outerHeight(true);
		var cols=maxW/unitW;
		// 入场动画
		$.each(oLis,function(idx,ele){
			var top=Math.floor(idx/cols)*unitH;
			var left=Math.floor(idx%cols)*unitW;
			$(ele).css({
				'top':top,
				'left':left
			});
		});
	}
});