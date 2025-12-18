from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import json
import os

from config import OPENAI_API_KEY, MODEL_NAME
from topics.dsa_topics import DSA_TOPICS

# ------------------ App Setup ------------------

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

client = OpenAI(api_key=OPENAI_API_KEY)

# ------------------ Prompt Loader ------------------

def load_prompt(topic, mode):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(base_dir, "prompts", "dsa_prompt.txt")

    with open(prompt_path, "r", encoding="utf-8") as file:
        prompt = file.read()

    prompt = prompt.replace("{{TOPIC}}", topic)
    prompt = prompt.replace("{{MODE}}", mode)

    return prompt

# ------------------ API Route ------------------

@app.route("/api/v1/dsa/generate", methods=["POST"])
def generate_dsa_viva():
    data = request.json or {}

    # 1️⃣ Extract inputs
    topic = data.get("topic")
    mode = data.get("mode", "viva")  # default mode

    # 2️⃣ Validate topic exists
    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    # 3️⃣ Validate mode
    allowed_modes = ["viva", "exam", "1-minute"]
    if mode not in allowed_modes:
        return jsonify({
            "error": "Invalid mode",
            "allowed_modes": allowed_modes
        }), 400

    # 4️⃣ Validate DSA topic (WHITELIST)
    if topic not in DSA_TOPICS:
        return jsonify({
            "error": "Invalid DSA topic",
            "allowed_topics": DSA_TOPICS
        }), 400

    # 5️⃣ Load prompt
    prompt = load_prompt(topic, mode)

    try:
        # 6️⃣ OpenAI call
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=700
        )

        ai_text = response.choices[0].message.content

        # 7️⃣ Parse AI JSON
        try:
            structured = json.loads(ai_text)
        except json.JSONDecodeError:
            return jsonify({
                "error": "AI response not valid JSON",
                "raw_output": ai_text
            }), 500

        # 8️⃣ Return final response
        return jsonify({
            "topic": topic,
            "mode": mode,
            "data": structured
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------ Run Server ------------------

if __name__ == "__main__":
    app.run(debug=True)
