
import os
import logging
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 200 * 1024

logging.basicConfig(level=logging.INFO)

API_KEY = os.getenv("GROQ_API_KEY")
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

client = Groq(api_key=API_KEY) if API_KEY else None


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/summarize", methods=["POST"])
def summarize():

    if client is None:
        return jsonify({
            "error": "Groq API key is missing. Add it to your .env file."
        }), 503

    data = request.get_json(silent=True) or {}

    notes = str(data.get("notes", "")).strip()
    length = data.get("length", "Medium")

    if not notes:
        return jsonify({"error": "Please paste your study notes first."}), 400

    if len(notes) > 20000:
        return jsonify({"error": "Please keep notes under 20,000 characters."}), 400

    if length not in ("Short", "Medium", "Detailed"):
        return jsonify({"error": "Invalid summary length."}), 400

    length_guidance = {
        "Short": "Write a concise summary of about 3–5 sentences.",
        "Medium": "Write a balanced summary with enough detail.",
        "Detailed": "Write a thorough, well-organized summary."
    }[length]

    instructions = """
You are NoteAI, an educational study assistant.

Use only information from the supplied notes.
Do not invent facts.
Write in clear, student-friendly English.

Return exactly three sections:

SUMMARY
KEY POINTS
IMPORTANT QUESTIONS

Under KEY POINTS, give 4–8 concise bullet points.

Under IMPORTANT QUESTIONS, write exactly 5 questions.
Output plain text only. Do not use Markdown (no **, no #, no backticks).
Do not use LaTeX or \( \) \[ \] symbols. Write math in simple plain text,
for example: P(Label | Data), z = mu + sigma * epsilon.
Write section headings exactly as: SUMMARY, KEY POINTS, IMPORTANT QUESTIONS.
Start each key point with a "- " hyphen.
Do not include answers.
"""

    prompt = f"""
Summary preference: {length}.
{length_guidance}

STUDY NOTES:
{notes}
"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": instructions},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=1800
        )

        output = response.choices[0].message.content or ""
        output = output.strip()

        if not output:
            return jsonify({
                "error": "AI returned an empty response. Try again."
            }), 502

        return jsonify({
            "result": output,
            "model": MODEL
        })

    except Exception as e:
        app.logger.exception("Groq API request failed")

        return jsonify({
            "error": str(e)
        }), 502


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({
        "error": "Request too large. Please shorten your notes."
    }), 413


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
