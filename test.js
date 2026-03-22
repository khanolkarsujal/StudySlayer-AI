import fs from 'node:fs';
const envFile = fs.readFileSync('./.env', 'utf8');
const API_KEY = envFile.match(/GEMINI_API_KEY=(.*)/)[1].trim();
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
        if (data.models) {
            console.log("Your API key supports the following models:");
            data.models.forEach(m => console.log("- " + m.name));
        } else {
            console.log("Error or no models found:");
            console.log(data);
        }
    })
    .catch(console.error);
