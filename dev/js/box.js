/*
bug1:search并第一次选择后再次选择时,选项中并没有将第一次的选项清除
bug2:点击li后再search,然后再点确定就没了
*/
$(function(){
	var randTimer=null;
	var cacheData=[];//缓存数组
	var searchData=[];//搜索数组
	var cacheSpeak=[];//随机话术
	var cacheState=[];//随机话术
	var posArr=[];
	var step=0;
	var oBtn=$("#stepBtn");
	var oAudio=$("#audio");
	var oSearch=$("#searchInput");
	var infoStr=[];//消息框
	// 初始化消息
	$.getJSON('./data/speak.json',function(data){
		cacheSpeak=$.extend([],data);
	});
	$.getJSON('./data/state.json',function(data){
		cacheState=$.extend([],data);
	});
	//初始化生成li
	$.getJSON('./data/list.json',function(data){
		_.each(data,function(obj,idx){
			obj.id=idx;
		});
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
		stepMove(1);
	});

	/*步骤点击*/
	var _dClick=_.debounce(btnStep,200);
	function btnStep(){
			/*状态机*/
			switch (step){
				case 0: //第一步,选择左边角色
				oSearch.removeAttr('disabled');
				var len=cacheData.length;
				if(len<2){//当配对人数小于一个的时候
					over();
				}
				break;
				case 1: //确认选择
				$("#mask").show();
				pushInfo();//消息入栈
				oSearch.attr('disabled','disabled');
				if(oSearch.val()!=''){
					oSearch.val('');
					hideLi(function(){
						createLi(cacheData);
					});
				}
				else{
					hideLi();
				}
				break;
				case 2: //停止抽取
				randLi();
				oAudio.attr('src','audio/select_music'+_.random(0,4)+'.mp3');
				break;
				case 3:
				pushInfo();//消息入栈
				stopTemp();//一次抽取结束,再次抽取开始
				oAudio.attr('src','audio/bgm'+_.random(0,3)+'.mp3');
				break;
				case 4://重新布局
				reloadLi();
				break;
			}
		}
	oBtn.on("click",function(){
		_dClick();
	});

	// 搜索框
	var _dSearch=_.debounce(searchPerson,200);
	function searchPerson(){
		var searchStr=$(this).val();
		searchData=_.filter(cacheData,function(obj){
			return new RegExp(searchStr,'gim').test(obj.name);
		});
		createLi(searchData);
	}
	oSearch.on('input',function(){
		oBtn.attr('disabled','disabled');
		_dSearch.call(oSearch);
	});
	/*functions*/
	function bindInfo(){
		var oLi=$(this);
		var headImg=$("#cardOneImg");
		headImg.parent().addClass('active');
		headImg.attr('src',oLi.find('img').attr('src')).hide().fadeIn();
		$("#cardOne").hide().text( oLi.data('name') ).fadeIn();
		$("#cardOneBig").show().css('background-image','url('+oLi.data('big')+')');
	}

	//随机抽取后入栈操作
	function reloadLi(){
		clearInterval(randTimer);
		setTimeout(showLis,200);
	}

	// 暂停
	function stopTemp(){
		clearInterval(randTimer);
		setTimeout(hideLi,1e3);
		oBtn.one('click',function(){
			stepMove();
		});
	}
	// 处理下一步的逻辑,当有参数传递进来的时候,就走到参数的步数,否则就默认往后走一步
	function stepMove(moveTo){
		if(moveTo){
			step=moveTo;
		}
		else{
			step++;
		}
		if(step>=5){
			step=0;
			$("#mask").hide();
			oBtn.attr('disabled','disabled');
			personInit();
		}
		oBtn.text(oBtn.data('s'+step));
	}

	// 空格点击代替button
	$("#person-select-wrap").on('keyup',function(e){
		if(e.keyCode==32){
			oBtn.trigger('click');
		}
	});
	//人物卡片重置
	function personInit(){
		$(".person-card").hide();
		$(".card-mini").text('').hide();
		$(".person-head").find('img').attr('src','img/placeholder.png');
	}
	//入栈
	function pushInfo(){
		var str=$("#js_selector").find('li').filter('[class=active]').data('name');
		infoStr.push(str);
		if(infoStr.length>=2){//当搜集到两个配对的名字的时候,就创建消息
			createInfo();
		}
	}

	function createInfo(){
		var str=[
		'<li>',
		'<span class="name">',
		infoStr.shift(),
		'</span>',
		_.sample(cacheSpeak).speak,
		'向<span class="name">',
		infoStr.shift(),
		'</span>发起了礼物交换请求,',
		_.sample(cacheState).state,
		'</li>'
		].join('');
		var l=$("#js_list").find('li').length;
		if(!l){
			$("#js_list").append($(str));
		}
		else{
			$(str).insertBefore($("#js_list").find('li').eq(0));
		}
		$("#js_list").find('li').eq(0).hide().slideDown();
	}
	// 随机li
	function randLi(){
		var oLis=$("#js_selector").find('li');
		var headImg=$("#cardTwoImg");
		var cardTwo=$("#cardTwo");
		var cardTwoBig=$("#cardTwoBig");
		cardTwo.show();
		cardTwoBig.show();
		clearInterval(randTimer);
		randTimer=setInterval(function(){
			var randIdx=_.random(0,oLis.length-1);
			oLis.removeClass('active');
			oLis.eq(randIdx).addClass('active');
			cardTwo.text(oLis.eq(randIdx).data('name'));
			headImg.attr('src',oLis.eq(randIdx).find('img').attr('src'));
			cardTwoBig.css('background-image','url('+oLis.eq(randIdx).data('big')+')');
		},20);
		stepMove();
	}
	//删除active的li
	function hideLi(fn){
		var oLis=$("#js_selector").find('li');
		var oAct=oLis.filter('[class=active]');
		var spliceIndex=_.findIndex(cacheData,{
			id:oAct.data('id')
		});
		cacheData.splice(spliceIndex,1);
		oAct.hide(400,function(){
			oAct.remove();
			if(fn){
				fn();
			}
			else{
				showLis();
			}
			stepMove();
		});
	}
	// 创建li
	function createLi(data){
		var strArr=[];
		$.each(data,function(idx,obj){
			strArr.push('<li data-name="'+obj.name+'" data-id="'+obj.id+'" data-big="'+obj.src_big+'"><img src="'+obj.src+'" alt="" /></li>');
		});
		$("#js_selector").html(strArr.join(''));
		showLis();
	}
	// 排列li
	function showLis(){
		var oLis=$("#js_selector").find("li");
		var maxW=$("#js_selector").width();
		oLis.height(oLis.width());
		var unitW=oLis.outerWidth(true);
		var unitH=oLis.outerHeight(true);
		var cols=Math.floor(maxW/unitW);
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

	//结束函数
	function over(){
		oBtn.off('click');
		oBtn.attr('disabled','disabled').text('游戏结束,没有阔以继续配对的啦~');
	}
});