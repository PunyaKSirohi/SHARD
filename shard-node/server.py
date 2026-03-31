from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json

app = Flask(__name__)
CORS(app)

NODE_ID = os.environ.get("NODE_ID", "node-?")
STORAGE_DIR = "/data/shares"
os.makedirs(STORAGE_DIR, exist_ok=True)

def save_share(vault_id, share):
    with open(f"{STORAGE_DIR}/{vault_id}.json", "w") as f:
        json.dump({"share": share}, f)

def load_share(vault_id):
    path = f"{STORAGE_DIR}/{vault_id}.json"
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)["share"]

def delete_share_file(vault_id):
    path = f"{STORAGE_DIR}/{vault_id}.json"
    if os.path.exists(path):
        os.remove(path)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "node": NODE_ID})

@app.route("/share", methods=["POST"])
def store_share():
    data = request.get_json()
    if not data or "vault_id" not in data or "share" not in data:
        return jsonify({"error": "Missing vault_id or share"}), 400
    save_share(data["vault_id"], data["share"])
    return jsonify({"status": "ok", "node": NODE_ID}), 201

@app.route("/share/<vault_id>", methods=["GET"])
def get_share(vault_id):
    share = load_share(vault_id)
    if share is None:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"vault_id": vault_id, "share": share, "node": NODE_ID}), 200

@app.route("/share/<vault_id>", methods=["DELETE"])
def delete_share(vault_id):
    delete_share_file(vault_id)
    return jsonify({"status": "deleted"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)