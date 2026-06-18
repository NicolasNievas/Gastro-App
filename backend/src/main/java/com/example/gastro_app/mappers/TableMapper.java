package com.example.gastro_app.mappers;

import com.example.gastro_app.dtos.response.TableResponseDto;
import com.example.gastro_app.entities.TableEntity;
import org.springframework.stereotype.Component;

@Component
public class TableMapper {

    public TableResponseDto toDto(TableEntity e){
        return TableResponseDto.builder()
                .id(e.getId())
                .number(e.getNumber())
                .capacity(e.getCapacity())
                .state(e.getState())
                .stateLabel(e.getState().getLabel())
                .openedAt(e.getOpenedAt())
                .discount(e.getDiscount())
                .surcharge(e.getSurcharge())
                .build();
    }
}
