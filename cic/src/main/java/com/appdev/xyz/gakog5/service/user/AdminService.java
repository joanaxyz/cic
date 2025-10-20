package com.appdev.xyz.gakog5.service.user;



import org.springframework.stereotype.Service;

import com.appdev.xyz.gakog5.entity.user.Admin;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.repository.user.AdminRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;
    
    public Admin findAdminById(Long id){
        return adminRepository.findById(id).
            orElseThrow(()-> new IllegalArgumentException("Admin with this id does not exist"));
    }

    public Admin findAdminByUser(User user){
        return adminRepository.findByUser(user).
            orElseThrow(()-> new IllegalArgumentException("Admin with this user id foreign key does not exist"));
    }
}
