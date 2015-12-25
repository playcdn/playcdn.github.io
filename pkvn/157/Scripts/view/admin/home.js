define(["jquery", "api", "utils", "translate"], function ($, api, utils, translate) {

	return function () {
		$('body').css('background', '#C1C4C6');
		$('#btnOK').click(setWebContent);
		getWebContent();
	}

	function getWebContent() {
		api.POST('/api/getWebContentSetting', '', getWebContentSuccess, getWebContentFail);
	}
	function getWebContentSuccess(result, errCode, errText) {
		var data = $.parseJSON(result);
		var pref = $.parseJSON(data.pref);
		var setting = $.parseJSON(data.setting);
		var tbody = "";
		$.each(setting, function (key, value) {
			tbody += "<tr>";
			tbody += "<td class='bold titleTd'><span>" + key + "<span></td>";
			tbody += "<td>" + input(key, value, pref) + "</td>";
			tbody += "</tr>";
		});
		$('#ContentTbl tbody').html(tbody);
	}
	function getWebContentFail(errCode, errText) {
	}

	function setWebContent() {
		var data = new Object();
		$('.wcontent').each(function () {
			var name = $(this).attr('wcontent-name');
			var value = $(this).val();
			data[name] = value;
		})
		var json = JSON.stringify(data);
		api.POST('/api/setWebContent', json, setWebContentSuccess, setWebContentFail);
	}
	function setWebContentSuccess(result, errCode, errText) {
		if (errCode != 0)
			new translate().warning(errText, errCode, setWebContentFail);
		else
			new translate().warning("WContent has been changed", "", null, ShowSuccess);
	}
	function setWebContentFail(errCode, errText) {
		new translate().warning(errText, errCode, setWebContentFail);
	}
	function ShowSuccess(code, text) {
		alert(text);
	}
	function ShowError(errCode, errText) {
		$('#errorBox').html(errText).css('display', 'block');
	}

	function input(key, type, pref)
	{
		var value = pref.hasOwnProperty(key) ? pref[key] : "";
		var input = "";
		if (type.indexOf('|') > -1)
		{
			var options = $.trim(type).split('|');
			input += "<select class='wcontent' wcontent-name='"+key+"'>";
			$.each(options, function(id, opt){
				input += "<option value='" + opt + "' " + (opt == value ? "selected='selected'" : "") + ">" + opt + "</option>";
			})
			input += "</select>";
		}
		else
		{
			input = "<input class='wcontent' wcontent-name='" + key + "' type='text' value='" + value + "'/>";
		}
		return input;
	}
})