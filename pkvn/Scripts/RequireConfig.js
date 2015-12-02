var js_git_path = "http://playcdn.github.io/pkvn/Scripts";
var js_local_path = "/core/Scripts/";

require.config({
	baseUrl: location.hostname == 'localhost' ? js_local_path : js_git_path,
	paths: {
		login: ["app/login.js?v=" + version, js_local_path + "app/login.js?v=" + version],
		utils: ["utils.js?v=" + version, js_local_path + "utils.js?v=" + version],
		translate: ["translate.js?v=" + version, js_local_path + "translate.js?v=" + version],
		'jquery-original': ["https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min", js_local_path + "lib/jquery-1.11.2.min"],
		jquery: ['app/jQuery-noConflict', js_local_path + 'app/jQuery-noConflict'],
		aes: ["lib/AES-3.1.2", js_local_path + "lib/AES-3.1.2"],
		"aes-handler": ["lib/aes-handler.js?v=" + version, js_local_path + "lib/aes-handler.js?v=" + version],
		rsa: ["lib/RSA-1.4", js_local_path + "lib/RSA-1.4"],
		"rsa-handler": ["lib/rsa-handler.js?v=" + version, js_local_path + "lib/rsa-handler.js?v=" + version],
		text: ["lib/text", js_local_path + "lib/text"]
	}
});