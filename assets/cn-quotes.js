/* Shared four-codepoint content comparison. No stored aliases or ledger migration. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PeiyuCNQuotes = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var rules = { '“': '「', '”': '」', '‘': '『', '’': '』' };
  function normalize(text) { return text.replace(/[“”‘’]/g, function (c) { return rules[c]; }); }
  function versions(input) {
    var list = Array.isArray(input.contentVersions) ? input.contentVersions.filter(function (v) { return typeof v === 'string' && v; }) : [];
    if (typeof input.contentVersion === 'string' && list.indexOf(input.contentVersion) < 0) list.push(input.contentVersion);
    return list;
  }
  function accepts(version, input) { return versions(input).indexOf(version) >= 0; }
  async function digests(text, crypto, prefix) {
    prefix = prefix || '';
    var result = [];
    for (var value of [text, normalize(text)]) {
      var hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
      var digest = prefix + Array.from(new Uint8Array(hash), function (n) { return n.toString(16).padStart(2, '0'); }).join('');
      if (result.indexOf(digest) < 0) result.push(digest);
    }
    return result;
  }
  return { normalize: normalize, versions: versions, accepts: accepts, digests: digests };
});
