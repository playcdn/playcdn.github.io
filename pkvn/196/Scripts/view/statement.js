(function (define) {
	define(["jquery", "api", "utils", "translate"], function ($, api, utils, translate) {
		//initialize game detail object
		var gd = new gameDetail();
		//works as constructor
		return function (translation) {
			statement(1);
		}

		function hideAll() {
			$('#tblStatementGameRounds').css('display', 'none');
			$('#tblStatementGames').css('display', 'none');
			$('#tblStatementSettlements').css('display', 'none');
			$('#tblStatementDays').css('display', 'none');
		}

		/***result per game round [3rd tier]***/
		var gdpage = 1;
		var gddate = "";
		var gddatedisplay = "";
		function gameDetail() {
			this.data = new Object();
			this.Show = function (page, date, gameId, dateDisplay) {
				if (dateDisplay) gddatedisplay = dateDisplay;
				if (date) { this.data.date = date; gddate = date; }
				if (gameId) { this.data.gameId = gameId; }
				if (page) { this.data.page = page; gdpage = page }
				var json = JSON.stringify(this.data);
				api.POST('/api/getGameDetail', json, this.Success, this.Fail);
			};
			this.Success = function (result, errCode, errText) {
				var json = $.parseJSON(result);
				var data = json.data;
				var paging = json.paging;
				var sum = json.sum;
				var gameDate = gddate;
				//preset table
				hideAll();
				$('#tblStatementGameRounds').css('display', 'table');
				$('#tblStatementGameRounds > tbody').html('');
				$('#StatementTitle').html('<span class="translate">Statement</span> ' + gddatedisplay).attr('workingDate', gddate);
				//paging info
				var total = paging.total;
				var size = paging.size;
				//records table
				for (i = 0; i < data.length; i++) {
					var stake = utils.Money(parseInt(data[i].amt), 2);
					var com = utils.Money(parseInt(data[i].com), 2);
					var wl = utils.Money(parseInt(data[i].win), 2);
					var wl_style = data[i].win < 0 ? 'color:red' : '';
					//if (data[i].id != "-1") {
						var date = data[i].ref + '<br />' + data[i].date;
						var detail = '<span class="bold">' + data[i].title + '</span><br />' + data[i].desc;
						var resultStatus = "";
						//if (json[i].status == "WA") resultStatus = '<span class="translate">Won</span>';
						//else if (json[i].status = "LA") resultStatus = '<span class="translate">Lost</span>';
						//else if (json[i].status = "D") resultStatus = '<span class="translate">Draw</span>';

						var result = data[i].res;

						if (data[i].title === "Games - PKV Sports") {
							result = "<span class='more' onclick='ViewSportTicketDetails(\"" + result + "\");'>" + result + "</span>";
						}

						//if (gdpage == 1)
						$('#tblStatementGameRounds > tbody').append('<tr><td>' + (i + 1 + size * (gdpage - 1)) + '</td><td class="td-left">' + date + '</td><td class="td-left">' + detail + '</td><td class="td-md">' + result + '</td><td>' + stake + '</td><td>' + com + '</td><td class="bd" style="' + wl_style + '">' + wl + '</td></tr>');
					//} else {
					//	$('#tblStatementGameRounds > tbody').append('<tr><td></td><td></td><td></td><td></td><td>' + stake + '</td><td>' + com + '</td><td class="bd" style="' + wl_style + '">' + wl + '</td></tr>');
					//}
				}
				if (typeof(sum) != "undefined") {
					var stake = utils.Money(parseInt(sum.amt), 2);
					var com = utils.Money(parseInt(sum.com), 2);
					var wl = utils.Money(parseInt(sum.win), 2);
					var wl_style = sum.win < 0 ? 'color:red' : '';
					$('#tblStatementGameRounds > tbody').append('<tr><td></td><td></td><td></td><td></td><td>' + stake + '</td><td>' + com + '</td><td class="bd" style="' + wl_style + '">' + wl + '</td></tr>');
				}
				//generate paging
				var totalPage = Math.ceil(parseFloat(total) / parseFloat(size));
				var pagingContent = "";
				for (p = 1; p <= totalPage; p++) {
					if (gdpage == p)
						pagingNum = '<div class="left" style="margin-right:5px;font-size:15px;font-weight:bold;color:blue">' + p + '</div>';
					else
						pagingNum = '<div class="btn left gd_page">' + p + '</div>';
					if (p < totalPage)
						pagingContent += pagingNum + '<span class="left" style="margin-right:5px">|</span>';
					else
						pagingContent += pagingNum;
				}
				//$('#tblStatementGameRounds > tfoot').append('<tr><td class="no-border">&nbsp;</td></tr><tr><td colspan="7" class="no-border td-md"><div style="display:inline-block">' + pagingContent + '</div></td></tr>');
				$('#StatementGameRoundsPaging').html(pagingContent);
				//implement table
				//$('#tblStatementGameRounds').attr('class', 'gd');
				//register paging event
				$('.gd_page').click(function () { gd.Show($(this).html()); });
				//implement control
				var control = '<div class="btn right themeBtn translate" id="game_back">BACK</div>';
				$('#ctrlStatement').html(control);
				$('#game_back').click(function () { game(gameDate); });
				//translate
				translate();
			};
			this.Fail = function (errCode, errText) {
				console.log(errCode + ":" + errText);
			};
		}

		/*** result per game [2nd tier] ***/
		function game(date) {
			var data = new Object();
			data.date = date;
			var json = JSON.stringify(data);
			api.POST('/api/getGameInfo', json, gameSuccess, gameFail);
		}
		function gameSuccess(result, errCode, errText) {
			//console.log(result);
			var json = $.parseJSON(result);
			//set thead
			hideAll();
			$('#tblStatementGames').css('display', 'table');
			$('#tblStatementGames > tbody').html('');
			$('#StatementTitle').html('Statement');
			//set tbody
			for (i = 0; i < json.length; i++) {
				//var stake = utils.Money(parseInt(json[i].amt), 0);
				//var settled = utils.Money(parseInt(json[i].winAmt), 0);
				//var com = utils.Money(parseInt(json[i].comAmt), 0);
				var stake = utils.AddCommas(json[i].amt);
				var settled = utils.Money(parseInt(json[i].winAmt), 2);
				var com = utils.Money(parseInt(json[i].comAmt), 2);
				var settled_style = parseInt(json[i].winAmt) < 0 ? "color:red;font-weight:bold" : parseFloat(json[i].winAmt) > 0 ? "font-weight:bold" : "";
				if (json[i].summary != "1") {
					//var date = json[i].workingDate.split(' ')[0];
					var date_array = json[i].workingDate.split('|');
					var date = date_array[0];
					var day = date_array[1];
					var event = json[i].game;
					var num = i + 1;
					var ext_info = "workingDate=" + date + " gameId=" + json[i].gameId;
					$('#tblStatementGames > tbody').append('<tr><td class="td-left">' + num + '</td><td class="gameDate td-left" ' + ext_info + '>' + date + ' (<span class="translate">' + day + '</span>)' + '</td><td class="td-left">' + event + '</td><td>' + stake + '</td><td style="' + settled_style + '">' + settled + '</td><td>' + com + '</td></tr>');
				} else {
					$('#tblStatementGames > tbody').append('<tr><td></td><td></td><td></td><td>' + stake + '</td><td style="' + settled_style + '">' + settled + '</td><td>' + com + '</td></tr>');
				}
			}
			//implement table
			//$('#tblStatementGames').attr('class', 'game');
			$('.gameDate').click(function () { gd.Show(1, $(this).attr('workingDate'), $(this).attr('gameId'), $(this).html()) });
			//implement control
			var control = '<div class="btn right themeBtn translate" id="game_back">BACK</div>';
			$('#ctrlStatement').html(control);
			$('#game_back').click(function () { statement(1); });
			//translate
			translate();
		}
		function gameFail(errCode, errText) {
			console.log(errCode + ":" + errText);
		}

		/*** result for settlement [2nd tier] ***/
		function settlement() {
			var date = $(this).parent().find('td').eq(0).find('.stmtDateS1').html();
			var data = new Object();
			data.date = date;
			var json = JSON.stringify(data);
			api.POST('/api/getSettlement', json, settlementSuccess, settlementFail);
		}
		function settlementSuccess(result, errCode, errText) {
			var json = $.parseJSON(result);
			//set thead
			hideAll();
			$('#tblStatementSettlements').css('display', 'table');
			$('#tblStatementSettlements > tbody').html('');
			//set tbody
			for (i = 0; i < json.length; i++) {
				var dateFull = json[i].date;
				var date_array = dateFull.split('|');
				var date = date_array[0];
				var day = date_array[1];
				var desc = json[i].desc;
				var amt = utils.Money(parseFloat(json[i].amt), 2);
				var amt_style = json[i].amt < 0 ? 'color:red' : '';
				$('#tblStatementSettlements > tbody').append('<tr><td>' + date + ' (<span class="translate">' + day + '</span>)' + '</td><td class="td-left translate">' + desc + '</td><td class="bd" style="' + amt_style + '">' + amt + '</td></tr>');
			}
			//impelment table
			//$('#tblStatementSettlements').attr('class', 'settlement');
			//implement control
			var control = '<div class="btn right themeBtn translate" id="game_back">BACK</div>';
			$('#ctrlStatement').html(control);
			$('#game_back').click(function () { statement(1); });
			//translate
			translate();
		}
		function settlementFail(errCode, errText) {
			console.log(errCode + ":" + errText);
		}

		/*** result per day [1st tier] ***/
		function statement(this_week) {
			var data = new Object();
			data.thisweek = this_week;
			var json = JSON.stringify(data);
			api.POST('/api/getStatement', json, statementSuccess, statementFail);
		}
		function statementSuccess(result, errCode, errText) {
			var json = $.parseJSON(result);
			//set thead
			hideAll();
			$('#tblStatementDays').css('display', 'table');
			$('#tblStatementDays > tbody').html('');
			//set tbody
			for (i = 0; i < json.length; i++) {
				var dateFull = json[i].summaryDate;
				var date_array = dateFull.split('|');
				var date = date_array[0];
				var day = date_array[1];
				var stakePlaced = utils.Money(parseInt(json[i].stakePlaced), 0);
				var winLose = utils.Money(parseFloat(json[i].winLose), 2);
				var commission = utils.Money(parseFloat(json[i].commission), 2);
				var settled = utils.Money(parseFloat(json[i].settled), 2);
				var currBalance = utils.Money(parseFloat(json[i].currBalance), 2);
				var wl_style = parseFloat(json[i].winLose) < 0 ? "color:red;font-weight:bold" : parseFloat(json[i].winLose) > 0 ? "font-weight:bold" : "";
				var stmt_class = parseFloat(json[i].settled) != 0 ? "stmtSettled" : "stmtSettled";
				$('#tblStatementDays > tbody').append('<tr><td class="stmtDate"><span class="stmtDateS1">' + date + '</span> (<span class="translate">' + day + '</span>)' + '</td><td>' + stakePlaced + '</td><td style="' + wl_style + '">' + winLose + '</td><td>' + commission + '</td><td class="' + stmt_class + '">' + settled + '</td><td style="bold">' + currBalance + '</td><tr>');
			}
			//impelment table
			//$('#tblStatementDays').attr('class', 'statement');
			$('.stmtDate').click(function () { game($(this).find('.stmtDateS1').html()); });
			$('.stmtSettled').click(settlement);
			//implement control
			var control = '<div class="btn right themeBtn translate" id="stmt_thisweek">THIS WEEK</div><div class="btn right themeBtn translate" id="stmt_lastweek" style="margin-right:10px">LAST WEEK</div>';
			$('#ctrlStatement').html(control);
			$('#stmt_thisweek').click(function () { statement(1); });
			$('#stmt_lastweek').click(function () { statement(0); });
			//translate
			translate();
		}
		function statementFail(errCode, errText) {
			console.log(errCode + ":" + errText);
		}
	})
}(myGlobalRequire.define));

function ViewSportTicketDetails(eRes) {
	window.open("https://afbsportlogin001.pkvn.mobi/ticket/" + eRes, "_blank", "width=950,height=600");
}
