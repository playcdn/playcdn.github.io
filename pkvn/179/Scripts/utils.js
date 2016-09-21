(function (define) {
	define(function () {
		this.AddCommas = function (nStr) {
			nStr += '';
			x = nStr.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {
				x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}
			return x1 + x2;
		};
		this.PopUpReg = function(url) {
    		popUpRegWindow = window.open(url, 'popUpRegWindow', 'width=800,height=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes')
		};
		this.PopUpPingBox = function(url) {
			popUpPingBoxWindow = window.open(url, 'popUpPingBoxWindow', 'height=500,width=450,left=0,top=0,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=yes')
		};
		this.PopupCenter = function(pageURL, title, w, h) {
			var left = (screen.width / 2) - (w / 2);
			var top = (screen.height / 2) - (h / 2);
			var targetWin = window.open(pageURL, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
		};
		this.MonthDay = function(str) {
			var d = new Date(Date.parse(str));
			var m = d.getMonth() + 1;
			return d.getDate() + "/" + m;
		};
		this.ParseUrl = function (url) {
			var parser = document.createElement("a");
			parser.href = url;
			return parser;
			parser.protocol; // => "http:"
			parser.hostname; // => "example.com"
			parser.port;     // => "3000"
			parser.pathname; // => "/pathname/"
			parser.search;   // => "?search=test"
			parser.hash;     // => "#hash"
			parser.host;     // => "example.com:3000"
		},
		this.GetCurrentUrlParam = function(name) {
			return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
		},
		this.GetUrlParam = function(name, url) {
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(url);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},
		this.RemoveCookie = function (name, path) {
			document.cookie =  name + '=; path=' + path + '; expires=' + new Date(0).toUTCString();
		},
		this.ClearCookie = function () {
			if (document.cookie != "") {
				crumbs = document.cookie.split(";");
				for (i = 0; i < crumbs.length; i++) {
					crumbName = crumbs[i].split("=")[0];
					document.cookie = crumbName + "=;expires=" + new Date(0).toUTCString();
				}
			}
		},
		this.SetCookie = function (name, value, exdays) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
			var expires = "expires=" + d.toUTCString();
			var path = "path=/";
			document.cookie = name + "=" + value + ";" + path + "; " + expires;
		},
		this.GetCookie = function (name) {
			var cname = name + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1);
				if (c.indexOf(cname) == 0) return c.substring(cname.length, c.length);
			}
			return null;
		},
		this.Money = function (number, fixed) {
			return number.toFixed(fixed).replace(/\d(?=(\d{3})+\.)/g, '$&,');
		},
		this.Logout = function () {
			this.RemoveCookie('user', '/');
			var deviceId = localStorage.getItem('did');
			localStorage.clear();
			localStorage.setItem('did', deviceId);
			window.location = '/';
		},
		this.RandomString = function (length) {
			key = "";
			var hex = "0123456789abcdef";
			for (i = 0; i < length; i++) {
				key += hex.charAt(Math.floor(Math.random() * 16));
			}
			return key;
		},
		this.IsNullOrWhiteSpace = function (value) {
			if (value == null) return true;
			if (typeof (value) == 'undefined') return true;
			if (typeof (value) == 'string' && value == 'undefined') return true;
			if (typeof (value) == 'string' && value.trim().length == 0) return true;
			return false;
		}
		return this;
	})
}(myGlobalRequire.define));