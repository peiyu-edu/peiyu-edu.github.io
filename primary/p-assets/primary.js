/* 培玉 · 小学数学 — 页面运行脚本（样板期由 PY-99 维护；并入 4360 后交 PY-35 公共件）。
   做五件事：步骤导航；竖排分数；朗读；作答（选择题 .predict、数字填空 .q[data-kind=num]、分数填空 .q[data-kind=frac]）；
   学习记录写 localStorage「peiyu.ps.log」，格式与高中 lesson.js 相同：{t, sec, kind, …}。

   作答写法
   选择题：<div class="card predict" data-id="e1" data-answer="B">…<button class="opt" data-v="A" data-hint="答错时的提示">…</button>…<div class="reveal">答对后显示</div></div>
   看答案：错满两次后自动出现「看答案」按钮（选项少的选择题错到只剩一个选项时出现），点了显示正确答案并展开 .reveal；记 log("peek")，不算答对。
   填空题：<div class="card q" data-id="p1" data-kind="frac" data-answer="1/5" data-miss='{"1/4":"…"}' data-hint="通用提示">题干<div class="reveal">…</div></div>
           data-kind="num" 时 data-answer 是整数；加 data-dec 属性后键盘多一个小数点，答案可以是小数（按数值判，12.50 与 12.5 都对）。分数按值判（2/4 与 1/2 都对，用户 2026-10-27 定）。
           data-tip='{"值":"提示"}'：想法对、但不是本课要的写法，给提示、不判错，可以再答。
           data-places="N"（可选，只加在 data-kind=num 的题上）：数值对但不是恰好 N 位小数的规范写法（6.10、06.1）→ 提示、不完成、可再答；N=0 要求整数规范形式；可配 data-places-tip 自定义提示。不加则按数值判（12.50 与 12.5 都对）。
   不出现「真聪明」：夸的是试、数、检查（stage0 规矩）。 */
(function () {
  "use strict";
  var body = document.body;
  var sec = body.getAttribute("data-sec") || "";
  var isHighGrade = /^p[4-6]/.test(sec);
  if (isHighGrade) body.classList.add("high");
  var LOG_KEY = "peiyu.ps.log";

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function readLog() { try { return JSON.parse(store(LOG_KEY) || "[]"); } catch (e) { return []; } }
  function log(kind, data) {
    var d = Object.assign({}, data || {});
    var emitted = !!d._emitted;
    delete d._emitted;
    var ev = Object.assign({ t: Date.now(), sec: sec, kind: kind }, d);
    var all = readLog(); all.push(ev);
    if (all.length > 5000) all = all.slice(-5000);
    store(LOG_KEY, JSON.stringify(all));
    if (!emitted && (kind === "fill" || kind === "eq") && typeof d.correct === "boolean" && d.hint !== "tip") {
      var rawId = typeof d.id === "string" ? d.id.trim() : "";
      var rawVal = d.value !== undefined ? d.value : d.v;
      var valStr = typeof rawVal === "string" ? rawVal.trim() : (typeof rawVal === "number" && isFinite(rawVal) ? String(rawVal) : "");
      if (rawId && valStr) {
        var detail = { id: rawId, value: valStr, correct: d.correct };
        if (typeof d.first === "boolean") detail.first = d.first;
        try {
          if (window.PeiyuP) window.PeiyuP._activeLegacyAnswer = detail;
          document.dispatchEvent(new CustomEvent("manip:answer", {
            detail: detail,
            bubbles: true
          }));
        } catch (e) { /* ignore */ } finally {
          if (window.PeiyuP) window.PeiyuP._activeLegacyAnswer = null;
        }
      }
    }
  }

  /* ---------- 数字与分数的读法 ---------- */
  var CN = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  function cn(n) {
    n = +n;
    if (n <= 10) return CN[n];
    if (n < 20) return "十" + CN[n - 10];
    if (n < 100) return CN[Math.floor(n / 10)] + "十" + (n % 10 ? CN[n % 10] : "");
    return String(n);
  }
  function fracWord(n, d) { return cn(d) + "分之" + cn(n); }
  function fracHTML(n, d, cls) {
    return '<span class="fr' + (cls ? " " + cls : "") + '" role="img" aria-label="' + fracWord(n, d) + '"><span>' + n + '</span><span class="bar"></span><span>' + d + "</span></span>";
  }
  function renderFracs(root) {
    [].forEach.call((root || document).querySelectorAll(".fr[data-n]"), function (el) {
      var n = el.getAttribute("data-n"), d = el.getAttribute("data-d");
      el.outerHTML = fracHTML(n, d, el.className.replace(/\bfr\b/, "").trim());
    });
  }

  /* ---------- 朗读：正式版换预生成音频（声音待定）；样板期用浏览器自带中文语音 ---------- */
  var SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  var zhVoice = null;
  function pickVoice() {
    if (!window.speechSynthesis) return;
    var vs = speechSynthesis.getVoices() || [];
    zhVoice = vs.filter(function (v) { return /^zh(-|_)CN/i.test(v.lang); })[0] || vs.filter(function (v) { return /^zh/i.test(v.lang); })[0] || null;
  }
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  /* 预生成音频：say-audio/<cyrb53(text) 十六进制>.mp3，哈希与 tools/gen_say_audio.py 一致；缺文件回退浏览器语音 */
  function cyrb53(s) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57, i, ch;
    for (i = 0; i < s.length; i++) {
      ch = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  /* 已发布的朗读音频清单（PY-357）。构建学习站时（build_learning_flow.py）把下面的 null 换成已拷贝的 mp3 哈希数组；
     点朗读时哈希不在清单里就直接用浏览器语音，不请求 mp3，所以缺音频的句子控制台没有 404。
     null = 没有清单（源码树 / 没有音频的树）：一律用浏览器语音，不发任何 mp3 请求。 */
  var SAY_MANIFEST = ["1001916df4743c","1002d2c0855e67","1006d547983a07","1008e48dc8686f","100aefddd6aa7f","10126cbfd4a020","1015953b7a859d","10181867893d3b","101d11eb4231f9","101de0ab2d3a6b","1024ab1f29ce7c","102ba9c3565a20","102e3b9c7c6fc","1036c346eeace1","1038ca9a0c95d2","1040a78988081e","104735b52baa61","10474bccd2a0df","104afa038980e5","104b7a0c2610a0","104d3a24c25bd3","104e1771bb3972","10561bab1b40e5","105f7c99a549f2","106ad671e7a782","106f0393bb3795","1076f37ca17cba","107d7698b2c516","107ee89b576ad5","1082ccde559d2e","10857b8536412c","1093a9e7feec1","109423bfc9a0a5","109473e3b429cd","1095273c12cb29","10a4e54069d813","10a9e22f64a713","10ab4bd0949be0","10ac7be57e1bb2","10ae4e950ed441","10af912da96688","10b2275943655d","10b48864fcd502","10b66c7e75ae51","10b9efeec12aed","10bc452c96c514","10c1a5120954ee","10c23b1a26406c","10c8c5746bc0","10d531bf973b52","10d9aef05a40c0","10db9b41089be6","10dbbdc126842e","10dbbf4c5c8f7e","10dcbe09a69486","10f1bf468d10bd","10f91f7733384c","10fc93aebb93da","11015b6f832ee3","1101d3b64faca3","1103a76c405e07","11057008219efb","111023417c26d4","1119f430568883","1125a96179087a","1125d610060dba","112b8f1d38665a","11304bf1f21145","1133ade1e9cd5f","1137113906b93b","1137847cef3e40","113b05d4e0dfd6","113dc683ca8f2d","1141e354d2c677","114b25f137cfa1","114b9583f291d0","114bc8b7125a3e","114cbad3b1c8f","1153c2863bc805","1158ace2134712","1159c007cb761b","116169d9d3150e","1162b0ea108a16","1163c0072c95ab","1164acbef1df8a","1165904be875c","116b4abe126a58","116f81a14df2f6","1173d6144ae403","11783117af1622","117b00cc7704c6","117bfeec4da8ca","117d16ee344afc","117f199b7449ae","118742b2a8e0a3","118b9e18693c85","118ed3c0ad9776","1195dd6ea897fa","119c039f255d09","119c8e3abcf9fc","119d67a1800a44","119d9290fcfb78","11a1413eeae230","11a899a52e0ef9","11a99e5f492607","11b0e4921a1539","11b1498624a0e6","11b8029228be4","11be53237062f5","11be9bdcb7418d","11bf6ee8395096","11bfd6fa2b75a","11cf4d3a6004ea","11d3e7e2ecd455","11d74f0ce96321","11dafd8c4b85bd","11de946f82c1e3","11e2c49ada514b","11e66620be3547","11e919dd3f676b","11f25b2c476557","11fb3fe8845b1c","12034d4e66d461","1205683c5dad23","1210d6db7d302a","12185f02bcd8b9","121c901a6614a9","1222d2e819da76","12238a579b910a","122b3ac774d492","123325278ba8f4","12359b52fcc08a","1245e9f966943e","1247ec2ae7cd32","1248b90c483005","124adc38ea3a56","124b56af4e08a4","124d48460f27f8","125213a8ade656","125c444564a177","125dcd75bf9bfb","12600a2d92547c","12605311b11592","12664e3068b392","126a9edf2d62ed","126e2971af2c63","126ec9549721dc","1278c872692cce","1278ff92dc11ca","1285200b3a0663","12906647efacf2","12938dfe08924e","1294898adea840","12991fbdbbaa5a","129953b2140ebb","12a04baa763d4d","12aa665ad77bd3","12ae119a35f9fd","12ae619f6f976f","12af1068a10c7","12b1fda941c352","12b2d2c61175bc","12b4a1fcd33c29","12cc2eb7c57857","12cfc736090139","12e3ad9ffe9be0","12e3b81b5f3106","12e3f75effbdb0","12e40f95ce82ac","12eec77c5cb248","12f1c389742220","12f8f9c1f22967","12f98c184bb5d1","130322720f7b1","13032e07a16ac1","1307699c8c3e82","1312f77b0fb464","1319346267f340","131bdcc9406e9f","131c9bc5de5dbe","131e4f9f96be60","1329d686be87fa","132f556a439ef5","133317d30318e6","134357ecf5bc37","13449eeb89bab9","1345c1a4cf09bf","1347d64f9a6873","134c127896132e","13564abd5114b4","135a575dbb05c1","1362b297d94dfe","13636411c9bebc","13653353558fdb","1365a2b31746fa","136861fe207c39","13746768646722","1375d8fa190e34","137972db8bf884","137a8f20dd5a08","138054d9db8571","1381042b8b10e7","13875cc0faea15","138806f7471abd","13894db8bf962","138a534d11192","138b31022cc8f9","138b7952121f6b","138c80c4269916","1390a36c6470e6","139248bcb6e258","1399c21a224182","139b4624aa6d9b","139edbe057c424","13a3ab726b3784","13aca19a289e1b","13ae746e5e4966","13b26ad007980e","13b603fb1560d7","13b77e62a7467","13b7decb6d4fb7","13b9b1ec241898","13c284b6fee97d","13c51903ec807d","13c579e5783296","13c90767e836a8","13c9c48571bf8c","13d5c0a934550e","13d802d66ec59f","13d991146d627","13dcfde02ad0ef","13dd13dea50a4","13dde8221768d3","13e283d853be89","13e3f5d67b1d69","13e64ba2f02e05","13e69abf84901f","13e976f0eb5679","13f138f0d45aba","13f8548a3c36d5","13ffc4f14a7702","14086c186df176","140bf93f63e86","140c96e0236830","140d3a7b37b24f","14113423e52e77","14167aa80cad42","141c74a91d6267","141cd0b6dde443","141e525b46a716","141f536b9f82b0","142afb403f6613","142b8af5e47423","1430ade31cd1f8","143378ed4f9f1a","1435061cf974ab","1436a8caf8e9b8","143810c0c23864","14447af513db0f","144850f2ca0830","144c6d1f8b4415","14510fa4ce5ca3","145201f7013433","1452bece2b951c","1460c3f3952fef","1461638ab2c4cd","1461d91f9a639c","1464c951ea37c5","14675747f47233","1468811a73bf3","146959aedf9035","146a65c8e32339","146ab7766545","146c3140c40c93","14732df5cf5fcf","147df8f43befc4","1480125ccc4df6","148334834e64c5","14834883d47f39","1485452dfbdf1c","1487dbba287d0d","148871abebab99","1498e528276664","1499b6d83578ed","14a06c23e70b83","14a550d3f2efdb","14b5249b68f3cc","14b5704383c6ea","14bcdabdb35647","14c878c5f98c19","14c96b2d3a7c87","14cc9bbda332b5","14cd3225304e83","14cfb018795331","14d35c40310031","14d584ed0489c","14dcb80ea142e8","14e1545bc3e367","14e34ad7d75169","14e575a2686d3f","14e63a75a541ad","14e991504d5f0e","14f1f9bfbf8ec1","14f799b2214a48","14fe5460c27651","1504f514ca3be3","1508c10b3b16b5","15094b991a1689","150c0517d71258","150e07efc3e39","1510e162a80316","15157ffc99ec81","15235fdb2f04a3","15286098208193","152a6b1c2c8fe7","152c433a1bae9d","152d844a0af3b4","153148df3f062f","153949d96ee608","153c95aea58a31","153d88d965a713","153e40826ebdfa","15426c8f1a7209","1547e85b1c2ae5","154d1952ac9e82","1556d12b15c3ea","155e5ff0ad53b4","156336e02135fa","15657d4a795db1","1565da176d3a60","1570f1d60fd60f","15776a40afeb31","1578ebf4fcbab","157ff365307aa5","1581c4f1d33fe5","1581cd31f4b50e","158261359f3d64","159acd7a043f2c","159bb880950b6a","15a4bf00e4d243","15a86ed8ea042d","15ad330c80c18c","15afa07f3af86e","15bbcf91db09c0","15c66d759e5fec","15c90159743c92","15c92a43fabfa3","15c9c36e6c6f6","15d31e681127e8","15d34f3392a771","15d6c3e759a92c","15d740a2fb9c67","15dbca3ed6c34d","15dd6427d3b8c1","15e00c1a084a6f","15e1576195026f","15eec1c66a3374","15ef9b4cc08023","15f24aa27c9160","15f38c005eead8","15f5301abd79ba","15f85cd498799a","15f973b713b305","15f99b25f9d2da","15ffa8d3f391e0","1601d6692e29d3","160909b26d1bb4","160f45d2f017fb","160fa295b3917e","160fd006e7680b","161081430020b","161449ced98c9b","161be3f9030805","161c34fab65d33","16212270928002","1621f039e302d4","162365d8086a72","1624486d0aecac","163170ef8bfbdf","16356c16c76b8f","163b767fef989c","163e94ff112fac","16429d25ec7dcd","16490c09d32b2f","165157cccedfce","165243de2d5097","16549b34d3f6b5","1658d393e45736","165ee968f8c013","165f65e1275abf","1665f0411e849d","16668747325ced","16780191595ec2","1678ef4e95e1bd","167f9dab1c93db","1681df697eb72f","1682d6c57690be","16873f441861b6","1691255e699ed8","1692130f3075aa","1692dacef5130c","1692dfe675eb9c","1694b560afd9d1","169928a4a44cd6","16997b81eae06","169b3103da4d0b","169ce21f3ad50e","16a23b8b2a84ed","16a6147fab6ad9","16ac7b0beef0dc","16af9319ddd317","16b1ac257c3db","16b5b264d9a230","16b714419e37fa","16ba5060158a88","16bbd08a51f4a8","16c1875a3e4bf3","16c1ea00325633","16c3ac5c71ae7c","16c575e2047434","16d1169698a5c5","16d43786d98127","16d9fb3d513a6f","16db14e73c387e","16e8da3af9241a","16ee6648b40db3","16f239571cbe20","16f42ec11f50c","16f4b39927843d","17018e99df123d","17047abfe19211","1707a8d73f2af4","1707ef4e22fbf2","170c5f328c80a3","17108ed373f692","17191e9457145a","171e0ce666260","1720e09a6f4f3d","17218251f72575","172c0039ab7c52","172c22cad3978e","172f214e820cf1","1730102a727912","1730bff3622ac6","17333e6966370a","1734dfde3d6542","173a31c6b5cb93","173b4a24dc8fe2","173c9872b4c2be","173caf67dc439f","1742b67ab92675","1745d18fef2dd2","174d2ae45549f7","1750d3bfa3b29b","175c1336d7d327","175d015eecf71f","175d890527b5e2","175e6bc7aaa27","175e76d45c142d","1766569b60671d","176bc62e9f7472","176e88224ee69b","17717ab710746e","177e8cb02fb25e","1781f666236a93","17842399c421e5","1788f0933545ce","178dcd9d09ba6","178e2d9958f770","178f1e19b3fcb2","1791ccd79bf659","17935dd4a32693","17985389044ca4","1799e009fca4c","179b6a025dfe8","179fe3dcb4078c","17a0e416141179","17a1ca3bdd14d","17a2975c531fd5","17a9dd148af4c7","17adb4b02dd67b","17ae609b826ba7","17afed25917d83","17b08418251bda","17b19bd6df5eb2","17b1c0b2915d3b","17b2357646bd88","17b48be2355de1","17bb07208c3f9a","17beacfde25d52","17bebff8ccd7","17c226d0302f15","17c828b8b92c0","17cedcd6930169","17d4185fbf2348","17d72a38c72c91","17e7a7899417fa","17eba23d35069","17ed4392b65f53","17ee180a41a81f","17f0a07a690784","17f24a84023ca6","17fceb50b45581","17fcfd02e76e0a","17ffe6a3ffb90b","18032aa8c25b6a","180c36f3691e17","180e034696fe0c","180f624267d22f","1816fdd4a92f23","181a82f55579cb","181c43483b2676","1822b6d878bcac","182bb58eeb89d8","182d1351799aea","18320537cf1faa","18340dceb02c76","183431cd61824d","183a3e429fe789","183cee683b81f3","183d03432ada0","1843e60e8f2a78","1847b9c2406ae9","1848ef0570ddea","184a8a4ce0120","1854dd8cb92b93","1857f3297f8d11","18632780599136","1868969dd687eb","186cdd44105a0d","186dc1f37ac8f7","187a1e7354cfc0","188349d4ff6c21","18872c737fea5","188b4adeaaad79","18906b428e66e0","189230a2bd0bc1","189568dd726544","18959e70cf295c","18986c2b1a8294","189af9bab01e54","189d36c1cf2c9","189f1e0dd77e98","189fea6e6d3392","18a19be42c6ec8","18a2acf5e3bccf","18b23afa4fd7a0","18b4964135bc1a","18bc720ecc4c1d","18bebddd7109be","18c9c5aafb9989","18d0ac3bb5e13c","18d45345309157","18dd89c74b9d1d","18de8c1dd784b9","18e95bbdd4ebd9","18ebbfc551df62","18f57136cdcff1","18f7f969ed1d03","18fb3baad2144d","18fc6b70bd8524","1900c0ed9f915","190378d8c412f6","1903f025eb2f81","19082215f781c9","190be5cafbe720","191322be4a7645","1915f000f242d0","19181306406f4e","1919d7015527ec","191be2eb0be6a","191f0b7d166ab1","1926f6e487add6","192f0a4f109dfc","19333bb5552e5","193481eb061ec8","1936a80b8743eb","193da5d3ecfb76","193dbe7e1baf2c","194cea043b8f14","1950b8242e4d48","19555c1843b5d7","19599fd8a77769","1959f3a5744c9b","195a1abc57e352","195aed4419379e","195af48be8d48d","195b2f91214f51","195dea267fedfb","1960ccb5361006","19620f1574f683","196420b184ae38","19664ae5942f44","196aaa2e53e58a","196b37c674fcd8","196c88fa55b720","196cc71c66960c","1974a4a92508a9","19764e7c2a308","197a1551a5abf7","197ab3409cd6c7","197c3e12c04984","197dd77feb149a","1983c22dd46fbc","1989f941999d7b","198c39c19836a5","1990299c7ae34c","19906bd39cf0c9","199458cb1525ee","19979668328d5d","1998ef652e019a","199a966d1f9787","199e29124b4e22","19a815caecdfe7","19a84e7927478f","19ab3d46cab7e","19ad3dc799d038","19adcc97b656e1","19b140805475e","19be217c828587","19d68c11fb605d","19da7016db8e6d","19dadd7bc7be8c","19dff6407146bc","19e53a7390f88a","19e5997249affa","19e7348a12fde2","19ebb73b86fc5b","19f53dff7efcdf","19f80114040641","19fe62bbb2042f","1a03d9362d7461","1a0ef8f3c963ea","1a1635f726dd62","1a19cc0a414111","1a211411a886d1","1a216d93f3ee96","1a28dbaddab6c0","1a2a7edb5f531a","1a2c7ad52ee479","1a2d2e57eb88ec","1a2ebc5a1546d4","1a3435c29b9754","1a39bd8ef31981","1a4816fd98e3fd","1a4885861a4f0a","1a4a8b9db39289","1a4d833d84842a","1a5347baac7b9f","1a60551eb97cc2","1a617d8a681c84","1a666a441e788e","1a67e71dd0ed41","1a6a2a893b63b","1a6a9fb9a6747","1a717e3905e468","1a76018dd85792","1a77a52ced4681","1a7d543d9d0601","1a814c84164851","1a9023cf018e07","1a9d2a0c59af69","1aa2b7a1e4b7cf","1aa370ceeeb0fb","1aaedfaf3c5b51","1ab8b3ece47961","1abb1c87bcebea","1abb5deda6f471","1abc79ec8a6a5d","1abd958d5ae1e0","1aca1d417a5e0f","1acad9f8ce530d","1acdee46d16a09","1ad1527637b3a5","1ad17741524198","1ad340f0d92b9d","1ad5e6d964582f","1ad64454d62986","1ae9ac152f7c06","1aea97060c2724","1af0cb740bc68d","1b006b68527d66","1b01b2595f5175","1b029f5cb235df","1b0ce797b8395","1b0e656b97e228","1b106f35e723b1","1b122dc2d29ac5","1b19d71f421306","1b1d64d9e64e3f","1b209da38ed9c7","1b25321b13df8e","1b258f6b059ba5","1b289cad2bfa61","1b29d84074b620","1b2ebeb96be2c3","1b34e8f456646a","1b35947585a678","1b3595f3bb49a0","1b35b8014dc68d","1b3a7d19200147","1b45db38de46c","1b50ff357a026f","1b5f24bc5e7b69","1b628edff40e33","1b634b0f3159ae","1b65bc90250a6b","1b6bfff211f27a","1b6cda7090c128","1b6e830fcb9550","1b6edbc0873a44","1b6f8676d35bfd","1b7735d21a2901","1b781b6cbb71d3","1b7931ae51433e","1b7a388077d9d6","1b7eece125919","1b7fb54eaae9a0","1b887b7788d2da","1b8c6307460c76","1b8e5499454782","1b98c2eefa0e4f","1b9958e1cb6283","1b9e41176e35df","1ba6228b5a1444","1ba651514e4b69","1bb35f9ecfedba","1bc2938622985b","1bc4759442a2b4","1bc62a04acd86b","1bd2e699f71d99","1bd56ce6707813","1be61f76b8f1b4","1be9568b70f8fb","1be9fec59c8c25","1bea676d3f64b9","1beb2445ad1976","1beeb49aeaae70","1bf6623beb184b","1bf8df425f25d3","1bf9f4f3838475","1c015dc0b61a72","1c11bf75e0e6ed","1c177963917c70","1c1c9f513abdfd","1c1d792fa8ea82","1c219f05dfcbe1","1c242eaf40a405","1c2a4fb79c0872","1c2c67e3550e49","1c2cf8dbd413fa","1c3831d5a4f6d7","1c3b7770e0e362","1c3be51413a60a","1c3f91ce8e75af","1c402065ca0999","1c47acbd8c3c58","1c4f8d2c09d6d6","1c504488200343","1c50fba7bc71dc","1c54608019540e","1c548fd605596c","1c559588bcc605","1c576c2ae14c4e","1c588c89980ac7","1c59a31eff83be","1c606ac1b07c2d","1c66d059cf1563","1c69c4a16900e1","1c6d3d175be150","1c79aeb3b777c","1c79c7f9afa730","1c7f3cef719e1e","1c820f9b73948b","1c8605badd0cc5","1c8c7f8f980ef9","1c97022a14a58f","1c99115bf87035","1c9f9584e2da94","1ca7d72dff3c5e","1cacaca99c0e91","1cbc7dd1432070","1cc04873f946cd","1cc23d7ce6df7c","1cc4e4d170e8af","1cd3a0fbd2eb22","1cd61121d9da16","1cd9f687d43bec","1cda0e7abc46a1","1ce2a869e0438","1ce4e99b41dae3","1ce5828f5a979a","1ce61ecfce2ce4","1ce7610b3ee5e0","1ceee1bc2d729e","1cefd27b9c08da","1cf02d075763c0","1cf4f186d45ef0","1cf7f6e6ad6123","1cfc76e3a43a48","1d00d68a954947","1d06ca76e11393","1d0daa7b6887c1","1d0f578282d116","1d14040628a678","1d1489f88e1937","1d1b20a21a41ed","1d1e7d64760307","1d20187528798","1d235a12339d44","1d2438ba0ada52","1d2575ad0031ab","1d281670312110","1d32b4d984b1b5","1d380b05d16003","1d41c835a9f6d4","1d4c4610a295e3","1d4feff335195d","1d59e9d28bb5cc","1d6d084db1e010","1d71379a4a119f","1d716a1b3dca7c","1d758b4ecb75cf","1d77e9d9790e2a","1d78accf9f029c","1d7fdb2b3b160f","1d7fe8fd41e21d","1d811351c5049b","1d820705f8ae1b","1d8c816ef44345","1d8d92b4b3581a","1d90d93257c7d8","1d913aeebf59cf","1d91439580b411","1d92428f4e6cb0","1d928b2b62f8e2","1da9c11463a455","1dacddab339db7","1db2d6f0b65e16","1db46cbebd9f80","1db4a410e54396","1db7f16c6983e1","1dba4288b0918e","1dbb5a683a26d7","1dbd72b03dccd3","1dc29500221482","1dc9b457d10b34","1dcab23417ae4e","1dcb710c6a6eec","1dcbadead4e40e","1dcd50f55d43df","1dd014dfe66c7d","1dd356292def31","1dd5561b83756f","1dd725a995c930","1dd9772f925bf1","1dda4cfebf05cd","1ddbe4f81b1a94","1ddd286470171e","1ddfd701be3341","1def5e41f6dd1b","1defa715bc799f","1df7d36957deeb","1df926f34adffe","1df9cbb4b9dddd","1dfd34c85d20b0","1dfde74b3bbfbe","1e0029836d7364","1e002baaa2923a","1e050f995a7e2d","1e0ad99bc7f7ac","1e1199b54f547","1e19d0bf109d03","1e1e106f47ad7b","1e263a1bcc649b","1e275683b663ac","1e2c653dac3c04","1e3042c538e9a0","1e34c8bc87066b","1e350654e35580","1e3823606a5efc","1e39e0acf7bc5e","1e3ddb45661e3b","1e47e61d445c1a","1e4e632b8af2ae","1e56a82d02e624","1e5b5ed6f83177","1e5d48c7c97ab3","1e5dfcd70ab17a","1e6441932b403a","1e663fa9093292","1e67b42378ebc1","1e71cc0ee7cf7d","1e75d9b5a1dbba","1e77c35c70d8f","1e7c61a5a6a464","1e85b0c8925ea8","1e864d142c7ccb","1e87e65b5fe285","1e8bd9b51f1313","1e8c1dacee9f6f","1e8cf0372def08","1e8e31ae1d9019","1ea09203065c12","1ea41b9aa1324c","1ea4f2f303d0e6","1eab005c791293","1eb6ecac2c892c","1eb84f887ff01b","1ebaebb0ee9eb9","1ebd8a0a107957","1ebe8b6e41757c","1ec263bd062960","1ec26be19c651e","1ec49bacf5326a","1eca7e65374f83","1ecc97e1893cf4","1ece4ab35acffd","1ed0c53d1a4024","1ed4fa72e1ce4","1edb3168eb4ca2","1edb75c88d5120","1edc4e4742838a","1ee0e2bd302e16","1ee1230c5e314","1ee60d2209af59","1ee683879529fd","1eea2d2170289","1eec77e3c236f2","1ef01004bb7dc5","1ef280ddd9dab6","1ef7514f83d8c4","1efb2c8f52865d","1efe825d5029c7","1f0019366ea23f","1f03f38f74982b","1f0ca1bb126e6e","1f0f9bab80992f","1f0ff7afb79121","1f1237270f755f","1f1242f0b38773","1f14ec724e14dc","1f1979fc5fa89a","1f1ee61618db7f","1f2157a1219668","1f23c0276bd49e","1f28a395daf764","1f2bc945606761","1f305bffe35ebc","1f35e9d3f4b6c2","1f3622062aa7e9","1f37343820a39","1f3dc82dbcdbd0","1f45f5b643ee9d","1f57c3541821e2","1f5f265faec224","1f6167c2c48e11","1f6175d5570383","1f714f34588b39","1f72df31f504e1","1f75d35fb7904d","1f7b1261e838cd","1f7b650ddb789f","1f7d5891faad9b","1f8283390e0b77","1f846dc3c50901","1f8aebc03230d8","1f90a2df029281","1f918776682baf","1f997830467171","1f9f25e8b449e7","1fa121c4f8bedf","1fa3795170a193","1fb219df4d0183","1fb2557dcbabb2","1fb3338129ddfe","1fb4a0be0cec56","1fb6b092da1e8e","1fbc7f48e8549","1fbcc28dbf24fe","1fbec58696b284","1fc236bce3dee2","1fc2508570daee","1fc5e0b434789d","1fc5e6275df73c","1fcede139e98c5","1fcf5c4dd7d4f1","1fd8f8a1525ad7","1fda7e64894c46","1fdabc632a50a8","1fdeafbab3ce55","1fe0f0889630d6","1fe34330f4161d","1fe7cf0714c7c3","1fea9bd4f9f8e6","1ffd503eba051a","1ffdede43e1d98","200442d9545fd","2023cb759b006","20f91105a72d9","214dd655774ba","216c4a87259dd","219b750ff65c5","21b6475b44f15","22360a0a76813","223732f268124","22772b2d22986","2286106d4740e","228fcd3ff05f8","2318f4e0b30be","23861dd324430","23ad283fe3c60","23ebaae525055","2427e41b43e7f","2474037ccc438","2476a32c34f01","248a39b2776af","24916ebf06ea6","24c0af773a284","24d66032c3784","2537092ff2e76","25ca7726eeae0","25d2c378d3792","272318c7e0a93","274e2513eb5b1","27508724d0481","2764339249c8d","2771997158145","279796a565f2d","2837176965fcd","28375a9a1e044","2843f8c7afe7","28d849d6e8eef","28fb93024ccce","295d08e46ab3b","2a3b4ff01b660","2a69d7f78f78f","2a87e9d877f15","2af7d2c34f14d","2b1883c614930","2b1f9f6d7315","2ba483d164c75","2bace3d10ec62","2bc4738fe15b2","2c666e143b913","2ccc8b27c0284","2cfffc43ce158","2d3434b7c0b2d","2e8dc364ffbcd","2ec7da9164bec","2ecdb5c66894a","2efb2aef3dd84","2f64ba6ef5c43","2fce76197ff46","2ff038f9642c1","2ff439e067ad4","30095b50c5512","30098051a8d9b","302d8999bf2ca","306317d721518","30b725c2d02de","3112ff0c270aa","3120d1c4c367d","315f84de69091","3180216f2ee47","31aedf953f5d5","321b2e3338e2e","3279132c046f3","3289d2111aef9","328ba55b80195","328e6e2c3abe1","32d33dabd4cc3","32d8ea645c534","33de0fb74bb33","341dd4a20b720","34aec5c0d112e","34ddfdcc84e16","35f4ebadc104f","3604bab02e7ef","3635054aef694","3650df5106835","36c31a7488459","373fbcd33ee4b","37581fc32b90b","37b5755ad31c6","37f08128cd7b6","37f3612cd3b93","381a0fc4096b6","3820517a8ca0","385a28f324eef","385ba33bde84a","387d87ecb309b","38c72a297376","390c25bc2b793","3966067f0670","39e3cf3c4e731","3a4c071fb05e7","3a5c9ab9e217f","3a6b3ff8ad3b1","3aaaf99712e57","3acafab70a80c","3b218012d28ae","3b25079194344","3b3ccb551978a","3ba659677aa6b","3be9dd7966252","3c09c6fe7c0db","3c2cff2125003","3c870d40c210a","3ccaed0dc8273","3d44d74f6e0b8","3d4f62b4c8e5","3d7cb0d8e3d22","3e5118fe03ef2","3ebc6dd0bee65","3f0c3e35a189","3fbf980483320","401e35a7cbf3c","40d4a0c415fa3","410a70e08a0c7","41f0fec6a0b0a","4201196f4fa1","425948cb1723a","4277938d04383","428ff756d5bf2","42bf5291dd0a","43407d0b01b50","43ba1219f577d","43c69808846b0","43f1d26df712c","440fe3784fef5","44c1245a67cc2","44fec98f1a864","4517fcb97586b","451a42517567f","451dac60a124b","453d812a69fbe","454aec39f9dd3","456cb989f6502","45768585e5754","459b529199357","45f7544d2558f","4611eee893f6b","4666c052754","46cc5bf3f4ca8","46fc3a3294815","476ecc4733103","47f18eada5565","480be1abd959","480ea3b926ca6","487c5826b46d9","4923e25c4be2b","49737f5675ac4","4a6f9a74490c","4ab1b199bf720","4acebf5f820e9","4ae8ba6406aee","4b48ceb40cc6d","4b7706a85487a","4c221df4b1c37","4d58becaba67c","4da2a2da06d20","4e6414e8662ae","4f9e062ec33db","502a58ae92952","508d0ce50172b","50e3f5ed45a5d","5197e6d97cb81","51c107fafbfb","526be06fff16a","528a2735ffd19","52b386bf2dc9f","53421575cafb5","53581d3f6f2b","536653981413e","539873be17e","53a4d63be9ff7","53b570a85c33","548a1ea75cff1","54d4ed97e7aaa","559aa238e3553","55e554f824b91","55ee634148186","5621f6b658955","5679c0708274a","56881afb13ae2","56b788ced97e","56f3022f35318","576135c3e410b","5781d7c105f7c","57f7a3de602b7","584e46c337c4","586d4dbceb5f1","5886b2e86de03","589e090cb0146","598909aa35184","598f0795db49a","59baaac1074a8","59f0efde3192","5a3316fb9ec6b","5a48234b848ed","5b2a7b363a51f","5b9f6e508495d","5be398889bb78","5bf84961c8bc6","5c4b11d14995","5cec1294133db","5d1f37005ed08","5d80d160f535d","5e9b559f1900d","5eede61ee11c6","5f12de558dfef","5f25b691c0d1f","5f3729762b443","5f81647bfbbae","5fbc5dacc9eb8","5fce5e239c4ec","6055651104eee","607176c149968","60c09ffb7ca98","60fa21be3a404","6139dc3dc30be","61ba191df4d44","62571ddb36707","62b21627c8536","631faa728e94b","6332449c67f39","63450ec03ca67","6382afce33313","63a9fdfac5741","63d0af11f5434","64717cad71d2c","64a279bc94f1e","64b37ffaadb1b","64c13d33b585b","6552d6bd1f241","65fea3aa68415","65ff26c40e9db","665d58a0840ef","66cb48235e20a","6731fd9438d09","67911329c85bb","682a680933fa5","6833d08369b5b","68796bfbe2d1e","689a3a3bf0733","68fca259fcc29","69457e63cf9b4","6975ba7427c2","69a96deed8d2d","6a3728a9e7056","6a559fa3676","6a82a7215b1a9","6a9114ba887c8","6aa3af61bb244","6aadf8ee69073","6ac73638ce5ca","6addbb7d48768","6b0fd41c36193","6b30f35aa1627","6b4f6beedf76e","6b72f7f9c7567","6b9f7a1b14b1a","6bbff06dafd59","6c06ef8e5b0f7","6c0ec70d2829c","6d817aaf48845","6d9b839b4f761","6df21f3d91fa","6e1f7b119c03c","6eb48777c3af4","6f6916073bf51","6f6caf34891d","6f7c0263d9029","6fca31aab047","6fcc2b250740","6fd0bd5be3ce3","70045f7976e20","701cf702b895a","70580da582d9c","714c971280b4e","71501c43a94e3","7197bf459e764","723b5132bf925","72589d0f8cdf4","728bd72e7e1cd","72b706af2d09c","73814d808bc06","73850492c1e75","738c41825de74","739bfadf4587e","73aa02e6a043a","73ee6c2567f2b","73eef1cf08923","7453d25ae0253","74589ec82a89","74e76a6f7bc40","76dd1f5ed314d","770afed4cbbd2","7746aa8cc56bb","7787b68502617","77f9fa3040381","7801b86c4020","781c2eac53d9b","7839557688050","78af873cd3ae3","78df09ce77b3a","79b1de465d03a","79b7f70027b2a","7a507127f5b1d","7a5587db85345","7af0ebc553fda","7af69895acd89","7b37bb4f0f52","7b55471ad54b4","7b5b69adab195","7b7dc2e9d9282","7b86e7bc2636b","7bbc398f0520c","7c4efe8930e83","7cb0dd7dedf0e","7d19b39971dba","7d7edb633088b","7da542d16a230","7eca6977ed1ed","7f24a3d603449","7f472871b977a","7f7aa8a5d7ce5","7fd7a396778fa","7ff5c72aabb29","800f6fa5a9a18","80103669ee92c","8063f0e48ac0","806940d280c83","80b81e5f7fe33","80c930bc5ac5e","8155ecb40edb7","81e1c41606b0e","81e7fa86deba3","822e28b580523","825a74e08438c","827da3abc7037","82a30d4132ad6","82b5c79225ace","82bdae6e62664","82fa6d742458d","83103afd1ee6c","831a7dd4b26b9","833201e743ef","834031493a363","83e48a26be92f","83ef0860499bf","83fbc8944691d","8407535c951ff","841cc1d8a1fcc","84a60939950b9","850b97ac8a921","853a27b076717","8581076967708","85ea9297e1030","861f964eda549","86bbe08537253","86f4575349841","887954ca87942","88a866b0c8ec5","88cbb3a12a9c4","88d08d2a4da45","88e797e345101","88ef72d180950","89156544d8d1c","8935920f514f5","894200a3e621b","89b5476776705","89db2f555739e","8a230ace90c97","8a7fce81d3730","8ab4f68966015","8b0e2c0f056ea","8b32ae3ef2907","8b50c175f74e2","8ba3017da3fe1","8bd52799b0234","8c98841dd10d4","8d2cae5c79e8d","8ea9e1d1a245f","8eceb74ff998b","8ed615a7809f6","8f16c738adf4d","8f1a3cc7f90d5","8f9694e2f66a","900fa362735d","90182e6adb874","904551123c049","90596d4e34f09","909a8aa52bc92","90bddf16e35a6","9119f291603f","918538cdf13d3","91b5b583aa529","91bbf1073e986","92174b511d3d9","930bea9b93864","937d6ec18d2c1","93aab64d07b40","93eca22e55f45","942ece7f0d7bd","9512a6e2aa859","95c2b5f9f9f39","95edf1d17af9d","96119c9b895f","968ccf3d0f64d","969fecf02a208","96a6f62de9a41","96d1768a0cdd5","9778ed735c14c","97f47365d6dcc","98959ebc72f90","98bfeff9a1474","98e06727592a4","98f6a6fd813eb","993e564de7108","995f95723f902","99611f5d99094","997c8dc1e835d","997ef3d10116b","999edb98fa1ce","99b23fa0be3d","9a643bbf9f816","9a7ad7d35bca6","9a9c29764692","9ab410c9c86fe","9b06eebabf315","9c67ac02a472e","9ca282ef94160","9d3e398bc27d0","9db4c35c9aa52","9dc25c3a977b0","9ddb73aefc34","9e1c2c26574b0","9e2a162f86dcd","9e7eb2afcdda7","9e8ad252e6a39","9e8c9bd9d51ac","9ed5352e7c2fa","9ee6490432610","9f2198bc3b0e7","9f6a517eecf5e","9fabd5c853127","a046f7368c8ba","a06c6c02ea43b","a094399bd9911","a0c52ade4552f","a0f8b464784f8","a1446f713f2ac","a19c6d53e9147","a19d0a71281f3","a1cd46d8a456a","a1dc2a0b3d70d","a23c92375b60","a295d98c577e1","a2cd477ba611c","a2db0875157cc","a32b81573b3aa","a3b0e49fa8341","a3b737d00ef25","a3fae55a70fe2","a3feff844adef","a4705c65c37a3","a476f377ad0d7","a4994cf223bac","a4aa32aa81c33","a4cfcb9c16b01","a50211abe4eda","a593143819e54","a682d444e4ddd","a690b57629976","a69996d228850","a79fad17a7d15","a7e21c6ed2506","a7e3dfe273a47","a88e289fee70a","a8fc9a003f1","a923636c933f5","aa30ad415724a","aa3b6df6f47d9","aa8fe576eecf9","aa9a8508ef746","aac6c04facf92","aad191edc9d93","ab388a55f8f85","ab9aa647fbe43","ac0462103a8a0","ac130572d71c5","acdf5bac40dea","ad196f4c18125","ad624304df98","ad7b0b3d22aea","ae0a72d4bef82","ae8ce0bf0911c","aecfa6bcee1d6","aed24225c45d0","aedbf813c9eea","af7616078241d","afe57b78b3307","b011cc21f9ff0","b0703c904cc44","b0ce9256ea975","b0f70b7aa5df","b13f73c218024","b15c15ccaaa36","b1845f8f36e7d","b1f67740dc2c8","b2077b7c0a0ef","b25d99c7db43c","b2daa98d6cc02","b34af23341814","b351be31521ec","b3877c284f45b","b3b9f34e95606","b43a0e4dc25a8","b489eb19d9fbf","b5ae23ad90766","b5b5169b16117","b5e8bcdd3745b","b677cf1d50d3c","b68a4ae46b4bb","b6b97f2bdd722","b7a888cac6d6d","b7cb4a2bb2484","b7cf582a1d3eb","b7f336c79800a","b85ebee0b53e4","b8c8ba0abb030","b900a0672329d","b9933fc65c014","b9b2140e0422a","b9f1f38860af5","ba2562b3c3726","baa7836cef8ce","bb1a1f0304b73","bb3e185cd158","bb72e8e3cb8c","bbc06cfac5840","bc2516f28c61a","bc62760c6bc3a","bd138a4960e19","bd4aca1c6c8c9","bd769909de4f0","bd7eaf2334bc9","bd89554c6f345","bdb3de7c564b9","be0a2d374bfdb","be6e41c2d9a9e","becc45b4355d7","bf030ba89856e","bf0ae4fa2e746","bf32ce4f31bbe","c024d9fa8510a","c0496c12a352a","c0981d71296c6","c118e96fe1672","c18646ccf05e0","c1afe9b9b3ce4","c1b5af5765af9","c1d684ac934cd","c22c6e4188a7b","c235eb9058880","c2439bde35f27","c26a00df7b17c","c2b7d813cc6fc","c2ef3a93c358b","c308d562c4f9e","c36770caf0784","c37cc8d07d747","c38b26eef2c03","c3b15778a0000","c3ccb8fd4e1d9","c3ecaabe1873b","c41a1e92ba21f","c43681177c223","c46dcf68f4983","c4b10a42341b7","c4f985d575b9","c502c30c109d0","c526e4d64e4ab","c52ed05ef0f41","c56a5dde3f37","c58f28ad1b4f0","c690cec4a140a","c6dbebed465a3","c6f22ffd069de","c6fb706d79d4f","c707f1b48704c","c7919210ae431","c80a658b30ac8","c835b2fd9419e","c841fe863a661","c895c39c3fcc6","c9467676fa287","c9f8c61ac3eec","ca3cdb2c5ce9","cab66a2926e7","cbafb69d07a1c","cbe0a68abc1bb","cbe68791badcf","cc0f75b4a2a12","cc89fc832345e","cccc7c3788aa5","ccd0dfd01db0e","cd10c33159aa6","cd22c2b10ac44","cd709af01f490","ce0f0203f7639","ce191d8cb6e5b","ce1fdb48f4e70","cf56339c62369","cf652e249fdda","cf74ca1b13f3f","cf915e7e0a2d9","d0073f75f6c2e","d02368176d0e0","d04eca8458f8","d077b595885a3","d088629ee59b9","d0c29cb936244","d0cb7b877bcf6","d0d4c569b559d","d0e8d2be8be2e","d11739c8085e","d14bbcdcabf73","d19d79422c482","d1d26eb83faf5","d2490fab47a65","d24c9e4c3e163","d2e0606ef5eff","d30d92faf7c49","d3d6434ea904","d45049d40ba3","d45ee3b6cfc25","d4e23c3407b62","d58e12205a249","d62804d238dae","d6b23a0e9f3c1","d710fda133866","d79471490f7b5","d7fa4cacba03","d8e788316f108","d8ff1b0e21143","d90cfcb677180","d922acc0e67a2","d924a84b9e4f6","d97005ecb106c","d9f336d951e62","da0f8f8b5195b","db0e9df0efe4","db2fbebda4bca","db6f1c43c283a","dba0ac1e939b2","dbb41ba569232","dbffbab1d7d","dc1780cbbb365","dc550b70d3348","dc66c443a1c8e","dcb8253b8c07a","dcb8da7c3c1dd","dcdca1b30e5f0","dd82feb6d5e6","de3db8552606a","debb9046f731c","dede235e06a27","deece449979cf","df55e4e04a4f6","dfa79ae9fea0b","e0022b5c28ccd","e008c60ff2789","e03293a788a29","e07bf5ff6cf9b","e19aa9a764a6d","e1a74067c744e","e2cce4b7c9e08","e2f4bf50bfba2","e30764ed77ee6","e30d115ec9a48","e32cc9f5288ad","e3a25d6bc654d","e3c7c309c3e6","e4800a1f00bf7","e4b45dc6cca4c","e4b714d8d243d","e4d3b384c4cf9","e4e7cbf2bd7c3","e56bcbaf39164","e59837227242a","e60e21b397eea","e6df81d850987","e72c0776dd526","e840eba22c141","e84c527ca194c","e86bf6eae4990","e88b6fd33536a","e8b1e12ec837e","e900b7160e352","e9615d4d56ae6","e986426023be6","e9b6a6d93f62a","e9ddc16c8f2e3","ea2548047b7eb","ea677a7553540","eaab7d01511f","eac71b4090b1c","eb71292f85ad4","eb8a5ff25feff","ec304587c42a3","ec3463ef5811c","ec3c216bd325f","ec6d4245413e0","ec74cfce5fd07","ecb5ff173c832","ecf5fdafd17b9","ed1aec0526cf7","ed39d513864dd","ed479c6507f14","ed60e576eeb66","ed9ecd6cf9c0e","ee21cbbb27209","ee3988d6d8405","eee98f9b690c6","ef270c955e120","ef3266224f231","ef955b702fde3","ef9f8290181a5","efa1960e106ef","f0284235eba4e","f033884f85739","f039e91e164f","f0bd4c34d5708","f0dcbb662dedb","f0fd0d0784034","f1bd91d8e09c9","f1c0758cc56c7","f1cb1e2ecc87d","f2114171f2b34","f22c4ebaee3b6","f23cd93cdc683","f245a08dfcee","f2961655ec2b6","f299077813104","f2c2dcd804fc2","f3195885a2156","f348dda8bce2","f348eb9a93adc","f36e8f3f5d456","f3d0adc518498","f3d4c79a2ce80","f51fb4fb5c8b8","f5280ce2babde","f539ec298598f","f5f6060183a27","f63659fa778a6","f66b6bc1f18c2","f67f57c97ac93","f6f56c61fc418","f71415f7fbcff","f72d14717f9f4","f78dc91c76ad3","f7cced5aeafc4","f7de1ebea1385","f7e56d1820edc","f7fbf76456c9","f824b5188f721","f855999bc4156","f87f337779a39","f8a5c6c35e8f7","f8d57a83cb40d","f90d69b9f147a","f92c5a2f02e65","f974127936fc1","fa28fdf687998","fa327a8eb7fb9","fa7c5a61ebdc0","fa93f956570d8","fa966583643dc","fa9cf177a3c28","faa851313f1fa","faad9655c1179","fb4ce8f6284a8","fb60adfa7949b","fb9a1e5a6b9e9","fc041d965b0b1","fc1537181f408","fc97506ec5736","fc9f4fad46ca1","fcb3c054d4ea3","fcce3472db5e2","fcd71beba1529","fcdb711a15874","fcef368312da6","fd6dcb146dee3","fd89b05ad5dba","fe3c70153f1d1","fe4e2044b7e4c","fef09a6560c4d","ff33e3dd7a158","ff76599aa2a65","ffa5dc032f9a0","ffd1b85b77333"]; /* @say-manifest */
  var sayKnown = (function () {
    if (!SAY_MANIFEST) return null;
    var m = Object.create(null); SAY_MANIFEST.forEach(function (k) { m[k] = 1; }); return m;
  })();
  var sayBase = (function () {
    var s = document.currentScript || document.querySelector('script[src*="primary.js"]');
    return s && s.src ? s.src.replace(/p-assets\/primary\.js.*$/, "say-audio/") : "../say-audio/";
  })();
  var sayAudio = null, sayBtn = null;
  function sayStop() {
    if (sayAudio) { sayAudio.onended = sayAudio.onerror = null; sayAudio.pause(); sayAudio = null; }
    if (sayBtn) { sayBtn.classList.remove("on"); sayBtn = null; }
    if (window.speechSynthesis) speechSynthesis.cancel();
  }
  function say(text, btn) {
    if (!text) return;
    log("say", { text: text.slice(0, 40) });
    sayStop();
    var key = cyrb53(text).toString(16);
    if (!sayKnown || !sayKnown[key]) { speakFallback(text, btn); return; }
    var a = new Audio(sayBase + key + ".mp3");
    a.playbackRate = body.classList.contains("low") ? 0.85 : 1;
    sayAudio = a; sayBtn = btn || null;
    if (btn) btn.classList.add("on");
    a.onended = function () { sayStop(); };
    a.onerror = function () { sayStop(); speakFallback(text, btn); };
    var p = a.play();
    if (p && p.catch) p.catch(function () { if (sayAudio === a) { sayStop(); speakFallback(text, btn); } });
  }
  function speakFallback(text, btn) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN"; u.rate = body.classList.contains("low") ? 0.8 : 0.9;
    if (zhVoice) u.voice = zhVoice;
    if (btn) { btn.classList.add("on"); u.onend = u.onerror = function () { btn.classList.remove("on"); }; }
    speechSynthesis.speak(u);
  }
  function sayButton(text) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "say"; b.setAttribute("data-say", text);
    b.setAttribute("aria-label", "朗读：" + text); b.innerHTML = SPEAKER;
    return b;
  }
  function initSay(root) {
    [].forEach.call((root || document).querySelectorAll("button.say"), function (b) {
      if (b.getAttribute("data-say-init")) return;
      b.setAttribute("data-say-init", "1");
      if (!b.innerHTML.trim()) b.innerHTML = SPEAKER;
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "朗读：" + (b.getAttribute("data-say") || ""));
      b.addEventListener("click", function () { say(b.getAttribute("data-say"), b); });
    });
  }

  /* ---------- 步骤导航 ---------- */
  function initSteps() {
    var steps = [].slice.call(document.querySelectorAll("section.step"));
    if (!steps.length) return;
    var nav = document.createElement("nav");
    nav.className = "steps"; nav.setAttribute("role", "tablist"); nav.setAttribute("aria-label", "这一课的步骤");
    var btns = steps.map(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab");
      b.textContent = (i + 1) + " " + s.getAttribute("data-title");
      b.addEventListener("click", function () { show(i, true); });
      nav.appendChild(b);
      return b;
    });
    steps[0].parentNode.insertBefore(nav, steps[0]);
    steps.forEach(function (s, i) {
      s.id = s.id || "step" + (i + 1);
      if (i === steps.length - 1) return;
      var p = document.createElement("p"); p.className = "next";
      var b = document.createElement("button");
      b.type = "button"; b.className = "btn";
      b.textContent = "下一步：" + steps[i + 1].getAttribute("data-title") + " →";
      b.addEventListener("click", function () { show(i + 1, true); });
      p.appendChild(b); s.appendChild(p);
    });
    function show(i, scroll) {
      steps.forEach(function (s, j) { s.classList.toggle("on", j === i); btns[j].setAttribute("aria-selected", j === i ? "true" : "false"); });
      if (scroll) { nav.scrollIntoView({ block: "start" }); log("step", { step: i + 1 }); }
      document.dispatchEvent(new CustomEvent("step:show", { detail: { step: i + 1 } }));
      document.dispatchEvent(new CustomEvent("step", { detail: i + 1 }));
    }
    var m0 = location.hash.match(/^#step(\d+)$/);
    var idx0 = m0 ? Math.min(Math.max(parseInt(m0[1], 10), 1), steps.length) - 1 : 0;
    show(idx0, false);
    window.addEventListener("hashchange", function () {
      var m = location.hash.match(/^#step(\d+)$/);
      if (m) {
        var idx = parseInt(m[1], 10) - 1;
        if (idx >= 0 && idx < steps.length) show(idx, true);
      }
    });
  }

  /* ---------- 对错判定（PY-216）：每次提交都要用文字明确说「对了 / 还不对」，不能只变色或只给提示 ---------- */
  /* 开头几个字里已经说了对错的，只补符号，不重复说 */
  var RIGHT_RE = /^(✓|.{0,6}(对了|对啦|答对|也对|正确|没错|真棒|太棒|好棒|画对|填对|补全了|拼好了)|对！)/;
  var WRONG_RE = /^(✗|.{0,4}(不对|错了|还不对|没对)|不是)/;
  function okText(t) { t = (t || "").trim(); return !t ? "✓ 对了！" : (RIGHT_RE.test(t) ? "✓ " + t : "✓ 对了！" + t); }
  /* 只要前缀（教具自己拼 HTML、朗读文字不变时用）：verdictPrefix(true, "画对了！") → "✓ " */
  function verdictPrefix(ok, t) { t = (t || "").trim(); var f = ok ? okText(t) : noText(t); return f.slice(0, f.length - t.length); }
  function noText(t) { t = (t || "").trim(); return WRONG_RE.test(t) ? "✗ " + t : "✗ 还不对。" + t; }

  /* ---------- 看答案（PY-192）：错满两次（选项少时错一次到只剩一个选项）出现「看答案」，点了揭晓正确答案和讲解 ---------- */
  var PEEK_AFTER = 2;
  function addPeek(after) {
    var n = 0, btn = null;
    return {
      miss: function (anchor, reveal) {
        n++;
        if (btn || n < after) return;
        btn = document.createElement("button");
        btn.type = "button"; btn.className = "btn ghost peek"; btn.textContent = "看答案";
        btn.addEventListener("click", function () { btn.remove(); btn = null; reveal(); });
        anchor.parentNode.insertBefore(btn, anchor.nextSibling);
      },
      clear: function () { if (btn) { btn.remove(); btn = null; } }
    };
  }

  /* ---------- 选择题 ---------- */
  function initPredict(root) {
    [].forEach.call((root || document).querySelectorAll(".predict"), function (box) {
      if (box.getAttribute("data-init")) return;
      box.setAttribute("data-init", "1");
      var id = box.getAttribute("data-id"), ans = box.getAttribute("data-answer"), tries = 0;
      var fb = document.createElement("p"); fb.className = "fb"; fb.setAttribute("aria-live", "polite");
      var opts = box.querySelector(".opts");
      if (opts) opts.parentNode.insertBefore(fb, opts.nextSibling);
      var nOpt = box.querySelectorAll(".opt").length;
      var peek = addPeek(Math.max(1, Math.min(PEEK_AFTER, nOpt - 1)));
      function showAnswer() {
        var right = null;
        [].forEach.call(box.querySelectorAll(".opt"), function (o) { if (o.getAttribute("data-v") === ans) right = o; });
        if (right) right.classList.add("right");
        box.classList.add("done", "peeked");
        fb.textContent = "正确答案是 " + ans + "。";
        log("peek", { id: id, answer: ans, tries: tries });
        try { box.dispatchEvent(new CustomEvent("predict:peek", { detail: { id: id, answer: ans }, bubbles: true })); } catch (e) { /* ignore */ }
      }
      [].forEach.call(box.querySelectorAll(".opt"), function (o) {
        o.type = "button";
        o.addEventListener("click", function () {
          if (box.classList.contains("done")) return;
          var v = o.getAttribute("data-v"), ok = v === ans;
          tries++;
          log("predict", { id: id, choice: v, correct: ok, first: tries === 1 });
          if (ok) {
            o.classList.add("right");
            box.classList.add("done");
            fb.className = "fb ok";
            fb.textContent = okText(o.getAttribute("data-ok") || box.getAttribute("data-ok"));
            peek.clear();
          } else {
            o.classList.add("wrong");
            fb.className = "fb no";
            fb.textContent = noText(o.getAttribute("data-hint") || box.getAttribute("data-hint") || "再看一看，换一个试试。");
            peek.miss(fb, showAnswer);
          }
          try { box.dispatchEvent(new CustomEvent("predict:pick", { detail: { id: id, choice: v, answer: ans, correct: ok }, bubbles: true })); } catch (e) { /* ignore */ }
        });
      });
    });
  }

  /* ---------- 填空题（数字键盘 / 分数两格） ---------- */
  function parseFrac(s) { var m = /^(\d+)\/(\d+)$/.exec(String(s)); return m ? [+m[1], +m[2]] : null; }
  function sameValue(a, b, kind) {
    if (kind === "num") return a !== "" && +a === +b;
    var x = parseFrac(a), y = parseFrac(b);
    if (!x || !y || !x[1] || !y[1]) return false;
    return x[0] * y[1] === y[0] * x[1];
  }
  /* 分数题目级写法要求 data-form（PY-216，原为 p5b-u4/u6 各页复制的拦截脚本）：
     simplest 要最简分数；denom 要分母等于答案分母；exact 要和答案逐字一致。大小已相等时才调用。 */
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function fracFormMiss(q, v, ans) {
    var form = q.getAttribute("data-form"), x = parseFrac(v), y = parseFrac(ans);
    if (!form || !x || !y) return "";
    if (form === "simplest" && gcd(x[0], x[1]) !== 1) return "大小没有错，但还能约分，继续约成最简分数。";
    if (form === "denom" && x[1] !== y[1]) return "大小没有错，不过题目要的是分母是 " + y[1] + " 的分数，再改一改。";
    if (form === "exact" && (x[0] !== y[0] || x[1] !== y[1])) return "大小相等，但这道题要按题意直接写出分数，再改一改。";
    return "";
  }
  function initFill(root) {
    [].forEach.call((root || document).querySelectorAll(".q[data-kind]"), function (q) {
      if (q.getAttribute("data-init")) return;
      q.setAttribute("data-init", "1");
      var kind = q.getAttribute("data-kind"), id = q.getAttribute("data-id"), ans = q.getAttribute("data-answer");
      var miss = {}, tip = {};
      try { miss = JSON.parse(q.getAttribute("data-miss") || "{}"); } catch (e) { /* ignore */ }
      try { tip = JSON.parse(q.getAttribute("data-tip") || "{}"); } catch (e) { /* ignore */ }
      var wrap = document.createElement("div"); wrap.className = "ans";
      var boxes = [], cur = 0;
      function mkBox(label) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "box"; b.setAttribute("aria-label", label); b.textContent = "";
        b.addEventListener("click", function () { focusBox(boxes.indexOf(b)); });
        boxes.push(b); return b;
      }
      if (kind === "frac") {
        var fb0 = document.createElement("span"); fb0.className = "fbox";
        var top = mkBox("分子"), bar = document.createElement("span"), bot = mkBox("分母");
        bar.className = "fbar";
        fb0.appendChild(top); fb0.appendChild(bar); fb0.appendChild(bot);
        wrap.appendChild(fb0);
        cur = 1; // 先写分母（一共分成几份），再写分子
      } else {
        wrap.appendChild(mkBox("答案"));
      }
      if (isHighGrade) {
        var goInline = document.createElement("button");
        goInline.type = "button"; goInline.className = "btn go-inline"; goInline.textContent = "好了";
        goInline.addEventListener("click", function () { press("go"); });
        var padBtn = document.createElement("button");
        padBtn.type = "button"; padBtn.className = "btn ghost pad-toggle"; padBtn.textContent = "数字键";
        padBtn.setAttribute("aria-expanded", "false");
        padBtn.addEventListener("click", function () {
          var open = q.classList.toggle("pad-open");
          padBtn.setAttribute("aria-expanded", open ? "true" : "false");
          if (boxes[cur]) boxes[cur].focus();
        });
        wrap.appendChild(goInline);
        wrap.appendChild(padBtn);
      }
      var pad = document.createElement("div"); pad.className = "pad"; pad.setAttribute("aria-label", "数字键盘");
      var dec = kind === "num" && q.hasAttribute("data-dec");
      "1234567890".split("").forEach(function (d) { pad.appendChild(key(d, d)); });
      if (dec) pad.appendChild(key(".", ".", "小数点"));
      pad.appendChild(key("⌫", "del", "删除"));
      var go = key("好了", "go", "检查答案"); go.className = "go"; pad.appendChild(go);
      wrap.appendChild(pad);
      var fb = document.createElement("p"); fb.className = "fb"; fb.setAttribute("aria-live", "polite");
      var reveal = q.querySelector(".reveal");
      q.insertBefore(wrap, reveal || null);
      q.insertBefore(fb, reveal || null);
      var peek = addPeek(PEEK_AFTER);
      function showAnswer() {
        if (kind === "frac") { var f = parseFrac(ans) || [ans, ""]; boxes[0].textContent = f[0]; boxes[1].textContent = f[1]; }
        else boxes[0].textContent = ans;
        boxes.forEach(function (b) { b.disabled = true; });
        q.classList.add("done", "peeked");
        fb.className = "fb tip";
        fb.innerHTML = "正确答案：" + (kind === "frac" ? fracHTML(boxes[0].textContent, boxes[1].textContent) : ans);
        log("peek", { id: id, answer: ans });
        try { q.dispatchEvent(new CustomEvent("fill:peek", { detail: { id: id, answer: ans }, bubbles: true })); } catch (e) { /* ignore */ }
      }
      focusBox(cur);
      function key(txt, v, label) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = txt; b.setAttribute("aria-label", label || txt);
        b.addEventListener("click", function () { press(v); });
        return b;
      }
      function focusBox(i) {
        if (q.classList.contains("done")) return;
        cur = i; boxes.forEach(function (b, j) { b.classList.toggle("on", j === i); b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      }
      function press(v) {
        if (q.classList.contains("done")) return;
        var b = boxes[cur];
        if (v === "del") { b.textContent = b.textContent.slice(0, -1); return; }
        if (v === "go") return check();
        if (b.textContent.length >= (dec ? 8 : (kind === "frac" ? 3 : 5))) return;
        if (v === "." && (b.textContent.indexOf(".") >= 0 || !b.textContent)) return;
        b.textContent += v;
        fb.textContent = ""; fb.className = "fb";
        // 分数：中低段分母 2–10 时，分母写完一位后自动跳到分子（高段分母常为两位数，由点击或 / 键切换）
        if (!isHighGrade && kind === "frac" && cur === 1 && b.textContent !== "1") focusBox(0);
      }
      function value() { return kind === "frac" ? boxes[0].textContent + "/" + boxes[1].textContent : boxes[0].textContent; }
      function check() {
        var v = value();
        if (kind === "frac" && (!boxes[0].textContent || !boxes[1].textContent)) { fb.className = "fb tip"; fb.textContent = "上面、下面两个格都要填。"; return; }
        if (kind === "num" && !boxes[0].textContent) { fb.className = "fb tip"; fb.textContent = "先在格子里填一个数。"; return; }
        /* 题目级可选约束 data-places="N"：要求写成恰好 N 位小数的规范形式（N=0 为整数）。数值对但写法不符（多尾 0、前导 0）→ 提示、不完成、可再答；未标注的题不受影响。 */
        var places = q.getAttribute("data-places");
        if (kind === "num" && places !== null && !tip[v] && sameValue(v, ans, kind)) {
          var np = parseInt(places, 10);
          var canon = np > 0 ? new RegExp("^(0|[1-9][0-9]*)\\.[0-9]{" + np + "}$") : /^(0|[1-9][0-9]*)$/;
          if (!canon.test(v)) {
            fb.className = "fb tip";
            fb.textContent = q.getAttribute("data-places-tip") || ("数值对了，但这题要写成" + (np > 0 ? "恰好 " + np + " 位小数" : "整数") + "，不要多写尾部的 0 或前面的 0。");
            log("fill", { id: id, value: v, correct: false, hint: "tip", _emitted: true });
            return;
          }
        }
        /* 分数前导 0（如 02/5）只是写法问题：提示、不算一次作答 */
        if (kind === "frac" && (/^0\d/.test(boxes[0].textContent) || /^0\d/.test(boxes[1].textContent))) {
          fb.className = "fb tip"; fb.textContent = "数字前面不用多写 0，重新填一填。";
          log("fill", { id: id, value: v, correct: false, hint: "tip", _emitted: true });
          return;
        }
        var ok = sameValue(v, ans, kind), formMiss = ok && kind === "frac" ? fracFormMiss(q, v, ans) : "";
        if (formMiss) ok = false; // 大小对、写法不合题目要求（data-form）：算答错，正常记录、计入「看答案」；优先于 data-tip
        if (!formMiss && tip[v]) { fb.className = "fb tip"; fb.textContent = tip[v]; log("fill", { id: id, value: v, correct: false, hint: "tip", _emitted: true }); return; }
        log("fill", { id: id, value: v, correct: ok, _emitted: true });
        if (ok) {
          q.classList.add("done"); fb.className = "fb ok";
          fb.textContent = okText(q.getAttribute("data-ok"));
          boxes.forEach(function (b) { b.disabled = true; });
          peek.clear();
        } else {
          fb.className = "fb no";
          fb.textContent = noText(formMiss || miss[v] || q.getAttribute("data-hint") || "再想一想，改一改再点「好了」。");
          peek.miss(fb, showAnswer);
        }
        try { q.dispatchEvent(new CustomEvent("fill:submit", { detail: { id: id, value: v, answer: ans, correct: ok }, bubbles: true })); } catch (e) { /* ignore */ }
      }
      q.addEventListener("keydown", function (e) {
        if (q.classList.contains("done")) return;
        if (/^[0-9]$/.test(e.key) || (dec && e.key === ".")) { press(e.key); e.preventDefault(); }
        else if (e.key === "Backspace") { press("del"); e.preventDefault(); }
        else if (e.key === "Enter" && e.target.closest(".pad, button:not(.box)") === null) { press("go"); e.preventDefault(); }
        else if (kind === "frac" && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "/")) { focusBox(e.key === "ArrowUp" ? 0 : (e.key === "ArrowDown" ? 1 : (cur === 1 ? 0 : 1))); e.preventDefault(); }
      });
    });
  }

  /* 家长导读：第一次打开时展开；家长收起后，这一页以后默认收起（只存在本机浏览器） */
  function initParent() {
    var d = document.querySelector("details.parent");
    if (!d) return;
    var k = "peiyu.ps.parentClosed." + sec;
    if (store(k) === "1") d.open = false;
    d.addEventListener("toggle", function () { store(k, d.open ? "0" : "1"); });
  }

  function init() {
    initParent();
    renderFracs();
    initSteps();
    initPredict();
    initFill();
    initSay();
    log("open", {});
  }
  window.PeiyuP = { okText: okText, noText: noText, verdictPrefix: verdictPrefix, log: log, readLog: readLog, say: say, sayButton: sayButton, cn: cn, fracWord: fracWord, fracHTML: fracHTML, initSay: initSay, LOG_KEY: LOG_KEY };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
