import dotenv from 'dotenv';
import fs from 'fs';
import * as yaml from 'js-yaml';
import Together from 'together-ai';
import readline from 'readline/promises'

//init
dotenv.config({override:true});

const client = new Together({apiKey:process.env.together_api});

let config;
try{
    config = yaml.load(fs.readFileSync('config.yaml','utf8'));
}
catch(err){
    config = {model:"qwen/qwen3-32b",max_tokens:3000,system_prompt:'You are helpfull assistent!',reasoning_effort:'none',temperature:0.4};
    let write_to_yaml = yaml.dump(config,{indent:2});
    fs.writeFileSync('config.yaml',write_to_yaml, 'utf8');
    console.log(`Error on loading config: ${err}`);
};

const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
});
rl.on('close', () => {
  console.log('Programm has been closed');
});

//funcs 
async function assistent(message){
    const response = await client.chat.completions.create({
        model:config.model,
        messages:[
            {role:'user',content:message}
        ]
    })
    console.log(response.choices[0].message.content);
};

while(true){
    let input = await rl.question('User: ');
    if (input === 'q'||input === 'quit'){
        rl.close();
        break;
    };
    await assistent(input);
}
