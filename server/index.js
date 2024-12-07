const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
    
    // Criar tabela de benefícios se não existir
    db.run(`
      CREATE TABLE IF NOT EXISTS benefits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employeeId TEXT NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        cost REAL NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT,
        description TEXT
      )
    `);
  }
});

// Rotas para benefícios
app.get('/benefits', (req, res) => {
  db.all('SELECT * FROM benefits', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/benefits', (req, res) => {
  const { employeeId, type, provider, cost, startDate, endDate, description } = req.body;
  
  db.run(
    'INSERT INTO benefits (employeeId, type, provider, cost, startDate, endDate, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [employeeId, type, provider, cost, startDate, endDate, description],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Retornar o benefício criado
      db.get('SELECT * FROM benefits WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

app.put('/benefits/:id', (req, res) => {
  const { employeeId, type, provider, cost, startDate, endDate, description } = req.body;
  
  db.run(
    'UPDATE benefits SET employeeId = ?, type = ?, provider = ?, cost = ?, startDate = ?, endDate = ?, description = ? WHERE id = ?',
    [employeeId, type, provider, cost, startDate, endDate, description, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Retornar o benefício atualizado
      db.get('SELECT * FROM benefits WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

app.delete('/benefits/:id', (req, res) => {
  db.run('DELETE FROM benefits WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Benefit deleted' });
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
