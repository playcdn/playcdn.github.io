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
					allow = document.referrer.search(regex) != -1;
					if (allow) break;
				}
			}
			if (!allow) location.href = '/app/img/blank.html';
		}
	}
}

if (allow) {
	(function (require) {
		require(['jquery', "/info/site?noext", 'translate', 'utils'], function ($, info, translate, utils) {
			$(document).ready(function () {
				lang = utils.GetCurrentUrlParam('lang') || info.defaultLang;
				utils.SetCookie('lang', lang, 365);
				var param = window.location.search;
				if (new RegExp("(mobile=)(.*)").test(param))
					param = param.replace(/(mobile=)[^\&]+/, '$1force');
				else
					param = param.length == 0 ? "?mobile=force" : param + "&mobile=force";
				$('#frameMain').attr('src', '/m/Main.aspx' + param);

				$('#btnMenu').click(function () {
					$("#menuBar").slideToggle(400);
				})

				/*** Main ***/
				var btnMain = $('#btnMain');
				if (btnMain.prop('tagName') == 'A') btnMain.attr('href', 'javascript:void(0)').removeAttr('target');
				btnMain.click(function () {
					$('#frameMain').attr('src', '/m/Main.aspx' + param);
					$("#menuBar").slideToggle(400);
				}).css({ 'cursor': 'pointer', 'visibility': 'visible' });

				/*** Register ***/
				var btnRegister = $('#btnRegister');
				if (btnRegister.prop('tagName') == 'A') btnRegister.attr('href', 'javascript:void(0)').removeAttr('target');
				btnRegister.click(function () {
					$('#frameMain').attr('src', '/Register.aspx' + param);
					$("#menuBar").slideToggle(400);
				}).css({ 'cursor': 'pointer', 'visibility': 'visible' });

				/*** Live Chat ***/
				var btnChat = $('#btnLivechat');
				if (btnChat.prop('tagName') == 'A') btnChat.attr('href', 'javascript:void(0)').removeAttr('target');
				btnChat.click(function () {
					//$('#frameMain').attr('src', '/app/livechat.html');
					utils.PopUpPingBox('/app/livechat.html');
					$("#menuBar").slideToggle(400);
				}).css({ 'cursor': 'pointer', 'visibility': 'visible' });

				/*** Download ***/
				var btnDownload = $('#btnDownload');
				if (btnDownload.prop('tagName') == 'A') btnDownload.attr('href', 'javascript:void(0)').removeAttr('target');
				btnDownload.click(function () {
					$('#frameMain').attr('src', '/app/Home0.aspx' + param);
					$("#menuBar").slideToggle(400);
				}).css({ 'cursor': 'pointer', 'visibility': 'visible' });

				/*** Sign In ***/
				var btnSignIn = $('.SITELOGIN[method=login]');
				var signInTag = btnSignIn.prop('tagName');
				if (signInTag == 'A') btnSignIn.attr('href', 'javascript:void(0)').removeAttr('target');
				btnSignIn.css({ 'cursor': 'pointer', 'visibility': 'visible' })
			})
		}, function (err) {
			alert("default0");
			var failedId = err.requireModules && err.requireModules[0];
			alert('Failed to load ' + failedId);
			location.reload();
		});

	}(myGlobalRequire.require));
}