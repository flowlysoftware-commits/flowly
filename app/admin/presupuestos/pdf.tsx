import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 42,
    fontFamily: "Helvetica",
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  hero: {
    backgroundColor: "#111827",
    color: "#ffffff",
    padding: 28,
    borderRadius: 18,
    marginBottom: 28,
  },
  brand: {
    fontSize: 28,
    fontWeight: "bold",
  },
  tag: {
    marginTop: 8,
    fontSize: 11,
    color: "#ddd6fe",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 22,
  },
  card: {
    flex: 1,
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
  },
  label: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
  },
  section: {
    marginBottom: 24,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
    paddingVertical: 10,
  },
  totalBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#f5f3ff",
  },
  total: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6d28d9",
  },
  small: {
    fontSize: 10,
    color: "#6b7280",
    lineHeight: 1.6,
  },
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
}: {
  client: string;
  email: string;
  phone: string;
  businessType: string;
  service: string;
  monthly: string;
  installation: string;
  notes: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Flowly IA</Text>
          <Text style={styles.tag}>
            Automatización, reservas y gestión premium para negocios modernos
          </Text>
        </View>

        <Text style={styles.title}>Presupuesto personalizado</Text>

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

            <Text style={styles.label}>Servicio contratado</Text>
            <Text style={styles.value}>{service}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Detalle de la propuesta</Text>

          <View style={styles.line}>
            <Text>Instalación y configuración inicial</Text>
            <Text>{installation} €</Text>
          </View>

          <View style={styles.line}>
            <Text>Cuota mensual del sistema</Text>
            <Text>{monthly} € / mes</Text>
          </View>

          <View style={styles.line}>
            <Text>Primer mes gratis</Text>
            <Text>Incluido</Text>
          </View>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.label}>Total mensual</Text>
          <Text style={styles.total}>{monthly} € / mes</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Incluye</Text>
          <Text style={styles.small}>
            Panel de gestión personalizado, reservas, clientes, servicios,
            estadísticas, automatizaciones, soporte inicial y configuración
            adaptada al negocio.
          </Text>
        </View>

        {notes ? (
          <View style={styles.section}>
            <Text style={styles.title}>Notas</Text>
            <Text style={styles.small}>{notes}</Text>
          </View>
        ) : null}

        <Text style={styles.small}>
          Presupuesto generado por Flowly IA. Validez orientativa: 15 días.
        </Text>
      </Page>
    </Document>
  );
}
