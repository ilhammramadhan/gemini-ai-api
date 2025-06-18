const { GoogleGenerativeAI } = require("@google/generative-ai");

const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const port = 3000;
const app = express();
app.use(express.json());


const upload = multer({ dest: 'uploads/' });
const genAI = new GoogleGenerativeAI(process.env.api_key);
const models = genAI.getGenerativeModel({model : "models/gemini-1.5-flash"});



app.post('/generate-text', async (req, res) => {
  try {
    const { contents } = req.body;
    const response = await models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating content.' });
  }
});





app.post('/generate-from-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const prompt = req.body.prompt || 'Describe this image';   

    // Create image part
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    };

    // Generate content with image and prompt
    const result = await models.generateContent([imagePart, prompt]);
    const response = await result.response;

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    res.json({ text: response.text() });
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'An error occurred while generating content from image.' });
  }
});

app.post('/generate-from-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded' });
    }

    const documentPath = req.file.path;
    const documentBuffer = fs.readFileSync(documentPath);
    const prompt = req.body.prompt || 'Summarize this document';

    // Create document part
    const documentPart = {
      inlineData: {
        data: documentBuffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    };

    // Generate content with document and prompt
    const result = await models.generateContent([documentPart, prompt]);
    const response = await result.response;

    // Clean up uploaded file
    fs.unlinkSync(documentPath);

    res.json({ text: response.text() });
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'An error occurred while generating content from document.' });
  }
}
);


app.post("generate-from-audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const audioPath = req.file.path;
    const audioBuffer = fs.readFileSync(audioPath);
    const prompt = req.body.prompt || "Transcribe this audio";

    // Create audio part
    const audioPart = {
      inlineData: {
        data: audioBuffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    // Generate content with audio and prompt
    const result = await models.generateContent([audioPart, prompt]);
    const response = await result.response;

    // Clean up uploaded file
    fs.unlinkSync(audioPath);

    res.json({ text: response.text() });
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "An error occurred while generating content from audio." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})