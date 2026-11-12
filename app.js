(() => {
  const STORAGE_KEY = 'pursely-founder-discovery-v1';
  const HEADERS = ['Section','Area','Variable / ID','Question / information required','Previously established value','Status of existing value','Unit','Your answer','Additional notes / source / quote reference','Guidance'];
  const sectionsRoot = document.querySelector('#sections');
  const fields = [];
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) { saved = {}; }

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const csv = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  const groups = new Map();
  try {
    const data = JSON.parse(document.querySelector('#field-data').textContent);
    data.forEach(f => {
      fields.push(f);
      if (!groups.has(f.section)) groups.set(f.section, []);
      groups.get(f.section).push(f);
    });
    document.querySelector('#field-total').textContent = `${fields.length} questions`;
    document.querySelector('#progress-label').textContent = `0 of ${fields.length} answered`;
    [...groups.entries()].forEach(([name, items], sectionIndex) => {
      const details = document.createElement('details');
      details.className = 'section';
      details.dataset.section = name.toLowerCase();
      const sectionTitle = name.replace(/^\d+\s*/, '');
      details.innerHTML = `<summary><span class="section-title"><span class="section-number">${String(sectionIndex + 1).padStart(2,'0')}</span><span class="section-name">${esc(sectionTitle)}</span></span><span class="section-count"><span class="answered-count">0</span> / ${items.length} answered&nbsp; <span class="chevron">⌄</span></span></summary><div class="section-body"></div>`;
      const body = details.querySelector('.section-body');
      items.forEach(f => {
        const value = saved[f.id] || {};
        const block = document.createElement('div');
        block.className = 'field';
        block.dataset.search = [f.area,f.id,f.question,f.plainQuestion,f.existing,f.guidance,f.unit].join(' ').toLowerCase();
        block.innerHTML = `<div class="field-copy"><div class="field-top"><span class="field-question">${esc(f.plainQuestion || f.question)}</span><span class="field-id">${esc(f.id)}</span></div><p class="field-original"><span>Template wording</span>${esc(f.question)}</p><div class="field-meta">${f.area ? `<b>${esc(f.area)}</b>` : ''}${f.unit ? `${f.area ? ' · ' : ''}${esc(f.unit)}` : ''}${f.status ? `${(f.area || f.unit) ? ' · ' : ''}${esc(f.status)}` : ''}</div>${f.existing ? `<p class="field-description"><b>Current reference:</b> ${esc(f.existing)}</p>` : ''}<p class="field-guidance">${esc(f.guidance || `Enter the current best estimate or write UNKNOWN. Include the period and scope that apply, and cite the evidence source and date in notes.`)}</p></div><div class="answer-wrap"><textarea class="answer" data-id="${esc(f.id)}" aria-label="Answer: ${esc(f.question)}" placeholder="Your answer">${esc(value.answer || '')}</textarea><textarea class="notes" data-notes-id="${esc(f.id)}" aria-label="Notes, source and evidence for ${esc(f.question)}" placeholder="Notes · evidence type, source &amp; date">${esc(value.notes || '')}</textarea></div>`;
        const answer = block.querySelector('.answer');
        const notes = block.querySelector('.notes');
        answer.addEventListener('input', () => { writeValue(f.id, 'answer', answer.value); updateProgress(); });
        notes.addEventListener('input', () => writeValue(f.id, 'notes', notes.value));
        body.appendChild(block);
      });
      sectionsRoot.appendChild(details);
    });
    document.querySelectorAll('.identity-grid input').forEach(el => {
      el.value = saved[`meta:${el.id}`] || (el.id === 'response-date' ? new Date().toLocaleDateString('en-CA') : '');
      el.addEventListener('input', () => { saved[`meta:${el.id}`] = el.value; persist(); });
    });
    updateProgress();
  } catch (err) { sectionsRoot.innerHTML = `<p class="empty">The question list could not be read. Reload this page or contact the form owner.</p>`; console.error('Form data could not be loaded:', err); }

  const saveTimeEl = document.querySelector('#save-time');
  const statusDot = document.querySelector('.status-dot');
  function showSaveTime() {
    const ts = saved._lastSaved;
    if (!ts) return;
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    saveTimeEl.textContent = `· ${hh}:${mm}`;
  }
  function persist() {
    try {
      saved._lastSaved = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      showSaveTime();
      statusDot.classList.add('pulse');
      setTimeout(() => statusDot.classList.remove('pulse'), 200);
    } catch (_) {}
  }
  showSaveTime();
  window.addEventListener('beforeunload', () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (_) {} });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (_) {} } });
  function writeValue(id, key, value) { saved[id] = saved[id] || {}; saved[id][key] = value; persist(); }
  function updateProgress() {
    const total = fields.length;
    let count = 0;
    document.querySelectorAll('.section').forEach(section => {
      let sub = 0;
      section.querySelectorAll('.answer').forEach(input => { if (input.value.trim()) { sub++; count++; } });
      section.querySelector('.answered-count').textContent = sub;
    });
    document.querySelector('#progress-label').textContent = `${count} of ${total} answered`;
    document.querySelector('#progress-fill').style.width = `${total ? count / total * 100 : 0}%`;
  }
  document.querySelector('#search').addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    document.querySelectorAll('.section').forEach(section => {
      let shown = 0;
      section.querySelectorAll('.field').forEach(field => {
        const match = !query || field.dataset.search.includes(query);
        field.hidden = !match;
        if (match) shown++;
      });
      section.hidden = shown === 0;
      if (query && shown) section.open = true;
    });
  });
  document.querySelector('#expand-all').addEventListener('click', event => {
    const sections = [...document.querySelectorAll('.section')].filter(s => !s.hidden);
    const shouldOpen = sections.some(s => !s.open);
    sections.forEach(s => { s.open = shouldOpen; });
    event.currentTarget.textContent = shouldOpen ? 'Collapse all' : 'Expand all';
  });
  document.querySelector('#download').addEventListener('click', () => {
    const name = document.querySelector('#respondent-name').value.trim();
    const email = document.querySelector('#respondent-email').value.trim();
    const responseDate = document.querySelector('#response-date').value;
    const timestamp = new Date().toISOString();
    const outHeaders = [...HEADERS, 'Respondent name', 'Respondent email', 'Response date', 'Exported at (UTC)'];
    const rows = fields.map(f => {
      const value = saved[f.id] || {};
      const row = [f.section, f.area, f.id, f.question, f.existing, f.status, f.unit, value.answer || '', value.notes || '', f.guidance];
      return [...row, name, email, responseDate, timestamp].map(csv).join(',');
    });
    const blob = new Blob(['\ufeff' + [outHeaders.map(csv).join(','), ...rows].join('\r\n')], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (name || 'team-member').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    link.href = url;
    link.download = `pursely-unit-economics-response-${safeName || 'team-member'}-${responseDate || new Date().toLocaleDateString('en-CA')}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  });
})();
