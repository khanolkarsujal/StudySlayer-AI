# StudySlayer AI 📚

Turn any syllabus into a smart, structured study plan! Powered by Google Gemini 2.5 Flash, StudySlayer AI is a completely front-end serverless web application. 

You can upload a PDF syllabus or paste the raw text syllabus into the text box, and the AI will analyze it to break down daily topics, study notes, and generate quick reinforcement quizzes. 

## Features
- **Serverless Vanilla JS**: Uses purely HTML, CSS, and JS with zero Node.js backend required!
- **Gemini API Integration**: Fast, incredibly smart study plan generation directly in the browser. 
- **Privacy-First**: Your API Key is safely tracked out of GitHub and injected into the frontend independently.

## Getting Started (Run it Locally)

Since there is no complex backend framework, spinning this app up locally is incredibly simple:

1. **Clone the repository.**
   
2. **Setup your API Key.**
   - Inside the main project folder, create a new file called `config.js`. 
   - Add your Gemini API Key into the file exactly following this format:
   ```js
   const ENV = {
       GEMINI_API_KEY: "YOUR_API_KEY_HERE"
   };
   ```
   *(Note: `config.js` is automatically ignored from git via `.gitignore` so your key remains safe).*
   
3. **Run the Application.**
   Just double click on `index.html` to open it in your browser, or start a local server using VSCode's Live Server extension!

## Deploying to Netlify ☁️

StudySlayer AI comes safely pre-configured for automated Netlify deployment using `netlify.toml`. Since your API key isn't stored in GitHub, Netlify creates it securely during the site build.

1. Connect your GitHub repository to your Netlify account and link the project.
2. In your Netlify project dashboard, go to **Site configuration** -> **Environment variables**.
3. Add a new variable with the key `GEMINI_API_KEY` and place your actual API key in the value box.
4. Hit **Deploy Site**! 

Netlify will automatically build the `config.js` script securely behind the scenes and launch your live website.
