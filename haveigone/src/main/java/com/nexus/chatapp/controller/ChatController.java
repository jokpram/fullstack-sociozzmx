package com.nexus.chatapp.controller;

import com.nexus.chatapp.model.ChatMessage;
import com.nexus.chatapp.model.ChatGroupMember;
import com.nexus.chatapp.model.SignalingMessage;
import com.nexus.chatapp.service.ChatService;
import com.nexus.chatapp.service.ChatGroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@Slf4j
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final ChatGroupService chatGroupService;

    @GetMapping("/history/{senderId}/{recipientId}")
    public List<ChatMessage> getChatHistory(@PathVariable String senderId, @PathVariable String recipientId) {
        return chatService.getChatHistory(senderId, recipientId);
    }

    @GetMapping("/history/group/{groupId}")
    public List<ChatMessage> getGroupChatHistory(@PathVariable Long groupId) {
        return chatService.getGroupChatHistory(groupId);
    }

    @GetMapping("/history/global")
    public List<ChatMessage> getGlobalChatHistory() {
        return chatService.getGlobalChatHistory();
    }

    @MessageMapping("/chat.sendMessage")
    @org.springframework.transaction.annotation.Transactional
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // Save the message to DB and forward it to recipient destination
        ChatMessage savedMsg = chatService.saveMessage(chatMessage);
        
        if (chatMessage.getGroupId() != null) {
            // Group Message
            List<ChatGroupMember> members = chatGroupService.getGroupMembers(chatMessage.getGroupId());
            for (ChatGroupMember member : members) {
                // To avoid sending it back to the sender if they shouldn't see it this way, we still send so UI updates
                messagingTemplate.convertAndSendToUser(
                        member.getUser().getUsername(), "/queue/messages",
                        savedMsg
                );
            }
        } else {
            // Direct Message
            messagingTemplate.convertAndSendToUser(
                    chatMessage.getRecipientId(), "/queue/messages",
                    savedMsg
            );
            
            // Also push it back to the sender's own queue so they see it delivered
            messagingTemplate.convertAndSendToUser(
                    chatMessage.getSenderId(), "/queue/messages",
                    savedMsg
            );
        }
    }

    @MessageMapping("/chat.publicMessage")
    @SendTo("/topic/public")
    public ChatMessage sendPublicMessage(@Payload ChatMessage chatMessage) {
        // Handle global group chat
        return chatService.saveMessage(chatMessage);
    }

    // WebRTC Signaling Controller Endpoint
    @MessageMapping("/webrtc.signal")
    public void processSignalingMessage(@Payload SignalingMessage message) {
        log.info("Signaling message from {} to {} type {}", message.getSender(), message.getRecipient(), message.getType());
        
        // Forward WebRTC signals (Offers, Answers, Candidates) directly to the recipient
        // No need to persist these in the database
        messagingTemplate.convertAndSendToUser(
                message.getRecipient(), "/queue/webrtc",
                message
        );
    }
}
