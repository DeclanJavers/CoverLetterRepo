// Import necessary modules
const express = require('express');  // Express framework for building web applications
const bodyParser = require('body-parser');  // Middleware to parse incoming request bodies
const dotenv = require('dotenv');  // Module to load environment variables from a .env file
const fs = require('fs').promises;  // Promises version of fs for asynchronous file operations
const { GoogleGenerativeAI } = require('@google/generative-ai');  // Import Google Generative AI client
const path = require('path');  // Import path module for handling file paths

dotenv.config();  // Load environment variables from .env file

const cors = require('cors');
app.use(cors());

const app = express();  // Create an instance of an Express application
const port = process.env.PORT || 3000;  // Define the port on which the server will listen

// Middleware
app.use(bodyParser.json());  // Middleware to parse JSON bodies
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files from the "public" directory

const apiKey = process.env.GEMINI_API_KEY;  // Load API key from environment variables
const genAI = new GoogleGenerativeAI(apiKey);  // Initialize Google Generative AI client

// Get the generative model
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
});

// Configuration for content generation
const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
};

let templateText = '';  // Variable to hold the template text

// Function to load the template text from a file
async function loadTemplate() {
    try {
        templateText = await fs.readFile('template.txt', 'utf-8');
        console.log('Template loaded successfully.');
    } catch (error) {
        console.error('Error loading template:', error);
    }
}

// Load the template text when the server starts
loadTemplate();

// Endpoint to generate a cover letter
app.post('/generate-cover-letter', async (req, res) => {
    const { jobDescription } = req.body;  // Extract job description from the request body

    try {
        // Prepare the parts for the model input
        const parts = [
            { text: templateText },  // Use the loaded template text
            { text: jobDescription },
            { text: "output: " }
        ];

        // Generate content using the model
        const result = await model.generateContent({
            contents: [{ role: 'user', parts }],
            generationConfig
        });

        // Extract and trim the cover letter content
        const coverLetterContent = result.response.candidates[0].content.parts[0].text.trim();

        // Remove the title from the beginning if it exists
        const titleIndex = coverLetterContent.indexOf('\n\n');
        const finalCoverLetter = titleIndex !== -1 ? coverLetterContent.substring(titleIndex + 2) : coverLetterContent;

        // Send the generated cover letter as a response
        res.json({ coverLetter: finalCoverLetter });

    } catch (error) {
        console.error('Error generating cover letter:', error);
        res.status(500).json({ error: 'Failed to generate cover letter' });
    }
});

// Endpoint to extract the company name and job role title from a job description
app.post('/get-company-name', async (req, res) => {
    const { jobDescription } = req.body;  // Extract job description from the request body

    try {
        // Prepare the parts for the model input
        const parts = [
            { text: 'please return the company name and the job role title only, nothing else. Do not use new lines, only separate words with a space. Do not end with a new line' },
            { text: jobDescription }
        ];

        // Generate content using the model
        const result = await model.generateContent({
            contents: [{ role: 'user', parts }],
            generationConfig
        });

        // Extract the generated text
        const generatedText = result.response.candidates[0].content.parts[0].text;

        // Send the generated text as a response
        res.json({ generatedText });

    } catch (error) {
        console.error('Error generating company name:', error);
        res.status(500).json({ error: 'Failed to generate company name' });
    }
});

// Serve static files (if needed)
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
