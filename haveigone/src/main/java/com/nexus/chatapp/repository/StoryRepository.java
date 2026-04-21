package com.nexus.chatapp.repository;

import com.nexus.chatapp.model.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {

    // Fetch active stories (expiresAt > now)
    @Query("SELECT s FROM Story s WHERE s.expiresAt > :now ORDER BY s.createdAt DESC")
    List<Story> findActiveStories(@Param("now") LocalDateTime now);

    @Query("SELECT s FROM Story s WHERE s.author.username = :username AND s.expiresAt > :now ORDER BY s.createdAt DESC")
    List<Story> findActiveStoriesByUsername(@Param("username") String username, @Param("now") LocalDateTime now);
}
