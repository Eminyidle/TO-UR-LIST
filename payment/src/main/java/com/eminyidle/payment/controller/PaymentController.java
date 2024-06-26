package com.eminyidle.payment.controller;

import com.eminyidle.payment.dto.CountryCurrency;
import com.eminyidle.payment.dto.ExchangeRate;
import com.eminyidle.payment.dto.req.PayIdReq;
import com.eminyidle.payment.dto.req.PaymentInfoReq;
import com.eminyidle.payment.dto.res.ExchangeRateRes;
import com.eminyidle.payment.dto.res.PaymentInfoRes;
import com.eminyidle.payment.exception.UserIdNotExistException;
import com.eminyidle.payment.dto.Message;
import com.eminyidle.payment.service.PaymentService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
@Validated
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final String HEADER_USER_ID = "userId";

    @Value("${KAFKA_PAYMENT_REQUEST_TOPIC}")
    String paymentTopicName;

    @GetMapping("/currency/{countryCode}/{date}")
    public ResponseEntity<?> getCountryCurrencyRate(@NotBlank @PathVariable("countryCode") String countryCode,
                                                    @NotBlank @PathVariable("date") String date) {

        log.debug(countryCode);
        log.debug(date);
        //날짜 파싱
        String parseDate = date.replace("-", "");

        ExchangeRate exchangeRate = paymentService.loadExchangeRate(countryCode, parseDate);
        CountryCurrency countryCurrency = paymentService.loadCountryCurrency(countryCode);

        return ResponseEntity.ok().body(
                ExchangeRateRes.builder()
                        .unit(countryCurrency.getCurrencySign())
                        .currencyRate(exchangeRate.getExchangeRate())
                        .currencyCode(countryCurrency.getCountryCurrencyId().getCurrencyCode())
                        .build()
        );
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@Valid @RequestBody PaymentInfoReq paymentInfoReq,
                                           @RequestHeader(value = HEADER_USER_ID, required = false) String userId) {

        log.debug(paymentInfoReq.toString());
        if (userId == null || userId.isEmpty()) {
            throw new UserIdNotExistException("유저 ID가 없습니다.");
        }

        String payId = paymentService.createPaymentInfo(paymentInfoReq, userId);
        // 저장 결과
        Map<String, String> responsePayment = new HashMap<>();
        responsePayment.put("payId", payId);
        return ResponseEntity.ok().body(responsePayment);
    }

    @PutMapping("/{payId}")
    public ResponseEntity<Void> updatePayment(@Valid @PathVariable("payId") String payId,
                                              @Valid @RequestBody PaymentInfoReq paymentInfoReq,
                                              @RequestHeader(value = HEADER_USER_ID, required = false) String userId) {

        log.debug(paymentInfoReq.toString());
        if (userId == null || userId.isEmpty()) {
            throw new UserIdNotExistException("유저 ID가 없습니다.");
        }

        paymentService.updatePaymentInfo(payId, paymentInfoReq, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{tourId}/{payId}")
    public ResponseEntity<Void> deletePayment(@Valid @PathVariable("tourId") String tourId,
                                              @Valid @PathVariable("payId") String payId,
                                              @Valid @RequestParam("payType") String payType,
                                              @RequestHeader(value = HEADER_USER_ID, required = false) String userId) {

        PayIdReq payIdReq = PayIdReq.builder()
                .tourId(tourId)
                .payType(payType)
                .build();

        log.debug(payId);
        if (userId == null || userId.isEmpty()) {
            throw new UserIdNotExistException("유저 ID가 없습니다.");
        }

        paymentService.deletePaymentInfo(payId, payIdReq, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{tourId}")
    public ResponseEntity<?> searchPaymentList(@Valid @PathVariable("tourId") String tourId,
                                               @RequestHeader(value = HEADER_USER_ID, required = false) String userId) {

        log.debug(tourId);
        if (userId == null || userId.isEmpty()) {
            throw new UserIdNotExistException("유저 ID가 없습니다.");
        }

        List<PaymentInfoRes> paymentInfoResList = paymentService.searchPaymentInfoList(tourId, userId);
        log.debug("리스트 사이즈: {}",paymentInfoResList.size());
        return ResponseEntity.ok().body(paymentInfoResList);
    }

    @GetMapping("/{tourId}/{payId}")
    public ResponseEntity<?> searchPaymentInfo(@Valid @PathVariable("tourId") String tourId,
                                               @Valid @PathVariable("payId") String payId,
                                               @Valid @RequestParam("payType") String payType,
                                               @RequestHeader(value = HEADER_USER_ID, required = false) String userId) {

        PayIdReq payIdReq = PayIdReq.builder()
                        .tourId(tourId)
                        .payType(payType)
                        .build();

        log.debug(payId);
        if (userId == null || userId.isEmpty()) {
            throw new UserIdNotExistException("유저 ID가 없습니다.");
        }

        PaymentInfoRes paymentInfoRes = paymentService.searchPaymentInfo(payId, payIdReq, userId);
        log.debug(paymentInfoRes.toString());
        return ResponseEntity.ok().body(paymentInfoRes);
    }

    // 고스트 유저 변경 요청
    @GetMapping("/ghost")
    public ResponseEntity<Void> updateGhost(@Valid @RequestBody Message message,
                                            @RequestHeader(value = HEADER_USER_ID, required = false) String userId) {

        log.debug(message.toString());
        if (userId == null || userId.isEmpty()) {
            throw new UserIdNotExistException("유저 ID가 없습니다.");
        }

        String key = message.getTourId();
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            kafkaTemplate.send(paymentTopicName, key, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize message", e);
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok().build();
    }
}
