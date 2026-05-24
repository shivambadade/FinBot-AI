async function sendMessage() {

    let input = document.getElementById("user-input");

    let message = input.value;

    if(message.trim() === "") {

        return;
    }


    let chatBox = document.getElementById("chat-box");


    // SHOW USER MESSAGE

    chatBox.innerHTML += `

        <div style="
            text-align:right;
            margin-top:15px;
        ">

            <div style="
                background:#22c55e;
                display:inline-block;
                padding:15px;
                border-radius:15px;
                color:white;
                max-width:70%;
            ">

                ${message}

            </div>

        </div>
    `;



    // SEND MESSAGE TO FLASK

    let response = await fetch('/chat', {

        method: 'POST',

        headers: {

            'Content-Type': 'application/json'
        },

        body: JSON.stringify({

            message: message
        })
    });



    // RECEIVE RESPONSE

    let data = await response.json();



    // SHOW BOT MESSAGE

    chatBox.innerHTML += `

        <div style="
            margin-top:15px;
        ">

            <div style="
                background:#1e293b;
                display:inline-block;
                padding:15px;
                border-radius:15px;
                color:white;
                max-width:70%;
            ">

                ${data.reply}

            </div>

        </div>
    `;


    input.value = "";

    chatBox.scrollTop = chatBox.scrollHeight;
}



/* ENTER KEY SUPPORT */

document.getElementById("user-input")

.addEventListener("keypress", function(event) {

    if(event.key === "Enter") {

        sendMessage();
    }
});