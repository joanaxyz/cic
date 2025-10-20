class CategoriesPage {
  constructor() {
    this.pageElement = document.getElementById('categories-page');
    this.gridElement = document.getElementById('categoriesGrid');
    this.addButton = document.getElementById('addCategoryBtn');
  }

  async init() {
    this.setupEventListeners();
    await window.categoryManager.ready;
    this.render();
  }

  setupEventListeners() {
    if (this.addButton) {
      this.addButton.addEventListener('click', () => this.handleAddCategory());
    }
  }

  async handleAddCategory() {
    try {
      const name = await window.MessageBox.showPrompt("Enter the name of your new category.", {
        title: "Add Category",
        placeholder: "Category name...",
        validator: (value) => {
          if (!value || value.trim().length === 0) {
            return "Category name cannot be empty";
          }
          if (value.length > 100) {
            return "Category name is too long (max 100 characters)";
          }
          return true;
        }
      });
      
      await window.categoryManager.addCategory(name);
      this.render();
    } catch (error) {
      console.log("Add category cancelled or failed:", error);
    }
  }

  async handleDeleteCategory(category_id) {
    window.MessageBox.showConfirm("Are you sure? This action cannot be undone.", async ()=>{
       await window.categoryManager.deleteCategory(category_id, () => {
        this.render();
      });
     });
    
  }

  async handleEditCategory(category_id) {
    if (window.navigation) {
        // navigate to editor page
        const category = window.categoryManager.getCategoryById(category_id);
        window.categoryManager.setCurrentCategory(category);
        window.navigation.navigateTo('editor', true);
    }
  }

  render() {
    if (!this.gridElement) return;

    window.categoryManager.renderCategories(
      this.gridElement,
      (category_id) => this.handleEditCategory(category_id),
      (category_id) => this.handleDeleteCategory(category_id)
    );
  }

  show() {
    this.render();
  }

  onShow() {
    this.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.categoriesPage = new CategoriesPage();
  window.categoriesPage.init();
  window.TerminalManager.initializeTerminal();
});