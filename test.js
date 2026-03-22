import fs from 'node:fs';

const API_KEY = process.env.GEMINI_API_KEY;
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
