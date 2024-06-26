package com.eminyidle.user.adapter.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserInfo {
    private String userId;
    private String userName;
    private String userNickname;
}
