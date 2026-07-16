import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
      return res.status(500).json({ error: 'Chiave API non trovata nelle configurazioni di Render.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Usiamo il vecchio modello 'gemini-pro' per aggirare il 404 delle vecchie librerie
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      systemInstruction: systemInstruction
    });
    
    const result = await model.generateContent(message);
    const response = await result.response;
    const responseText = response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error("ERRORE DETTAGLIATO DI GEMINI:", error.message || error);
    res.status(500).json({ error: error.message || 'Errore durante la connessione a Gemini.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server attivo sulla porta ${port}`);
});

    
