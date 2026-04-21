package com.nexus.chatapp.repository;

import com.nexus.chatapp.model.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {
    
    @Query("SELECT cgm.group FROM ChatGroupMember cgm WHERE cgm.user.username = :username")
    List<ChatGroup> findGroupsByUsername(@Param("username") String username);
}
