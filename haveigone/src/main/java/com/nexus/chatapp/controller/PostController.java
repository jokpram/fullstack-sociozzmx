package com.nexus.chatapp.controller;

import com.nexus.chatapp.model.Post;
import com.nexus.chatapp.service.PostService;
import com.nexus.chatapp.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final BookmarkService bookmarkService;

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Map<String, String> payload) {
        // Expected payload: { "username": "...", "content": "...", "imageUrl": "(optional)" }
        String username = payload.get("username");
        String content = payload.get("content");
        String imageUrl = payload.get("imageUrl");
        
        Post post = postService.createPost(username, content, imageUrl);
        return ResponseEntity.ok(post);
    }

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/feed/{username}")
    public ResponseEntity<List<Post>> getFeed(@PathVariable String username) {
        return ResponseEntity.ok(postService.getFeedForUser(username));
    }

    @PostMapping("/{postId}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long postId, @RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        if (username == null) {
            return ResponseEntity.badRequest().body("Username is required");
        }
        boolean isBookmarked = bookmarkService.toggleBookmark(username, postId);
        return ResponseEntity.ok(Map.of("bookmarked", isBookmarked));
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<List<Post>> getBookmarks(@RequestParam String username) {
        return ResponseEntity.ok(bookmarkService.getBookmarkedPosts(username));
    }
}
