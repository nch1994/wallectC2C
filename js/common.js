// var urls="http://47.244.216.195:8081";
// var urls="10.1.0.64:8088";
var urls="http://app.tokenpanda.pro:8088";
var balances=getCookie("balance");
// var outuids=getCookie("outuid");
var userIds=getCookie("userId");
//获取地址参数
var url = decodeURI(location.search);//获取参数
var theRequest = new Object();
if (url.indexOf("?") != -1) {
	var str = decryptByDESModeEBC(url.substr(1));
	strs = str.split("&");
	for (var i = 0; i < strs.length; i++) {
		theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
	}
}
console.log(theRequest);
function setCookie(cname,cvalue) {
    document.cookie = cname + "=" + cvalue + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
//复制功能
function copyText(id,idtext) {
	var copycode=document.getElementById(idtext).innerText;
	$('#'+id).attr("data-clipboard-text", copycode );//copycode 要复制的文本  ,他没有这个属性 text就一直为空
      var clipboard = new ClipboardJS('#'+id);
      clipboard.on('success', function(e) { alert("复制成功"); });
      clipboard.on('error', function(e) { alert("复制失败"); });
	
}
getExchangeRate();
function getExchangeRate(){//首页汇率	
	$.ajax({
        type: "get",
        url: urls+"/api/v1/coinBasin/otcGetExchangeRate/"+userIds,
        dataType: 'json',
        success: function (res) {
			console.log(res);
        	if (res.code==1) {
        		setCookie("usdtToCny",res.obj.usdtToCny);
        		$('#one_rate').html(res.obj.cnyToUsdt);//首页购买单价
				$('#one_rates').html(res.obj.usdtToCny);//首页出售单价
				$('#one_ratess').html("¥"+res.obj.usdtToCny);//出售信息单价
				$('#one_ratesss').html("¥"+res.obj.cnyToUsdt);//购买信息单价
				num("nums","moneys",res.obj.cnyToUsdt);
				num("numss","moneyss",res.obj.usdtToCny);
				money("nums","moneys",res.obj.cnyToUsdt);
				money("numss","moneyss",res.obj.usdtToCny);
				$('#ordernums').text(theRequest.ordernums);//出售数量赋值
				$('#ordermoney').text(theRequest.ordernums*res.obj.cnyToUsdt);
        	}
        },
        error:function(res){
        }
    })
}
function toLogin(){
    window.location.href="html/login.html";
}
// 登录页功能start
//点击图标清空手机输入框的值
$('#login_close').click(function(){
    $('#phone_num').val('');
    $('#verCode').val('');
})
// 设置倒计时时间
function settime(getCodeBtn, countdown) {
    if (countdown == 0) {
        getCodeBtn.removeAttribute("disabled");
        getCodeBtn.value = "获取验证码";
        return false;
    } else {
        getCodeBtn.setAttribute("disabled", true);
        getCodeBtn.value = "重新发送(" + countdown + "s)";
        countdown--;
        editCookie("secondsremained", countdown, countdown);
    }
    setTimeout(function () {
        settime(getCodeBtn, countdown);
    }, 1000)
}
// 发送验证码、、
function send(_this) {
    var mobile =$("#phone_num").val();
    var reg = /^\d{5,}@qq\.com$|^[0-9a-zA-Z_]+@(?!qq\.com)[^@\s]+\.com$/;
    if (reg.test(mobile)) {
        // var login_select=$("#login_select").val();//获取区号
        var phone_num = $("#phone_num").val();//获取输入手机号
        // setCookie("login_select", login_select);
        setCookie("phone",phone_num);
        var all_phone =phone_num;//区号手机号拼接
        var message = {"number":all_phone,"tenantId":"0"};//获取验证码接口传值
        var messages =  JSON.stringify(message);
        console.log(messages);
        var phone_nums=encryptByDESModeCBC(messages,key);//数据EDS加密
        var get_code='["'+phone_nums+'"]';
        $.ajax({
            type: "post",
            crossDomain: true,
            url:urls+'/api/v1/user/sendSMS?' +get_code ,
            dataType:'json',
            contentType : "application/json;charset=utf-8",
            success: function (res) {
                if (res.code==1) {
                     // 把'剩余倒计时时间'保存到cookie中,有效时间60s
                    addCookie("secondsremained", 60, 60);
                     // 开始倒计时
                    settime(_this,60);
                    alert(res.msg);
                }
                
            },
            error:function(res){
                alert('获取验证码失败');
            }
        })
    } else {
        alert('请输入正确邮箱！');
    }
}
//校检验证码，获取用户id
function logining(){
    // var login_select=$("#login_select").val();//获取区号
    var phone_num = $("#phone_num").val();//获取输入手机号
    var all_phone =phone_num;//区号手机号拼接
    var verCode = $("#verCode").val();//获取验证
    var VerfiCode = {"captcha":verCode,"number":all_phone};
    var VerfiCodes =  JSON.stringify(VerfiCode);
    console.log(VerfiCodes);
    var check_verCode=encryptByDESModeCBC(VerfiCodes,key);//数据EDS加密
    var check_verCodes='["'+check_verCode+'"]';
    console.log(check_verCode);
    //获取验证码
    $.ajax({
        type: "post",
        crossDomain: true,
        url:urls+'/api/v1/user/validateVerfiCode?' +check_verCodes ,
        dataType:'json',
        contentType : "application/json;charset=utf-8",
        success: function (res) {
            if (res.code==1) {
                //用户登录接口获取用户id	
                newLogin(phone_num,verCode,all_phone)    
            }
        },
        error:function(res){
            alert('操作失败');
        }
    })    
};
function newLogin(phone_num,verCode,all_phone){
    //用户登录接口获取用户id	
    var login_userId = {
        "captcha":verCode,//验证码
        // "countryCode":login_select,//国家区号
        "number": all_phone//手机号码或电子邮箱 
    };
    var login_userId_str =  JSON.stringify(login_userId);
    console.log(login_userId_str);
    var login_userId_str_des=encryptByDESModeCBC(login_userId_str);//数据EDS加密
    var login_userId_str_dess='["'+login_userId_str_des+'"]';
    $.ajax({
        type: "post",
        crossDomain: true,
        url:urls+'/api/v1/user/newLogin?' +login_userId_str_dess,
        dataType:'json',
        contentType : "application/json;charset=utf-8",
        success: function (res) {
            console.log(res);
            if (res.code==1) {
                setCookie("userId",res.obj.userId);

                userInfo();
            }else{
                alert(res.msg);
            }
            
        },
        error:function(res){
            alert('操作失败');
        }
    });
}
function userInfo(){
    //获取用户信息
    var userIds=getCookie("userId");
    var userInfo = {
        "userId":userIds,//用户id
    };
    console.log(userInfo);
    var userInfo_str=JSON.stringify(userInfo);
    var userInfo_str_des='["'+encryptByDESModeCBC(userInfo_str)+'"]';
    $.ajax({
        type: "post",
        crossDomain: true,
        url:urls+'/api/v1/user/userInfo?' +userInfo_str_des,
        dataType:'json',
        contentType : "application/json;charset=utf-8",
        success: function (res) {
            console.log(res);
            if(res.code==1){
                setCookie("payPassword",res.obj.payPassword);
                window.location.href="../index.html";
            }
        },
    })
}
//首页index
function mainorders(){
	window.location.href="html/main_order.html?"+encryptByDESModeCBC("userId="+userIds+"&balance="+balances);
}
//输入框实时监控
function num(num,money,res){
	$("#"+num).bind("input propertychange",function(event){//监听数量输入框值
		var inputs=$(this).val();
 		$("#"+money).val(Math.round(inputs*res*100)/100);
		if(inputs==''){
		  	$("#"+money).val('');
		}
		if (inputs>1386962.41) {
			$("#buys").attr('disabled','disabled');
			alert("单次最高交易额9999999.99元!");
		}else{
			$("#buys").removeAttr('disabled','disabled');
		}
	});
}

function money(num,money,res){
	$("#"+money).bind("input propertychange",function(event){//监听金额输入框值
		var inputs=$(this).val();
      	$("#"+num).val(Math.round(inputs/res*100)/100);
    	if(inputs==''){
		 	$("#"+num).val('');
		}	
	});
}
function InputOnchange(thisId) {
    //验证数据
    var valueCurrent = document.getElementById(thisId).value;
    var value = valueCurrent;
    //不是数字
    if (/[^\d]/.test(valueCurrent)) {
        //含小数点
        if (valueCurrent.indexOf(".") != -1) {
            var valueArray = valueCurrent.split(".");
            //小数点不能首位
            if (valueCurrent.indexOf(".") == 0) {
                value = '';
            }
            //小数点只有一个
            else if (valueArray.length > 2) {
                value = valueCurrent.substring(0, valueCurrent.length - 1);
            }
            //小数位数为2，且是数字
            else if (valueArray[1].length > 2) {
                valueArray[1] = valueArray[1].substring(0, 2);//valueArray[1].length - 1
                if (/[^\d]/.test(valueArray[1])) {
                    valueArray[1] = valueArray[1].replace(/[^\d]/g,'');
                }
                value = valueArray.join('.');
            }
            //小数部分也只能是数字
            else if (/[^\d|\.]/.test(valueCurrent)) {
                value = valueCurrent.replace(/[^\d|\.]/g, '');
            }
        }
        else{
            value = valueCurrent.replace(/[^\d]/g, '');
        }
    }//开头不能连续两个0
    else if (valueCurrent.substring(0,1) == "0") {
        if (valueCurrent.substring(1,2) != ".") {
            value = "0";
        }
    }
    //整数位数不超过7位
    else if (valueCurrent.length>7) {
        value = valueCurrent.substring(0,7);
    }
    document.getElementById(thisId).value = value;
    //...省略部分代码...//
}
// 我的订单main_order数据接口
function main_order(){
	$.ajax({
		url : urls+ "/api/v1/coinBasin/otcMyOrders/"+userIds+"/0/0",
		type :'get',
		dataType: 'json',
		success : function(res){
			console.log(res);
			if (res.code==1) {
				var html = '';
				for (var i in res.obj) {
					var type_str="'"+res.obj[i].type+"'";
					var orderNo="'"+res.obj[i].orderNo+"'";
					var statuss="'"+res.obj[i].status+"'";
					html +=
					'<ul class="mui-table-view">'+
						'<li class="mui-table-view-cell" onclick="checks('+type_str+','+orderNo+','+statuss+','+res.obj[i].cnyAmount+','+res.obj[i].usdtAmount+')"">'+
							'<div class="mui-container myorder">'+
								'<div class="mui-row">'+
									'<div class="mui-col-xs-1" style="line-height:40px">'+
										''+(changeimg(res.obj[i].type))+''+
									'</div>'+
									'<div class="mui-col-xs-11">'+
										'<p><span>'+res.obj[i].type+'</span><span style="margin:0 10px;">'+(amount(res.obj[i].usdtAmount))+'</span><span>USDT</span><span>￥'+res.obj[i].cnyAmount+'</span></p>'+
										'<p><span>'+res.obj[i].createTime+'</span><span>'+(statusss(res.obj[i].type,res.obj[i].status))+'</span></p>'+
									'</div>'+
								'</div>'+
							'</div>'+
						'</li>'+
					'</ul>'
				}
				$('#orders').html(html);
			}			
		}
	});
}
function statusss(type,status){
	var bak = '';
	if (status == '商家取消'||status == '付款超时或用户取消') {
		bak += '<span style="color: #8B9090 ;">' + status + '</span>';
	}else{
		if(type=='买币'){
			bak += '<span style="color: #12D0B4;">' + status + '</span>';
		}else if(type=='卖币'){
			bak += '<span style="color: #F5A623;">' + status + '</span>';
		};
	}
	return bak;
}
function changeimg(types){
	var bak = '<img src="../images/group3.png">';
	if(types=='买币'){
    	bak = '<img src="../images/group3.png">';
    }else if(types=='卖币'){
    	bak = '<img src="../images/group4.png">';
    }
    return bak;
}
function checks(type_str,orderNo,statuss,cnyAmount,usdtAmount){
	$.ajax({
        type: "get",
        url:urls+"/api/v1/coinBasin/tradeStatus/"+orderNo,
        dataType: 'json',
        success: function (res) {
        	console.log(res);
        	if (res.code==1) {			
        		if (type_str=='买币') {
        			if (res.obj.payWay==1) {
        				window.location.href="buy_order_zf.html?"+encryptByDESModeCBC("userId="+theRequest.userId+"&type_str="+type_str+"&orderId="+orderNo+"&statuss="+statuss+"&cnyAmount="+cnyAmount+"&usdtAmount="+usdtAmount);

        			}else if (res.obj.payWay==2) {
        				window.location.href="buy_order_wx.html?"+encryptByDESModeCBC("userId="+theRequest.userId+"&type_str="+type_str+"&orderId="+orderNo+"&statuss="+statuss+"&cnyAmount="+cnyAmount+"&usdtAmount="+usdtAmount);

        			}else{
        				window.location.href="check_order_buy.html?"+encryptByDESModeCBC("userId="+theRequest.userId+"&type_str="+type_str+"&orderId="+orderNo+"&statuss="+statuss+"&cnyAmount="+cnyAmount+"&usdtAmount="+usdtAmount);

        			}
				}else if(type_str=='卖币'){
					window.location.href="check_order_sale.html?"+encryptByDESModeCBC("userId="+theRequest.userId+"&type_str="+type_str+"&orderNo="+orderNo+"&statuss="+statuss+"&cnyAmount="+cnyAmount+"&usdtAmount="+usdtAmount);
				}
        	}
        }
    })
}
function amount(amount){
	var bak=Math.round(amount*100)/100;
    return bak;
}
function returns(){
	window.location.href="../index.html?"+encryptByDESModeCBC("userId="+userIds+"&balance="+balances);  
}
function returns_order(){
	window.location.href="coin_order.html?"+encryptByDESModeCBC("userId="+userIds+"&balance="+balances);  
}
// 安全中心start
function toIndex_myself(){
	setCookie('index_money',2);
	window.location.href="../index.html?"+encryptByDESModeCBC("userId="+userIds+"&balance="+balances);
}
function toIndex_money(){
	setCookie('index_money',1);
	window.location.href="../index.html?"+encryptByDESModeCBC("userId="+userIds+"&balance="+balances);
}
//下载app
$("#downapp").click(function(){
	window.location.href="downapp.html";
});
function toCenter(){
	window.location.href="security_center.html";  
}
//资金密码
$("#recharge_ps").click(function(){
	window.location.href="recharge_ps.html";
});
//身份认证
$("#authentication").click(function(){
	window.location.href="Authentication.html";
});

function f_close(){
	mui('#popover').popover('hide');  
}
function f_closes(){
	mui('#popover').popover('hide');
	var userInfo = {
		"id":theRequest.orderId,//用户id
	};
	var userInfo_str=JSON.stringify(userInfo);
	var userInfo_str_des='["'+encryptByDESModeCBC(userInfo_str)+'"]';
	$.ajax({//订单取消接口
        type: "post",
        crossDomain: true,
        url:urls+"/api/v1/coinBasin/cancelTrade?"+userInfo_str_des,
        dataType:'json',
		contentType : "application/json;charset=utf-8",
        success: function (res) {
        	if (res.code==1) {
        		window.location.href="main_order.html?"+encryptByDESModeCBC("userId="+userIds+"&balance="+balances); 
        	}else{
        	}
        }
    })
	 
}
function f_closess(){
	mui('#popover').popover('hide');
	var userInfo = {
		"id":theRequest.orderId,//用户id
	};
	var userInfo_str=JSON.stringify(userInfo);
	var userInfo_str_des='["'+encryptByDESModeCBC(userInfo_str)+'"]';
	$.ajax({//订单取消接口
        type: "post",
        crossDomain: true,
        url:urls+"/api/v1/coinBasin/cancelTrade?"+userInfo_str_des,
        dataType:'json',
		contentType : "application/json;charset=utf-8",
        success: function (res) {
        	if (res.code==1) {
        		window.location.href="../index.html?"+encryptByDESModeCBC("userId="+userIds+"&balance="+balances); 
        	}else{
        	}
        }
    })
	 
}
//购买按钮
function buys() { 
	var userIds=getCookie("userId");
	$.ajax({
		type: "get",
		crossDomain: true,
		url:urls+'/api/v1/user/userAuth/'+userIds,
		dataType:'json',
		success: function (res) {
			if (res.code == 1) {
				if(res.obj==''||res.obj==null){
					window.location.href="html/Authentication.html";
				}else{
					setCookie("authentication",1);
					var money = $('#moneys').val();//获取购买数量对应的金额
					var nums=$('#nums').val();//获取购买数量
					if(money<200){
						alert("最低输入200.0元");	
					}else{
						window.location.href="html/pay_method.html?"+encryptByDESModeCBC("orderAmount="+money+"&userId="+userIds+"&balance="+balances+"&nums="+nums);
					}	
				}
			} 
		},
	})
	
}
// 余额赋值

//出售按钮
function sales() {
	var userIds=getCookie("userId");
	$.ajax({
		type: "get",
		crossDomain: true,
		url:urls+'/api/v1/user/userAuth/'+userIds,
		dataType:'json',
		success: function (res) {
			if (res.code == 1) {
				if(res.obj==''||res.obj==null){
					window.location.href="html/Authentication.html";
				}else{
					setCookie("authentication",1);
					var money = $('#moneyss').val();//获取出售数量对应的金额
					var nums=$('#numss').val();//获取出售数量
					setCookie("sale_money",money);
					setCookie("sale_num",nums);
					var sale_num=parseInt(balances)-parseInt(nums);
					if (sale_num<0) {
						alert("余额不足！");
					}else{
						if(money<200){
							alert("最低输入200.0元");
						}else{
							window.location.href="html/check_sales.html?"+encryptByDESModeCBC("orderAmount="+money+"&userId="+userIds+"&nums="+nums+"&balance="+balances);
						}	
					}	
				}
			} 
		},
	})
	
}
$('#saled').click(function(){
	time('saled');
	var checkno = $("#checkno").val().trim().length;
	var checkbank = $("#checkbank").val().trim().length;
	var collection_name = $("#checkname").val();
	var collection_bank = $("#checkbank").val();
	var cardno = $("#checkno").val();
	var userIds=getCookie("userId");
	var userInfo = {
	  "bankname": collection_bank,
	  "cardno": cardno,
	  "name": collection_name,
	  "orderAmount": theRequest.nums,
	  "userId": userIds
	}
	console.log(userInfo);
	var userInfo_str=JSON.stringify(userInfo);
	var userInfo_str_des='["'+encryptByDESModeCBC(userInfo_str)+'"]';
	// encodeURIComponent
	var nums=theRequest.nums;
	var numss=balances-nums;
	if (checkbank>1&&checkno>15&&checkno<20) {
		if (numss<0) {
			alert("余额不足！");
		}else{
			$.ajax({
		        type: "post",
		        crossDomain: true,
		        url: urls+"/api/v1/coinBasin/otcWithdraw?"+userInfo_str_des,
		       	dataType:'json',
				contentType : "application/json;charset=utf-8",
		        success: function (res) {
		        	if (res.code==1) {
		        		var users=balances-nums;
						setCookie("balance", users);
						var balancess=getCookie("balance");
		        		window.location.href=encodeURI("myOrder_sale.html?"+encryptByDESModeCBC("orderNo="+res.msg+"&order_money="+theRequest.orderAmount+"&orderAmount="+theRequest.nums+"&name="+collection_name+"&cardno="+cardno+"&bankname="+collection_bank+"&userId="+userIds+"&balance="+balancess));
		        	}else if(res.code==0){
		        		alert(res.msg);
		        	}
		        },
		        error:function(res){
		           alert(res.msg);
		        }
		    })
		}
	}else{
		if (checkbank>1) {
			$('#checkbanks').attr('style','color:#000;');
			$("#checkbank").attr('style','color:#000');
		}else{
			$("#checkbank").val('');
			$("#checkbank").attr('class', 'change');
			$("#checkbank").attr('placeholder', '请输入正确银行信息'); 
		    $("#checkbank").attr('style','color:red;font-size:14px;');
			$('#checkbanks').attr('style','color:red;')
		}
		if (checkno>15&&checkno<20) {
			$('#bankno').attr('style','color:#000;');
			$("#checkno").attr('style','color:#000');
		}else{ 
			$("#checkno").val('');
			$("#checkno").attr('class', 'change');
		    $("#checkno").attr('placeholder', '请输入正确银行信息'); 
		    $("#checkno").attr('style','color:red;font-size:14px;');
			$('#bankno').attr('style','color:red;');
		}
	}	
})
// withdrawAddress; 提币地址
// coinType;币种编号
// withdrawAmount;提币数量
// payPassword;支付密码
// mobileCaptcha;手机验证码
function submit_coin(){
	//提币确定功能
	var address=$("#t_coin_address").val();
	var coinType=getCookie('coinType');
	var userIds=getCookie('userId');
	var t_nums=$("#t_nums").val();
	var money_pwd=$.md5($("#money_pwd").val()).toUpperCase();
	var checkcode =$("#checkcode").val();
	var userInfo = {
		"withdrawAddress":address,
		"coinType":coinType,
		"withdrawAmount":t_nums,
		"payPassword":money_pwd,
		"mobileCaptcha":checkcode,
		"userId":userIds
	};
	console.log(userInfo);
	var userInfo_str=JSON.stringify(userInfo);
	var userInfo_str_des='["'+encryptByDESModeCBC(userInfo_str)+'"]';
	
	$.ajax({
		type: "post",
		crossDomain: true,
		url:urls+'/api/v1/account/withdraw?' +userInfo_str_des,
		dataType:'json',
		contentType : "application/json;charset=utf-8",
		success: function (res) {
			console.log(res);
			if(res.code==1){
				window.location.href="t_coin_order.html";
			}
		},
	})
}
//支持支付方式
function userPayWay(){
	var userIds=getCookie("userId");
	$.ajax({
		type: "get",
		crossDomain: true,
		url:urls+'/api/v1/coinBasin/supportPayWay/' +userIds,
		dataType:'json',
		success: function (res) {
			console.log(res);
			if (res.code==1) {
				setCookie("paybank",res.obj.bank);
				setCookie("payzf",res.obj.zfb);
				setCookie("paywx",res.obj.wx);
			}
		}
	})
}
//已付款
$('#payed').click(function(){
	var orderId=getCookie('orderId');
	$.ajax({
		type: "get",
		url:urls+"/api/v1/coinBasin/otcPayment/"+orderId,
		dataType: 'json',
		success: function (res) {
			if (res.code==1) {
				window.location.href="myOrder_buy.html?"+encryptByDESModeCBC("orderId="+orderId+"&orderAmount="+theRequest.orderAmount+"&nums="+theRequest.nums+"&userId="+userIds);
			}else{
				alert(res.msg);
			}
		}
	})
})
function toOrder(){
	window.location.href="main_order.html?"+encryptByDESModeCBC("userId="+userIds+"&balance="+balances);
}
//倒计时
 function timestampToTime(timestamp) {
   var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
   var Y = date.getFullYear() + '-';
   var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
   var D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' ';
   var h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':';
   var m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()) + ':';
   var s = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds());
	return Y+M+D+h+m+s;
}
function antitime() {
	//在安卓上这样写可以获取到的---结束时间
	 var timess=getCookie("times");
	var time=timestampToTime(timess);
	// var time="2020-12-12 23:59:59";
	//但在苹果手机上是不支持的，必须这样写：
	var to = new Date(time.replace(/-/g,"/"));
	var now = new Date();
	var deltaTime = to.getTime() - now.getTime();
	//超时就停止倒计时
	if (deltaTime <= 0) {
		window.clearInterval(timer);
		return;
	}
	var d= deltaTime / (1000 * 60 * 60 * 24);
	var h = Math.floor(deltaTime / 1000 / 60 / 60 % 24);
	var m = Math.floor(deltaTime / 1000 / 60 % 60);
	var s = Math.floor(deltaTime / 1000 % 60);
	//把时间的数字转成字符串， 如果时分秒不足10， 则前面补0
	// var timeStr = ""+ (h/10>=1?h=h:h="0"+h) + (m/10>=1?m=m:m="0"+m) + (s/10>=1?s=s:s="0"+s);
	var timeStr = "" + (m/10>=1?m=m:m="0"+m) + (s/10>=1?s=s:s="0"+s)
	//console.log(timeStr);
	//each循环遍历.num元素
	$(".dingshi").each(function(index, span) {
		$(span).html(timeStr.substring(index, index+2));
		if(index==1) $(span).html(timeStr.substring(2, 4));
		if(index==2) $(span).html(timeStr.substring(4, 6));
		//$(span).html();这个方法是用来设置span里面的值的
	});
}

//每秒执行一次
var timer = setInterval(antitime, 1000);
//按钮限制3s可点击一次
var wait=3; 
function time(id) {
	if (wait == 0) { 
		$("#"+id).removeAttr("disabled");           
		wait = 3; 
	} else { 
		$("#"+id).attr("disabled","disabled");  
		wait--; 
		setTimeout(function() { 
			time(id) 
		}, 
		1000) 
	} 
} 
//购买方式-去支付按钮接口
function btn_pays(){
	time('btn_payss');
	var customerId =$("input[name='pay_name']").val();
	var customerIds =$("input[name='pay_names']").val();
	var customerIdss =$("input[name='pay_namess']").val();
	var re=/[^\u4e00-\u9fa5]/;
	if (!re.test(customerId)||!re.test(customerIds)||!re.test(customerIdss)){
		var userIds=getCookie("userId");
		var orderAmount=theRequest.orderAmount;
		var payWays=$('input:radio[name="pays"]:checked').val();
		if (payWays==1) {
			setCookie('payWay',3);
			var userInfo = {
			  "customerId": customerId,
			  "orderAmount":orderAmount,
			  // "outUserId": outuids,
			  "payWay": getCookie('payWay'),
			  "userId":userIds
      };
      console.log(userInfo);
			merchantBuy(userInfo,payWays,customerId,orderAmount);
		}else if(payWays==2){
			setCookie('payWay',1);
			var userInfo = {
			  "customerId": customerIds,
			  "orderAmount":orderAmount,
			  // "outUserId": outuids,
			  "payWay": getCookie('payWay'),
			  "userId":userIds
      };
      console.log(userInfo);
			merchantBuy(userInfo,payWays,customerIds,orderAmount);
		}else if(payWays==3){
			setCookie('payWay',2);
			var userInfo = {
			  "customerId": customerIdss,
			  "orderAmount":orderAmount,
			  // "outUserId": outuids,
			  "payWay": getCookie('payWay'),
			  "userId":userIds
      };
      console.log(userInfo);
			merchantBuy(userInfo,payWays,customerIdss,orderAmount);
		}
	}else{
		alert("请输入正确姓名！");
	}
}
function merchantBuy(userInfo,payWays,customerId,orderAmount){
	var userInfo_str=JSON.stringify(userInfo);
	console.log(userInfo_str);
	var userInfo_str_des='["'+encryptByDESModeCBC(userInfo_str)+'"]';
	$.ajax({
		type: "post",
		crossDomain: true,
		url:urls+"/api/v1/coinBasin/merchantBuy?"+userInfo_str_des,
		dataType: 'json',
		contentType: 'application/json; charset=UTF-8',
		success: function (res) {
			console.log(res);
			if (res.code==1) {
				setCookie("orderId",res.obj.id);
				if (payWays==1) {
					window.location.href="pay_bank.html?"+encryptByDESModeCBC("customerId="+customerId+"&orderAmount="+orderAmount+"&userId="
				+userIds+"&nums="+theRequest.nums+"&orderId="+res.obj.id+"&payee="+res.obj.name+"&payee_bank="+res.obj.bankName+"&pay_account="+res.obj.cardNo);
				}else if (payWays==2){
					window.location.href="pay_zf.html?"+encryptByDESModeCBC("customerId="+customerId+"&orderAmount="+orderAmount+"&userId="
				+userIds+"&nums="+theRequest.nums+"&orderId="+res.obj.id+"&userNo="+res.obj.userNo+"&names="+res.obj.name+"&imgUrl="+res.obj.imgUrl);
				}else if (payWays==3) {
					window.location.href="pay_wx.html?"+encryptByDESModeCBC("customerId="+customerId+"&orderAmount="+orderAmount+"&userId="
				+userIds+"&nums="+theRequest.nums+"&orderId="+res.obj.id+"&userNo="+res.obj.userNo+"&names="+res.obj.name+"&imgUrl="+res.obj.imgUrl);
				}
				
			}else if(res.code==0){
				alert(res.msg);
			}
		},
		error:function(res){
		   alert('操作失败');
		}
	})	
}
window.alert = function(msg) {
	var div = document.createElement("div");
	div.innerHTML = "<style type=\"text/css\">"
			+ ".nbaMask { position: fixed; z-index: 1000; top: 0; right: 0; left: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); }                                                                                                                                                                       "
			+ ".nbaMaskTransparent { position: fixed; z-index: 1000; top: 0; right: 0; left: 0; bottom: 0; }                                                                                                                                                                                            "
			+ ".nbaDialog { position: fixed; z-index: 5000; width: 80%; max-width: 300px; top: 50%; left: 50%; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%); background-color: #fff; text-align: center; border-radius: 8px; overflow: hidden; opacity: 1; color: white; }"
			+ ".nbaDialog .nbaDialogHd { padding: .2rem .27rem .08rem .27rem; }                                                                                                                                                                                                                         "
			+ ".nbaDialog .nbaDialogHd .nbaDialogTitle { font-size: 17px; font-weight: 400; }                                                                                                                                                                                                           "
			+ ".nbaDialog .nbaDialogBd { padding: 0 .27rem; font-size: 15px; line-height: 2;text-align:center; word-wrap: break-word; word-break: break-all; color: #000000; }                                                                                                                                          "
			+ ".nbaDialog .nbaDialogFt { position: relative; line-height: 48px; font-size: 17px; display: -webkit-box; display: -webkit-flex; display: flex; }                                                                                                                                          "
			+ ".nbaDialog .nbaDialogFt:after { content: \" \"; position: absolute; left: 0; top: 0; right: 0; height: 1px; border-top: 1px solid #e6e6e6; color: #e6e6e6; -webkit-transform-origin: 0 0; transform-origin: 0 0; -webkit-transform: scaleY(0.5); transform: scaleY(0.5); }               "
			+ ".nbaDialog .nbaDialogBtn { display: block; -webkit-box-flex: 1; -webkit-flex: 1; flex: 1; color: #000; text-decoration: none; -webkit-tap-highlight-color: transparent; position: relative; margin-bottom: 0; }                                                                       "
			+ ".nbaDialog .nbaDialogBtn:after { content: \" \"; position: absolute; left: 0; top: 0; width: 1px; bottom: 0; border-left: 1px solid #e6e6e6; color: #e6e6e6; -webkit-transform-origin: 0 0; transform-origin: 0 0; -webkit-transform: scaleX(0.5); transform: scaleX(0.5); }             "
			+ ".nbaDialog a { text-decoration: none; -webkit-tap-highlight-color: transparent; }"
			+ "</style>"
			+ "<div id=\"dialogs2\" style=\"display: none\">"
			+ "<div class=\"nbaMask\"></div>"
			+ "<div class=\"nbaDialog\">"
			+ "	<div class=\"nbaDialogHd\">"
			+ "		<strong class=\"nbaDialogTitle\"></strong>"
			+ "	</div>"
			+ "	<div class=\"nbaDialogBd\" id=\"dialog_msg2\"></div>"
			+ "	<div class=\"nbaDialogHd\">"
			+ "		<strong class=\"nbaDialogTitle\"></strong>"
			+ "	</div>"
			+ "	<div class=\"nbaDialogFt\">"
			+ "		<a href=\"javascript:;\" class=\"nbaDialogBtn nbaDialogBtnPrimary\" id=\"dialog_ok2\">确定</a>"
			+ "	</div></div></div>";
	document.body.appendChild(div);
 
	var dialogs2 = document.getElementById("dialogs2");
	dialogs2.style.display = 'block';
 
	var dialog_msg2 = document.getElementById("dialog_msg2");
	dialog_msg2.innerHTML = msg;
 
	// var dialog_cancel = document.getElementById("dialog_cancel");
	// dialog_cancel.onclick = function() {
	// dialogs2.style.display = 'none';
	// };
	var dialog_ok2 = document.getElementById("dialog_ok2");
	dialog_ok2.onclick = function() {
		dialogs2.style.display = 'none';
		// callback();
	};
};
// 屏蔽f12
document.onkeydown = function () {
  if (window.event && window.event.keyCode == 123) {
      // alert("F12被禁用");
      event.keyCode = 0;
      event.returnValue = false;
  }
  // if (window.event && window.event.keyCode == 13) {
  //     window.event.keyCode = 505;
  // }
  // if (window.event && window.event.keyCode == 8) {
  //     // alert(str + "\n请使用Del键进行字符的删除操作！");
  //     window.event.returnValue = false;
  // }
}
// 屏蔽右键菜单
document.oncontextmenu = function (event) {
    if (window.event) {
        event = window.event;
    }
    try {
        var the = event.srcElement;
        if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}