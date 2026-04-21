package com.nexus.chatapp.dto;

import com.nexus.chatapp.model.Post;
import com.nexus.chatapp.model.Story;
import com.nexus.chatapp.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private User user;
    private long followersCount;
    private long followingCount;
    private long postsCount;
    private List<Post> posts;
    private List<Story> activeStories;
}
