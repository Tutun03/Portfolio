// ============================================================
// NEXUS CHATBOT
// ============================================================

const nexusChat =
    document.getElementById('nexus-chat');

const nexusToggle =
    document.getElementById('nexus-toggle');

const nexusClose =
    document.getElementById('nexus-close');

const nexusWindow =
    document.querySelector('.nexus-window');

const nexusMessages =
    document.getElementById('nexus-messages');

const nexusForm =
    document.getElementById('nexus-form');

const nexusInput =
    document.getElementById('nexus-input');

const nexusSend =
    document.getElementById('nexus-send');


// ============================================================
// CONVERSATION HISTORY
// ============================================================

let conversationHistory = [];


// ============================================================
// OPEN CHAT
// ============================================================

function openNexus() {

    if (!nexusChat) {
        return;
    }


    nexusChat.classList.add('open');


    nexusToggle?.setAttribute(
        'aria-expanded',
        'true'
    );


    nexusWindow?.setAttribute(
        'aria-hidden',
        'false'
    );


    setTimeout(() => {

        nexusInput?.focus();

    }, 200);

}


// ============================================================
// CLOSE CHAT
// ============================================================

function closeNexus() {

    if (!nexusChat) {
        return;
    }


    nexusChat.classList.remove('open');


    nexusToggle?.setAttribute(
        'aria-expanded',
        'false'
    );


    nexusWindow?.setAttribute(
        'aria-hidden',
        'true'
    );

}


// ============================================================
// TOGGLE CHAT
// ============================================================

function toggleNexus() {

    if (
        nexusChat?.classList.contains('open')
    ) {

        closeNexus();

    }

    else {

        openNexus();

    }

}


// ============================================================
// EVENTS
// ============================================================

nexusToggle?.addEventListener(
    'click',
    toggleNexus
);


nexusClose?.addEventListener(
    'click',
    closeNexus
);


// ============================================================
// ESCAPE KEY
// ============================================================

document.addEventListener(
    'keydown',
    (event) => {

        if (
            event.key === 'Escape' &&
            nexusChat?.classList.contains('open')
        ) {

            closeNexus();

        }

    }
);


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );

}


// ============================================================
// FORMAT ANSWER
// ============================================================

function formatAnswer(text) {

    if (!text) {
        return '';
    }


    let answer =
        escapeHTML(text);


    // Bold
    answer =
        answer.replace(
            /\*\*(.*?)\*\*/g,
            '<strong>$1</strong>'
        );


    // Inline code
    answer =
        answer.replace(
            /`([^`]+)`/g,
            '<code>$1</code>'
        );


    // New lines
    answer =
        answer.replace(
            /\n/g,
            '<br>'
        );


    return answer;

}


// ============================================================
// ADD MESSAGE
// ============================================================

function addMessage(
    role,
    text
) {

    if (!nexusMessages) {
        return null;
    }


    const message =
        document.createElement(
            'div'
        );


    message.className =
        `nexus-message ${role}`;


    const label =
        document.createElement(
            'div'
        );


    label.className =
        'nexus-label';


    label.textContent =

        role === 'user'
            ? 'YOU'
            : 'NEXUS';


    const content =
        document.createElement(
            'div'
        );


    content.className =
        'nexus-content';


    content.innerHTML =
        formatAnswer(text);


    message.appendChild(
        label
    );


    message.appendChild(
        content
    );


    nexusMessages.appendChild(
        message
    );


    nexusMessages.scrollTop =
        nexusMessages.scrollHeight;


    return message;

}


// ============================================================
// TYPING INDICATOR
// ============================================================

function addTypingIndicator() {

    if (!nexusMessages) {
        return null;
    }


    const typing =
        document.createElement(
            'div'
        );


    typing.className =
        'nexus-message bot nexus-typing';


    typing.innerHTML = `

        <div class="nexus-label">
            NEXUS
        </div>

        <div class="nexus-content">
            <span></span>
            <span></span>
            <span></span>
        </div>

    `;


    nexusMessages.appendChild(
        typing
    );


    nexusMessages.scrollTop =
        nexusMessages.scrollHeight;


    return typing;

}


// ============================================================
// REMOVE TYPING INDICATOR
// ============================================================

function removeTypingIndicator(
    typing
) {

    if (
        typing &&
        typing.parentNode
    ) {

        typing.parentNode.removeChild(
            typing
        );

    }

}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage(
    message
) {

    const cleanedMessage =
        message.trim();


    if (
        !cleanedMessage
    ) {

        return;

    }


    addMessage(
        'user',
        cleanedMessage
    );


    conversationHistory.push({

        role:
            'user',

        content:
            cleanedMessage

    });


    nexusInput.value =
        '';


    nexusSend.disabled =
        true;


    const typing =
        addTypingIndicator();


    try {

        const response =
            await fetch(

                'http://localhost:3000/api/chat',

                {

                    method:
                        'POST',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify({

                            message:
                                cleanedMessage,

                            history:
                                conversationHistory
                                    .slice(-8)

                        })

                }

            );


        const data =
            await response.json();


        removeTypingIndicator(
            typing
        );


        if (
            !response.ok
        ) {

            throw new Error(

                data.error ||
                'Unable to get a response.'

            );

        }


        const answer =
            data.answer ||
            'I could not generate a response.';


        addMessage(
            'bot',
            answer
        );


        conversationHistory.push({

            role:
                'assistant',

            content:
                answer

        });

    }

    catch (error) {

        removeTypingIndicator(
            typing
        );


        console.error(
            'NEXUS error:',
            error
        );


        const errorMessage =

            error.message ||

            'Something went wrong while contacting NEXUS.';


        addMessage(
            'bot',
            errorMessage
        );

    }

    finally {

        nexusSend.disabled =
            false;


        nexusInput?.focus();

    }

}


// ============================================================
// FORM SUBMIT
// ============================================================

nexusForm?.addEventListener(

    'submit',

    async (event) => {

        event.preventDefault();


        if (
            nexusSend.disabled
        ) {

            return;

        }


        await sendMessage(
            nexusInput.value
        );

    }

);


// ============================================================
// SUGGESTION BUTTONS
// ============================================================

document
    .querySelectorAll(
        '.nexus-suggestions button'
    )
    .forEach(

        (button) => {

            button.addEventListener(

                'click',

                async () => {

                    const question =
                        button.dataset.question;


                    if (
                        !question
                    ) {

                        return;

                    }


                    await sendMessage(
                        question
                    );

                }

            );

        }

    );


// ============================================================
// MOBILE KEYBOARD FRIENDLY BEHAVIOR
// ============================================================

nexusInput?.addEventListener(
    'focus',
    () => {

        setTimeout(
            () => {

                nexusMessages.scrollTop =
                    nexusMessages.scrollHeight;

            },
            250
        );

    }
);


// ============================================================
// INITIAL STATE
// ============================================================

nexusWindow?.setAttribute(
    'aria-hidden',
    'true'
);

nexusToggle?.setAttribute(
    'aria-expanded',
    'false'
);