from flask import Flask, jsonify
import random
import string

app = Flask(__name__)

@app.route('/generate')
def generate_code():
    code = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    return jsonify({"short_code": code})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)