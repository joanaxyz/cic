class EditorPage {
  constructor() {
    this.pageElement = document.getElementById('editorView');
    this.categorySelect = document.getElementById('editorCategory');
    this.questionInput = document.getElementById('editorQuestion');
    this.answerInput = document.getElementById('editorAnswer');
    this.backButton = document.getElementById('backFromEditor');
    this.cancelButton = document.getElementById('cancelEditorBtn');
    this.clearContentButton = document.getElementById('clearContentBtn');
    this.clearPresetsButton = document.getElementById('clearPresetsBtn');
    this.saveContentButton = document.getElementById('saveContentBtn');
    this.savePresetsButton = document.getElementById('savePresetsBtn');
    this.editButton = document.getElementById('editCategoryBtn');
    this.nameInput = document.getElementById('categoryNameInput');
    this.nameEditor = document.getElementById('categoryNameEditor');
    this.saveNameButton = document.getElementById('saveEditCategoryBtn');
    this.cancelNameButton = document.getElementById('cancelEditCategoryBtn');
    
    this.previousPage = `categories`;
    this.categoryId = null;
  }

  async init() {
    // Wait for AdminResourceLoader to be available
    while (!window.AdminResourceLoader) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    this.setupEventListeners();
    await window.categoryManager.ready;
    this.show();
  }

  setupEventListeners() {
    if (this.backButton) {
      this.backButton.addEventListener('click', () => this.goBack());
    }

    if (this.cancelButton) {
      this.cancelButton.addEventListener('click', () => this.goBack());
    }

    if (this.clearContentButton) {
      this.clearContentButton.addEventListener('click', () => this.handleClearContent());
    }

    if (this.clearPresetsButton) {
      this.clearPresetsButton.addEventListener('click', () => this.handleClearPresets());
    }

    if (this.saveContentButton) {
      this.saveContentButton.addEventListener('click', () => this.handleSaveContent());
    }

    if (this.savePresetsButton) {
      this.savePresetsButton.addEventListener('click', () => this.handleSavePresets());
    }

    if (this.editButton) {
      this.editButton.addEventListener('click', () => this.hadnleEditButton());
    }

    if(this.saveNameButton){
      this.saveNameButton.addEventListener('click', () => this.handleSaveName());
    }

    if(this.cancelNameButton){
      this.cancelNameButton.addEventListener('click', () => this.cancelSaveName());
    }

    // Auto-resize textarea functionality
    if (this.answerInput) {
      this.setupTextareaAutoResize();
    }
  }

  setupTextareaAutoResize() {
    const textarea = this.answerInput;
    
    // Function to adjust textarea height
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 150; // minimum height in pixels
      
      // Set height to scrollHeight but not less than minHeight
      textarea.style.height = Math.max(scrollHeight, minHeight) + 'px';
    };

    // Adjust height on input
    textarea.addEventListener('input', adjustHeight);
    
    // Adjust height on paste
    textarea.addEventListener('paste', () => {
      setTimeout(adjustHeight, 0); // Delay to allow paste content to be processed
    });
    
    // Initial adjustment
    setTimeout(adjustHeight, 0);
  }

  loadData() {
    this.populateCategorySelect();
    let category = window.categoryManager.getCurrentCategory();
    if (category === null) {
    const stored = localStorage.getItem('currentCategory');
    if (stored) {
      category = JSON.parse(stored);  // convert string → object
      console.log("Current Category:", category);
    }
}
    const content = category.content;
    if (this.categorySelect  && category) this.categorySelect.value = category.id;
    if (!content && this.answerInput)  this.answerInput.value = "Nothing yet";
    if (content && this.answerInput)  this.answerInput.value = content;

    // Load presets for the current category
    if (window.presetManager && category) {
      window.presetManager.loadPresets(category.id);
    }

    // Trigger auto-resize after content is loaded
    if (this.answerInput) {
      setTimeout(() => {
        const adjustEvent = new Event('input');
        this.answerInput.dispatchEvent(adjustEvent);
      }, 0);
    }

    if (this.clearContentButton) this.clearContentButton.style.display = 'inline-flex';
    if (this.clearPresetsButton) this.clearPresetsButton.style.display = 'inline-flex';
  }

  populateCategorySelect() {
    if (!this.categorySelect) return;

    const categories = window.categoryManager.getAllCategories();
    this.categorySelect.innerHTML = '<option value="">Select a category</option>';

    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      this.categorySelect.appendChild(option);
    });
  }

  async handleSaveContent() {
    console.log('Saving content...');
    const categoryId = this.categorySelect?.value;
    const answer = this.answerInput?.value.trim();

    if (!categoryId) {
      alert('Please select a category');
      return;
    }

    try {
      await window.categoryManager.editCategory(categoryId, null, answer);
      window.MessageBox.showSuccess('Content updated successfully!', () => {
        window.MessageBox.hide();
      });
    } catch (error) {
      console.error('Error saving content:', error);
      window.MessageBox.showError('Failed to save content. Please try again.');
    }
  }

  async handleSavePresets() {
    console.log('Saving presets...');
    const categoryId = this.categorySelect?.value;

    if (!categoryId) {
      alert('Please select a category');
      return;
    }

    try {
      // Get current presets from preset manager
      const presets = window.presetManager.getPresets();
      
      // Update category with presets
      await window.categoryManager.editCategory(categoryId, null, null, presets);
      
      window.MessageBox.showSuccess('Presets updated successfully!', () => {
        window.MessageBox.hide();
      });
    } catch (error) {
      console.error('Error saving presets:', error);
      window.MessageBox.showError('Failed to save presets. Please try again.');
    }
  }

  hadnleEditButton() {
      this.nameEditor.style.display = 'block';
      this.editButton.style.display = 'none';
  }

  cancelSaveName(){
    this.nameEditor.style.display = 'none';
    this.editButton.style.display = 'inline-block';
  }

  async handleSaveName(){
    const categoryId = this.categorySelect?.value;
      if (!categoryId) {
      alert('Please select a category');
      return;
    }

    const newName = this.nameInput.value.trim();

    try {
      const response = await window.categoryManager.editCategory(categoryId, newName);
      // Refresh the category select dropdown to show the new name
      this.populateCategorySelect();
      // Keep the current category selected
      this.categorySelect.value = categoryId;
      
      this.nameEditor.style.display = 'none';
      this.editButton.style.display = 'inline-block';
    
      window.MessageBox.showSuccess('Category name updated successfully!', () => {
        window.MessageBox.hide();
      });
    } catch (error) {
      console.error('Error saving category name:', error);
      window.MessageBox.showError('Failed to save category name. Please try again.');
    }
  }


  async handleClearContent() {
    // Confirm before clearing content
    const confirmed = confirm('This will clear the content. Are you sure you want to continue?');
    if (!confirmed) return;

    // Clear content
    this.answerInput.value = "";
    
    // Trigger auto-resize after clearing
    const adjustEvent = new Event('input');
    this.answerInput.dispatchEvent(adjustEvent);
  }

  async handleClearPresets() {
    // Confirm before clearing presets
    const confirmed = confirm('This will clear all preset questions. Are you sure you want to continue?');
    if (!confirmed) return;
    
    // Clear all preset questions
    if (window.presetManager) {
      window.presetManager.clearAllPresets();
    }
  }

  goBack() {
    if (window.navigation) {
        window.navigation.navigateTo(this.previousPage);
    }
  }

  show() {
    this.loadData();
  }
}

document.addEventListener('DOMContentLoaded', () => {
 window.editorPage = new EditorPage();
});
