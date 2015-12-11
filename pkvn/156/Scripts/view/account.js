define(["jquery", "api", "translate"], function ($, api, translate) {
	return function () {
		api.POST('/api/getAccInfo', "", accountSuccess, accountFail);
	}

	function accountSuccess(result, errCode, errText) {
		var json = $.parseJSON(result);
		$('#txtAccUsername').html(json.username);
		$('#txtAccCurrency').html(json.currency);
		$('#txtAccFullname').html(json.fullname);
		$('#txtAccContact').html(json.contact);
		$('#txtAccEmail').html(json.email);
	}
	function accountFail(errCode, errText) {
		console.log(errCode + ":" + errText);
	}
})