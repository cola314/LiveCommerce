package pro.noah.LiveCommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class WebrtcDto {


    @AllArgsConstructor @Builder
    @Getter
    public static class PresenterDto {
        private String room;
        private String userId;
        private String offer;
    }

    @AllArgsConstructor @Builder
    @Getter
    public static class PresenterResponse {
        private String answer;
    }

    @AllArgsConstructor @Builder
    @Getter
    public static class ViewerDto {
        private String room;
        private String userId;
        private String offer;
    }

    @AllArgsConstructor @Builder
    @Getter
    public static class ViewerResponse {
        private String answer;
    }

    @AllArgsConstructor @Builder
    @Getter
    public static class CandidateResponseDto {
        private String candidate;
    }

    @AllArgsConstructor @Builder
    @Getter
    public static class CandidateRequestDto {
        private String candidate;
        private String sdpMid;
        private int sdpMLineIndex;
    }
}
