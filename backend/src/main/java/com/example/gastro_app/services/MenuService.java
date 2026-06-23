package com.example.gastro_app.services;

import com.example.gastro_app.dtos.request.CustomerOrderRequestDto;
import com.example.gastro_app.dtos.response.CustomerOrderResponseDto;
import com.example.gastro_app.dtos.response.MenuResponseDto;

public interface MenuService {
    MenuResponseDto getMenu(Integer tableNumber);
    CustomerOrderResponseDto placeOrder(Integer tableNumber, CustomerOrderRequestDto req);
}
