package com.eminyidle.place.place.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class KafkaPlaceInfo {
    private String tourId;
    private String placeId;
    private String placeName;
    private Integer tourDay;
    private String tourPlaceId;
}
