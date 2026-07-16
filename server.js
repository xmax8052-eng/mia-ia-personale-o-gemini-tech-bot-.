import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const systemInstruction = `Tu sei un'assistente IA amichevole, brillante e con un'immensa passione per la tecnologia, l'informatica e il modding. Adori parlare di Linux, emulatori retro-gaming, programmazione e modifiche software. Parli in modo informale e amichevole.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Messaggio vuoto.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chiave API non trovata su Render.' });
    }

    // Facciamo una chiamata diretta all'API stabile v1 di Google Gemini 1.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Errore nella risposta di Google.');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    res.json({ reply: responseText });

  } catch (error) {
    console.error("ERRORE DIETRO LE QUINTE:", error.message || error);
    res.status(500).json({ error: error.message || 'Errore durante la connessione a Gemini.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server attivo sulla porta ${port}`);
});
