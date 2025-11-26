import google.generativeai as genai

GOOGLE_API_KEY = "AIzaSyA0j-TWhhay7rmclCP5_Xbfyec0XUFTHCE"
genai.configure(api_key=GOOGLE_API_KEY)

print("List of available models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)