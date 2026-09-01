import json 
import os
import agent
from pathlib import Path
import datetime

def recent_path():
    f_dir = Path(__file__).parent/'data'
    f_dir.mkdir(exist_ok=True)    
    files = [f_dir / 'recent.json',f_dir / 'tokens.json']
    for f in files:
        if not f.exists():
            f.touch()
    return files

def history_path(file_name): #takes string returns list
    date_dir = Path(__file__).parent / f'data/history/{datetime.datetime.now().strftime('%d|%m|%y')}'
    date_dir.mkdir(parents = True,exist_ok = True)
    files = [date_dir / f'{file_name}.json', date_dir / f'{file_name}_context.json']
    for f in files:
        if not f.exists():
            f.touch()
    return files

def write_to_short_mem(conv,tokens):
    data = []
    sys_prompt = None
    with open(recent_path()[0], 'r') as f:
        try:
            for message in json.load(f):
                if message.get('role') == 'system':
                    sys_prompt = message
                else: data.append(message)
                
        except:
            pass
        
    for line in conv:
        if line.get('role') == 'system':
            sys_prompt = line
        elif line not in data:
            data.append(line)

    if sys_prompt:
        data.insert(0, sys_prompt)

    with open(recent_path()[0], 'w') as f:
        json.dump(data, f, indent=4,ensure_ascii=False)

    history(data,tokens)

def get_short_memory():#list
    try:
        with open(recent_path()[0], 'r') as f:
            data = json.load(f)                
        return data
    except:
        return []

def summarizer(context):
    summarize = []
    shorten_context=[]
    for replic in context:
        if replic['role']=='system':
            shorten_context.append(replic)
        else:
            summarize.append(replic)
    new_context = agent.context_assist(summarize)
    shorten_context.extend(new_context)
    with open(recent_path()[0],'w') as f:
        json.dump(shorten_context,f,indent=4,ensure_ascii=False)

def history(conv,tokens):
    #chat_tokens
    file_name = ''
    to_history = []
    for replic in conv:
        try:
            with open(file_name,'r') as f:
                conversation = json.load(f)
                for line in conversation:
                    if replic['user'] == line['user']:
                        pass
            to_history.append(replic)        
        except:
            if replic['role']=='user' and len(file_name) == 0:
                file_name = agent.name_assistance(replic)
                files = history_path(file_name)
        
    with open (files[0],'w') as f:
        json.dump(to_history,f)

            




'''try:
        with open(recent_path()[1],'r') as f:
            used_tokens = json.load(f)
            used_tokens += tokens
    except json.JSONDecodeError:
        used_tokens = tokens
    except Exception as e:
        used_tokens = tokens
        print('tokenizer broken',type(e), e)
        
        
        it will count total token usage by model. not amount of tokens history takes'''



"""if __name__=='__main__':
    a = [
        {
            "role": "user",
            "content": "Hi"
        },
        {
            "role": "assistant",
            "content": "Hello! How can I assist you today? \ud83d\ude0a"
        }
    ]
    write_to_short_mem(a)"""