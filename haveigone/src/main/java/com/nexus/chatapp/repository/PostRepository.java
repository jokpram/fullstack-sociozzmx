package com.nexus.chatapp.repository;

import com.nexus.chatapp.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // Fetch all posts ordered by newest first
    List<Post> findAllByOrderByCreatedAtDesc();

    // Fetch posts only by followed users
    @Query("SELECT p FROM Post p WHERE p.author.id IN (SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId) OR p.author.id = :userId ORDER BY p.createdAt DESC")
    List<Post> findFeedForUser(@Param("userId") Long userId);

    List<Post> findByAuthorUsernameOrderByCreatedAtDesc(String username);
    long countByAuthor(com.nexus.chatapp.model.User author);
}
