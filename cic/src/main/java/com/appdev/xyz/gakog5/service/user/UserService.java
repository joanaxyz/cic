package com.appdev.xyz.gakog5.service.user;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appdev.xyz.gakog5.dto.auth.response.UserResponse;
import com.appdev.xyz.gakog5.entity.user.Admin;
import com.appdev.xyz.gakog5.entity.user.Student;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.entity.user.UserRole;
import com.appdev.xyz.gakog5.repository.user.AdminRepository;
import com.appdev.xyz.gakog5.repository.user.StudentRepository;
import com.appdev.xyz.gakog5.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    
    @Transactional
    public List<User> findAllUsers(){
        return userRepository.findAll();
    }

    @Transactional
    public UserResponse convertToUserResponse (User user){
        UserResponse res = UserResponse.builder()
            .id(user.getId())
            .name(user.getFirstName() + " " + user.getLastName())
            .email(user.getEmail())
            .role(user.getRole())
            .lastLogin(user.getLastlogin())
            .lastLogout(user.getLastLogout())
            .joinedAt(user.getCreatedAt())
            .banned(user.isBanned())
            .build();
        return res;
    }

    @Transactional
    public List<UserResponse> convertAllToUserResponse (List<User> users){
        List<UserResponse> res = new ArrayList<>();
        users.forEach(user->{
            res.add(convertToUserResponse(user));
        });
        return res;
    }

    @Transactional
    public User banUser(Long id){
        User user = findUserById(id);
        user.setBanned(true);
        return userRepository.save(user);
    }

    @Transactional
    public User unbanUser(Long id){
        User user = findUserById(id);
        user.setBanned(false);
        return userRepository.save(user);
    }

    @Transactional
    public User promoteToAdmin(Long id){
        User user = findUserById(id);
        user.setRole(UserRole.ADMIN);
        Optional<Admin> adminOpt = adminRepository.findByUser(user);
        
        if(adminOpt.isPresent()){
            return userRepository.save(user);
        }

        adminRepository.save(
                Admin.builder() // creates new admin
                .user(user)
                .build()
            );
        return userRepository.save(user);
    }

    @Transactional
    public User demoteToStudent(Long id){
        User user = findUserById(id);
        user.setRole(UserRole.STUDENT);
        Optional<Student> studentOpt = studentRepository.findByUser(user);
        if(studentOpt.isPresent()){
            return userRepository.save(user);
        }
        studentRepository.save(
                Student.builder() // creates new student
                .user(user)
                .build()
            );
        return userRepository.save(user);
    }

    @Transactional
    public void updateLastLogout(User user){
        user.udpateLastLogout();
        userRepository.save(user);
    }

    @Transactional
    public void updateLastLogin(User user){
        user.updateLastLogin();
        userRepository.save(user);
    }
    
    @Transactional
    public User findUserById(Long id){
        return userRepository.findById(id).
            orElseThrow(()-> new IllegalArgumentException("User with this id does not exist"));
    }

    @Transactional
    public User findUserByEmail(String email){
        return userRepository.findByEmail(email)
            .orElseThrow(()-> new IllegalArgumentException("User with this email does not exist"));
    }
}
