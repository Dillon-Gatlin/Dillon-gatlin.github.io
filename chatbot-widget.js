// chatbot-widget.js
(function() {
    
    // Create and inject CSS Styles inject dynamically so pages stay clean
    const styles = `
        #chat-launcher { position: fixed; 
         bottom: 20px;  right: 20px; background-color: #d29b7c; 
         background-image: url('assets/DG_Icon.png'); background-repeat: no-repeat;background-position: center;
         background-size: 48px 48px; color: white; 
         border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; 
         box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 1000;}
        #chat-window { position: fixed; bottom: 90px; right: 20px; width: 350px; height: 450px; background: 
         white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); display: none; 
         flex-direction: column; overflow: hidden; z-index: 1000; font-family: sans-serif; }
        #chat-header { background: #d29b7c; color: white; padding: 15px; font-weight: bold; display: flex;
         justify-content: space-between; }
        #chat-close { background: none; border: none; color: white; cursor: pointer;
             font-size: 18px; }
        #chat-output { flex: 1; padding: 15px; overflow-y: auto; font-size: 14px; 
            background: #333; color:white; }
        #chat-input-area { display: flex; border-top: 1px solid #5c5c5c; }
        #chat-input { flex: 1; padding: 12px; border: none; outline: none; 
            background: #5a5450; color: white; }
        #chat-send { background: #d29b7c; color: white; border: none; padding: 0 15px; 
            cursor: pointer; }
        #chat-output table { width: 100%; border-collapse: collapse; 
            margin: 10px 0; font-size: 13px;}
        #chat-output th, #chat-output td { border: 1px solid #5c5c5c; padding: 8px; 
            text-align: left; }
        #chat-output th { background-color: #d29b7c; color: white;}
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    // this is for formatting
    const markdownScript = document.createElement('script');
    markdownScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    document.head.appendChild(markdownScript);
    // Build the HTML elements structure
    const chatContainer = document.createElement("div");

    chatContainer.innerHTML = `
        <button id="chat-launcher"></button>
        <div id="chat-window">
            <div id="chat-header">
                <span>DWG-Bot</span>
                <button id="chat-close">×</button>
            </div>
            <div id="chat-output">
                <p style="color:#666; font-style:italic;">Ask me about my experience or technical background! (first query might take longer than usual)</p>
            </div>
            <div id="chat-input-area">
                <input type="text" id="chat-input" placeholder="Type a message...">
                <button id="chat-send">Send</button>
            </div>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // Setup UI Interaction Logic
    const launcher = document.getElementById("chat-launcher");
    const windowEl = document.getElementById("chat-window");
    const closeBtn = document.getElementById("chat-close");
    const sendBtn = document.getElementById("chat-send");
    const inputEl = document.getElementById("chat-input");
    const outputEl = document.getElementById("chat-output");

    launcher.onclick = () => windowEl.style.display = windowEl.style.display === "flex" ? "none" : "flex";
    closeBtn.onclick = () => windowEl.style.display = "none";

    // Hit live Render backend FastAPI endpoint
    async function handleMessage() {
        const text = inputEl.value.trim();
        if (!text) return;

        //Instantly append the USER's message to the chat window
        outputEl.innerHTML += `<div style="margin: 8px 0; color: #ffffff;"><strong>You:</strong> ${text}</div>`;
        
        // Clear input field and scroll down
        inputEl.value = "";
        outputEl.scrollTop = outputEl.scrollHeight;

        try {
            // Make the async call to your Render backend API
            const res = await fetch("https://portfolio-backend-2gtg.onrender.com/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_query: text })
            });
            
            // Extract the JSON response payload
            const data = await res.json();
            // convert the markdown string into HTML elements using Marked.js
            const formattedReply = marked.parse(data.reply);
            outputEl.innerHTML += `<div style="margin: 8px 0; color: #ffffff;"><strong>Assistant:</strong> ${formattedReply}</div>`;
            
        } catch (err) {
            console.error(err); // Prints the error log to the inspect panel for debugging
            outputEl.innerHTML += `<div style="color:red; margin: 8px 0;"><strong>System:</strong> Connection error. Is the server waking up?</div>`;
        }
        
        // Final layout adjustment to match container heights
        outputEl.scrollTop = outputEl.scrollHeight;
    }

    sendBtn.onclick = handleMessage;
    inputEl.onkeypress = (e) => { if (e.key === 'Enter') handleMessage(); };

    // Wake up the sleeping free-tier backend immediately when the user lands on the site
    fetch("https://portfolio-backend-2gtg.onrender.com").catch(() => {});
})();