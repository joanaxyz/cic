package com.appdev.xyz.gakog5.service.user;



import org.springframework.stereotype.Service;

import com.appdev.xyz.gakog5.entity.user.Student;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.repository.user.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    
    public Student findStudentById(Long id){
        return studentRepository.findById(id).
            orElseThrow(()-> new IllegalArgumentException("Student with this id does not exist"));
    }

    public Student findStudentByUser(User user){
        return studentRepository.findByUser(user).
            orElseThrow(()-> new IllegalArgumentException("Student with this user id foreign key does not exist"));
    }
}
