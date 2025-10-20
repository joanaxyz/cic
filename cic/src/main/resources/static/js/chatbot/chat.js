document.addEventListener('DOMContentLoaded', async() => {
    window.MessageBox.setThemeMode(localStorage.getItem('theme'));
    // Check authentication
    if (!window.ApiCaller?.auth?.isAuthenticated()) {
        window.location.href = '/cic/auth/sign-in';
        return;
    }
    // DOM elements - cached for performance
    const elements = {
        chatInput: document.querySelector('.chat-input'),
        sendButton: document.querySelector('.send-button'),
        chatMessages: document.querySelector('.chat-messages'),
    };

    const messageFactory = new MessageFactory();

    // Utility functions
    const utils = {
        scrollToBottom: () => {
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        },
    };

    const getResponse = async (id, question)=>{
        const currCat = window.categoryHandler.currentCategory;
        try{
            window.ApiCaller.setAllowSpinner(false);
            const response = await window.ApiCaller.postRequest('/api/chat/process-query', {id: id, categoryId:currCat?.id, question:question}, true)
              console.log("response in chat.js",response);
              if(response.success){
              
                return {chat: response.data, message: response.data2};
            }else{
                console.error(response.message);
            }
        }catch(error){
            console.error(error);
        }
        return null;
    }

    const sleep = (ms)=>{
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Message handlers
    const messageHandlers = {
        send: async () => {
            const text = elements.chatInput.value.trim();
            
            if (!text) return;

            // Add user message
            const userMessage = messageFactory.createUserMessage(text);
            elements.chatMessages.appendChild(userMessage);
            utils.scrollToBottom();

            // Clear input and disable while processing
            elements.chatInput.value = '';
            elements.sendButton.disabled = true;
            elements.chatInput.disabled = true;

            // Show typing indicator
            const typingIndicator = messageFactory.createTypingIndicator();
            elements.chatMessages.appendChild(typingIndicator);
            utils.scrollToBottom();

            let id = new URLSearchParams(window.location.search).get("id");
            if(id === 'null') id = null;

            const response = await getResponse(id, text);
            const chat = response.chat;
            const message = response.message;

            if(id === null){
                const newUrl = `${window.location.pathname}?id=${chat.id}`;
                window.history.pushState({}, '', newUrl);
                window.ChatManager.pushChat(chat);
            }
            typingIndicator.remove();
            const botMessage = messageFactory.createBotMessage(message);
            elements.chatMessages.appendChild(botMessage);
            utils.scrollToBottom();
            // Re-enable input
            elements.sendButton.disabled = false;
            elements.chatInput.disabled = false;
            elements.chatInput.focus();

        },

        toggleAction: (activeBtn, otherBtn) => {
            const isActive = activeBtn.hasAttribute('data-active');
            
            // Remove active state from both
            activeBtn.removeAttribute('data-active');
            otherBtn.removeAttribute('data-active');
            
            // Toggle current button
            if (!isActive) {
                activeBtn.setAttribute('data-active', 'true');
            }
        }
    };

    // Event listeners setup
    const setupEventListeners = () => {
        // Message sending
        elements.sendButton.addEventListener('click', messageHandlers.send);
        elements.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                messageHandlers.send();
            }
        });

        // Auto-focus on input when clicking chat area
        elements.chatMessages.addEventListener('click', () => {
            elements.chatInput.focus();
        });
    };

    // Initialize
    const init = () => {
        setupEventListeners();
        elements.chatInput.focus();
    };

    init();
});