package com.appdev.xyz.gakog5.repository.chatbot;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appdev.xyz.gakog5.entity.chatbot.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>{
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
}
