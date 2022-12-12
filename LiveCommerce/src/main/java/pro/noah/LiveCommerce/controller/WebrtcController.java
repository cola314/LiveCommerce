package pro.noah.LiveCommerce.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.*;
import org.kurento.jsonrpc.JsonUtils;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import pro.noah.LiveCommerce.dto.WebrtcDto;

import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RequiredArgsConstructor
@Controller
public class WebrtcController {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final KurentoClient kurentoClient;
    private final ConcurrentHashMap<String, WebRtcEndpoint> viewers = new ConcurrentHashMap<>();
    private MediaPipeline pipeline;
    private String presenterId;
    private WebRtcEndpoint presenterWebRtc;

    @MessageMapping("/webrtc/presenter")
    public void presenter(
        WebrtcDto.PresenterDto dto
    ) {
        if (presenterId == null || true) {
            presenterId = dto.getUserId();

            pipeline = kurentoClient.createMediaPipeline();
            presenterWebRtc = new WebRtcEndpoint.Builder(pipeline).build();
            presenterWebRtc.addIceCandidateFoundListener(event -> {
                try {
                    String candidate = JsonUtils.toJson(event.getCandidate());
                    WebrtcDto.CandidateResponseDto candidateResponseDto = WebrtcDto.CandidateResponseDto.builder()
                            .candidate(candidate)
                            .build();
                    simpMessagingTemplate.convertAndSend("/topic/webrtc/candidate/" + dto.getUserId(), candidateResponseDto);
                }
                catch (Exception e) {
                    log.error("error on ice candidate found", e);
                }
            });

            String answer = presenterWebRtc.processOffer(dto.getOffer());
            WebrtcDto.PresenterResponse presenterResponse = WebrtcDto.PresenterResponse.builder()
                    .answer(answer)
                    .build();
            simpMessagingTemplate.convertAndSend("/topic/webrtc/answer/" + dto.getUserId(), presenterResponse);

            presenterWebRtc.gatherCandidates();
        }
        else {
            log.info("presenter rejected");
        }
    }

    @MessageMapping("/webrtc/viewer")
    public void viewer(
        @Payload WebrtcDto.ViewerDto dto
    ) {
        WebRtcEndpoint webRtcEndpoint = new WebRtcEndpoint.Builder(pipeline).build();
        viewers.put(dto.getUserId(), webRtcEndpoint);
        webRtcEndpoint.addIceCandidateFoundListener(event -> {
            try {
                String candidate = JsonUtils.toJson(event.getCandidate());
                WebrtcDto.CandidateResponseDto candidateResponseDto = WebrtcDto.CandidateResponseDto.builder()
                        .candidate(candidate)
                        .build();
                simpMessagingTemplate.convertAndSend("/topic/webrtc/candidate/" + dto.getUserId(), candidateResponseDto);
            }
            catch (Exception e) {
                log.error("error on ice candidate found", e);
            }
        });

        presenterWebRtc.connect(webRtcEndpoint);
        String answer = webRtcEndpoint.processOffer(dto.getOffer());
        WebrtcDto.ViewerResponse viewerResponse = WebrtcDto.ViewerResponse.builder()
                .answer(answer)
                .build();

        simpMessagingTemplate.convertAndSend("/topic/webrtc/answer/" + dto.getUserId(), viewerResponse);
        webRtcEndpoint.gatherCandidates();
    }

    @MessageMapping("/webrtc/onIceCandidate/{userId}")
    public void onIceCandidate(
        @DestinationVariable String userId,
        @Payload WebrtcDto.CandidateRequestDto dto
    ) {
        WebRtcEndpoint webRtcEndpoint;
        if (Objects.equals(presenterId, userId)) {
            webRtcEndpoint = presenterWebRtc;
        } else {
            webRtcEndpoint = viewers.get(userId);
        }
        webRtcEndpoint.addIceCandidate(new IceCandidate(dto.getCandidate(), dto.getSdpMid(), dto.getSdpMLineIndex()));
    }

    @MessageMapping("/webrtc/stop")
    public void stop() {

    }
}
