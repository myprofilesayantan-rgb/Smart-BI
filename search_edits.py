import json
import re

transcript_path = r"C:\Users\HI\.gemini\antigravity\brain\60250510-31f5-48a6-9223-5c01cbda311c\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            if step.get('type') in ('REPLACE_FILE_CONTENT', 'MULTI_REPLACE_FILE_CONTENT', 'WRITE_TO_FILE'):
                tool_calls = step.get('tool_calls', [])
                for call in tool_calls:
                    args = call.get('args', {})
                    # Decode args if it's a string
                    if isinstance(args, str):
                        try:
                            args = json.loads(args)
                        except:
                            pass
                    target = args.get('TargetFile', '') or args.get('Target', '')
                    if 'index.html' in target and 'smart-bi' in target:
                        print(f"Step {step.get('step_index')}: {call.get('name')} to {target}")
                        print("Instruction:", args.get('Instruction', ''))
                        print("Description:", args.get('Description', ''))
                        if 'ReplacementChunks' in args:
                            for chunk in args['ReplacementChunks']:
                                print("--- CHUNK ---")
                                print("TargetContent:", chunk.get('TargetContent'))
                                print("ReplacementContent:", chunk.get('ReplacementContent'))
                        elif 'ReplacementContent' in args:
                            print("--- REPLACEMENT ---")
                            print("TargetContent:", args.get('TargetContent'))
                            print("ReplacementContent:", args.get('ReplacementContent'))
                        print("==================================\n")
        except Exception as e:
            pass
