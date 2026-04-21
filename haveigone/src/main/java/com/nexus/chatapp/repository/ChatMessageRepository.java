package com.nexus.chatapp.repository;

import com.nexus.chatapp.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    @Query("SELECT m FROM ChatMessage m WHERE (m.senderId = :user1 AND m.recipientId = :user2) OR (m.senderId = :user2 AND m.recipientId = :user1) ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("user1") String user1, @Param("user2") String user2);

    @Query("SELECT m FROM ChatMessage m WHERE m.recipientId IS NULL AND m.groupId IS NULL ORDER BY m.timestamp ASC")
    List<ChatMessage> findGlobalChatHistory();

    List<ChatMessage> findByGroupIdOrderByTimestampAsc(Long groupId);
}
