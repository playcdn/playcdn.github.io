(function (require) {

	var version = document.querySelector('script[data-version]').getAttribute('data-version');
	var version_folder = version;
	if (typeof (version) == 'undefined') {
		var version = "1";
	} else {
		var version_array = version.toString().split('.');
		if (version_array.length == 3) version_folder = version_array[1];
	}
	var js_online_path = window.location.protocol + "//playcdn.github.io/pkvn/" + version_folder;
	var js_local_path = "/core";
	var baseUrl = location.hostname == 'localhost' ? js_local_path : js_online_path;
	try { var data_main = document.querySelector('script[data-sub]').getAttribute('data-sub'); } catch (e) { }

	var viewUI = viewUI ? viewUI : "/View/";
	var view = view ? view : "/Scripts/view/";
	var homeUI = homeUI ? homeUI : "/app/Home0.aspx";
	require.config({
		paths: {
			login: [baseUrl + "/Scripts/app/login.js?v=" + version, js_local_path + "/Scripts/app/login.js?v=" + version],
			utils: [baseUrl + "/Scripts/utils.js?v=" + version, js_local_path + "/Scripts/utils.js?v=" + version],
			translate: [baseUrl + "/Scripts/translate.js?v=" + version, js_local_path + "/Scripts/translate.js?v=" + version],
			'jquery-original': ["https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min", js_local_path + "/Scripts/lib/jquery-1.11.2.min"],
			jquery: [baseUrl + '/Scripts/app/jQuery-noConflict', js_local_path + '/Scripts/app/jQuery-noConflict'],
			aes: [baseUrl + "/Scripts/lib/AES-3.1.2", js_local_path + "/Scripts/lib/AES-3.1.2"],
			"aes-handler": [baseUrl + "/Scripts/lib/aes-handler.js?v=" + version, js_local_path + "/Scripts/lib/aes-handler.js?v=" + version],
			rsa: [baseUrl + "/Scripts/lib/RSA-1.4", js_local_path + "/Scripts/lib/RSA-1.4"],
			"rsa-handler": [baseUrl + "/Scripts/lib/rsa-handler.js?v=" + version, js_local_path + "/Scripts/lib/rsa-handler.js?v=" + version],
			text: [baseUrl + "/Scripts/lib/text", js_local_path + "/Scripts/lib/text"],
			api: [baseUrl + '/Scripts/api.js?v=' + version, js_local_path + '/Scripts/api.js?v=' + version],		
			Default0: [baseUrl + '/Scripts/app/Default0.js?v=' + version, js_local_path + '/Scripts/app/Default0.js?v=' + version],
			main: [baseUrl + "/Scripts/view/main.js?v=" + version, js_local_path + "/Scripts/view/main.js?v=" + version],
			header: [baseUrl + view + "header.js?v=" + version, js_local_path + view + "header.js?v=" + version],
			headerPage: [js_local_path + viewUI + "header.html?v=" + version],
			mheaderPage: [js_local_path + viewUI + "mheader.html?v=" + version],
			home: [baseUrl + view + "home.js?v=" + version, js_local_path + view + "home.js?v=" + version],
			homePage: [homeUI + "?v=" + version + "&" + location.search.slice(1)],
			account: [baseUrl + '/Scripts/view/account.js?v=' + version, js_local_path + '/Scripts/view/account.js?v=' + version],
			accountPage: [js_local_path + '/View/account.html?v=' + version],
			deposit: [baseUrl + '/Scripts/view/deposit.js?v=' + version, js_local_path + '/Scripts/view/deposit.js?v=' + version],
			depositPage: [js_local_path + '/View/deposit.html?v=' + version],
			password: [baseUrl + '/Scripts/view/password.js?v=' + version, js_local_path + '/Scripts/view/password.js?v=' + version],
			passwordPage: [js_local_path + '/View/password.html?v=' + version],
			referral: [baseUrl + '/Scripts/view/referral.js?v=' + version, js_local_path + '/Scripts/view/referral.js?v=' + version],
			referralPage: [js_local_path + '/View/referral.html?v=' + version],
			statement: [baseUrl + '/Scripts/view/statement.js?v=' + version, js_local_path + '/Scripts/view/statement.js?v=' + version],
			statementPage: [js_local_path + '/View/statement.html?v=' + version],
			withdraw: [baseUrl + '/Scripts/view/withdraw.js?v=' + version, js_local_path + '/Scripts/view/withdraw.js?v=' + version],
			withdrawPage: [js_local_path + '/View/withdraw.html?v=' + version],
			gb: [baseUrl + '/Scripts/lang/gb.js?v=' + version, js_local_path + '/Scripts/lang/gb.js?v=' + version],
			id: [baseUrl + '/Scripts/lang/id.js?v=' + version, js_local_path + '/Scripts/lang/id.js?v=' + version],
			th: [baseUrl + '/Scripts/lang/th.js?v=' + version, js_local_path + '/Scripts/lang/th.js?v=' + version],
			vi: [baseUrl + '/Scripts/lang/vi.js?v=' + version, js_local_path + '/Scripts/lang/vi.js?v=' + version],
			en: [baseUrl + '/Scripts/lang/eng.js?v=' + version, js_local_path + '/Scripts/lang/eng.js?v=' + version],
			km: [baseUrl + '/Scripts/lang/km.js?v=' + version, js_local_path + '/Scripts/lang/km.js?v=' + version],
			//mobile
			Default0: [baseUrl + '/Scripts/app/Default0.js?v=' + version, js_local_path + '/Scripts/app/Default0.js?v=' + version],
			Default_m: [baseUrl + "/Scripts/m/Default.js?v=" + version, js_local_path + "/Scripts/m/Default.js?v=" + version],
			Main_m: [baseUrl + "/Scripts/m/Main.js?v=" + version, js_local_path + "/Scripts/m/Main.js?v=" + version]
		}
	});

	if (data_main) require([data_main]);

}(myGlobalRequire.require));