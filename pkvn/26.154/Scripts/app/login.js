define(['jquery', 'translate', 'utils', 'aes-handler', 'rsa-handler'], function ($, translate, utils, aes, RSA) {
	return function (rkey) {
		var rsa = new RSA();
		rsa.Init(rkey);

		var txtUsername = $('.SITELOGIN[method=username]');
		var txtPassword = $('.SITELOGIN[method=password]');
		var btnSignIn = $('.SITELOGIN[method=login]');
		
		txtUsername.attr('tabindex', '1').keydown(function (e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				validateLogin();
			}
		});
		txtPassword.attr('tabindex', '2').keydown(function (e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				validateLogin();
			}
		});
		btnSignIn.attr('tabindex', '3').click(function () {
			validateLogin();
		}).closest("form").submit(function (e) {
			e.preventDefault();
		})
		
		function validateLogin() {
			var username = $.trim($('.SITELOGIN[method=username]').val());
			var password = $.trim($('.SITELOGIN[method=password]').val());
			if (username.length == 0) new translate().warning('Username cannot be empty', '', null, LoginAlert);
			else if (password.length == 0) new translate().warning('Password cannot be empty', '', null, LoginAlert);
			else if (username.length > 16) new translate().warning('Username cannot be more than 16 characters', '', null, LoginAlert);
			else if (password.length > 16) new translate().warning('Password cannot be more than 16 characters', '', null, LoginAlert);
			else Login(username, password);
		}

		var normalLogin = true;
		this.ForceLogin = function (username, password) {
			normalLogin = false;
			Login(username, password);
		}

		/*** LOGIN ***/
		function Login(username, password) {
			try {
				localStorage.setItem('username', username);
				var data = new Object();
				data.username = username;
				data.password = password;
				data.key = aes.key();
				var json = JSON.stringify(data);
				var cipher = rsa.Encrypt(json);
				var urlRef = document.referrer;
				var ref = getURLParameter("ref");
				LoginAPI("login", { enc: encodeURIComponent(cipher), urlRef: urlRef, ref: ref, type:"json" }, 'json', loginSuccess, null);
			} catch (e) {
				alert(e);
				new translate().warning('Connection error', '', null, LoginAlertReload);
			}
		}
		function loginSuccess(data) {
			try {
				var plainText = aes.Decrypt(data.enc, data.iv);
			} catch (e) {
				var errCode = data.errcode;
				var errText = data.errtext;
				var result = data.result;
				if (errCode != "0") AlertException(errCode, errText, result);
				return 0;
			}
			var json = $.parseJSON(plainText);
			var errCode = json.errcode;
			var errText = json.errtext;
			var result = json.result;
			switch(errCode) {
				//case "0": window.top.location = '/core/view/main.aspx' + window.location.search;break; //Success
				//case "1005": window.top.location = "/core/SecurityQuestion.aspx" + window.top.location.search; break; //DeviceNotTrusted
				case "0": redirect('/core/view/main.aspx' + window.location.search); break; //Success
				case "1005": redirect('/core/SecurityQuestion.aspx' + window.top.location.search); break; //DeviceNotTrusted
				case "1002": new translate().warning(errText, errCode, null, LoginAlert); break; //LoginFailed
				case "1004": new translate().warning(errText, errCode, null, LoginAlert); break; //IpNotAllowed
				default: new translate().warning(errText, errCode, null, LoginAlertReload);break;
			}
		}

		function redirect(url) {
			if (normalLogin) {
				window.location = url;
			} else {
				if (window.opener != null) {
					window.opener.loginSuccess(aes.key(), url);
					window.top.location = '/app/Thankyou.html?action=close';
				} else {
					window.top.location = '/app/Thankyou.html?action=' + url;
				}
			}
		}

		function LoginAPI(action, params, datatype, success, fail) {
			$.ajax({
				type: 'POST',
				url: '/api/' + action,
				dataType: datatype,
				data: params,
				timeout: 20000,
				beforeSend: function (xhr) {
					$('#login_loading').css('display', 'inline-block');
				},
				complete: function () {
					$('#login_loading').css('display', 'none');
				},
				success: function (data) {
					success(data);
				},
				error: function (xhr, status, error) {
					if (status === 'timeout') new translate().warning('Connection time out', '', null, LoginAlert);
					else if (status === 'abort') new translate().warning('Connection abort', '', null, LoginAlert);
					else if (status === 'parsererror') new translate().warning('Session Expired: ParserError', '', null, LoginAlertReload);
					else if (status === 'error') {
						if (xhr.status == '440') new translate().warning('Session Expired: 440', '', null, LoginAlertReload);
						else if (error.length == 0) new translate().warning('Connection error', '', null, LoginAlert);
						else new translate().warning('ERR: ' + error, '', null, LoginAlertReload);
					}
				}
			});
		}

		function LoginAlert(errCode, errText) {
			alert(errText);
		}
		function LoginAlertReload(errCode, errText) {
			alert(errText);
			location.reload();
		}
		function AlertException(errCode, errText, result) {
			alert(errCode + ": " + errText + "\n" + result);
			location.reload();
		}

		function getCookie(name) {
			var cname = name + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1);
				if (c.indexOf(cname) == 0) return c.substring(cname.length, c.length);
			}
			return null;
		}

		function getURLParameter(name) {
			return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || "";
		}
	}
})