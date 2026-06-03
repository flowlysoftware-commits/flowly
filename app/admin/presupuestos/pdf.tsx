import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export type BudgetItem = {
  name: string;
  description?: string;
  price: number;
  type: "Mensual" | "Único";
};

const styles = StyleSheet.create({
  page: { padding: 34, fontFamily: "Helvetica", color: "#111827", backgroundColor: "#ffffff" },
  hero: { backgroundColor: "#111827", color: "#ffffff", padding: 26, borderRadius: 18, marginBottom: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { width: 120, objectFit: "contain" },
  brandFallback: { fontSize: 26, fontWeight: "bold" },
  tag: { marginTop: 8, fontSize: 10, color: "#ddd6fe", maxWidth: 300, lineHeight: 1.4 },
  badge: { backgroundColor: "#7c3aed", color: "#ffffff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, fontSize: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 10, color: "#6b7280", marginBottom: 16, lineHeight: 1.5 },
  grid: { flexDirection: "row", gap: 12, marginBottom: 18 },
  card: { flex: 1, border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, backgroundColor: "#ffffff" },
  label: { fontSize: 8, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.7 },
  value: { fontSize: 12, fontWeight: "bold", marginBottom: 9 },
  section: { marginBottom: 18 },
  table: { border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", marginTop: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f3ff", borderBottom: "1px solid #e5e7eb" },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #f3f4f6" },
  colConcept: { width: "52%", padding: 10 },
  colType: { width: "18%", padding: 10 },
  colPrice: { width: "30%", padding: 10, textAlign: "right" },
  th: { fontSize: 8, fontWeight: "bold", color: "#6d28d9", textTransform: "uppercase" },
  tdTitle: { fontSize: 10.5, fontWeight: "bold", marginBottom: 3 },
  tdDesc: { fontSize: 8.5, color: "#6b7280", lineHeight: 1.4 },
  td: { fontSize: 10, color: "#111827" },
  totalBox: { marginTop: 14, padding: 16, borderRadius: 16, backgroundColor: "#111827", color: "#ffffff" },
  totalLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  totalLabel: { fontSize: 10, color: "#ddd6fe" },
  totalValue: { fontSize: 12, fontWeight: "bold" },
  total: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
  includeGrid: { flexDirection: "row", gap: 10, marginTop: 8 },
  includeCard: { flex: 1, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 },
  small: { fontSize: 9, color: "#6b7280", lineHeight: 1.6 },
  footer: { marginTop: 18, paddingTop: 12, borderTop: "1px solid #e5e7eb", fontSize: 8, color: "#9ca3af", lineHeight: 1.5 },
});

export function BudgetPDF({
  client,
  email,
  phone,
  businessType,
  service,
  monthly,
  installation,
  notes,
  planName,
  items,
  logoUrl,
  monthlySubtotal,
  discount,
}: {
  client: string;
  email: string;
  phone: string;
  businessType: string;
  service: string;
  monthly: string;
  installation: string;
  notes: string;
  planName?: string;
  items?: BudgetItem[];
  logoUrl?: string;
  monthlySubtotal?: string;
  discount?: string;
}) {
  const rows = items && items.length ? items : [
    { name: service, description: "Solución Flowly IA personalizada.", price: Number(monthly), type: "Mensual" as const },
    { name: "Instalación y configuración inicial", description: "Puesta en marcha del sistema.", price: Number(installation), type: "Único" as const },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <View>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <Text style={styles.brandFallback}>Flowly IA</Text>}
            <Text style={styles.tag}>Automatización, reservas, CRM y gestión premium para negocios modernos</Text>
          </View>
          <Text style={styles.badge}>Presupuesto personalizado</Text>
        </View>

        <Text style={styles.title}>Propuesta comercial Flowly IA</Text>
        <Text style={styles.subtitle}>Documento generado automáticamente con selección de pack, módulos contratables y condiciones comerciales.</Text>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{client}</Text>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{email}</Text>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>{phone || "No indicado"}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Tipo de negocio</Text>
            <Text style={styles.value}>{businessType || "No indicado"}</Text>
            <Text style={styles.label}>Pack seleccionado</Text>
            <Text style={styles.value}>{planName || service}</Text>
            <Text style={styles.label}>Propuesta</Text>
            <Text style={styles.value}>{service}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Desglose de la propuesta</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colConcept, styles.th]}>Concepto</Text>
              <Text style={[styles.colType, styles.th]}>Tipo</Text>
              <Text style={[styles.colPrice, styles.th]}>Importe</Text>
            </View>
            {rows.map((item, index) => (
              <View key={`${item.name}-${index}`} style={styles.tableRow}>
                <View style={styles.colConcept}>
                  <Text style={styles.tdTitle}>{item.name}</Text>
                  {item.description ? <Text style={styles.tdDesc}>{item.description}</Text> : null}
                </View>
                <Text style={[styles.colType, styles.td]}>{item.type}</Text>
                <Text style={[styles.colPrice, styles.td]}>{item.price.toFixed(2)} €</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalBox}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Subtotal mensual</Text>
              <Text style={styles.totalValue}>{monthlySubtotal || monthly} € / mes</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Descuento mensual</Text>
              <Text style={styles.totalValue}>-{discount || "0.00"} €</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Instalación</Text>
              <Text style={styles.totalValue}>{installation} €</Text>
            </View>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.totalLabel}>Total mensual</Text>
              <Text style={styles.total}>{monthly} € / mes</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Incluye</Text>
          <View style={styles.includeGrid}>
            <View style={styles.includeCard}><Text style={styles.small}>Panel de gestión personalizado con clientes, servicios, reservas y calendario operativo.</Text></View>
            <View style={styles.includeCard}><Text style={styles.small}>Configuración inicial, acompañamiento y soporte para la puesta en marcha del negocio.</Text></View>
            <View style={styles.includeCard}><Text style={styles.small}>Primer mes gratuito según promoción comercial vigente y contratación sin permanencia.</Text></View>
          </View>
        </View>

        {notes ? <View style={styles.section}><Text style={styles.title}>Notas comerciales</Text><Text style={styles.small}>{notes}</Text></View> : null}

        <Text style={styles.footer}>Presupuesto generado por Flowly IA. Validez orientativa: 15 días. Los módulos seleccionados podrán activarse automáticamente en el panel del cliente una vez formalizada la contratación.</Text>
      </Page>
    </Document>
  );
}
