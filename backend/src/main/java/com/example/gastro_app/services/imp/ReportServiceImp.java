package com.example.gastro_app.services.imp;

import com.example.gastro_app.dtos.response.*;
import com.example.gastro_app.repositories.ReportRepository;
import com.example.gastro_app.services.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImp implements ReportService {
    private final ReportRepository repo;

    private static final Map<String, String> METHOD_LABELS = Map.of(
            "EFECTIVO",      "Efectivo",
            "DEBITO",        "Débito",
            "CREDITO",       "Crédito",
            "TRANSFERENCIA", "Transferencia",
            "MERCADO_PAGO",  "Mercado Pago"
    );

    @Override
    public ReportSummaryDto getSummary(LocalDate from, LocalDate to) {
        LocalDateTime f = from.atStartOfDay();
        LocalDateTime t = to.atTime(LocalTime.MAX);

        List<Object[]> summaryRows = repo.findSummaryStats(f, t);
        Object[] row = summaryRows.isEmpty()
                ? new Object[]{BigDecimal.ZERO, 0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO}
                : summaryRows.get(0);

        List<Object[]> methods = repo.findByPaymentMethod(f, t);
        String topMethod = methods.isEmpty() ? null : (String) methods.get(0)[0];

        return ReportSummaryDto.builder()
                .totalRevenue(bd(row[0]))
                .totalPayments(lng(row[1]).intValue())
                .avgTicket(bd(row[2]))
                .totalDiscount(bd(row[3]))
                .totalSurcharge(bd(row[4]))
                .topPaymentMethod(topMethod)
                .topPaymentMethodLabel(topMethod != null
                        ? METHOD_LABELS.getOrDefault(topMethod, topMethod) : null)
                .build();
    }

    @Override
    public List<PaymentMethodSummaryDto> getByPaymentMethod(LocalDate from, LocalDate to) {
        List<Object[]> rows = repo.findByPaymentMethod(from.atStartOfDay(), to.atTime(LocalTime.MAX));
        BigDecimal grandTotal = rows.stream().map(r -> bd(r[2])).reduce(BigDecimal.ZERO, BigDecimal::add);

        return rows.stream().map(row -> {
            String     method = (String) row[0];
            BigDecimal amount = bd(row[2]);
            double pct = grandTotal.compareTo(BigDecimal.ZERO) == 0 ? 0
                    : amount.multiply(BigDecimal.valueOf(100))
                    .divide(grandTotal, 1, RoundingMode.HALF_UP)
                    .doubleValue();
            return PaymentMethodSummaryDto.builder()
                    .method(method)
                    .methodLabel(METHOD_LABELS.getOrDefault(method, method))
                    .count(lng(row[1]).intValue())
                    .amount(amount)
                    .percentage(pct)
                    .build();
        }).toList();
    }

    @Override
    public List<DailyRevenueDto> getDailyRevenue(LocalDate from, LocalDate to) {
        List<Object[]> rows = repo.findDailyRevenue(from.atStartOfDay(), to.atTime(LocalTime.MAX));

        Map<String, DailyRevenueDto> map = rows.stream().collect(Collectors.toMap(
                r -> (String) r[0],
                r -> DailyRevenueDto.builder()
                        .date((String) r[0])
                        .count(lng(r[1]).intValue())
                        .amount(bd(r[2]))
                        .build()
        ));

        // Rellenar días sin ventas con cero para que el gráfico sea continuo
        List<DailyRevenueDto> result = new ArrayList<>();
        LocalDate current = from;
        while (!current.isAfter(to)) {
            String key = current.toString();
            result.add(map.getOrDefault(key, DailyRevenueDto.builder()
                    .date(key).count(0).amount(BigDecimal.ZERO).build()));
            current = current.plusDays(1);
        }
        return result;
    }

    @Override
    public List<HourlySalesDto> getHourlySales(LocalDate from, LocalDate to) {
        List<Object[]> rows = repo.findHourlySales(from.atStartOfDay(), to.atTime(LocalTime.MAX));

        Map<Integer, HourlySalesDto> map = rows.stream().collect(Collectors.toMap(
                r -> toInt(r[0]),
                r -> HourlySalesDto.builder()
                        .hour(toInt(r[0]))
                        .label(toInt(r[0]) + "hs")
                        .count(lng(r[1]).intValue())
                        .amount(bd(r[2]))
                        .build()
        ));

        List<HourlySalesDto> result = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            result.add(map.getOrDefault(h, HourlySalesDto.builder()
                    .hour(h).label(h + "hs").count(0).amount(BigDecimal.ZERO).build()));
        }
        return result;
    }

    @Override
    public List<TopProductDto> getTopProducts(LocalDate from, LocalDate to, int limit) {
        return repo.findTopProducts(from.atStartOfDay(), to.atTime(LocalTime.MAX), limit)
                .stream().map(r -> TopProductDto.builder()
                        .productName((String) r[0])
                        .totalQuantity(toInt(r[1]))
                        .totalRevenue(bd(r[2]))
                        .build())
                .toList();
    }

    // ── Conversores de Object[] nativo → tipos Java ───────────────────
    private BigDecimal bd(Object v) {
        if (v == null) return BigDecimal.ZERO;
        if (v instanceof BigDecimal b) return b;
        if (v instanceof Double     d) {
            if (d.isNaN() || d.isInfinite()) return BigDecimal.ZERO;
            return BigDecimal.valueOf(d);
        }
        if (v instanceof Float      f) return BigDecimal.valueOf(f.doubleValue());
        if (v instanceof Long       l) return BigDecimal.valueOf(l);
        if (v instanceof Integer    i) return BigDecimal.valueOf(i);
        if (v instanceof Number     n) return BigDecimal.valueOf(n.doubleValue());
        try {
            return new BigDecimal(v.toString().trim());
        } catch (NumberFormatException e) {
            log.warn("bd() no pudo parsear '{}' ({})", v, v.getClass().getSimpleName());
            return BigDecimal.ZERO;
        }
    }

    private Long lng(Object v) {
        if (v == null) return 0L;
        if (v instanceof Long       l) return l;
        if (v instanceof Integer    i) return i.longValue();
        if (v instanceof BigDecimal b) return b.longValue();
        if (v instanceof Number     n) return n.longValue();
        try {
            return Long.parseLong(v.toString().trim());
        } catch (NumberFormatException e) {
            log.warn("lng() no pudo parsear '{}' ({})", v, v.getClass().getSimpleName());
            return 0L;
        }
    }

    private Integer toInt(Object v) {
        if (v == null) return 0;
        if (v instanceof Integer    i) return i;
        if (v instanceof Long       l) return l.intValue();
        if (v instanceof Double     d) return d.intValue();
        if (v instanceof BigDecimal b) return b.intValue();
        if (v instanceof Number     n) return n.intValue();
        try {
            return Integer.parseInt(v.toString().trim());
        } catch (NumberFormatException e) {
            log.warn("toInt() no pudo parsear '{}' ({})", v, v.getClass().getSimpleName());
            return 0;
        }
    }
}
