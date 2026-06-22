(function (define) {
	define(["rsa"], function () {
		return function () {
			this.rsa = new RSAKey();
			this.Encrypt = function (txt) {
				return this.rsa.encrypt(txt);
			};
			this.Init = function (key) {
				var pkey = key.split(',');
				this.rsa.setPublic(pkey[1], pkey[0]);
			};
		}
	})
}(myGlobalRequire.define));