package com.appdev.xyz.gakog5.dto.auth.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ApiResponse {
    private String message;
    private Object data;
    private Object data2;
    public ApiResponse(String message){
        this.message = message;
    }
    public ApiResponse(String message, Object data){
        this.message = message;
        this.data = data;
    }

    public ApiResponse(String message, Object data, Object data2){
        this.message = message;
        this.data = data;
        this.data2 = data2;
    }
}
