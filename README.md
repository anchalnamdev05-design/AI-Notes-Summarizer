# NoteAI — AI Notes Summarizer

A small Generative AI mini-project built with Python Flask and the OpenAI API.

## Features
- Paste study notes into a clean web interface
- Choose Short, Medium, or Detailed output
- Generate a summary, key points, and five exam questions
- Copy the generated result
- Input validation and friendly error messages

## Requirements
- Python 3.10 or newer
- An OpenAI API key with API access and billing configured
- Internet connection while generating results

**Note:** ChatGPT subscriptions and OpenAI API billing are separate. A ChatGPT plan does not automatically include API credits.

## Setup on Windows

1. Extract the ZIP file.
2. Open the extracted `AI-Notes-Summarizer` folder in VS Code.
3. Open the VS Code terminal in that folder.
4. Create a virtual environment:

   ```powershell
   py -m venv venv
   ```

5. Activate it:

   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

   If PowerShell blocks activation, use Command Prompt instead:

   ```bat
   venv\Scripts\activate.bat
   ```

6. Install the packages:

   ```bash
   python -m pip install -r requirements.txt
   ```

7. Copy `.env.example` and rename the copy to `.env`.
8. Open `.env` and replace `replace_with_your_api_key` with your API key. Keep the key private.
9. Start the application:

   ```bash
   python app.py
   ```

10. Open this address in your browser:

    http://127.0.0.1:5000

To stop the server, press `Ctrl + C` in the terminal.

## If you get an API error
- Confirm `.env` is named exactly `.env` (not `.env.txt`).
- Confirm the API key is correct and has not been revoked.
- Confirm API billing/credits and model access are available.
- If your account cannot access `gpt-4.1-mini`, change `OPENAI_MODEL` in `.env` to a model available to your API project, then restart Flask.

## Project structure

```text
AI-Notes-Summarizer/
├── app.py
├── requirements.txt
├── .env.example
├── .gitignore
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## How it works
1. The browser sends the notes and selected summary length to Flask.
2. Flask validates the input and builds instructions (a prompt).
3. The OpenAI Responses API sends the prompt to the selected language model.
4. The model generates the summary, key points, and questions.
5. Flask returns the generated text as JSON, and the browser displays it.

## Viva explanation
"This project demonstrates text-to-text generation using a pretrained large language model. I use prompt engineering to ask the model to summarize study material, extract key points, and create practice questions. I have integrated the model through an API instead of training a model from scratch."
