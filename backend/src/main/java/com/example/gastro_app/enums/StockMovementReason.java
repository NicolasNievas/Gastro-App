package com.example.gastro_app.enums;

public enum StockMovementReason {
    SALE("Venta"),
    RESTOCK("Reposición"),
    MANUAL_ADJUSTMENT("Ajuste manual"),
    WASTE("Merma / descarte"),
    CANCELLED_ORDER("Pedido cancelado");

    private final String label;
    StockMovementReason(String label) { this.label = label; }
    public String getLabel() { return label; }
}
