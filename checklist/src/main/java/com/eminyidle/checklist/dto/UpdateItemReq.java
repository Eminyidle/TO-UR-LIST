package com.eminyidle.checklist.dto;

import com.eminyidle.checklist.domain.ChecklistItem;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateItemReq {
    ChecklistItem oldItem;
    ChecklistItem newItem;
}
