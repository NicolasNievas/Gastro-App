package com.example.gastro_app.enums;

public enum SectorOrderStatus {
    PENDIENTE("Pendiente"),
    EN_PREPARACION("En preparación"),
    LISTO("Listo"),
    ENTREGADO("Entregado");

    private final String label;
    SectorOrderStatus(String label) { this.label = label; }
    public String getLabel() { return label; }
}
