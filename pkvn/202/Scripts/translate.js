(function (r) {
	var require = r.require;
	var define = r.define;
	define(["utils", "jquery"], function (utils, $) {
		return function (code) {
			function error(err) {
				var failedId = err.requireModules && err.requireModules[0];
				alert('Failed to load ' + failedId);
				location.reload();
			}

			var path = "/core/Scripts/lang";
			var pageLang = code ? code : utils.GetCookie('lang') || utils.GetCurrentUrlParam('lang') || "en-us";
			switch (pageLang) {
				case "zh-cn": require(['gb'], function (gb) { translatePage(gb) }, function (err) { error(err); }); break;
				case "th": require(['th'], function (th) { translatePage(th) }, function (err) { error(err); }); break;
				case "vi": require(['vi'], function (vi) { translatePage(vi) }, function (err) { error(err); }); break;
				case "id": require(['id'], function (id) { translatePage(id) }, function (err) { error(err); }); break;
				case "kh": require(['km'], function (km) { translatePage(km) }, function (err) { error(err); }); break;
			}

			function translatePage(lang) {
				$('.translate').each(function () {
					var fulltext = $(this).html() || $(this).val();
					if ($(this).attr('placeholder')) fulltext = $(this).attr('placeholder');
					var text = fulltext.split('|');
					var numbered = text.length == 2;
					if (numbered) {
						if (lang[text[0]]) {
							var translated = lang[text[0]].replace('[]', text[1]);
							if ($(this).is('input') && $(this).attr('placeholder').length > 0) $(this).attr('placeholder', translated);
							else if ($(this).is('input')) $(this).val(translated);
							else $(this).html(translated);
						}
					} else if (lang[fulltext]) {
						if ($(this).is('input') && $(this).attr('placeholder')) $(this).attr('placeholder', lang[fulltext]);
						else if ($(this).is('input')) $(this).val(lang[fulltext]);
						else $(this).html(lang[fulltext]);
					}
				})
			}

			this.warning = function (errText, errCode, failFunc, ShowError) {
				var pageLang = code ? code : utils.GetCookie('lang') || utils.GetCurrentUrlParam('lang') || "en-us";
				switch (pageLang) {
					case "zh-cn": require(['gb'], function (gb) { doTranslate(failFunc, errCode, ShowError, gb) }, function (err) { error(err); }); break;
					case "th": require(['th'], function (th) { doTranslate(failFunc, errCode, ShowError, th) }, function (err) { error(err); }); break;
					case "vi": require(['vi'], function (vi) { doTranslate(failFunc, errCode, ShowError, vi) }, function (err) { error(err); }); break;
					case "id": require(['id'], function (id) { doTranslate(failFunc, errCode, ShowError, id) }), function (err) { error(err); }; break;
					case "kh": require(['km'], function (km) { doTranslate(failFunc, errCode, ShowError, km) }), function (err) { error(err); }; break;
					default: require(['en'], function (eng) { doTranslate(failFunc, errCode, ShowError, eng) }, function (err) { error(err); }); break;
				}

				function doTranslate(failFunc, errCode, ShowError, lang) {
					var translated = translate(lang, errText);
					if (ShowError) ShowError(errCode, translated);
					if (failFunc) failFunc(errCode, translated);
				}

				function translate(lang, text) {
					var errText = text.split('|');
					var text = errText[0];
					var amount = errText[1];
					if (amount) {
						if (text.indexOf('[]') > -1)
							translated = typeof lang[text] !== 'undefined' && lang[text] !== 'undefined' ? lang[text].replace('[]', amount) : text.replace('[]', amount);
						else
							translated = typeof lang[text] !== 'undefined' && lang[text] !== 'undefined' ? lang[text] + " " + amount : text + " " + amount;
					} else {
						translated = typeof lang[text] !== 'undefined' && lang[text] !== 'undefined' ? lang[text] : text;
					}
					return translated;
				}
			}
		}
	})
}(myGlobalRequire));