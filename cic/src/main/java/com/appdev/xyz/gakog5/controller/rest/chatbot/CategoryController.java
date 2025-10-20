package com.appdev.xyz.gakog5.controller.rest.chatbot;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appdev.xyz.gakog5.annotation.RequireAdminAuth;
import com.appdev.xyz.gakog5.annotation.RequireAuth;
import com.appdev.xyz.gakog5.dto.auth.request.IdRequest;
import com.appdev.xyz.gakog5.dto.auth.response.ApiResponse;
import com.appdev.xyz.gakog5.dto.chatbot.CategoryRequest;
import com.appdev.xyz.gakog5.entity.chatbot.Category;
import com.appdev.xyz.gakog5.entity.user.Admin;
import com.appdev.xyz.gakog5.service.chatbot.CategoryService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.*;

import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@Getter
@Setter
@RequiredArgsConstructor
@RequestMapping("/api/category")
public class CategoryController {
    private final CategoryService categoryService;

    @RequireAuth
    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse> getAllCategories() {
        try{
            List<Category> cat = categoryService.findALlCategories();
            return ResponseEntity.ok(new ApiResponse("Categories fetched successfully", 
            categoryService.convertAllToCategoryResponse(cat)));
        }catch(DataAccessException e){
            return ResponseEntity.internalServerError()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAdminAuth
    @PostMapping("/add")
    public ResponseEntity<?> addCategory(@RequestBody CategoryRequest req, HttpServletRequest request) {
        Admin admin = (Admin) request.getAttribute("currentAdmin");
        try{
            Category category = categoryService.addCategory(req.getName(), admin);
            return ResponseEntity.ok(new ApiResponse("Category added successfully", categoryService.convertToCategoryResponse(category)));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAdminAuth
    @PostMapping("/delete")
    public ResponseEntity<?> deleteCategory(@RequestBody IdRequest req) {
        try{
            Category category = categoryService.deleteCategory(req.getId());
            return ResponseEntity.ok(new ApiResponse("Category deleted successfully", category));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }
    
    @RequireAdminAuth
    @PostMapping("/update")
    public ResponseEntity<?> updateCategory(@RequestBody CategoryRequest req, HttpServletRequest request) {
        Admin admin = (Admin) request.getAttribute(("currentAdmin"));
        try{
            Category category = categoryService.updateCategory(req.getName(), req.getContent(), req.getPresets(), req.getId(), admin);
            return ResponseEntity.ok(new ApiResponse("Category updated successfully", category));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

}
