function sendFeature(feature) {
    document.getElementById("userInput").value = feature;
}

async function sendMessage() {

    const input = document.getElementById("userInput");
    const message = input.value.trim();

    if (message === "") {
        alert("Please enter a question!");
        return;
    }

    const chatBox = document.getElementById("chat-box");

    // Show user message
    chatBox.innerHTML += `
        <div class="user">
            <strong>You:</strong> ${message}
        </div>
    `;

    input.value = "";

    // Show loading message
    chatBox.innerHTML += `
        <div class="bot" id="loading">
            <strong>AI:</strong> Thinking...
        </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

    try {

            const response = await fetch("/chat",   {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        // Remove loading message
        document.getElementById("loading").remove();

        // Show AI response
        chatBox.innerHTML += `
            <div class="bot">
                <strong>AI:</strong> ${data.reply}
            </div>
        `;

        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {

        const loading = document.getElementById("loading");
        if (loading) loading.remove();

        chatBox.innerHTML += `
            <div class="bot">
                <strong>AI:</strong> Error connecting to server.
            </div>
        `;

        console.error(error);
    }
}

// Allow Enter key to send message
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("userInput");

    input.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
});