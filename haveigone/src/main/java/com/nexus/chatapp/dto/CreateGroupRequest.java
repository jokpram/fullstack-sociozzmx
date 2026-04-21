package com.nexus.chatapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateGroupRequest {
    private String name;
    private String creatorUsername;
    private List<String> memberUsernames;
}
