package com.nexus.chatapp.service;

import com.nexus.chatapp.model.ChatGroup;
import com.nexus.chatapp.model.ChatGroupMember;
import com.nexus.chatapp.model.User;
import com.nexus.chatapp.repository.ChatGroupMemberRepository;
import com.nexus.chatapp.repository.ChatGroupRepository;
import com.nexus.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatGroupService {

    private final ChatGroupRepository chatGroupRepository;
    private final ChatGroupMemberRepository chatGroupMemberRepository;
    private final UserRepository userRepository;

    public ChatGroup createGroup(String name, String creatorUsername, List<String> memberUsernames) {
        User creator = userRepository.findByUsername(creatorUsername)
                .orElseThrow(() -> new IllegalArgumentException("Creator not found"));

        ChatGroup group = ChatGroup.builder()
                .name(name)
                .creator(creator)
                .build();
        final ChatGroup finalGroup = chatGroupRepository.save(group);

        // Add creator
        chatGroupMemberRepository.save(ChatGroupMember.builder()
                .group(finalGroup)
                .user(creator)
                .build());

        // Add others
        for (String memberUsername : memberUsernames) {
            if (!memberUsername.equals(creatorUsername)) {
                userRepository.findByUsername(memberUsername).ifPresent(user -> {
                    chatGroupMemberRepository.save(ChatGroupMember.builder()
                            .group(finalGroup)
                            .user(user)
                            .build());
                });
            }
        }

        return group;
    }

    public List<ChatGroup> getUserGroups(String username) {
        return chatGroupRepository.findGroupsByUsername(username);
    }

    public List<ChatGroupMember> getGroupMembers(Long groupId) {
        return chatGroupMemberRepository.findByGroupId(groupId);
    }
}
