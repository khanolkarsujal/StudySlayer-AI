const API_KEY = "AIzaSyBisqzlB9k2g_L3v4S60UU7K95Or6kwYBE";
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        contents: [{ parts: [{text: "Testing PDF"}, {inlineData: {mimeType: "application/pdf", data: "JVBERi0xLgo="}}] }]
    })
}).then(res => res.json()).then(console.log).catch(console.error);
