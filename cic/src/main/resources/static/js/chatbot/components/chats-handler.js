class ChatManager {
    constructor() {
        this.newChatBtn = document.getElementById('newChatBtn');
        this.chatList = document.getElementById("chatHistoryList");
        this.chatMessagesContainer = document.querySelector('.chat-messages');
        this.messageFactory = new MessageFactory();
        this.currentId = new URLSearchParams(window.location.search).get("id");
        this.chats = null;
    
        this.init();
    }

    scrollToMessage(searchText) {
        const messages = this.chatMessagesContainer.querySelectorAll(".message");
        for (const msg of messages) {
            if (msg.textContent.toLowerCase().includes(searchText.toLowerCase())) {
                msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const url = new URL(window.location.href);
                url.searchParams.delete('highlight');
                history.replaceState(null, '', url.toString());
                break;
            }
        }
    }


    async init() {
        this.newChatBtn.addEventListener('click', () => this.createNewChat());
        const params = new URLSearchParams(window.location.search);
        const highlight = params.get('highlight');

        this.chats = await this.loadChats();
        this.renderChats(this.chats);

        const currentChat = this.chats.find(c => String(c.id) === this.currentId);
        this.renderMessages(currentChat);

        if (highlight) {
        const tryScroll = () => {
            const messages = this.chatMessagesContainer.querySelectorAll('.message');
            if (messages.length > 0) {
                this.scrollToMessage(highlight);
            } else {
                setTimeout(tryScroll, 100); 
            }
        };
        tryScroll();
    }

    }

    async loadChats() {
        try {
            const response = await window.ApiCaller.getRequest('/api/chat/getAllByUser', true);
            if (response.success) return response.data;
            console.error('Failed to load chats:', response.message);
            return [];
        } catch (error) {
            console.error('Error loading chats:', error);
            return [];
        }
    }

    async createNewChat() {
        try {
            window.location.href = `/cic/chatbot?id=null`;
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    }

    async deleteChat(chatId) {
        try {
            const response = await window.ApiCaller.postRequest('/api/chat/delete', { id: chatId }, true);
            if (response.success) return true;
            console.error('Failed to delete chat:', response.message);
            return false;
        } catch (error) {
            console.error('Error deleting chat:', error);
            return false;
        }
    }

    renderMessages(chat) {
        this.chatMessagesContainer.innerHTML = '';
        if (!chat) return;

        chat.messages.forEach(message => {
            if (message.userMessage) {
                this.chatMessagesContainer.appendChild(
                    this.messageFactory.createUserMessage(message)
                );
            }
            if (message.botMessage) {
                this.chatMessagesContainer.appendChild(
                    this.messageFactory.createBotMessage(message)
                );
            }
        });

        this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
    }

    async refreshCurrentChat() {
        if (!this.currentId) return;
        
        // Reload chats to get updated data
        this.chats = await this.loadChats();
        const currentChat = this.chats.find(c => String(c.id) === this.currentId);
        
        if (currentChat) {
            this.renderMessages(currentChat);
        }
    }

    pushChat(chat){
        if(this.chatList.textContent.trim() === 'No chat history yet') this.chatList.innerHTML = "";
        const item = document.createElement("div");
        item.classList.add("chat-history-item");
        item.classList.add("active");
        item.innerHTML = `
            <span class="chat-title">${chat.title || "Untitled Chat"}</span>
            <button class="delete-chat-btn" data-chat-id="${chat.id}" title="Delete chat">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6
                             m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                </svg>
            </button>
        `;
        // Handle chat title click
        const chatTitle = item.querySelector('.chat-title');
        chatTitle.addEventListener("click", () => {
            window.location.href = `/cic/chatbot?id=${chat.id}`;
        });
        // Handle delete button click
        const deleteBtn = item.querySelector('.delete-chat-btn');
        deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            this.handleChatDelete(chat, item, deleteBtn);
        });
        this.chatList.prepend(item);
    }

    renderChats(chats) {
        this.chatList.innerHTML = "";

        if (!chats || chats.length === 0) {
            this.chatList.innerHTML = '<div class="no-chats">No chat history yet</div>';
            return;
        }

        chats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .forEach(chat => {
            const item = document.createElement("div");
            item.classList.add("chat-history-item");
            if (String(chat.id) === this.currentId) item.classList.add("active");

            item.innerHTML = `
                <span class="chat-title">${chat.title || "Untitled Chat"}</span>
                <button class="delete-chat-btn" data-chat-id="${chat.id}" title="Delete chat">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6
                                 m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                    </svg>
                </button>
            `;

            // Handle chat title click
            const chatTitle = item.querySelector('.chat-title');
            chatTitle.addEventListener("click", () => {
                window.location.href = `/cic/chatbot?id=${chat.id}`;
            });

            // Handle delete button click
            const deleteBtn = item.querySelector('.delete-chat-btn');
            deleteBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                this.handleChatDelete(chat, item, deleteBtn);
            });

            this.chatList.appendChild(item);
        });
    }

    async handleChatDelete(chat, item, deleteBtn) {
        window.MessageBox.showConfirm(
            `Are you sure you want to delete "${chat.title || 'Untitled Chat'}"?`,
            async () => {
                deleteBtn.disabled = true;
                deleteBtn.classList.add('deleting');

                const success = await this.deleteChat(chat.id);
                if (success) {
                    item.style.animation = 'slideOutRight 0.3s ease';

                    setTimeout(async () => {
                        const updatedChats = await this.loadChats();
                        this.renderChats(updatedChats);

                        // Redirect if active chat was deleted
                        if (String(chat.id) === this.currentId) {
                            if (updatedChats.length > 0) {
                                window.location.href = `/cic/chatbot?id=${updatedChats[0].id}`;
                            } else {
                                window.location.href = '/cic/chatbot';
                            }
                        }
                    }, 300);
                } else {
                    deleteBtn.disabled = false;
                    deleteBtn.classList.remove('deleting');
                }
            }
        );
    }
}

document.addEventListener('DOMContentLoaded', () =>
    window.ChatManager = new ChatManager());
