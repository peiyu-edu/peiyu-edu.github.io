/* The existing lab preview is intentionally locked until its prediction is
   answered. Make the same state explicit for keyboard and assistive technology;
   the original quiz still controls when it unlocks. */
(function () {
  'use strict';
  function sync() {
    pending = false;
    document.querySelectorAll('.lab-body').forEach(function (body) {
      var locked = body.classList.contains('locked');
      if (body.getAttribute('aria-disabled') !== String(locked)) body.setAttribute('aria-disabled', String(locked));
      if (body.inert !== locked) body.inert = locked;
    });
  }
  var pending = false;
  function schedule(records) {
    if (pending || !records.some(function (record) {
      return record.type === 'childList' || record.target.classList.contains('lab-body');
    })) return;
    pending = true;
    Promise.resolve().then(sync);
  }
  sync();
  new MutationObserver(schedule).observe(document.body, {subtree:true,childList:true,attributes:true,attributeFilter:['class']});
})();
