package com.nexus.chatapp.service;

import com.nexus.chatapp.model.ChatMessage;
import com.nexus.chatapp.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository repository;

    public ChatMessage saveMessage(ChatMessage message) {
        return repository.save(message);
    }

    public List<ChatMessage> getChatHistory(String senderId, String recipientId) {
        return repository.findChatHistory(senderId, recipientId);
    }

    public List<ChatMessage> getGlobalChatHistory() {
        return repository.findGlobalChatHistory();
    }

    public List<ChatMessage> getGroupChatHistory(Long groupId) {
        return repository.findByGroupIdOrderByTimestampAsc(groupId);
    }
}
