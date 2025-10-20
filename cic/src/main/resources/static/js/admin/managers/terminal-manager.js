class TerminalManager {
  constructor(inputElement, outputElement) {
    this.input = inputElement;
    this.output = outputElement;
    this.commandHistory = [];
    this.historyIndex = -1;
    this.originalHeight = this.input.style.height;
    this.testMode = false;
    this.conversationHistory = [];
    
    if (this.input) {
      this.setupEventListeners();
    }
  }
  static initializeTerminal() {
        const inputElement = document.getElementById('terminalInput');
        const outputElement = document.getElementById('terminalOutput');
        if (inputElement && outputElement) {
            window.TerminalManager = new TerminalManager(inputElement, outputElement);
        }
  }

  setupEventListeners() {
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const command = this.input.value.trim();
        
        if (this.testMode) {
          this.handleTestMode(command);
        } else {
          this.executeCommand(command);
        }
        
        this.input.value = '';
        this.input.style.height = this.originalHeight;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory('down');
      }
    });

    this.input.addEventListener('input', () => {
      this.input.style.height = 'auto';
      this.input.style.height = this.input.scrollHeight + 'px';
    });
  }

  async handleTestMode(message) {
    if (!message) return;

    this.commandHistory.push(message);
    this.historyIndex = this.commandHistory.length;

    // Display user message
    this.writeLine(`You: ${message}`, 'command');
    
    // Get current category context
    const currentCat = window.categoryManager.getCurrentCategory();
    
    if (!currentCat) {
      this.writeError('No category selected. Please select a category first or exit test mode.');
      this.scrollToBottom();
      return;
    }

    // Show loading indicator
    const loadingLine = this.writeLine('Bot is thinking...', 'info');
    this.scrollToBottom();

    try {
      window.ApiCaller.setAllowSpinner(false);
      const response = await window.ApiCaller.postRequest('/api/chat/process-query', {
        categoryId: currentCat.id,
        question: message,
        test: true
      });

      // Remove loading indicator
      loadingLine.remove();

      if (response.success) {
        const answer = response.data;
        this.conversationHistory.push({ question: message, answer });
        this.writeLine(`Bot: ${answer}`, 'success');
      } else {
        this.writeError(`Error: ${response.message}`);
      }
    } catch (error) {
      loadingLine.remove();
      this.writeError(`Failed to get response: ${error.message}`);
    }

    this.scrollToBottom();
  }

  executeCommand(command) {
    if (!command) return;

    this.commandHistory.push(command);
    this.historyIndex = this.commandHistory.length;

    this.writeLine(`${command}`, 'command');

    const parts = this.parseCommand(command);
    const commandName = parts.command;

    switch (commandName) {
      case 'help':
        this.showHelp();
        break;
      case 'clear':
        this.clear();
        break;
      case 'test':
        this.toggleTestMode();
        break;
      case 'list-categories':
        this.listCategories();
        break;
      case 'add-category':
        this.addCategory(parts.args);
        break;
      case 'delete-category':
        this.deleteCategory(parts.args);
        break;
      case 'edit-category':
        this.editCategory(parts.args);
        break;
      case 'select-category':
        this.selectCategory(parts.args);
        break;
      case 'current-category':
        this.showCurrentCategory();
        break;
      default:
        this.writeError(`Command not found: ${commandName}`);
        this.writeLine('Type "help" for available commands', 'info');
    }

    this.scrollToBottom();
  }

  parseCommand(command) {
    const regex = /--(\w+)\s+"([^"]+)"|--(\w+)\s+(\S+)|(\S+)/g;
    const result = {
      command: '',
      args: {}
    };

    let match;
    let firstToken = true;

    while ((match = regex.exec(command)) !== null) {
      if (match[1] && match[2]) {
        result.args[match[1]] = match[2];
      } else if (match[3] && match[4]) {
        result.args[match[3]] = match[4];
      } else if (match[5]) {
        if (firstToken) {
          result.command = match[5];
          firstToken = false;
        }
      }
    }

    return result;
  }

  toggleTestMode() {
    this.testMode = !this.testMode;
    
    // Get terminal container for styling
    const terminalContainer = document.querySelector('.terminal-container');
    
    if (this.testMode) {
      const currentCat = window.categoryManager.getCurrentCategory();
      if (!currentCat) {
        this.writeError('No category selected. Please select a category first.');
        this.writeLine('Use: select-category --name "Category Name"', 'info');
        this.testMode = false;
        return;
      }
      
      this.writeSuccess(`Test mode enabled for category: ${currentCat.name}`);
      this.writeLine('You can now chat with the bot. Type your questions naturally.', 'info');
      this.writeLine('Type "test" again to exit test mode.', 'info');
      this.conversationHistory = [];
      
      // Update prompt and add test mode styling
      this.updatePrompt('test');
      if (terminalContainer) {
        terminalContainer.classList.add('test-mode');
      }
    } else {
      this.writeSuccess('Test mode disabled. Back to command mode.');
      this.updatePrompt('admin@cic:~$');
      
      // Remove test mode styling
      if (terminalContainer) {
        terminalContainer.classList.remove('test-mode');
      }
    }
  }

  updatePrompt(text) {
    const promptElement = document.querySelector('.terminal-prompt');
    if (promptElement) {
      promptElement.textContent = text;
    }
  }

  showHelp() {
    this.writeLine('Available commands:', 'success');
    this.writeLine('');
    
    this.writeLine('CATEGORY MANAGEMENT:', 'info');
    this.writeLine('  add-category --name "Category Name"', 'normal');
    this.writeLine('    Create a new category');
    this.writeLine('');
    this.writeLine('  delete-category --name "Category Name"', 'normal');
    this.writeLine('    Delete a category');
    this.writeLine('');
    this.writeLine('  edit-category --name "Old Name" --newname "New Name"', 'normal');
    this.writeLine('    Rename a category');
    this.writeLine('');
    this.writeLine('  select-category --name "Category Name"', 'normal');
    this.writeLine('    Select a category as current');
    this.writeLine('');
    this.writeLine('  current-category', 'normal');
    this.writeLine('    Show current selected category');
    this.writeLine('');
    this.writeLine('  list-categories', 'normal');
    this.writeLine('    List all available categories');
    this.writeLine('');
    
    this.writeLine('TEST MODE:', 'info');
    this.writeLine('  test', 'normal');
    this.writeLine('    Toggle test mode to chat with the bot');
    this.writeLine('    (Requires a category to be selected)');
    this.writeLine('');
    
    this.writeLine('GENERAL:', 'info');
    this.writeLine('  clear', 'normal');
    this.writeLine('    Clear terminal output');
    this.writeLine('');
    this.writeLine('  help', 'normal');
    this.writeLine('    Show this help message');
  }

  async addCategory(args) {
    const name = args.name;

    if (!name) {
      this.writeError('Missing required argument: --name');
      return;
    }

    try {
      await window.categoryManager.addCategory(name);
      this.writeSuccess(`✓ Category "${name}" created successfully!`);
    } catch (error) {
      this.writeError(`Failed to create category: ${error.message}`);
    }
  }

  async deleteCategory(args) {
    const name = args.name;

    if (!name) {
      this.writeError('Missing required argument: --name');
      return;
    }

    const category = window.categoryManager.getAllCategories().find(c => 
      c.name.toLowerCase() === name.toLowerCase()
    );

    if (!category) {
      this.writeError(`Category not found: ${name}`);
      return;
    }

    try {
      await window.categoryManager.deleteCategory(category.id);
      this.writeSuccess(`✓ Category "${name}" deleted successfully!`);
      
      // Clear current category if it was deleted
      const current = window.categoryManager.getCurrentCategory();
      if (current && current.id === category.id) {
        window.categoryManager.setCurrentCategory(null);
        this.writeLine('Current category cleared', 'info');
      }
    } catch (error) {
      this.writeError(`Failed to delete category: ${error.message}`);
    }
  }

  async editCategory(args) {
    const name = args.name;
    const newName = args.newname;

    if (!name || !newName) {
      this.writeError('Missing required arguments: --name and --newname');
      return;
    }

    const category = window.categoryManager.getAllCategories().find(c => 
      c.name.toLowerCase() === name.toLowerCase()
    );

    if (!category) {
      this.writeError(`Category not found: ${name}`);
      return;
    }

    try {
      await window.categoryManager.editCategory(category.id, newName, null);
      this.writeSuccess(`✓ Category renamed from "${name}" to "${newName}"!`);
    } catch (error) {
      this.writeError(`Failed to edit category: ${error.message}`);
    }
  }

  selectCategory(args) {
    const name = args.name;

    if (!name) {
      this.writeError('Missing required argument: --name');
      return;
    }

    const category = window.categoryManager.getAllCategories().find(c => 
      c.name.toLowerCase() === name.toLowerCase()
    );

    if (!category) {
      this.writeError(`Category not found: ${name}`);
      this.writeLine('Use "list-categories" to see available categories', 'info');
      return;
    }

    window.categoryManager.setCurrentCategory(category);
    this.writeSuccess(`✓ Selected category: ${category.name}`);
  }

  showCurrentCategory() {
    const current = window.categoryManager.getCurrentCategory();
    
    if (!current) {
      this.writeLine('No category currently selected', 'info');
      this.writeLine('Use: select-category --name "Category Name"', 'info');
      return;
    }

    this.writeLine('Current category:', 'success');
    this.writeLine('');
    this.writeLine(`  Name: ${current.name}`, 'info');
    this.writeLine(`  ID: ${current.id}`, 'info');
    this.writeLine(`  Created: ${this.formatDate(current.createdAt)}`, 'info');
    this.writeLine(`  Created By: ${current.createdBy}`, 'info');
  }

  listCategories() {
    const categories = window.categoryManager.getAllCategories();
    
    if (categories.length === 0) {
      this.writeLine('No categories available', 'info');
      return;
    }

    const current = window.categoryManager.getCurrentCategory();
    this.writeLine('Available categories:', 'success');
    this.writeLine('');
    
    categories.forEach((cat, index) => {
      const marker = current && current.id === cat.id ? '●' : ' ';
      this.writeLine(`${marker} ${index + 1}. ${cat.name} (ID: ${cat.id})`, 'info');
    });
    
    if (current) {
      this.writeLine('');
      this.writeLine(`● = Currently selected category`, 'normal');
    }
  }

  writeLine(text, type = 'normal') {
    const line = document.createElement('div');
    line.className = 'terminal-line';

    let prefix = '';
    if (type === 'command') {
      prefix = '<span class="terminal-prompt">admin@cic:~$</span> ';
    } else if (type === 'success') {
      prefix = '<span class="terminal-success">●</span> ';
    } else if (type === 'error') {
      prefix = '<span class="terminal-error">✗</span> ';
    } else if (type === 'info') {
      prefix = '<span class="terminal-info">›</span> ';
    }

    line.innerHTML = prefix + this.escapeHtml(text);
    this.output.appendChild(line);
    
    return line;
  }

  writeSuccess(text) {
    this.writeLine(text, 'success');
  }

  writeError(text) {
    this.writeLine(text, 'error');
  }

  clear() {
    this.output.innerHTML = `
      <div class="terminal-line">
        <span class="terminal-success">●</span> Terminal initialized successfully
      </div>
      <div class="terminal-line">
        <span class="terminal-info">Type 'help' for available commands</span>
      </div>
    `;
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    if (direction === 'up') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.commandHistory[this.historyIndex];
      }
    } else if (direction === 'down') {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.input.value = this.commandHistory[this.historyIndex];
      } else {
        this.historyIndex = this.commandHistory.length;
        this.input.value = '';
      }
    }
  }

  scrollToBottom() {
    this.output.scrollTop = this.output.scrollHeight;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

window.TerminalManager = TerminalManager;