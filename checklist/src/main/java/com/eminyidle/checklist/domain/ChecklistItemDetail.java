package com.eminyidle.checklist.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChecklistItemDetail extends ChecklistItem{
    private Boolean isPublic;

    private String placeName;

    public ChecklistItemDetail(String tourId, String placeId, String activity, Integer tourDay, String item, Boolean isChecked, Boolean isPublic) {
        super(tourId, placeId, activity, tourDay, item, isChecked);
        setIsPublic(isPublic);
    }
    public ChecklistItemDetail(String tourId, String placeId, String activity, Integer tourDay, String item, Boolean isChecked, Boolean isPublic, String placeName) {
        super(tourId, placeId, activity, tourDay, item, isChecked);
        setIsPublic(isPublic);
        setPlaceName(placeName);
    }
}
