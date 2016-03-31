var allow = true;
try { if (window.top.location.hostname !== window.location.hostname) { checkIframe(); } }
catch (err) { checkIframe(); }

function checkIframe() {
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

if (allow) {
	(function (require) {
		require(['jquery', 'login', "/info/site?noext", 'translate', 'utils'], function ($, login, info, translate, utils) {
			/***API***/
			var API = function () {
				function jackpot(data, site) {
					var delay = 700000;
					var jackpots = {};
					var timer = null;
					function set_jackpot(site, jackpot, total, amount) {
						var jackpot = jackpot + amount;
						var jump = utils.AddCommas(parseInt(jackpot));
						$('.SITEAPI[method="jackpot"][param="' + site + '"]').html(jump);
						return jackpot;
					}
					function pull() {
						var total = $(data).find('result').find(site).text();
						total = parseInt(total.replace(/,/g, ''));
						if (!jackpots[site]) jackpots[site] = parseInt(total - 134700);
						jackpots[site] = jackpots[site] > 0 ? jackpots[site] : 0;
						var amount = 134700 / delay * 50;
						timer = setInterval(function () { jackpots[site] = set_jackpot(site, jackpots[site], total, amount); }, 50);
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
							tr_num++;
							var name = $(this).find('name').text();
							var date = utils.MonthDay($(this).find('date').text().split(' ')[0]);
							var amt = utils.AddCommas($(this).find('amount').text());
							tbl.find('tbody > tr:nth-child(' + tr_num + ') .name').html(name);
							tbl.find('tbody > tr:nth-child(' + tr_num + ') .date').html(date);
							tbl.find('tbody > tr:nth-child(' + tr_num + ') .amt').html(amt);
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
							$('.SITEAPI').each(function () {
								var action = $(this).attr('method');
								var param = $(this).attr('param');
								param = (typeof param != 'undefined') ? param : null;
								switch (action) {
									case 'jackpot': jackpot(data, param); break;
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
					winner.find('amount').each(function () {
						$(this).text(parseInt($(this).text()) * 100);
					})
					table(action, winner);
				}
				return public;
			};

			$(document).ready(function () {
				/***PREPARE LOGIN***/
				//if (window != top) top.location.href = location.protocol + "//" + location.host;
				$('head').prepend('<style>.loading{padding:3px;background:#ebebeb;display:none;}.loading > div { border:1px solid #383838;padding:5px 10px; }.loading > div > div{display:inline-block;vertical-align:middle}</style>');
				$('body').prepend('<div style="width:100%;position:fixed;top:0;left:0;text-align:center;z-index:999"><div id="login_loading" class="loading"><div style="display:inline-block"><div style="margin-right:5px;width:16px;height:16px;"><img src="/core//Images/loading.gif" /></div><div>loading...</div></div></div></div>');
				lang = utils.GetCurrentUrlParam('lang') || info.defaultLang;
				try {
					login(info.rkey);
				} catch (err) {
					console.log(err);
					new translate().warning('Session Expired:failed loading login script', '', null, LoginAlertReload);
				}

				translate();

				function LoginAlertReload(errCode, errText) {
					alert(errText);
					location.reload();
				}

				var api = new API();
				/***WContent***/
				$.getJSON("/info/wcontent", function (data) {
					var elem = document.getElementsByTagName("*");
					for (var i = 0; i < elem.length; i++) {
						var attrs = elem[i].attributes;
						for (var m = 0; m < attrs.length; m++) {
							if (attrs[m].nodeName.indexOf('wcontent') === 0) {
								var attrName = attrs[m].nodeName.split('-');
								if (attrName.length > 1)
									elem[i].setAttribute(attrName[1], data[attrs[m].nodeValue]);
								else
									elem[i].innerHTML = data[attrs[m].nodeValue];
							}
						}
					}
				});

				/***API***/
				var subActions = "";
				$('.SITEAPI').each(function () {
					var action = $(this).attr('method');
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

				/*** Sign In ***/
				var btnSignIn = $('.SITELOGIN[method=login]');
				var signInTag = btnSignIn.prop('tagName');
				if (signInTag == 'A') btnSignIn.attr('href', 'javascript:void(0)').removeAttr('target');
				btnSignIn.css({ 'cursor': 'pointer', 'visibility': 'visible' })

				/*** Register ***/
				var btnRegister = $('.SITELOGIN[method=register]');
				if (btnRegister.prop('tagName') == 'A') btnRegister.attr('href', 'javascript:void(0)').removeAttr('target');
				btnRegister.click(function () {
					location.href = '/Register.aspx' + location.search;
				}).css({ 'cursor': 'pointer', 'visibility': 'visible' });

				/*** Desktop ***/
				var btnDesktop = $('.SITELOGIN[method=desktop]');
				if (btnDesktop.prop('tagName') == 'A') btnDesktop.attr('href', 'javascript:void(0)').removeAttr('target');
				btnDesktop.click(function () {
					var param = window.location.search;
					if (new RegExp("(mobile=)(.*)").test(param))
						param = param.replace(/(mobile=)[^\&]+/, '$1off');
					else
						param = param.length == 0 ? "?mobile=off" : param + "&mobile=off";
					top.window.location.href = "http://" + window.location.host + "/" + param;
				}).css({ 'cursor': 'pointer', 'visibility': 'visible' });
			})
		}, function (err) {
			alert("default0");
			var failedId = err.requireModules && err.requireModules[0];
			alert('Failed to load ' + failedId);
			location.reload();
		});

	}(myGlobalRequire.require));
}