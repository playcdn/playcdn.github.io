(function (define) {
	define(["aes"], function () {
		var aesHandler = new Object();
		aesHandler.key_name = "key";
		aesHandler.iv_name = "iv";
		aesHandler.key = function () {
			if (!sessionStorage.getItem(aesHandler.key_name))
				sessionStorage.setItem(aesHandler.key_name, aesHandler.generateKey());
			return sessionStorage.getItem(aesHandler.key_name);
		};
		aesHandler.iv = function () {
			return sessionStorage.getItem(aesHandler.iv_name);
		};
		aesHandler.Encrypt = function (data) {
			sessionStorage.setItem(aesHandler.iv_name, aesHandler.generateKey());
			var key = CryptoJS.enc.Utf8.parse(sessionStorage.getItem(aesHandler.key_name));
			var iv = CryptoJS.enc.Utf8.parse(sessionStorage.getItem(aesHandler.iv_name));
			data = CryptoJS.enc.Utf8.parse(data);
			var encrypted = CryptoJS.AES.encrypt(data, key,
			{
				keySize: 128 / 8,
				iv: iv,
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7
			});
			return encrypted.toString();
		};
		aesHandler.Decrypt = function (data, iv) {
			var key = CryptoJS.enc.Utf8.parse(sessionStorage.getItem(aesHandler.key_name));
			var iv = CryptoJS.enc.Utf8.parse(iv);
			var decrypted = CryptoJS.AES.decrypt(data, key, {
				keySize: 128 / 8,
				iv: iv,
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7
			});
			return decrypted.toString(CryptoJS.enc.Utf8);
		};
		aesHandler.generateKey = function () {
			key = "";
			var hex = "0123456789abcdef";
			for (i = 0; i < 16; i++) {
				key += hex.charAt(Math.floor(Math.random() * 16));
			}
			return key;
		};
		return aesHandler;
	})
}(myGlobalRequire.define));