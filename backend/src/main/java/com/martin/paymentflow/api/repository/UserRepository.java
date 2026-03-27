package com.martin.paymentflow.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.martin.paymentflow.api.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query("""
        SELECT u
        FROM User u
        WHERE u.isAdmin = false
        AND u.isDeactivated = false
        AND (
                LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :query, '%'))
        )
        ORDER BY u.firstName ASC, u.lastName ASC
    """)
    List<User> searchUsers(String query, Pageable pageable);

    @Query("""
        SELECT u
        FROM User u
        WHERE u.isAdmin = false
        AND u.isDeactivated = false
        ORDER BY u.firstName ASC, u.lastName ASC
    """)
    List<User> findUsersForPicker(Pageable pageable);

        @Query("""
        SELECT u
        FROM User u
        WHERE u.isAdmin = false
        AND (:includeDeactivated = true OR u.isDeactivated = false)
        ORDER BY u.firstName ASC, u.lastName ASC
    """)
    List<User> findManageableUsers(boolean includeDeactivated);

}