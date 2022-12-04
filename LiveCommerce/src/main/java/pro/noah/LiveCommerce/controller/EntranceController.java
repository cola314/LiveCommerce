package pro.noah.LiveCommerce.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Slf4j
public class EntranceController {

    @GetMapping("/enter")
    public String enter() {
        log.info("start enter");
        return "Enter the project";
    }
}
