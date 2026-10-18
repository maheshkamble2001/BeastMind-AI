import { useState } from 'react';
import { api } from './services/apiClient.js';

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!file) return;
    setBusy(true); setErr(null); setResult(null);
    try {
      const fd = new FormData();
      fd.append('audio', file, file.name);
      fd.append('language', 'auto');
      const { data } = await api.post('/voice-to-text/transcribe', fd);
      setResult(data);
    } catch (e) {
      setErr(e.response?.data?.detail ?? e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h1>Upload test</h1>
      <input
        type="file"
        accept="audio/*,video/*"
        onChange={(e) => { setFile(e.target.files[0]); setResult(null); setErr(null); }}
      />
      {file && <p>{file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB</p>}
      <button onClick={submit} disabled={!file || busy}>
        {busy ? 'Transcribing…' : 'Transcribe'}
      </button>
      {err && <p style={{ color: 'crimson' }}>Error: {err}</p>}
      {result && (
        <div style={{ marginTop: 16 }}>
          <p>Language: {result.language} ({(result.language_probability * 100).toFixed(1)}%)</p>
          <p>Duration: {result.duration_seconds.toFixed(2)}s</p>
          <textarea readOnly value={result.text} rows={8} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}