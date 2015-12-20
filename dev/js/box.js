/*
bug1:search并第一次选择后再次选择时,选项中并没有将第一次的选项清除
bug2:点击li后再search,然后再点确定就没了
*/
$(function(){
	var randTimer=null,randDoubleTimer=null;
	var cacheData=[];//缓存数组
	var searchData=[];//搜索数组
	var cacheSpeak=[];//随机话术
	var cacheState=[];//随机话术
	var posArr=[];
	var currentModel=0;//当前选择模式
	var step=0,stepDouble=0;
	var oBtn=$("#stepBtn");
	var oDbtn=$("#doubleBtn");
	var oAudio=$("#audio");
	var oSearch=$("#searchInput");
	var oModelBtn=$(".select-model-btn");
	var infoStr=[];//消息框

	//初始化选择模式
	$(".btn").hide();
	changeBtn();
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

	// 切换按钮
	oModelBtn.on('click',function(){
		if(step==0 && stepDouble==0){
			currentModel=$(this).data('model');
			changeBtn();
		}
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

	/*双选按钮*/
	var _doubleMove=_.debounce(moveStepDouble,200);
	function moveStepDouble(){
		var len=cacheData.length;
		if(len<2){//当配对人数小于一个的时候
			over();
		}
		switch(stepDouble){
			case 0 ://点击开始双选
			randDoubleLi();
			oAudio.attr('src','audio/select_music'+_.random(0,4)+'.mp3');
			break;
			case 1:
			pushInfo();//消息入栈
			stopDoubleTemp();//一次抽取结束,再次抽取开始
			oAudio.attr('src','audio/bgm'+_.random(0,3)+'.mp3');
			break;
		}
		stepDouble++;
		if(stepDouble>2){
			stepDouble=0;
		}
		oDbtn.text(oDbtn.data('s'+stepDouble));
	}
	oDbtn.on('click',function(){
		_doubleMove();
	});
	// 搜索框
	var _dSearch=_.debounce(searchPerson,200);
	function searchPerson(){
		var searchStr=$.trim($(this).val());
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
	function stopDoubleTemp(){
		clearInterval(randDoubleTimer);
		setTimeout(hideLi,1e3);
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
		$("#js_selector").find('li').filter('[class=active]').each(function(idx,ele){
			infoStr.push($(ele).data('name'));
		});
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
		'与<span class="name">',
		infoStr.shift(),
		'</span>进行了礼物交换,',
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

	function randDoubleLi(){
		var oLis=$("#js_selector").find('li');
		var headOneImg=$("#cardOneImg"),headTwoImg=$("#cardTwoImg");
		var cardTwo=$("#cardTwo"),cardOne=$("#cardOne");
		var cardTwoBig=$("#cardTwoBig"),cardOneBig=$("#cardOneBig");
		$(".person-card").show();
		$(".card-mini").show();
		clearInterval(randDoubleTimer);
		randDoubleTimer=setInterval(function(){
			var randA=_.sample(cacheData,2);
			oLis.removeClass('active');
			oLis.filter('[data-id='+randA[0].id+']').addClass('active');
			oLis.filter('[data-id='+randA[1].id+']').addClass('active');

			headOneImg.attr('src',randA[0].src);
			cardOne.text(randA[0].name);
			cardOneBig.css('background-image','url('+randA[0].src_big+')');

			headTwoImg.attr('src',randA[1].src);
			cardTwo.text(randA[1].name);
			cardTwoBig.css('background-image','url('+randA[1].src_big+')');
		},20);
	}
	//删除active的li
	function hideLi(fn){
		var oLis=$("#js_selector").find('li');
		var oAct=oLis.filter('[class=active]');
		oAct.each(function(idx,ele){
			var spliceIndex=_.findIndex(cacheData,{
				id:$(ele).data('id')
			});
			cacheData.splice(spliceIndex,1);
		});
		oAct.hide(400,function(){
			oAct.remove();
			if(fn){
				fn();
			}
			else{
				showLis();
			}
			if(currentModel==0){
				stepMove();
			}
			else{
				oDbtn.text('再次抽取');
			}
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

	//切换选择按钮
	function changeBtn(){
		if(currentModel==0){//单选模式
			$("#mask").hide();
			oBtn.show();
			oDbtn.hide();
			oSearch.removeAttr('disabled');
		}
		else if(currentModel==1){//多选模式
			$("#mask").show();
			oDbtn.show();
			oBtn.hide();
			oSearch.attr('disabled', 'disabled');
		}
		oModelBtn.removeClass('active');
		oModelBtn.eq(currentModel).addClass('active');
	}
	//结束函数
	function over(){
		oBtn.off('click');
		oDbtn.off('click');
		oBtn.attr('disabled','disabled').text('游戏结束,没有阔以继续配对的啦~');
		oDbtn.attr('disabled','disabled').text('游戏结束,没有阔以继续配对的啦~');
	}
});