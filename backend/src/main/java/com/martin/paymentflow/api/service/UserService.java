package com.martin.paymentflow.api.service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.martin.paymentflow.api.dto.UpdateUserRequest;
import com.martin.paymentflow.api.dto.UserResponse;
import com.martin.paymentflow.api.dto.UserSummaryResponse;
import com.martin.paymentflow.api.entity.User;
import com.martin.paymentflow.api.exception.ResourceNotFoundException;
import com.martin.paymentflow.api.repository.UserRepository;

@Service
public class UserService {

    private static final int DEFAULT_PICKER_LIMIT = 10;

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserSummaryResponse> searchUsers(String query) {
        List<User> users;

        if (query == null || query.trim().isEmpty()) {
            users = userRepository.findUsersForPicker(PageRequest.of(0, DEFAULT_PICKER_LIMIT));
        } else {
            users = userRepository.searchUsers(query.trim(), PageRequest.of(0, DEFAULT_PICKER_LIMIT));
        }

        return users.stream()
                .map(this::mapToSummary)
                .toList();
    }

    private UserSummaryResponse mapToSummary(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail()
        );
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getFullName(),
                user.getEmail(),
                user.getBalance(),
                user.isAdmin(),
                user.isDeactivated(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        return mapToUserResponse(user);
    }

    public List<UserResponse> getUsersForAdmin(boolean includeDeactivated) {
        return userRepository.findManageableUsers(includeDeactivated).stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (user.isAdmin()) {
            throw new IllegalArgumentException("Admin users cannot be edited through this endpoint.");
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    public UserResponse deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (user.isAdmin()) {
            throw new IllegalArgumentException("Admin users cannot be deactivated through this endpoint.");
        }

        user.setDeactivated(true);

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    public UserResponse reactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (user.isAdmin()) {
            throw new IllegalArgumentException("Admin users cannot be reactivated through this endpoint.");
        }

        user.setDeactivated(false);

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }
}