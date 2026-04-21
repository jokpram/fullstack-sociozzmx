package com.nexus.chatapp.controller;

import com.nexus.chatapp.model.Story;
import com.nexus.chatapp.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;

    @PostMapping
    public ResponseEntity<Story> createStory(@RequestBody Map<String, String> payload) {
        // Expected payload: { "username": "...", "content": "...", "mediaUrl": "(optional)" }
        String username = payload.get("username");
        String content = payload.get("content");
        String mediaUrl = payload.get("mediaUrl");

        Story story = storyService.createStory(username, content, mediaUrl);
        return ResponseEntity.ok(story);
    }

    @GetMapping
    public ResponseEntity<List<Story>> getActiveStories() {
        return ResponseEntity.ok(storyService.getActiveStories());
    }
}
