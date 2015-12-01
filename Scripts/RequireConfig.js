require.config({
	//urlArgs: "v=" + version,
	baseUrl: "/core/Scripts",
	paths: {
		api: "api.js?v=" + version,
		utils: "utils.js?v=" + version,
		translate: "translate.js?v=" + version,
		jquery: ["https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min", "lib/jquery-1.11.2.min"],
		aes: "lib/AES-3.1.2",
		"aes-handler": "lib/aes-handler.js?v=" + version,
		rsa: "lib/RSA-1.4",
		"rsa-handler": "lib/rsa-handler.js?v=" + version,
		text: "lib/text"
	}
});