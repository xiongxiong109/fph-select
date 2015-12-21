var oUl=$("#js_list");
function getList(){
	var oLis=oUl.find('li');
	var len=oLis.length;
	if(!len){
		alert('当前还木有相关人员名单,请至少先进行一次礼物交换吧~');
		return false;
	}
	else{
		var arr=[];
		oLis.each(function(idx,ele){
			arr.push($(ele).text()+',交换时间:'+new Date().toUTCString());
		});
		var json={};
		_.each(arr,function(str,idx){
			json[idx]=str;
		});
		/*ajax*/
		$.post('/getList',json,function(data){
			if(data.error_code==0){//说明写入成功
				window.open(data.download_url);
			}
		});
	}
}