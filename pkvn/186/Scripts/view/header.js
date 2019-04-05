(function (define) {
define(["jquery", "api", "utils"], function ($, api, utils) {
		var requirePage;
		var requireHome;
		return function (loadPage, loadHome) {
			$('#menuLang').hide();
			if (mobile_game_enabled) {
				$('#btn_android_download').show();
				$('#btn_ios_download').show();
				$('#btn_mobile_download').show();
			}
			requirePage = loadPage;
			requireHome = loadHome;
			api.Message(messageSuccess, totalCreditFail);
			api.POST('/api/totalCredit', "", totalCreditSuccess, totalCreditFail);
			setupMenu();
			setupLang();
			setupButtons();
			$('#txtUsername').html(localStorage.getItem('username'));
			if (!isMobile) $('#btnLogout > div').css('background', 'url("/core/Images/icons/power_' + fontColor + '.png") no-repeat 5px 4px');
		}

		function setupLang() {
			$(document).click(function (e) {
				if (e.target.id != 'btnLanguage' && e.target.id != 'langSelected' && e.target.id !="imgLanguage") {
					$("#menuLang").hide();
				}
			});
			setLangIcon(utils.GetCookie('lang') || utils.GetCurrentUrlParam('lang') || "en-us");
			$('#btnLanguage').click(function () {
				if ($('#menuLang').css('display') == 'block')
					$('#menuLang').css('display', 'none');
				else
					$('#menuLang').css('display', 'block');
			})
			$('.menuItemLang').click(function (e) {
				var lang = $(this).attr('lang');
				showHideMenuItem($(this), e, lang);
				setLangIcon(lang);
			})
			$('#menuItemLang').blur(function () {
				$('#menuLang').css('display', 'none');
			})
		}
		function setLangIcon(lang) {
			$('#langSelected').attr('class', 'flag flag_' + lang);
			$('#lang_' + lang).css('display', 'none');
		}
		function showHideMenuItem(item, e, lang) {
			e.stopPropagation();
			$('.menuItemLang').css('display', 'block');
			$('#menuLang').css('display', 'none');
			utils.SetCookie('lang', lang, 365);
			var param = window.location.search;
			if (new RegExp("(lang=)(.*)").test(param))
				param = window.location.search.replace(/(lang=)(.*)/, '$1no');
			else
				param = param.length == 0 ? "?lang="+lang : param + "&lang=" + lang;
			location.search = param;
		}
	
		function setupMenu() {
			$('#menuHome').click(function () { requireHome(); $("#menuBar").slideToggle(400); })
			$('#menuAccount').click(function () { requirePage('account'); $("#menuBar").slideToggle(400); })
			$('#menuStatement').click(function () { requirePage('statement'); $("#menuBar").slideToggle(400); })
			$('#menuExchange').click(function () { requirePage('currency'); $("#menuBar").slideToggle(400); })
			$('#menuPassword').click(function () { requirePage('password'); $("#menuBar").slideToggle(400); })
			$('#menuDeposit').click(function () { requirePage('deposit'); $("#menuBar").slideToggle(400); })
			$('#menuWithdraw').click(function () { requirePage('withdraw'); $("#menuBar").slideToggle(400); })
			$('#menuReferral').click(function () { requirePage('referral'); $("#menuBar").slideToggle(400); })
		}

		function setupButtons() {
			$('#btnRefreshCredit').click(function () {
				api.POST('/api/totalCredit', "", totalCreditSuccess, totalCreditFail);
			})
			$('#btnLogout').click(function () {
				api.POST('/api/logout', "", logoutSuccess, logoutfail);
			})
			$('#btnLivechat').click(function () {
				utils.PopUpPingBox('/app/livechat.html');
			})
			$('#btnMenu').click(function () {
				$("#menuBar").slideToggle(400);
			})
		}
		//logout
		function logoutSuccess(result, errCode, errText) {
			utils.Logout();
		}
		function logoutfail(errCode, errText) {
			utils.Logout();
		}
		//message
		function messageSuccess(result, errCode, errText) {
			var newMessage = $('#message').clone().html(result);
			$('#message').replaceWith(newMessage);
		}
		function messageFail(errCode, errText) {
			console.log(errCode + "|" + errText);
		}

		//API callback
		function totalCreditSuccess(result, errCode, errText) {
			var json = $.parseJSON(result);
			$('#txtCurrency').html(json.curcode);
			$('#txtCredit').html(json.totalCredit);
		}
		function totalCreditFail(errCode, errText) {}
})
}(myGlobalRequire.define));