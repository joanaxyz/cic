package com.appdev.xyz.gakog5.repository.chatbot;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appdev.xyz.gakog5.entity.chatbot.Chat;
import com.appdev.xyz.gakog5.entity.user.User;


@Repository
public interface ChatRepository extends JpaRepository<Chat, UUID>{
    List<Chat> findByUser(User user);
}
