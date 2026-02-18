import sys
import whisper
import json

model = whisper.load_model("base")  # small model, good balance

audio_path = sys.argv[1]

result = model.transcribe(audio_path)

print(json.dumps({"text": result["text"]}))
