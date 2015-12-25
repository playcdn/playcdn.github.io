define(["jquery", "api", "translate", "utils"], function ($, api, translate, utils) {
	//VALIDATE SECURITY ANSWERS
	var validate = {
		Reset: function () {
			$('#answer1_true').hide();
			$('#answer1_false').hide();
			$('#answer2_true').hide();
			$('#answer2_false').hide();
		},
		Invalid: function (target) {
			$(target).css('display', 'block');
		},
		Error: function (errText) {
			$('#errorBox').html(errText).show();
			translate();
		},
		Question: function (target, errElem) {
			var value = $(target).val();
			if ($.trim(value).length < 3 || $.trim(value).length > 16) {
				this.Invalid(errElem);
				this.Error("Answer must be between 3 to 16 characters");
				return false;
			}
			return true;
		},
		Compare: function (target1, target2, errElem) {
			var question1 = $(target1).val();
			var question2 = $(target2).val();
			if ($.trim(question1) == $.trim(question2)) {
				console.log(question1 + ":" + question2);
				this.Invalid(errElem);
				this.Error("Answer 1 and answer 2 cannot be same");
				return false;
			}
			return true;
		}
	}

	//register events
	return function () {
		$('#lblPwdUname').html(localStorage.getItem('username'));
		$('#btnPwdSubmit').click(submit);
		$('#btnSet').click(function () {
			console.log($('#chkDisableQuestion').prop('checked'));
			if (!$('#chkDisableQuestion').prop('checked')) setQuestion();
			else disableQuestion();
		});
		$('#pwdMenuPass').click(function () {
			$('#passwordTitle').css('display', 'table-cell');
			$('#questionTitle').css('display', 'none');
			$('#tblPasswordInner').css('display', 'table');
			$('#tblSetQuestion').css('display', 'none');
		})
		$('#pwdMenuQuestion').click(function () {
			$('#passwordTitle').css('display', 'none');
			$('#questionTitle').css('display', 'table-cell');
			$('#tblPasswordInner').css('display', 'none');
			$('#tblSetQuestion').css('display', 'table');
			getQuestion();
		})
		$('#chkDisableQuestion').change(function () {
			if (this.checked) {
				$('#sel_preset_1').prop('disabled', true);
				$('#sel_preset_2').prop('disabled', true);
				$('#txt_preset_answer_1').prop('disabled', true);
				$('#txt_preset_answer_2').prop('disabled', true);
			} else {
				$('#sel_preset_1').prop('disabled', false);
				$('#sel_preset_2').prop('disabled', false);
				$('#txt_preset_answer_1').prop('disabled', false);
				$('#txt_preset_answer_2').prop('disabled', false);
			}
		})
		resetError();
	}

	function resetError() {
		$('#txtPwdOld').keypress(function () {
			$('#lblPwdError').html("").css("color", "red");
		})
		$('#txtPwdNew').keypress(function () {
			$('#lblPwdError').html("").css("color", "red");
		})
		$('#txtPwdConfirm').keypress(function () {
			$('#lblPwdError').html("").css("color", "red");
		})
	}

	//SET SECURITY QUESTIONS
	function getQuestion() {
		api.POST('/api/changeQuestions', "", getQuestionSuccess, getQuestionFailed);
	}
	function getQuestionSuccess(result, errCode, errText) {
		var questionSet = $.parseJSON(result);
		$('#depositTitle').css('display', 'none');
		$('#questionTitle').css('display', 'table-cell');
		$('#tblDepositInner').css('display', 'none');
		$('#tblDepositBoard').css('display', 'none');
		$('#tblDespositPending').css('display', 'none');
		$('#tblSetQuestion').css('display', 'table');
		//set question
		$('#sel_preset_1').find('option').remove();
		$.each(questionSet[1], function (key, value) {
			$('#sel_preset_1').append('<option class="translate" value="' + key + '">' + value + '</option>');
		})
		$('#sel_preset_2').find('option').remove();
		$.each(questionSet[2], function (key, value) {
			$('#sel_preset_2').append('<option class="translate" value="' + key + '">' + value + '</option>');
		})
		$.each(questionSet[3], function (key, value) {
			if (value == '0') $('#chkDisableQuestion').prop('checked', true);
			else $('#chkDisableQuestion').prop('checked', false);
			$("#chkDisableQuestion").trigger("change");
		})
		$('#tbl_preset').css('display', 'table');
		translate();
	}
	function getQuestionFailed(errCode, errText) {
	}

	//SET SECURITY QUESTIONS
	function setQuestion() {
		validate.Reset();
		var success = validate.Compare('#txt_preset_answer_1', '#txt_preset_answer_2', '#answer2_false');
		success = validate.Question('#txt_preset_answer_2', '#answer2_false') && success;
		success = validate.Question('#txt_preset_answer_1', '#answer1_false') && success;

		if (success) {
			var data = new Object();
			data.question1 = $('#sel_preset_1').val();
			data.answer1 = $.trim($('#txt_preset_answer_1').val());
			data.question2 = $('#sel_preset_2').val();
			data.answer2 = $.trim($('#txt_preset_answer_2').val());
			var json = JSON.stringify(data);
			api.POST('/api/setQuestions', json, setQuestionSuccess, setQuestionFailed);
		}
	}
	function setQuestionSuccess(result, errCode, errText) {
		utils.SetCookie('deviceId', result, 30);
		new translate().warning("Security questions has been updated", "", null, ShowSuccess);
	}
	function setQuestionFailed(errCode, errText) {
		validate.Reset();
		if (errCode == "3001") {
			validate.Invalid('#answer1_false');
		} else if (errCode == "3002") {
			validate.Invalid('#answer2_false');
		} else {
			console.log(errCode + ":" + errText);
		}
		translate();
	}

	//DISABLE SECURITY QUESTIONS
	function disableQuestion() {
		api.POST('/api/disableQuestion', '', disableQuestionSuccess, disableQuestionFailed);
	}
	function disableQuestionSuccess(result, errCode, errText) {
		utils.RemoveCookie('deviceId', '/');
		new translate().warning("Security questions has been updated", "", null, ShowSuccess);
	}
	function disableQuestionFailed(errCode, errText) {
		validate.Reset();
	}

	//submit
	function submit() {
		var data = new Object();
		data.old = $.trim($('#txtPwdOld').val());
		data.new = $.trim($('#txtPwdNew').val());
		var confirm = $.trim($('#txtPwdConfirm').val());

		if (data.new == "" || data.old == "" || confirm == "") new translate().warning("Please fill in all empty fields", null, null, ShowError);
		else if (data.new == data.old) new translate().warning("New password cannot be the same as old password", null, null, ShowError);
		else if (data.new < 6 || data.old < 6) new translate().warning("Password must be least 6 characters", null, null, ShowError);
		else if (data.new != confirm) new translate().warning("Confirm password is not the same as new password", null, null, ShowError);
		else api.POST('/api/setPassword', JSON.stringify(data), success, fail);
	}
	function success(result, errCode, errText) {
		$('#txtPwdOld').val("");
		$('#txtPwdNew').val("");
		$('#txtPwdConfirm').val("");
		if (result != "1")
			$('#lblPwdError').css("color", "red").html(errText);
		else
			new translate().warning("Password has been changed", "", null, ShowSuccess);
			//$('#lblPwdError').css("color", "blue").html("Success");
	}
	function fail(errCode, errText) {
		//$('#txtPwdOld').val("");
		//$('#txtPwdNew').val("");
		//$('#txtPwdConfirm').val("");
		new translate().warning(errText, errCode, null, ShowError);
	}

	function ShowSuccess(errCode, errText) {
		alert(errText);
	}

	function ShowError(errCode, errText) {
		$('#errorBox').html(errText).css('display', 'block');
	}
})