package com.zipflow.zipflowserver.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@RequiredArgsConstructor
public enum RoleEnum {
    USER(Collections.emptySet()),
    ADMIN(Set.of(
            PermissionEnum.ADMIN_READ,
            PermissionEnum.ADMIN_UPDATE,
            PermissionEnum.ADMIN_DELETE,
            PermissionEnum.ADMIN_CREATE,
            PermissionEnum.MANAGER_READ
    )),
    MANAGER(Set.of(
            PermissionEnum.MANAGER_READ,
            PermissionEnum.MANAGER_UPDATE,
            PermissionEnum.MANAGER_DELETE,
            PermissionEnum.MANAGER_CREATE
    ));

    private final Set<PermissionEnum> permissions;

    public List<SimpleGrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = getPermissions().stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getPermission()))
                .collect(Collectors.toList());
        authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name()));
        return authorities;
    }
}
