// Diagnostic test: external JS loaded into Gemini Canvas via jsDelivr.
// Goal: verify (1) Canvas allows external <script src> and (2) Gemini API
// key injection still works for fetches originating from this externally-
// loaded code.

window.CANVAS_TEST_LOADED = true;

(function () {
  const t1 = document.getElementById('test-1');
  const t1r = document.getElementById('test-1-result');
  if (t1 && t1r) {
    t1.className = 'test pass';
    t1r.innerHTML = 'PASS - external JS loaded from jsDelivr.';
  }

  const t3 = document.getElementById('test-3');
  const t3r = document.getElementById('test-3-result');
  if (!t3 || !t3r) return;
  t3r.textContent = 'Calling Gemini API...';

  const apiKey = (typeof window.__CANVAS_API_KEY === 'string')
    ? window.__CANVAS_API_KEY
    : '';
  const keyPreview = apiKey
    ? `(length=${apiKey.length}, starts="${apiKey.slice(0, 4)}...")`
    : '(empty)';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: 'Reply with only the single word: PONG' }] }],
  };

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((r) => r.json().then((data) => ({ ok: r.ok, status: r.status, data })))
    .then(({ ok, status, data }) => {
      const text = data && data.candidates && data.candidates[0]
        && data.candidates[0].content && data.candidates[0].content.parts
        && data.candidates[0].content.parts[0]
        && data.candidates[0].content.parts[0].text;
      if (ok && text) {
        t3.className = 'test pass';
        t3r.innerHTML = `PASS - Gemini responded. API key injection works through external JS.<br>`
          + `<small>Key seen by external JS: ${keyPreview}</small>`
          + `<pre>${text}</pre>`;
      } else {
        t3.className = 'test fail';
        t3r.innerHTML = `FAIL - HTTP ${status}.<br>`
          + `<small>Key seen by external JS: ${keyPreview}</small>`
          + `<pre>${JSON.stringify(data, null, 2)}</pre>`
          + `<small>Likely cause: Canvas did not inject API key into a fetch originating from externally-loaded script.</small>`;
      }
    })
    .catch((err) => {
      t3.className = 'test fail';
      t3r.innerHTML = `FAIL - fetch threw: ${err.message}<br>`
        + `<small>Likely cause: network error, CORS, or COEP block.</small>`;
    });
})();
