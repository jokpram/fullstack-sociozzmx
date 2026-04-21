package com.nexus.chatapp.config;

import com.nexus.chatapp.model.ChatMessage;
import com.nexus.chatapp.model.MessageType;
import com.nexus.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final UserService userService;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        // When user disconnects, we need to update their status in the DB
        // and notify others that they are offline
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        
        if (username != null) {
            log.info("User disconnected: {}", username);
            
            userService.disconnectBySessionId(sessionId);
            
            var leaveMessage = ChatMessage.builder()
                    .type(MessageType.LEAVE)
                    .senderId(username)
                    .timestamp(LocalDateTime.now())
                    .build();
            
            messagingTemplate.convertAndSend("/topic/public", leaveMessage);
        } else {
            // Unauthenticated connection cleanup
            userService.disconnectBySessionId(sessionId);
        }
    }
}
