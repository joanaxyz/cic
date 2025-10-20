package com.appdev.xyz.gakog5.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appdev.xyz.gakog5.entity.user.Admin;
import com.appdev.xyz.gakog5.entity.user.User;

import java.util.Optional;



@Repository
public interface AdminRepository extends JpaRepository<Admin, Long>{
    Optional<Admin> findByUser(User user);
}
