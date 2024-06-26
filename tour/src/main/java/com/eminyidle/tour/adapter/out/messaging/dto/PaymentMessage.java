package com.eminyidle.tour.adapter.out.messaging.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
public class PaymentMessage {
    private String tourId;

    private String ghostId;

    private String userId;
}
