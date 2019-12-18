var LoadPage;

(function (require) {
	require(["jquery", "api", "translate", "utils"], function ($, api, translate, utils) {
		var single_login_count = 0;

		$(document).ready(function () {
			alert($('#DisableAutoMobileSite').val());
			singleLogin(1);
			$('.error').click(function () {location.reload();})
			try {
				var mobile = decodeURIComponent((new RegExp('[?|&]mobile=([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
				if (mobile == "force") {
					loadMobile();
				} else if (mobile != null && (/Mobi/i).test(navigator.userAgent)) {
					switch (mobile) {
						case "auto":
							loadMobile();
							break;
						default:
							loadDesktop();
					}
				} else {
					loadDesktop();
				}
			} catch (err) {
				alert(err);
				loadDesktop();
			}
		})

		function loadMobile() {
			isMobile = true;
			requireHeader('mheader', 'header');
			requireHome();
		}
		function loadDesktop() {
			isMobile = false;
			requireHeader('header', 'header');
			requireHome();
		}
	
		function singleLogin(mins) {
			//single_login_count++;
			var data = new Object();
			//if (single_login_count < 15) {
			//	data.udateOnline = '0';
			//} else {
			//	single_login_count = 0;
			//	data.udateOnline = '1';
			//}
			data.updateOnline = '1';
			var json = JSON.stringify(data);
			api.POST('/api/singleLogin', json, singleLoginSuccess, singleLoginFail);
			setTimeout(function () { singleLogin(mins) }, mins * 60000);
		}
		function singleLoginSuccess(result, errCode, errText) {
				version = result;
		}
		function singleLoginFail(errCode, errText) {
			alert(errText);
			utils.Logout();
		}

		//load page content
		function requireHeader(pageName, scriptName) {
			$('#page_loading').css('display', 'inline-block');
			require(['text!' + pageName + 'Page', scriptName], function (page, script) {
				$('#header').html(page); script(requireMain, requireHome);
				$('#page_loading').css('display', 'none');
				translate();
			}, function (err) {
				$('#page_loading').css('display', 'none');
				$('#errorBox').html('Connection timeout').css('display', 'block');
			});
		}
		function requireHome() {
			$('#errorBox').css('display', 'none');
			$('#page_loading').css('display', 'inline-block');
			require(["text!homePage", 'home'], function (page, script) {
				$('#main').html(page); script();
				if (typeof(InitHome) === typeof(Function)) InitHome();
				$('#page_loading').css('display', 'none');
				if (isMobile) $('.desktopItem').css('display', 'none');
				translate();
			}, function (err) {
				$('#page_loading').css('display', 'none');
				$('#errorBox').html('Connection timeout').css('display', 'block');
			});
		}
		//TODO: define in main.aspx
		function requireMain(pageName) {
			$('#errorBox').css('display', 'none');
			$('#page_loading').css('display', 'inline-block');
			require(["text!" + pageName + 'Page', pageName], function (page, script) {
				$('#main').html(page); script();
				$('#page_loading').css('display', 'none');
				translate();
			}, function (err) {
				$('#page_loading').css('display', 'none');
				$('#errorBox').html('Connection timeout').css('display', 'block');
			});
		}

		LoadPage = requireMain;
	}, function (err) {
		var failedId = err.requireModules && err.requireModules[0];
		alert('Failed to load ' + failedId);
		location.reload();
	});
}(myGlobalRequire.require));