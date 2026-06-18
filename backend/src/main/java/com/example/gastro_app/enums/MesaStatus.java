package com.example.gastro_app.enums;

public enum MesaStatus {
    LIBRE("Libre"),
    ESPERANDO_PEDIDO("Esperando pedido"),
    EN_PREPARACION("En preparación"),
    LISTA("Lista para entregar"),
    PARA_COBRAR("Para cobrar");

    private final String label;
    MesaStatus(String label) { this.label = label; }
    public String getLabel() { return label; }
}
