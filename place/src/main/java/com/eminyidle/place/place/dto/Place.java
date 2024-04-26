package com.eminyidle.place.place.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Place {
    // Google Place API에서 바로 받아오는 부분
//    private String placeId;
//    private String placeName;
//    private List<String> placePhotoList;
    private String id;
    private List<String> types;
    private List<AddressComponent> addressComponents;
    private String googleMapsUri;
    private DisplayName displayName;
    private String primaryType;
    //    private List<Photo> photos;
    private List<Photo> photos;


    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AddressComponent { // 도로명주소에 대한 정보
        private String longText;
        private String shortText;
        private List<String> types;
        private String languageCode;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DisplayName { // 장소 이름
        private String text;
        private String languageCode;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Photo {   // 사진 - 업로드 한 사람 정보는 빼고 가져옴
        private String name;
        private int widthPx;
        private int heightPx;
    }
}






