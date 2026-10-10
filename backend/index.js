const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к БД
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// ЭНДПОИНТ 1: Получить все ссылки из БД
app.get('/api/links', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM links ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ЭНДПОИНТ 2: Сократить ссылку
app.post('/api/shorten', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const webServiceResponse = await axios.get(`${process.env.WEB_SERVICE_URL}/generate`);
    const shortCode = webServiceResponse.data.short_code;

    const result = await pool.query(
      'INSERT INTO links (original_url, short_code) VALUES ($1, $2) RETURNING *',
      [url, shortCode]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ЭНДПОИНТ 3: Страница подтверждения перехода
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const result = await pool.query(
      'SELECT original_url FROM links WHERE short_code = $1',
      [shortCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).send(renderPage({
        title: 'Ссылка не найдена',
        message: `Короткий код "${shortCode}" не существует или был удалён.`,
        accent: '#e53e3e',
        icon: '🚫',
        buttons: [
          { href: 'http://localhost:3000', label: 'На главную', primary: true }
        ]
      }));
    }

    const originalUrl = result.rows[0].original_url;

    res.send(renderPage({
      title: 'Вы хотите перейти по ссылке',
      message: 'Этот короткий код ведёт на внешний ресурс:',
      accent: '#667eea',
      icon: '🔗',
      url: originalUrl,
      buttons: [
        { href: originalUrl, label: 'Перейти на сайт', primary: true, external: true },
        { href: 'http://localhost:3000', label: 'Отмена', primary: false }
      ]
    }));
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Функция для генерации HTML-страницы
function renderPage({ title, message, accent, icon, url, buttons }) {
  const authorHtml = `
    <div class="author">
      Лабораторная работа студента Петренко Ю.И.<br/>
      по дисциплине «Проектирование Веб-Сервисов»
    </div>
  `;

  const buttonsHtml = buttons.map(btn => `
    <a href="${btn.href}"
       ${btn.external ? 'target="_blank" rel="noreferrer"' : ''}
       class="btn ${btn.primary ? 'btn-primary' : 'btn-secondary'}">
      ${btn.label}
    </a>
  `).join('');

  const urlBlock = url ? `
    <div class="url-box">
      <span class="url-text">${url}</span>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .card {
          background: white;
          border-radius: 20px;
          padding: 48px 40px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 60px rgba(0,0,0,0.25);
          animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .icon {
          font-size: 3.5rem;
          margin-bottom: 16px;
          display: block;
        }
        h1 {
          font-size: 1.5rem;
          margin: 0 0 12px 0;
          color: #333;
        }
        p {
          color: #666;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }
        .url-box {
          background: #f8f9fc;
          border-left: 4px solid ${accent};
          padding: 16px 20px;
          border-radius: 10px;
          margin-bottom: 28px;
          text-align: left;
        }
        .url-text {
          font-family: monospace;
          font-size: 0.9rem;
          color: #333;
          word-break: break-all;
        }
        .buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-block;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.2s;
          cursor: pointer;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(102,126,234,0.45);
        }
        .btn-secondary {
          background: #f0f0f5;
          color: #333;
        }
        .btn-secondary:hover {
          background: #e4e4ef;
          transform: translateY(-2px);
        }
        .accent {
          color: ${accent};
        }
        .author {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 0.8rem;
          color: #999;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="icon">${icon}</span>
        <h1 class="accent">${title}</h1>
        <p>${message}</p>
        ${urlBlock}
        <div class="buttons">
          ${buttonsHtml}
        </div>
        ${authorHtml}
      </div>
    </body>
    </html>
  `;
}

app.listen(5000, () => console.log('Backend running on port 5000'));