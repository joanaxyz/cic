package com.appdev.xyz.gakog5.repository.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appdev.xyz.gakog5.entity.user.Student;
import com.appdev.xyz.gakog5.entity.user.User;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long>{
    Optional<Student> findByUser(User user);
}