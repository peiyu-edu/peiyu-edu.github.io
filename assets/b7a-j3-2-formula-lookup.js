/* j3-2 only: a finite lookup-and-substitution task; drafts stay in the DOM. */
(() => {
  'use strict';
  const mount = document.getElementById('formula-lookup');
  if (!mount) return;
  mount.innerHTML = `
  <form class="card expression-work context-work" id="temperature-lookup" novalidate>
    <h3>查阅小任务：同一温度，两种温标</h3>
    <p>摄氏温度和华氏温度是同一温度的两种表示。请先查资料，找到两种温标之间的换算关系，再代入计算。这不是前面随时刻变化的温度模型。</p>
    <p>沿用上面的查阅记录方法。可选读下方离线卡，也可查自己的资料。草稿只在本页，刷新清空。自由填写的来源、公式、过程与解释不自动判真，请按准则自核。</p>
    <details class="more"><summary>离线资料卡 A：摄氏与华氏</summary>
      <p>C、F 分别是同一温度用 ℃、℉ 表示时的数值。摄氏转华氏：F=1.8×C+32；华氏转摄氏：C=(F−32)÷1.8。这里转换的是温度读数，不是温差。</p>
    </details>
    <details class="more"><summary>离线资料卡 B：摄氏与开尔文</summary>
      <p>C 是摄氏温度数值，K 是开尔文温度数值，K=C+273.15；前者单位 ℃，后者单位 K。这条关系不含华氏温度。</p>
    </details>
    <p>两卡为本页改写，依据 <a href="https://www.nist.gov/pml/owm/si-units-temperature" target="_blank" rel="noopener noreferrer">NIST：SI Units – Temperature</a> 的 Temperature Conversion (Exact) 表（核对于2026-10-31）。可离线使用本页卡；记录时写卡名及原表位置。</p>
    <fieldset data-research><legend>一、查到并记录</legend>
      <label>本任务适用哪种换算？<select name="scale"><option value="">请选择</option><option value="cf">摄氏与华氏</option><option value="ck">摄氏与开尔文</option></select></label>
      <label>资料名称与能再次找到的位置（卡名/页码/网址和表名）<textarea name="source" maxlength="600"></textarea></label>
      <label>记录正向与反向公式，并说明为何适用本任务<textarea name="formula" maxlength="600"></textarea></label>
      <label>每个字母的量、单位；说明字母代表数值<textarea name="variables" maxlength="600"></textarea></label>
      <button class="btn" type="button" data-continue aria-expanded="false" aria-controls="temperature-calculation">保存查阅稿，打开数据</button>
    </fieldset>
    <fieldset id="temperature-calculation" data-calculation hidden disabled><legend>二、实际代入与反向检验</legend>
      <p>① 一份记录是 25℃，转写成华氏温度。② 另一份记录是 68℉，转写成摄氏温度，再将第二题所得摄氏数值代回正向公式，看能否回到原读数。</p>
      <p>用你查到的公式写取值、代入、运算与答语。两道数值都能精确写出。数值栏仅收非负整数或有限小数：整数部分1至6位，小数最多3位，可有前导 +；单位另选。不收算式、分数、指数、负号、近似符号或单位文字，不作四舍五入判断。</p>
      <label>两道题的完整代入与运算（反向检验也写出）<textarea name="working" maxlength="1000"></textarea></label>
      <label>① 换算后的数值<input name="forward" inputmode="decimal" maxlength="20"></label>
      <label>① 结果单位<select name="forwardUnit"><option value="">请选择</option><option value="c">℃（摄氏度）</option><option value="f">℉（华氏度）</option><option value="k">K（开尔文）</option></select></label>
      <label>② 换算后的数值<input name="reverse" inputmode="decimal" maxlength="20"></label>
      <label>② 结果单位<select name="reverseUnit"><option value="">请选择</option><option value="c">℃（摄氏度）</option><option value="f">℉（华氏度）</option><option value="k">K（开尔文）</option></select></label>
      <label>解释两道结果的实际意义；反向检验为何能帮助发现错误？<textarea name="meaning" maxlength="600"></textarea></label>
      <button class="btn" type="submit">核对数值和单位</button>
    </fieldset>
    <button class="btn ghost" type="reset">清空本任务</button>
    <p class="result" role="status" aria-live="polite"></p>
    <div data-guide hidden><p>查阅与解释自核准则（系统未认证这些文字）：来源位置能复查吗？公式方向和题目温标相符吗？每个字母的数值与单位明确吗？先减32的括号有没有保留？两题都写了取值、完整运算、带单位答语吗？把第二题结果代回正向公式是否得到68？说明这只是同一温度的另一种表示，不能说换算使物体升温或降温。</p></div>
  </form>`;
  const form = mount.querySelector('form');
  const research = form.querySelector('[data-research]');
  const calculation = form.querySelector('[data-calculation]');
  const next = form.querySelector('[data-continue]');
  const status = form.querySelector('[role=status]');
  const guide = form.querySelector('[data-guide]');
  const field = name => form.elements.namedItem(name);
  const value = name => field(name).value.trim();
  let ready = false;
  function clearFeedback() {
    status.textContent = '';
    guide.hidden = true;
    form.dataset.state = 'draft';
  }
  function closeCalculation() {
    ready = false;
    calculation.hidden = calculation.disabled = true;
    next.setAttribute('aria-expanded', 'false');
    calculation.querySelectorAll('input,textarea,select').forEach(el => { el.value = ''; });
    clearFeedback();
  }
  function feedback(message, state) {
    status.textContent = message;
    form.dataset.state = state;
  }
  function filled(names) { return names.every(name => value(name) !== ''); }
  next.addEventListener('click', () => {
    if (!filled(['scale', 'source', 'formula', 'variables'])) {
      feedback('请先选温标，并补齐来源、公式及变量单位；空白不能继续。', 'incomplete');
      return;
    }
    if (value('scale') !== 'cf') {
      feedback('所选温标不匹配：本任务要在摄氏与华氏间换算，请重新查阅。', 'retry');
      return;
    }
    ready = true;
    calculation.hidden = calculation.disabled = false;
    next.setAttribute('aria-expanded', 'true');
    feedback('查阅稿已保留；未认证公式正确或来源真实。请对照所选资料自核，再实际代入。', 'draft');
  });
  function exact(raw, target) {
    if (!/^\+?\d{1,6}(?:\.\d{1,3})?$/.test(raw)) return null;
    const [whole, fraction = ''] = raw.replace(/^\+/, '').split('.');
    return BigInt(whole + fraction) === BigInt(target) * 10n ** BigInt(fraction.length);
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!ready) { feedback('请先完成查阅记录并打开数据。', 'incomplete'); return; }
    if (!filled(['working', 'forward', 'forwardUnit', 'reverse', 'reverseUnit', 'meaning'])) {
      feedback('请补齐两道数值、单位、完整过程与意义解释。', 'incomplete');
      return;
    }
    const forward = exact(value('forward'), 77);
    const reverse = exact(value('reverse'), 20);
    if (forward === null || reverse === null) {
      feedback('格式暂不支持：数值栏请按说明填非负整数或有限小数，单位另选。', 'format');
      return;
    }
    const unit1 = value('forwardUnit') === 'f';
    const unit2 = value('reverseUnit') === 'c';
    feedback(`① ${forward ? '数值相符' : '数值需重算'}，${unit1 ? '单位相符' : '单位需重选'}；② ${reverse ? '数值相符' : '数值需重算'}，${unit2 ? '单位相符' : '单位需重选'}。只核对这两道固定数值和单位；公式、来源、过程与解释请按下方准则自核。`, forward && reverse && unit1 && unit2 ? 'matched' : 'retry');
    guide.hidden = false;
  });
  form.addEventListener('input', event => {
    if (research.contains(event.target)) closeCalculation();
    else clearFeedback();
  });
  form.addEventListener('change', event => {
    if (research.contains(event.target)) closeCalculation();
    else clearFeedback();
  });
  form.addEventListener('reset', () => {
    closeCalculation();
    feedback('本任务已清空，请重新查阅。', 'draft');
  });
  closeCalculation();
})();
