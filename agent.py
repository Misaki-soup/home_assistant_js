import os
import memory
from dotenv import load_dotenv
from together import Together
from together import AsyncTogether
import time
import yaml

load_dotenv()
api = os.getenv('together_api')

client = Together(api_key=api)

try:
    with open('config.yaml','r') as f:
        config = yaml.safe_load(f)
except: 
    with open('config.yaml','w')as f: 
        config = {'model':"qwen/qwen3-32b",'max_tokens':3000,'system_prompt':'You are helpfull assistent!','reasoning_effort':'none','temperature':0.4}
        yaml.dump(config,f,allow_unicode=True,indent=2)



def assistant():
    #extraction of context
    data = []
    sys_prompt = {'role':'system','content':config['system_prompt']}
    data=memory.get_short_memory() #list
    if len(data) == 0:
        data.insert(0,sys_prompt)     

    text = input('User: ')
    if text == 'q': os.abort() 
    
    data.append({
                "role": "user",
                "content": text
                })
    #conversation part
    try:
        chat_completion = client.chat.completions.create(
            messages=data,
            model=config['model'],
            reasoning_effort=config['reasoning_effort'],
            temperature=config['temperature'],
            max_tokens=config['max_tokens']
                )
        response = chat_completion.choices[0].message.content
        print(f'Agent: {response}')
        try:
            tokens = chat_completion.usage.total_tokens - chat_completion.usage.completion_tokens_details.reasoning_tokens
        except: tokens = chat_completion.usage.total_tokens
        #Saving to memory
        data.append({
                    "role": chat_completion.choices[0].message.role,
                    "content": response
                    })         
        memory.write_to_short_mem(data,tokens)
        if tokens > config['context_limit']:
            memory.summarizer(data)

    except Exception as e: 
        print('no response from agent: ',type(e),e)
    


def context_assist(context):    
    prompt = [{"role": "system",
        "content": """You are a context summarizer. Given a conversation, extract and compress it into a short plain-text summary (5-10 lines max).
        Always output the summary in English, regardless of the conversation language.
        Include:
        - What the user is building or trying to do
        - Key decisions or solutions reached
        - Current task state (what's done, what's next)
        - Any important facts, constraints, or preferences established
        - The language the user is writing in
        - If text is not finished, you must shortly tell where from to continue

        Exclude:
        - Small talk
        - Failed attempts that were abandoned
        - Anything already resolved and no longer relevant

        Output only the summary, no preamble.

        Example output format:
        User is building [project]. Language: [language].
        Current task: [task].
        Decisions made:
        - [decision 1]
        - [decision 2]
        Next step: [next step]."""}]
    for line in context:
        prompt.append(line)
    chat_completion = client.chat.completions.create(
        messages=prompt,
        model="openai/gpt-oss-20b",
        reasoning_effort = 'medium',
        max_tokens=10000,
        temperature=0.5)
    response = chat_completion.choices[0].message.content
    summary = []
    summary.append(dict(role=chat_completion.choices[0].message.role,content=response))
    return summary


def name_assistance(message): #takes in dict returnes string
    prompt = [{'role':'system','content':'''Output ONLY a filesystem-safe slug. Nothing else. No explanation, no markdown, no preamble.\n
        Rules:
        - lowercase
        - words separated by underscores
        - max 5 words
        - no special characters
        Example:
        Input: build async api client for together ai
        Output: together_ai_async_client'''
    }]
    prompt.append(message)
    chat_completion = client.chat.completions.create(
        messages=prompt,
        model="openai/gpt-oss-20b",
        reasoning_effort='low',
        temperature=1)
    return chat_completion.choices[0].message.content
    

if __name__ == "__main__":
    while True: 
        assistant()