package com.appdev.xyz.gakog5.repository.chatbot;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appdev.xyz.gakog5.entity.chatbot.Chat;
import com.appdev.xyz.gakog5.entity.chatbot.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long>{
    List<Message> findByChat(Chat chat);
}
