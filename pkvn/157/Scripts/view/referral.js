define(["jquery", "api", "translate"], function ($, api, translate) {

	//register events
	return function () {
		getRef();
		$('#btnRefSubmit').click(setRef);
	}

	//get
	function getRef() {
		api.POST('/api/getReferral', '', getRefSuccess, getRefFail);
	}
	function getRefSuccess(result, errCode, errText) {
		//console.log(result);
		var json = $.parseJSON(result);
		if (json.exist == "1") {
			$('#tblReferralCreate').css('display', 'none');
			$('#tblReferralView').css('display', 'table');
		} else {
			$('#tblReferralCreate').css('display', 'table');
			$('#tblReferralView').css('display', 'none');
		}
		$('#txtRefCode').val(json.code);
		$('#txtRefUrl').val(location.protocol + "//" + location.host + "/?ref=" + json.code);
		$('#btnRefRegister').attr('href', $('#txtRefUrl').val());
		var refCode = Math.floor((Math.random() * 100000) + 899999);
		$('#txtCreateRefCode').val(refCode);
		
		if (json.referral.length > 0) {
			$('#tblReferralList').css('display', 'table');
			var referralList = json.referral.split(',');
			var referralListTbl = "";
			for (var i = 0; i < referralList.length; i++)
				referralListTbl += "<tr><td>" + referralList[i] + "</td></tr>";
			$('#tblReferralList tbody').html(referralListTbl);
		}
	}
	function getRefFail(errCode, errText) {
		console.log(errCode + ":" + errText);
	}

	//set
	function setRef() {
		var data = new Object();
		data.code = $('#txtCreateRefCode').val();
		var json = JSON.stringify(data);
		api.POST('/api/setReferral', json, setRefSuccess, setRefFail);
	}
	function setRefSuccess(result, errCode, errText) {
		if (result == "1") {
			$('#tblReferralCreate').css('display', 'none');
			$('#tblReferralView').css('display', 'table');
			var refCode = $('#txtCreateRefCode').val();
			$('#txtRefCode').val(refCode);
			$('#txtRefUrl').val(location.protocol + "//" + location.host + "/Register.aspx?ref=" + refCode);
			$('#btnRefRegister').attr('href', $('#txtRefUrl').val());
		}
	}
	function setRefFail(errCode, errText) {
		console.log(errCode + ":" + errText);
	}
})