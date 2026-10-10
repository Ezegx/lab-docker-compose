import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchLinks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/links');
      setLinks(res.data);
    } catch (err) {
      showToast('Ошибка загрузки данных');
    }
  };

  const shortenUrl = async () => {
    if (!url) return showToast('Введите ссылку');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/shorten', { url });
      setUrl('');
      await fetchLinks();
      showToast('Ссылка успешно сокращена!');
    } catch (err) {
      showToast('Ошибка сокращения');
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Скопировано: ' + text);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          text-align: center;
          color: white;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 2.5rem;
          margin: 0 0 8px 0;
          font-weight: 700;
        }
        .header p {
          margin: 0;
          opacity: 0.85;
          font-size: 1rem;
        }
        .header .author {
          margin-top: 16px;
          font-size: 0.85rem;
          opacity: 0.75;
          line-height: 1.5;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          margin-bottom: 20px;
        }
        .input-row {
          display: flex;
          gap: 10px;
        }
        .input-row input {
          flex: 1;
          padding: 14px 16px;
          font-size: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-row input:focus {
          border-color: #667eea;
        }
        .btn {
          padding: 14px 24px;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.2s;
          color: white;
          background: linear-gradient(135deg, #667eea, #764ba2);
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102,126,234,0.4);
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #f0f0f5;
          color: #333;
        }
        .btn-secondary:hover {
          background: #e4e4ef;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .btn-small {
          padding: 8px 14px;
          font-size: 0.875rem;
        }
        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .toolbar h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #333;
        }
        .link-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .link-item {
          background: #f8f9fc;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-left: 4px solid #667eea;
          transition: box-shadow 0.2s;
        }
        .link-item:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .link-original {
          font-size: 0.85rem;
          color: #666;
          word-break: break-all;
        }
        .link-original::before {
          content: '🔗 ';
        }
        .link-short-row {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .link-short {
          flex: 1;
          font-size: 1rem;
          font-weight: 600;
          color: #667eea;
          text-decoration: none;
          word-break: break-all;
        }
        .link-short:hover {
          text-decoration: underline;
        }
        .empty {
          text-align: center;
          padding: 40px 20px;
          color: #999;
        }
        .toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: white;
          padding: 14px 24px;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          font-size: 0.95rem;
          animation: slideUp 0.3s ease;
          z-index: 1000;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>Сервис сокращения ссылок</h1>
          <p>Введите длинную ссылку — получите короткую</p>
          <p className="author">
            Лабораторная работа студента Петренко Ю.И.<br/>
            по дисциплине «Проектирование Веб-Сервисов»
          </p>
        </div>

        <div className="card">
          <div className="input-row">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && shortenUrl()}
              placeholder="https://example.com/very/long/path..."
              disabled={loading}
            />
            <button className="btn" onClick={shortenUrl} disabled={loading}>
              {loading ? <><span className="spinner"></span>Сокращаем...</> : 'Сократить'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="toolbar">
            <h2>История ссылок</h2>
            <button className="btn btn-secondary btn-small" onClick={fetchLinks}>
              Обновить
            </button>
          </div>

          {links.length === 0 ? (
            <div className="empty">
              Пока нет сокращённых ссылок
            </div>
          ) : (
            <div className="link-list">
              {links.map(link => {
                const shortUrl = `http://localhost:5000/${link.short_code}`;
                return (
                  <div className="link-item" key={link.id}>
                    <div className="link-original">{link.original_url}</div>
                    <div className="link-short-row">
                      <a
                        className="link-short"
                        href={shortUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {shortUrl}
                      </a>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => copyToClipboard(shortUrl)}
                      >
                        Копировать
                      </button>
                    </div>
                  </div>  
                );
              })}
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

export default App;