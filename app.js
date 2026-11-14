(function () {
  'use strict';

  var out = {
    https: document.querySelector('[data-k="https"]'),
    css: document.querySelector('[data-k="css"]'),
    js: document.querySelector('[data-k="js"]'),
    img: document.querySelector('[data-k="img"]'),
    pvlocal: document.querySelector('[data-k="pvlocal"]'),
    pvsite: document.querySelector('[data-k="pvsite"]')
  };

  function mark(el, text, ok) {
    if (!el) return;
    el.textContent = text;
    el.classList.add(ok ? 'ok' : 'bad');
  }

  // 1. HTTPS / 协议
  var isHttps = location.protocol === 'https:';
  mark(out.https, 'HTTPS：' + (isHttps ? '正常（' + location.protocol + '）' : '非 HTTPS（' + location.protocol + '）'), isHttps);

  // 2. CSS：读取由 style.css 定义的自定义属性
  var penny = getComputedStyle(document.documentElement).getPropertyValue('--penny').trim();
  mark(out.css, 'CSS：' + (penny ? '正常（--penny=' + penny + '）' : '未生效'), !!penny);

  // 3. JS：能执行到这里即正常
  mark(out.js, 'JavaScript：正常（脚本已执行）', true);

  // 4. 图片：实际加载解码
  var img = document.querySelector('img');
  function imgResult() {
    var ok = img.complete && img.naturalWidth > 0;
    mark(out.img, '图片：' + (ok ? '正常（' + img.naturalWidth + '×' + img.naturalHeight + '）' : '加载失败'), ok);
  }
  if (img.complete) imgResult();
  else { img.addEventListener('load', imgResult); img.addEventListener('error', imgResult); }

  // 5a. 本机计数（localStorage，只证明脚本与存储可用，不代表真实 PV）
  var localText = '不可用（浏览器禁用了本地存储）';
  var localOk = false;
  try {
    var key = 'penny-test-pv';
    var n = parseInt(localStorage.getItem(key) || '0', 10) + 1;
    localStorage.setItem(key, String(n));
    localText = '正常（本机第 ' + n + ' 次打开）';
    localOk = true;
  } catch (e) { /* 隐私模式或存储被禁 */ }
  mark(out.pvlocal, '本机计数：' + localText, localOk);

  // 5b. 站点访问量（不蒜子）——轮询等待脚本回填，最多 6 秒
  var bsStatus = document.getElementById('bs-status');
  var bsContainer = document.getElementById('busuanzi_container_site_pv');
  var bsValue = document.getElementById('busuanzi_value_site_pv');
  var tries = 0;

  function pollBusuanzi() {
    tries++;
    var v = bsValue ? bsValue.textContent.trim() : '';
    var loaded = !!window.__bsLoaded || (v && v !== '-');
    var failed = !!window.__bsFailed;

    if (loaded && v && v !== '-') {
      mark(out.pvsite, '站点访问量：正常（累计 ' + v + ' 次）', true);
      if (bsContainer) bsContainer.style.display = 'inline';
      if (bsStatus) bsStatus.textContent = '脚本状态：已加载，计数正常';
      return;
    }
    if (failed || tries > 12) {
      mark(out.pvsite, '站点访问量：不可用（脚本未加载或超时）', false);
      if (bsStatus) bsStatus.textContent = '脚本状态：' + (failed ? '加载失败（onerror）' : '超时未返回数据');
      return;
    }
    setTimeout(pollBusuanzi, 500);
  }
  setTimeout(pollBusuanzi, 800);

  // 交互按钮
  var btn = document.getElementById('btn');
  var btnOut = document.getElementById('btn-out');
  var clicks = 0;
  if (btn) {
    btn.addEventListener('click', function () {
      clicks += 1;
      btnOut.textContent = 'JS 交互正常：已点击 ' + clicks + ' 次，时间 ' + new Date().toLocaleTimeString('zh-CN');
    });
  }

  // 打开时间
  var now = document.getElementById('now');
  if (now) now.textContent = new Date().toLocaleString('zh-CN');
})();
