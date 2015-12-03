define(["jquery", "api", "utils", "translate"], function ($, api, utils, translate) {

	//register events
	return function () {
		$('body').css('background', '#C1C4C6');
		if ($('#jp_tbl').length > 0) get_jackpot_winners();
	}

	//show jackpot winners table
	function get_jackpot_winners() {
		$.ajax({
			type: "GET",
			url: "/api.aspx?action=jackpot_winners&site=poker228",
			datatype: "xml",
			success: function (data) {
				var result = $(data).find('result');
				var jackpot_winners = result.find('jackpot_winners');
				var winner = jackpot_winners.find('winner');
				winner.each(function () {
					var name = $(this).find('name').text();
					var date = $(this).find('date').text();
					var type = $(this).find('type').text();
					var amount = money($(this).find('amount').text() + "00");
					var table_id = $(this).find('table_id').text();
					var community = $(this).find('community').text();
					var player = $(this).find('player').text();
					// type
					var type_html = "<img width='83px' height='64px' src='/core/Images/jackpot/jp_type" + type + ".png' border=0 />";
					// community
					var com_html = "";
					var com_cards = community.split(",");
					for (var i = 0; i < com_cards.length; i++) {
						if (com_cards[i] != "-") {
							com_html += "<img width='32px' height='42px' src='/core/Images/cards/" + com_cards[i] + ".png' border=0>&nbsp;";
						}
					}
					// player
					var ply_html = "";
					var ply_cards = player.split(",");
					for (var i = 0; i < ply_cards.length; i++) {
						if (ply_cards[i] != "-") {
							ply_html += "<img width='32px' height='42px' src='/core/Images/cards/" + ply_cards[i] + ".png' border=0>&nbsp;";
						}
					}
					// cards
					var cards = com_html + '&nbsp;&nbsp;&nbsp;' + ply_html;
					$('#jp_tbl').append('<tr><td>' + type_html + '</td><td>' + name + '</td><td>' + table_id + '</td><td>' + date + '</td><td>' + cards + '</td><td>' + amount + '</td></tr>');
				});
			}
		});
	}

	function money(value) {
		// Sign
		var sign = "";
		if (value != "" && value[0] == '-') {
			sign = "-";
			value = value.substr(1, value.length);
		}
		// Make sure is number
		s = "" + to_num(value);
		// Make sure 2 decimals
		if (s.indexOf(".") > 0) {
			value = (Math.floor(Number(s) * 100) / 100).toFixed(2);
			s = "" + value;
		}
		// Process
		if (s.length > 1) {
			var l = s.length;
			var res = "" + s[0];
			for (var i = 1; i < l - 1; i++) {
				if ((l - i) % 3 == 0) res += ",";
				res += s[i];
			}
			res += s[l - 1];
			res = res.replace(',.', '.');
			return sign + res;
		}
		return sign + s;
	}

	function to_num(value) {
		var str = "" + value;
		str = str.replace(/[^0-9\.]/g, '');
		return Number(str);
	}
		
})