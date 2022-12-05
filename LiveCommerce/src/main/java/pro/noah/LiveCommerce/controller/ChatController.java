package pro.noah.LiveCommerce.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    @MessageMapping("chat")
    @SendTo("/topic/message")
    public String chat(String message) {
        log.info("get message : {}", message);
        return message;
    }

}
