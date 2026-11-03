/* Ponte Android — CANASTRA EmpreenderTHZ Games. Só age dentro do app (window.ThzAndroid). */
(function () {
  if (!window.ThzAndroid) return;
  document.documentElement.classList.add('is-android-app');

  var st = document.createElement('style');
  st.textContent =
    'html.is-android-app,html.is-android-app body{overscroll-behavior:none;-webkit-tap-highlight-color:transparent}' +
    'html.is-android-app header,html.is-android-app .hand-header,html.is-android-app .actions,html.is-android-app .card{-webkit-user-select:none;user-select:none}';
  document.head.appendChild(st);

  // "Exportar histórico": downloads por blob não funcionam em WebView — envia ao compartilhamento nativo.
  var nativeClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.download && /^(blob:|data:)/.test(this.href)) {
      var name = this.download;
      fetch(this.href)
        .then(function (r) { return r.blob(); })
        .then(function (b) { return b.text().then(function (t) { window.ThzAndroid.shareFile(name, b.type || 'application/json', t); }); })
        .catch(function (e) { console.warn('Falha ao exportar', e); });
      return;
    }
    return nativeClick.call(this);
  };

  // Botão Voltar do Android: fecha a janela aberta; com a mesa visível, devolve false (app vai para segundo plano).
  window.__thzBack = function () {
    var open = document.querySelectorAll('dialog[open]');
    var d = open[open.length - 1];
    if (d && d.id !== 'welcomeDialog') { d.close(); return true; }
    return false;
  };
})();
