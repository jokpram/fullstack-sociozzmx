package com.nexus.chatapp.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalingMessage {
    private String type; // e.g. "offer", "answer", "candidate"
    
    private String sender;
    private String recipient;
    
    private String sdp;
    
    // For ICE candidates
    private String candidate;
    private Integer sdpMLineIndex;
    private String sdpMid;
}
