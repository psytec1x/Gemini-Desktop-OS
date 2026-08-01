import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Lazy initializer for Gemini client to prevent startup crashes if key missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health API
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Gemini Chat & Prompt API
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      contents,
      model = 'gemini-3.6-flash',
      systemInstruction = 'Du bist die offizielle Google Gemini Desktop KI-Assistenz auf Deutsch. Du bist hilfsbereit, präzise, direkt und freundlich. Antworte in strukturierter Markdown-Formatierung.',
      enableSearch = false,
      images = [],
    } = req.body;

    const ai = getAiClient();

    // Prepare contents array/parts
    let processedContents: any = contents;

    if (typeof contents === 'string') {
      if (images && images.length > 0) {
        const parts: any[] = [{ text: contents }];
        for (const img of images) {
          // img can be data:image/png;base64,...
          const matches = img.match(/^data:(image\/\w+);base64,(.+)$/);
          if (matches) {
            parts.push({
              inlineData: {
                mimeType: matches[1],
                data: matches[2],
              },
            });
          }
        }
        processedContents = { parts };
      } else {
        processedContents = contents;
      }
    } else if (Array.isArray(contents)) {
      // Map chat history
      processedContents = contents.map((msg: any) => {
        if (typeof msg === 'string') return msg;
        const role = msg.role === 'user' ? 'user' : 'model';
        const parts: any[] = [];
        if (msg.content) parts.push({ text: msg.content });
        if (msg.images && Array.isArray(msg.images)) {
          for (const img of msg.images) {
            const matches = img.match(/^data:(image\/\w+);base64,(.+)$/);
            if (matches) {
              parts.push({
                inlineData: {
                  mimeType: matches[1],
                  data: matches[2],
                },
              });
            }
          }
        }
        return { role, parts: parts.length > 0 ? parts : [{ text: '' }] };
      });
    }

    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model,
      contents: processedContents,
      config,
    });

    const responseText = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || null;

    res.json({
      text: responseText,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({
      error: error.message || 'Fehler bei der Kommunikation mit Google Gemini.',
    });
  }
});

// Gemini Image Generation API
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt ist erforderlich' });
    }

    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    let imageUrl = '';
    let responseText = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Str = part.inlineData.data;
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${base64Str}`;
        } else if (part.text) {
          responseText += part.text + ' ';
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'Kein Bild in der Gemini-Antwort generiert.',
        details: responseText,
      });
    }

    res.json({
      imageUrl,
      text: responseText.trim(),
    });
  } catch (error: any) {
    console.error('Gemini Image Gen Error:', error);
    res.status(500).json({
      error: error.message || 'Fehler bei der Bildgenerierung.',
    });
  }
});

// Downloadable Desktop Shortcut File Endpoint (.url file for Windows)
app.get('/api/download-shortcut', (req, res) => {
  const host = req.protocol + '://' + req.get('host');
  const fileContent = `[InternetShortcut]
URL=${host}
IconIndex=0
IconFile=%SystemRoot%\\System32\\shell32.dll
HotKey=0
IDList=
[{000214A0-0000-0000-C000-00000000046Chunk}]
Prop3=19,2
`;
  res.setHeader('Content-Type', 'application/x-mswinurl');
  res.setHeader('Content-Disposition', 'attachment; filename="Google Gemini Desktop.url"');
  res.send(fileContent);
});

// Downloadable Windows Launcher Batch File (.bat)
app.get('/api/download-launcher', (req, res) => {
  const host = req.protocol + '://' + req.get('host');
  const batContent = `@echo off
title Google Gemini Desktop Launcher
echo Starte Google Gemini Desktop App...
start "" "${host}"
exit
`;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="Google Gemini Desktop.bat"');
  res.send(batContent);
});

// Mount Vite middleware in development or serve static in production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
