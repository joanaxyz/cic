class MessageFactory {
    // ============================================
    // Message Creation Methods
    // ============================================

    /**
     * Creates a user message element with optional delete button
     * @param {string|object} textOrMessage - Either a text string or message object
     * @returns {HTMLElement} The user message element
     */
    createUserMessage(textOrMessage) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';

        const bubble = document.createElement('div');
        bubble.className = 'user-bubble';
        
        // Handle both old API (just text) and new API (message object)
        let text, messageId, isBotMessageDeleted;
        
        if (typeof textOrMessage === 'string') {
            // Old API - just text, no delete button
            text = textOrMessage;
            messageId = null;
            isBotMessageDeleted = false;
        } else {
            // New API - message object
            text = textOrMessage.userMessage;
            messageId = textOrMessage.id;
            // Bot message is considered deleted if it's empty, null, or just whitespace
            isBotMessageDeleted = !textOrMessage.botMessage || 
                                textOrMessage.botMessage.trim() === '';
            
            console.log(`User message ${messageId}: botMessage="${textOrMessage.botMessage}", isBotMessageDeleted=${isBotMessageDeleted}`);
        }
        
        bubble.textContent = text;
        messageDiv.appendChild(bubble);

        // Only add delete button if bot message was deleted and we have a message ID
        if (isBotMessageDeleted && messageId) {
            const actions = this.createUserActionButtons(messageId);
            messageDiv.appendChild(actions);
        }

        return messageDiv;
    }

    /**
     * Creates a bot message element with action buttons
     * @param {string} text - The message text
     * @returns {HTMLElement} The bot message element
     */
    createBotMessage(message) {
        console.log("Creating Bot Message", message);
        const text = message.botMessage;
        const id = message.id;
        const isLike = message.like;
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';

        const botText = document.createElement('div');
        botText.className = 'bot-text';
        botText.innerHTML = this.formatBotResponse(text);
        messageDiv.appendChild(botText);

        const actions = this.createActionButtons(id, isLike);
        messageDiv.appendChild(actions);

        return messageDiv;
    }

    /**
     * Creates a typing indicator for bot responses
     * @returns {HTMLElement} The typing indicator element
     */
    createTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        
        const botText = document.createElement('div');
        botText.className = 'bot-text typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.className = 'typing-dot';
            botText.appendChild(dot);
        }
        
        typingDiv.appendChild(botText);
        return typingDiv;
    }

    // ============================================
    // Text Formatting Methods
    // ============================================

    /**
     * Formats bot response text to HTML with proper styling
     * Supports: line breaks, lists, bold/italic text, code blocks
     * @param {string} text - The raw text to format
     * @returns {string} HTML-formatted text
     */
    formatBotResponse(text) {
        if (!text) return '';

        let formatted = this.escapeHtml(text);

        // Apply text styling
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');

        // Format lists
        formatted = this.formatLists(formatted);
        formatted = this.formatNumberedLists(formatted);

        // Format code
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<code class="code-block">$1</code>');
        formatted = formatted.replace(/`([^`]+?)`/g, '<code class="inline-code">$1</code>');

        // Format paragraphs (must be last to preserve list structure)
        formatted = this.formatParagraphs(formatted);

        return formatted;
    }

    /**
     * Escapes HTML to prevent XSS attacks
     * @param {string} text - The text to escape
     * @returns {string} Escaped HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Formats unordered lists (bullet points starting with -, •, or *)
     * @param {string} text - The text containing bullet points
     * @returns {string} Text with HTML list markup
     */
    formatLists(text) {
        const bulletRegex = /^[\s]*[-•*]\s+(.+)$/gm;
        const lines = text.split('\n');
        const result = [];
        let inList = false;
        
        for (const line of lines) {
            const match = line.match(bulletRegex);
            
            if (match) {
                if (!inList) {
                    result.push('<ul class="bot-list">');
                    inList = true;
                }
                const content = match[0].replace(/^[\s]*[-•*]\s+/, '');
                result.push(`<li>${content}</li>`);
            } else {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                result.push(line);
            }
        }
        
        if (inList) {
            result.push('</ul>');
        }
        
        return result.join('\n');
    }

    /**
     * Formats numbered lists (lines starting with 1., 2., etc.)
     * @param {string} text - The text containing numbered lists
     * @returns {string} Text with HTML ordered list markup
     */
    formatNumberedLists(text) {
        const numberRegex = /^[\s]*\d+\.\s+(.+)$/gm;
        const lines = text.split('\n');
        const result = [];
        let inList = false;
        
        for (const line of lines) {
            const match = line.match(numberRegex);
            
            if (match) {
                if (!inList) {
                    result.push('<ol class="bot-list">');
                    inList = true;
                }
                const content = match[0].replace(/^[\s]*\d+\.\s+/, '');
                result.push(`<li>${content}</li>`);
            } else {
                if (inList) {
                    result.push('</ol>');
                    inList = false;
                }
                result.push(line);
            }
        }
        
        if (inList) {
            result.push('</ol>');
        }
        
        return result.join('\n');
    }

    /**
     * Formats paragraphs and line breaks
     * Double line breaks create new paragraphs, single breaks become <br>
     * @param {string} text - The text to format
     * @returns {string} Text with paragraph markup
     */
    formatParagraphs(text) {
        const paragraphs = text.split(/\n\s*\n/);
        
        if (paragraphs.length <= 1) {
            return text.replace(/\n/g, '<br>');
        }
        
        return paragraphs
            .map(para => para.trim())
            .filter(para => para.length > 0)
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
            .join('');
    }

    // ============================================
    // Action Button Methods
    // ============================================

    /**
     * Creates the like/dislike action button container with delete button
     * @returns {HTMLElement} Container with action buttons
     */
    createActionButtons(id, isLike) {
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        
        const likeBtn = this.createActionButton('like');
        const dislikeBtn = this.createActionButton('dislike');
        const deleteBtn = this.createActionButton('delete');
        
        if(isLike === null){
            likeBtn.addEventListener('click', async () => {
                this.toggleAction(likeBtn, dislikeBtn)
                await window.ApiCaller.postRequest(`/api/message/handle-like/${id}/${true}`, null, true);
            });
            dislikeBtn.addEventListener('click', async () => {
                this.toggleAction(dislikeBtn, likeBtn)
                await window.ApiCaller.postRequest(`/api/message/handle-like/${id}/${false}`, null, true);
            });
        }

        deleteBtn.addEventListener('click', () => this.deleteMessage(id, deleteBtn, 'bot'));
        
        actions.appendChild(likeBtn);
        actions.appendChild(dislikeBtn);
        actions.appendChild(deleteBtn);
        
        return actions;
    }

    /**
     * Creates action buttons for user messages (only delete)
     * @returns {HTMLElement} Container with user action buttons
     */
    createUserActionButtons(id) {
        const actions = document.createElement('div');
        actions.className = 'message-actions user-actions';
        
        const deleteBtn = this.createActionButton('delete');
        deleteBtn.addEventListener('click', () => this.deleteMessage(id, deleteBtn, 'user'));
        
        actions.appendChild(deleteBtn);
        
        return actions;
    }

    /**
     * Creates an individual action button (like, dislike, or delete)
     * @param {string} type - Either 'like', 'dislike', or 'delete'
     * @returns {HTMLElement} The action button element
     */
    createActionButton(type) {
        const button = document.createElement('button');
        button.className = `action-btn ${type}-btn`;
        
        let ariaLabel, svgPath;
        
        switch (type) {
            case 'like':
                ariaLabel = 'Like';
                svgPath = 'M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z';
                break;
            case 'dislike':
                ariaLabel = 'Dislike';
                svgPath = 'M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z';
                break;
            case 'delete':
                ariaLabel = 'Delete message';
                svgPath = 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z';
                break;
            default:
                ariaLabel = 'Action';
                svgPath = '';
        }
        
        button.setAttribute('aria-label', ariaLabel);
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'currentColor');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', svgPath);
        
        svg.appendChild(path);
        button.appendChild(svg);
        
        return button;
    }

    /**
     * Toggles the active state of action buttons
     * @param {HTMLElement} activeBtn - The button being clicked
     * @param {HTMLElement} otherBtn - The other button to deactivate
     */
    async toggleAction(activeBtn, otherBtn) {
        if (activeBtn.classList.contains('active')) {
            activeBtn.classList.remove('active');
        } else {
            activeBtn.classList.add('active');
            otherBtn.classList.remove('active');
        }
        setTimeout(() => {
                    activeBtn.remove();
                    otherBtn.remove();
        }, 300);
    }

    /**
     * Handles message deletion with confirmation
     * @param {HTMLElement} deleteBtn - The delete button that was clicked
     */
    deleteMessage(id, deleteBtn, type) {
        window.MessageBox.showConfirm('Are you sure you want to delete this message?', async()=>{
            const messageElement = deleteBtn.closest('.message');
            if (messageElement) {
                // Add fade out animation before removing
                messageElement.style.transition = 'all 0.3s ease-out';
                messageElement.style.opacity = '0';
                messageElement.style.transform = 'translateX(-20px)';

                switch(type){
                    case "bot":
                        await this.deleteBotMsg(id);
                        // Don't remove DOM element - let refreshCurrentChat handle the update
                        return;
                    case "user":
                        await window.ApiCaller.postRequest(`/api/message/delete/${id}`, null, true);
                        break;
                }
                
                // Remove the message after animation completes
                setTimeout(() => {
                    messageElement.remove();
                }, 300);
            }
        });
    }

    async deleteBotMsg(id){
        // Use URL encoding for empty string to avoid path parameter issues
        const response = await window.ApiCaller.postRequest(`/api/message/updateBot/${id}/%20`, null, true);
        console.log(response.message);
        
        // Refresh the current chat to show updated state (user delete buttons)
        if (window.ChatManager) {
            await window.ChatManager.refreshCurrentChat();
        }
    }
}