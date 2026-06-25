function sendFeature(feature) {
    document.getElementById("userInput").value = feature;
}

async function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value.trim();

    if (!message) {
        alert("Please enter a question!");
        return;
    }

    const chatBox = document.getElementById("chat-box");

    // Display user message
    const userDiv = document.createElement("div");
    userDiv.className = "user";
    userDiv.innerHTML = `<strong>You:</strong> ${escapeHtml(message)}`;
    chatBox.appendChild(userDiv);

    input.value = "";
    input.focus();

    // Loading message
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "bot";
    loadingDiv.id = "loading";
    loadingDiv.innerHTML = `<strong>AI:</strong> Thinking...`;
    chatBox.appendChild(loadingDiv);

    scrollToBottom();

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message })
        });

        // Check server response
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();

        // Remove loading
        loadingDiv.remove();

        // Show AI reply
        const botDiv = document.createElement("div");
        botDiv.className = "bot";
        botDiv.innerHTML = `
            <strong>AI:</strong> ${escapeHtml(data.reply || "No response received.")}
        `;

        chatBox.appendChild(botDiv);
        scrollToBottom();

    } catch (error) {
        console.error("Error:", error);

        loadingDiv.remove();

        const errorDiv = document.createElement("div");
        errorDiv.className = "bot error";
        errorDiv.innerHTML = `
            <strong>AI:</strong> Unable to connect to the server. Please try again.
        `;

        chatBox.appendChild(errorDiv);
        scrollToBottom();
    }
}

// Enter key support
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("userInput");

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
});

// Auto scroll
function scrollToBottom() {
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Prevent HTML injection
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}