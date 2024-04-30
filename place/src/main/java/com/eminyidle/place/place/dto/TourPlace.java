package com.eminyidle.place.place.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.Id;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TourPlace {    // 장소 리스트 조회 시 반환할...

    private String placeId;
    private String placeName;
    private Integer tourDay;
    private List<TourActivity> tourActivityList;
}