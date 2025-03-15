
function loginSuccess(key, url) {
	sessionStorage.setItem("key", key);
	window.location = url;
}

var allow = true;
try { if (window.top.location.hostname !== window.location.hostname) { checkIframe(); } }
catch (err) { checkIframe(); }

function checkIframe() {
	if (sessionStorage.getItem('referrer') == null)
		sessionStorage.setItem('referrer', document.referrer);

    var iframe = 'off';
    try { iframe = document.querySelector('script[data-iframe]').getAttribute('data-iframe').toLowerCase(); } catch (err) { }
    if (iframe == 'off') {
        if (window.self !== window.top) {
            allow = false;
            location.href = '/app/img/blank.html';
        }
    } else if (iframe == 'all') {
        allow = true;
    } else {
        if (window.self !== window.top) {
            allow = false;
            var whitelist = iframe.split(',');
            for (var i = 0; i < whitelist.length; i++) {
                if (whitelist[i].trim().length > 0) {
                    var regexForm = '(' + whitelist[i].trim().replace('.', '\.').replace('-', '\-') + ')';
                    var regex = new RegExp(regexForm);
                    allow = sessionStorage.getItem('referrer').search(regex) != -1;
                    if (allow) break;
                }
            }
            if (!allow) location.href = '/app/img/blank.html';
        }
    }
}

function isMobile() {
    if (!allow) return;
    var isMobile = false;
	
	//skip main site iframe page
    var mobile = "auto";
    if (window.self !== window.top) {
    	try{
    		if (window.top.location.hostname == window.location.hostname) return false;
    	} catch (e) {
    		mobile = "auto";
    	}
    }


    try {
        mobile = decodeURIComponent((new RegExp('[?|&]mobile=([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || 'auto';
    } catch (err) { }
    var param = window.location.search;
    if (!new RegExp("(mobile=)(.*)").test(param))
        param = param.length == 0 ? "?mobile=" + mobile : param + "&mobile=" + mobile;
	var isMobileDevice = mobile == "auto" && (/Mobi/i).test(navigator.userAgent);
	if (mobile == "force" || (isMobileDevice && !disableAutoMobile)) {
		isMobile = true;
		location.href = "/m/" + param;
	}
	return isMobile;
}


if (allow && !isMobile()) {

	(function (require) {
		require(['jquery', 'login', "/info/site?noext", 'translate', 'utils'], function ($, login, info, translate, utils) {
			/***API***/
			var API = function () {
				function jackpot(data, site, starting_amount) {
					var delay = 700000;
					var jackpots = {};
					var timer = null;
					function set_jackpot(site, jackpot, total, amount) {
						var jackpot = jackpot + amount;
						var jump = utils.AddCommas(parseInt(jackpot));
						var separator = $('.SITEAPI[method="jackpot"][param="' + site + '"]').attr('separator');
						if (typeof separator != "undefined") jump = jump.replace(/,/g, separator);
						$('.SITEAPI[method="jackpot"][param="' + site + '"]').html(jump);
						return jackpot;
					}
					function pull() {
						var total = $(data).find('result').find(site).text();
						total = parseInt(total.replace(/,/g, ''));
						//if (starting_amount > 0 && starting_amount > total) {
						if (starting_amount > 0) {
							total = starting_amount;
						}
						if (!jackpots[site]) jackpots[site] = parseInt(total - 134700);
						jackpots[site] = jackpots[site] > 0 ? jackpots[site] : 0;
						var amount = 134700 / delay * 20;
						timer = setInterval(function () { jackpots[site] = set_jackpot(site, jackpots[site], total, amount); }, 20);
					};
					return pull();
				}

				function table(action, xml, index, length) {
					if (!index) index = 0;
					if (!length) length = 10
					if (index)
						var tbl = $('.SITEAPI[method="' + action + '"][start="' + (index + 1) + '"]');
					else
						var tbl = $('.SITEAPI[method="' + action + '"]');
					var tr_num = 0;
					var count = 0;
					xml.each(function () {
						count++;
						if (count > index && count <= index + length) {
							//create table
							tr_num++;
							var name = $(this).find('name').text();
							var date = $(this).find('date').text();
							if (date.indexOf('-') == -1) date = utils.MonthDay($(this).find('date').text().split(' ')[0]);
							var amt = $(this).find('amount').text();
							amt = utils.AddCommas(amt);
							tbl.find('tbody > tr:nth-child(' + tr_num + ') .name').html(name);
							tbl.find('tbody > tr:nth-child(' + tr_num + ') .date').html(date);
							tbl.find('tbody > tr:nth-child(' + tr_num + ') .amt').html(amt);
							//create single record
							var actionSub = action.split('-');
							if (actionSub[2] == count.toString()) {
								if (actionSub[1] == "name") $('.SITEAPI[method="' + action + '"]').html(name);
								else if (actionSub[1] == "date") $('.SITEAPI[method="' + action + '"]').html(date);
								else if (actionSub[1] == "amt") $('.SITEAPI[method="' + action + '"]').html(amt);
							}
						}
					})
				}

				var public = {};
				public.everything = function (subActions) {
					if (subActions.length == 0) return;
					$.ajax({
						type: "GET",
						url: "/api.aspx?action=everything&subAction=" + subActions,
						datatype: "xml",
						success: function (data) {
							var result = $(data).find('result').find('jackpot_winners');
							var winner = result.find('winner');
							winner.find('amount').each(function () {
								$(this).text(parseInt($(this).text()) * 100);
							})
							$('.SITEAPI').each(function () {
					    		var action = $(this).attr('method');
					    		var actionType = action.split('-')[0];
								var param = $(this).attr('param');
								var starting_amount = 0;
								if (actionType == 'jackpot') {
									var range = $(this).attr('range');
									console.log(param + "," + range)
									range = $.trim(range);
									if (range.length > 3) {
										var min_max = range.split(',');
										if (min_max.length == 2) {
											var min = parseInt(min_max[0]);
											var max = parseInt(min_max[1]);
											starting_amount = parseInt(Math.random() * (max - min) + min);
										}
									}
								}
								param = (typeof param != 'undefined') ? param : null;
								switch (actionType) {
									case 'jackpot': jackpot(data, param, starting_amount); break;
									case 'message': public.Message(data); break;
									case 'deposit': public.Deposits(data, action); break;
									case 'withdraw': public.Withdraws(data, action); break;
									case 'top_winners': public.TopWinners(data, action, $(this).attr('start')); break;
									case 'top_referrals': public.TopReferrals(data, action); break;
									case 'jackpot_winners': public.JackpotWinners(data, action); break;
								}
							})
						}
					});
				}
				public.Jackpot = function (txt_id, site) {
					jackpot(null, txt_id, site);
				}
				public.Message = function (data) {
					var result = $(data).find('result').find('message').text();
					var marquee = $('.SITEAPI[method="message"]');
					var newMessage = marquee.clone().html(result);
					marquee.replaceWith(newMessage);
				}
				public.Deposits = function (data, action) {
					var result = $(data).find('result').find('deposits');
					var deposit = result.find('deposit');
					table(action, deposit);
				}
				public.Withdraws = function (data, action) {
					var result = $(data).find('result').find('withdraws');
					var withdraw = result.find('withdraw');
					table(action, withdraw);
				}
				public.TopWinners = function (data, action, start) {
					var result = $(data).find('result').find('top_winners');
					var winner = result.find('winner');
					table(action, winner, parseInt(start) - 1);
				}
				public.TopReferrals = function (data, action) {
					var result = $(data).find('result').find('top_referrals');
					var referral = result.find('referral');
					table(action, referral);
				}
				public.JackpotWinners = function (data, action) {
					var result = $(data).find('result').find('jackpot_winners');
					var winner = result.find('winner');
					//winner.find('amount').each(function () {
					//	$(this).text(parseInt($(this).text()) * 100);
					//})
					table(action, winner);
				}
				return public;
			};

			$(document).ready(function () {
				lang = utils.GetCurrentUrlParam('lang') || info.defaultLang;
				utils.SetCookie('lang', lang, 365);
				if (document.referrer.length == 0 || utils.ParseUrl(document.referrer).hostname != location.hostname) {
					sessionStorage.setItem("ref", utils.GetCurrentUrlParam('ref'));
				}

				try {
					login(info.rkey);
				} catch (err) {
					new translate().warning('Session Expired:failed loading login script', '', null, LoginAlertReload);
				}

				function LoginAlertReload(errCode, errText) {
					alert(errText);
					location.reload();
				}

				/*** Register ***/
				var btnReg = $('.SITELOGIN[method=register]');
				if (btnReg.prop('tagName') == 'A') btnReg.attr('href', 'javascript:void(0)').removeAttr('target');
				btnReg.click(function () {
					urlRef = utils.GetCurrentUrlParam('ref');
					var sessionRef = sessionStorage.getItem('ref');
					if (urlRef == null && sessionRef != null && sessionRef != "null")
						urlRef = sessionRef;
					var ref = urlRef ? '&ref=' + urlRef : '';
					utils.PopupCenter('/Register.aspx?lang=' + lang + ref, "Register Account", 800, 600);
				}).css({ 'cursor': 'pointer', 'visibility': 'visible' });

				/*** Forgot Pass ***/
				var btnForgot = $('.SITELOGIN[method=forgotpass]');
				if (btnForgot.prop('tagName') == 'A') btnForgot.attr('href', 'javascript:void(0)').removeAttr('target');
				btnForgot.click(function () {
					utils.PopupCenter('/ForgetPass.aspx?lang=' + lang, "Forgot Password", 800, 400);
				}).css({ 'cursor': 'pointer', 'visibility': 'visible' });

				/*** Live Chat ***/
				var btnChat = $('.SITELOGIN[method=chat]');
				if (btnChat.prop('tagName') == 'A') btnChat.attr('href', 'javascript:void(0)').removeAttr('target');
				btnChat.click(function () {
					utils.PopupCenter('/app/livechat.html', 'Live Chat', 460, 300);
				}).css({ 'cursor': 'pointer', 'visibility': 'visible' });

				/*** Sign In ***/
				var btnSignIn = $('.SITELOGIN[method=login]');
				var signInTag = btnSignIn.prop('tagName');
				if (signInTag == 'A') btnSignIn.attr('href', 'javascript:void(0)').removeAttr('target');
				btnSignIn.css({ 'cursor': 'pointer', 'visibility': 'visible' });
			
				var api = new API();
				/***WContent***/
				// $.getJSON("/info/wcontent", function (data) {
				// 	var elem = document.getElementsByTagName("*");
				// 	for (var i = 0; i < elem.length; i++) {
				// 		var attrs = elem[i].attributes;
				// 		for (var m = 0; m < attrs.length; m++) {
				// 			if (attrs[m].nodeName.indexOf('wcontent') === 0) {
				// 				var attrName = attrs[m].nodeName.split('-');
				// 				if (attrName.length > 1)
				// 					elem[i].setAttribute(attrName[1], data[attrs[m].nodeValue]);
				// 				else
				// 					elem[i].innerHTML = data[attrs[m].nodeValue];
				// 			}
				// 		}
				// 	}
				// });

				/***API***/
				var subActions = "";
				$('.SITEAPI').each(function () {
					var action = $(this).attr('method').split('-')[0];
					var param = $(this).attr('param');
					param = (typeof param != 'undefined') ? param : null;
					if (action == 'deposit' || action == 'withdraw') subActions = appendAction(subActions, 'payment_history', param);
					else subActions = appendAction(subActions, action, param);
				})
				function appendAction(subActions, action, param) {
					var subAction = action + (param ? (':' + param) : '');
					if (subActions.indexOf(subAction) > -1) return subActions;
					return subActions += (subActions.length > 0 ? ',' : '') + subAction;
				}
				api.everything(subActions);
			})
		}, function (err) {
			var failedId = err.requireModules && err.requireModules[0];
			alert('Failed to load ' + failedId);
			location.reload();
		});
	}(myGlobalRequire.require));
}