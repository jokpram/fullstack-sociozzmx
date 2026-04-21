package com.nexus.chatapp.service;

import com.nexus.chatapp.model.Story;
import com.nexus.chatapp.model.User;
import com.nexus.chatapp.repository.StoryRepository;
import com.nexus.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository storyRepository;
    private final UserRepository userRepository;

    public Story createStory(String username, String content, String mediaUrl) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Story story = Story.builder()
                .author(author)
                .content(content)
                .mediaUrl(mediaUrl)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        return storyRepository.save(story);
    }

    public List<Story> getActiveStories() {
        return storyRepository.findActiveStories(LocalDateTime.now());
    }
}
