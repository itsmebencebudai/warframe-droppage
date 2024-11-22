import secrets

api_key = secrets.token_hex(32)  # Generates a 64-character random key
print("Your API Key:", api_key)

