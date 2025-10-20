package com.appdev.xyz.gakog5.service.chatbot;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appdev.xyz.gakog5.dto.chatbot.CategoryResponse;
import com.appdev.xyz.gakog5.entity.chatbot.Category;
import com.appdev.xyz.gakog5.entity.user.Admin;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.repository.chatbot.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponse convertToCategoryResponse(Category category){
        User createdBy = category.getCreatedBy().getUser();
        String updatedString = "";
        if(category.getUpdatedBy() != null){
            User updatedBy = category.getUpdatedBy().getUser();
            updatedString = String.format("%s %s", updatedBy.getFirstName(), updatedBy.getLastName());
        }

        return CategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .createdBy(String.format("%s %s", createdBy.getFirstName(), createdBy.getLastName()))
            .updatedBy(updatedString)
            .createdAt(category.getCreatedAt())
            .content(category.getContent())
            .presets(category.getPreset())
            .updatedAt(category.getUpdatedAt())
            .build();
    }

    @Transactional
    public List<CategoryResponse> convertAllToCategoryResponse(List<Category> categories){
        List<CategoryResponse> cats = new ArrayList<>();
        categories.forEach(cat->{
            CategoryResponse response = convertToCategoryResponse(cat);
            cats.add(response);
        });
        return cats;
    }

    @Transactional
    public List<Category> findALlCategories(){
        return categoryRepository.findAll();
    }

    @Transactional
    public Category addCategory(String name, Admin admin){
        Category category = Category.builder()
            .name(name)
            .createdBy(admin)
            .build();
        return categoryRepository.save(category);
    }
    
    @Transactional
    public Category deleteCategory(Long id){
        Category category = findCategoryById(id);
        categoryRepository.delete(category);
        return category;
    }

    @Transactional 
    public Category updateCategory(String name, String content, List<String> presets, Long id, Admin admin){
        Category category = findCategoryById(id);
        if(name != null) category.setName(name);
        if(content != null) category.setContent(content);
        if(presets != null) category.setPreset(presets);
        category.setUpdatedAt(LocalDateTime.now());
        category.setUpdatedBy(admin);
        return categoryRepository.save(category);
    }   

    public Category findCategoryById(Long id){
        return categoryRepository.findById(id)
            .orElseThrow(()->new IllegalArgumentException("Category with that id does not exist"));
    }

}
