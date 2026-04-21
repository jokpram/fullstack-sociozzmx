package com.nexus.chatapp.service;

import com.nexus.chatapp.model.Bookmark;
import com.nexus.chatapp.model.Post;
import com.nexus.chatapp.model.User;
import com.nexus.chatapp.repository.BookmarkRepository;
import com.nexus.chatapp.repository.PostRepository;
import com.nexus.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Transactional
    public boolean toggleBookmark(String username, Long postId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Optional<Bookmark> existingBookmark = bookmarkRepository.findByUserAndPost(user, post);
        if (existingBookmark.isPresent()) {
            bookmarkRepository.delete(existingBookmark.get());
            return false; // unbookmarked
        } else {
            Bookmark bookmark = new Bookmark(user, post);
            bookmarkRepository.save(bookmark);
            return true; // bookmarked
        }
    }

    public List<Post> getBookmarkedPosts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookmarkRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(Bookmark::getPost)
                .collect(Collectors.toList());
    }
}
