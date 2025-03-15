(function (define) {
	define(["jquery", "api", "translate", "utils"], function ($, api, translate, utils) {

		//register events
		return function (translation) {
			getWithdraw();
			$('#btnWithdrawSubmit').click(setWithdraw);
		}

		function ShowMinWD(code, msg){		
			$('#lblWithdrawMinDepo').html('(' + msg + ')');
		}

		//get
		function getWithdraw() {
			api.POST('/api/getWithdraw', '', getWithdrawSuccess, getWithdrawFail);
		}
		function getWithdrawSuccess(result, errCode, errText) {
			var json = $.parseJSON(result);
			if (json.PendingReq.BankName == "") {
				$('#tblWithdrawInner').css('display', 'table');
				$('#tblWithdrawBoard').css('display', 'table');
				$('#tblDespositPending').css('display', 'none');
				new translate().warning('Min|' + utils.AddCommas(json.BankInfo.MinLimit), '', null, ShowMinWD);
				$('#txtWithdrawBankName').val(json.BankInfo.BankName);
				$('#txtWithdrawAcctName').val(json.BankInfo.AccName);
				$('#txtWithdrawAccNum').val(json.BankInfo.BankAcc);
				$('#txtWithdrawAmount').val(json.BankInfo.MaxLimit);
			} else {
				$('#tblWithdrawInner').css('display', 'none');
				$('#tblWithdrawBoard').css('display', 'none');
				$('#tblDespositPending').css('display', 'table');
				$('#txtWithdrawBank').html(json.PendingReq.BankName);
				$('#txtWithdrawAccName').html(json.PendingReq.AccName);
				$('#txtWithdrawPendingAccNum').html(json.PendingReq.BankAcc);
				$('#txtWithdrawAmt').html(json.PendingReq.Amt);
				$('#txtWithdrawStatus').html(json.PendingReq.Status);
			}
			translate();
		}
		function getWithdrawFail(errCode, errText) {
			console.log(errCode + ":" + errText);
		}

		//set
		function setWithdraw() {
			var data = new Object();
			data.amt = $('#txtWithdrawAmount').val();
			data.bankName = $('#txtWithdrawBankName').val();
			data.accName = $('#txtWithdrawAcctName').val();
			data.bankAcc = $('#txtWithdrawAccNum').val();
			data.pwd = $('#txtWithdrawPwd').val();
			var json = JSON.stringify(data);
			api.POST('/api/setWithdraw', json, setWithdrawSuccess, setWithdrawFail);
		}
		function setWithdrawSuccess(result, errCode, errText) {
			if (result == "1") getWithdraw();
		}
		function setWithdrawFail(errCode, errText) {
			console.log(errCode + ":" + errText);
		}

	})
}(myGlobalRequire.define));