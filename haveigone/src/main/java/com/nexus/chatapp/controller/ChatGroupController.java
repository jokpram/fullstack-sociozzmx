package com.nexus.chatapp.controller;

import com.nexus.chatapp.dto.CreateGroupRequest;
import com.nexus.chatapp.model.ChatGroup;
import com.nexus.chatapp.model.ChatGroupMember;
import com.nexus.chatapp.service.ChatGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class ChatGroupController {

    private final ChatGroupService chatGroupService;

    @PostMapping
    public ResponseEntity<ChatGroup> createGroup(@RequestBody CreateGroupRequest request) {
        try {
            ChatGroup group = chatGroupService.createGroup(request.getName(), request.getCreatorUsername(), request.getMemberUsernames());
            return ResponseEntity.ok(group);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<ChatGroup>> getUserGroups(@PathVariable String username) {
        return ResponseEntity.ok(chatGroupService.getUserGroups(username));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<ChatGroupMember>> getGroupMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(chatGroupService.getGroupMembers(groupId));
    }
}
