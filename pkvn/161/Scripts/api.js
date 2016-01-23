(function (define) {
	define(["jquery", "translate", "utils", "aes-handler"], function ($, translate, utils, aes) {
		var public = {};

		function ajax(type, action, dataType, encrypt, json, successFunc, failFunc) {
			var params = json;
			if (encrypt && $.trim(json).length > 0) {
				var cipher = aes.Encrypt(json);
				params = { enc: encodeURIComponent(cipher), iv: aes.iv };
			}

			$.ajax({
				type: type,
				url: action,
				data: params,
				timeout: 20000,
				beforeSend: function () {
					$('#ajax_loading').css('display', 'inline-block');
					if (action != '/api/singleLogin')
						$('#errorBox').css('display', 'none');
				},
				complete: function () {
					$('#ajax_loading').css('display', 'none');
				},
				success: function (data) {
					var plainText = data;
					try {
						if (encrypt) {
							var json = $.parseJSON(plainText);
							plainText = aes.Decrypt(json.enc, json.iv);
						}
						if (dataType == 'json') {
							var json = plainText;
							if (encrypt) json = $.parseJSON(plainText);
							var errCode = json.errcode;
							var errText = json.errtext;
							var result = json.result;
						}
						else if (dataType == 'xml') {
							var xml = $(plainText);
							if (encrypt) xml = $($.parseXML(plainText));
							var result = $(xml).find('result').text();
							var errCode = $(plainText).find('errcode').text();
							var errText = $(plainText).find('errtext').text();
						}
					} catch (err) {
						//var errCode = json.errcode;
						//var errText = json.errtext;
						//var result = json.result;
						//if (errCode.length == 4) {
						//    new translate().warning("Session Expired", "", null, AlertError);
						//} else {
							if (action != '/api/singleLogin')
								ShowApiException(errCode, errText, result);
							else
								utils.Logout();
						//}
						return;
					}

					if (errCode != "0" && failFunc != null) {
						new translate().warning(errText, errCode, failFunc, ShowApiError);
					} else if (successFunc != null) {
						successFunc(result, errCode, errText);
					}
				},
				error: function (xhr, status, error) {
					if (action != '/api/singleLogin') ShowApiError(status, error);
					//$('.error').css('display', 'inline-block');
				}
			});
		}
		function AlertError(errCode, errText) {
			alert(errText);
			utils.Logout();
		}
		function ShowAjaxError(errCode, errText) {
			$('.errMsg').html(errText);
			$('.error').css('display', 'inline-block');
		}
		function ShowApiError(errCode, errText) {
			$('#errorBox').html(errText).css('display', 'block');
		}
		function ShowApiException(errCode, errText, errResult) {
			$('#errorBox').html(errCode + ": " + errText + "<br\>" + errResult).css('display', 'block');
		}
		
		public.GET = function (action, json, successFunc, failFunc) {
			ajax('GET', action, 'json', true, json, successFunc, failFunc);
		}

		public.POST = function (action, json, successFunc, failFunc) {
			ajax('POST', action, 'json', true, json, successFunc, failFunc);
		}

		public.Message = function (successFunc, failFunc) {
			ajax('POST', '/api.aspx?action=message', 'xml', false, '', successFunc, failFunc);
		}

		return public;
	
	})
}(myGlobalRequire.define));