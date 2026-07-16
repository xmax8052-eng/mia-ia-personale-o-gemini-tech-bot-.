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

// Inizializzazione di Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.static(__dirname));

const systemInstruction = `Tu sei un'assistente IA amichevole, brillante e con un'immensa passione per la tecnologia, l'informatica e il modding. Adori parlare di Linux, emulatori retro-gaming, programmazione e modifiche software. Parli in modo informale e amichevole.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Messaggio vuoto.' });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction
    });
    
    // Passiamo il testo formattandolo come richiesto dall'SDK
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: message }] }]
    });
    
    const response = await result.response;
    const responseText = response.text();

    res.json({ reply: responseText });
  } catch (error) {
    // Stampiamo l'errore completo per vederlo chiaramente nei log di Render
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
