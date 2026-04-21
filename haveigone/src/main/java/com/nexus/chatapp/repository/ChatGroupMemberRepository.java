package com.nexus.chatapp.repository;

import com.nexus.chatapp.model.ChatGroup;
import com.nexus.chatapp.model.ChatGroupMember;
import com.nexus.chatapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatGroupMemberRepository extends JpaRepository<ChatGroupMember, Long> {
    List<ChatGroupMember> findByGroupId(Long groupId);
    Optional<ChatGroupMember> findByGroupAndUser(ChatGroup group, User user);
    boolean existsByGroupIdAndUserUsername(Long groupId, String username);
}
