// 6. JAVASCRIPT LOGIC
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const generateBtn = document.getElementById('generate-btn');
    const syllabusInput = document.getElementById('syllabus');
    const outputSection = document.getElementById('output-section');
    const outputContent = document.getElementById('output-content');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const pdfUpload = document.getElementById('pdf-upload');
    const uploadTriggerBtn = document.getElementById('upload-trigger-btn');
    const fileNameDisplay = document.getElementById('file-name-display');
    const limitCountDisplay = document.getElementById('limit-count');

    // Application API Settings and State
    const API_KEY = "AIzaSyBisqzlB9k2g_L3v4S60UU7K95Or6kwYBE";
    const MAX_FREE_USES = 5;
    
    let generatedPlanText = "";
    let pdfFileBase64 = null;
    let pdfMimeType = "";

    // Load API usage limit from localStorage
    let usesLeft = MAX_FREE_USES;
    const storedUses = localStorage.getItem('studySlayerUses');
    if (storedUses !== null) {
        usesLeft = parseInt(storedUses, 10);
    }
    limitCountDisplay.textContent = usesLeft;

    // PDF Upload Handlers
    uploadTriggerBtn.addEventListener('click', () => {
        pdfUpload.click();
    });

    pdfUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            const reader = new FileReader();
            reader.onload = function(event) {
                // Extract base64 part of the data URL
                const dataUrl = event.target.result;
                const base64Data = dataUrl.split(',')[1];
                pdfFileBase64 = base64Data;
                pdfMimeType = file.type;
            };
            reader.readAsDataURL(file);
        } else {
            fileNameDisplay.textContent = "No file chosen";
            pdfFileBase64 = null;
        }
    });

    // Generate Plan Handler
    generateBtn.addEventListener('click', async () => {
        const text = syllabusInput.value.trim();
        
        if (!text && !pdfFileBase64) {
            alert("Please enter a syllabus or upload a PDF first!");
            syllabusInput.focus();
            return;
        }

        if (usesLeft <= 0) {
            alert("You have reached your free daily limit! Please check back tomorrow or upgrade.");
            return;
        }

        // Set Loading Animation UI State
        setLoadingState(true);
        outputSection.classList.remove('visible');

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
            
            const parts = [
                { text: "You are an expert study planner. Parse the following syllabus material and generate a structured study plan. Break it down day by day. Provide topics, study notes, and a quick quiz for each day." }
            ];

            if (text) {
                parts.push({ text: `Additional Context / Syllabus Text:\n${text}` });
            }

            if (pdfFileBase64) {
                parts.push({
                    inlineData: {
                        mimeType: pdfMimeType || "application/pdf",
                        data: pdfFileBase64
                    }
                });
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: parts }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    day: { type: "STRING", description: "e.g., Day 1" },
                                    topic: { type: "STRING" },
                                    notes: { type: "STRING" },
                                    quiz: { type: "STRING" }
                                },
                                required: ["day", "topic", "notes", "quiz"]
                            }
                        }
                    }
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error("API Error: " + (errData.error?.message || response.statusText));
            }

            const data = await response.json();
            const responseText = data.candidates[0].content.parts[0].text;
            const plan = JSON.parse(responseText);

            // Decrease limit successfully
            usesLeft--;
            localStorage.setItem('studySlayerUses', usesLeft);
            limitCountDisplay.textContent = usesLeft;

            // Render UI
            renderPlanUI(plan);
            
            // Format for TXT Export and Clipboard
            generatedPlanText = formatForText(plan);

            // Display Output smoothly
            outputSection.classList.add('visible');
            
            // Scroll to the result
            setTimeout(() => {
                outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (error) {
            console.error("Error generating study plan:", error);
            alert(error.message || "An error occurred while generating your plan. Please try again.");
        } finally {
            // Restore UI State
            setLoadingState(false);
        }
    });

    /**
     * Toggles the UI state of the generate button
     */
    function setLoadingState(isLoading) {
        if (isLoading) {
            generateBtn.classList.add('loading');
            generateBtn.disabled = true;
            generateBtn.querySelector('.btn-text').textContent = "Analyzing Syllabus...";
        } else {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
            generateBtn.querySelector('.btn-text').textContent = "Generate Plan";
        }
    }

    /**
     * Renders the structured data into HTML DOM
     */
    function renderPlanUI(planArray) {
        outputContent.innerHTML = ''; // Clear previous content
        
        planArray.forEach(item => {
            const dayDiv = document.createElement('div');
            // Using templates for a clean structured look
            dayDiv.className = 'plan-day';
            dayDiv.innerHTML = `
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${escapeHTML(item.day)}
                </h3>
                <div class="plan-topic">Topic: ${escapeHTML(item.topic)}</div>
                <div class="plan-notes">${escapeHTML(item.notes)}</div>
                <div class="plan-quiz">
                    <strong>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18h6"></path>
                            <path d="M10 22h4"></path>
                            <path d="M12 2a5 5 0 0 0-5 5c0 1.62.8 3.09 1.83 4.14A3 3 0 0 1 10 13v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-2c0-.79.31-1.54.81-2.08C15.82 9.87 17 8.5 17 7a5 5 0 0 0-5-5z"></path>
                        </svg>
                        Quick Quiz
                    </strong>
                    ${escapeHTML(item.quiz)}
                </div>
            `;
            outputContent.appendChild(dayDiv);
        });
    }

    /**
     * Formats the plan array into a clean text string for copying and downloading
     */
    function formatForText(planArray) {
        let text = "✨ StudySlayer AI - Your Smart Study Plan ✨\n\n";
        planArray.forEach(item => {
            text += `[ ${item.day.toUpperCase()} ]\n`;
            text += `Topic: ${item.topic}\n`;
            text += `Notes: ${item.notes}\n`;
            text += `Quiz: ${item.quiz}\n`;
            text += `----------------------------------------\n\n`;
        });
        return text;
    }

    /**
     * Prevents XSS when rendering raw text safely into HTML
     */
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // 5. EXTRA FEATURES - Copy to Clipboard
    copyBtn.addEventListener('click', async () => {
        if (!generatedPlanText) return;
        
        try {
            await navigator.clipboard.writeText(generatedPlanText);
            
            // Visual feedback
            const span = copyBtn.querySelector('span');
            const originalText = span.textContent;
            span.textContent = "Copied!";
            copyBtn.style.color = "#10b981"; // success color
            copyBtn.style.borderColor = "#10b981";
            
            setTimeout(() => {
                span.textContent = originalText;
                copyBtn.style.color = "";
                copyBtn.style.borderColor = "";
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert("Failed to copy text. Your browser may not support this feature.");
        }
    });

    // 5. EXTRA FEATURES - Download as Text file
    downloadBtn.addEventListener('click', () => {
        if (!generatedPlanText) return;

        // Create blob with text content
        const blob = new Blob([generatedPlanText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Create an invisible anchor element to trigger download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'StudySlayer_Plan.txt';
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    });
});
