import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#111",
  },

  header: {
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitle: {
    color: "#666",
    fontSize: 12,
  },

  section: {
    marginBottom: 24,
  },

  card: {
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    color: "#666",
  },

  total: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
});

export function BudgetPDF({
  client,
  service,
  monthly,
  installation,
}: {
  client: string;
  service: string;
  monthly: string;
  installation: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Flowly IA</Text>
          <Text style={styles.subtitle}>
            Presupuesto profesional personalizado
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Cliente</Text>
              <Text>{client}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Servicio</Text>
              <Text>{service}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Instalación</Text>
              <Text>{installation} €</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Cuota mensual</Text>
              <Text>{monthly} €</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text>
            Incluye panel de gestión, automatizaciones, reservas online,
            estadísticas y soporte.
          </Text>
        </View>

        <Text style={styles.total}>
          Total mensual: {monthly} €
        </Text>
      </Page>
    </Document>
  );
}
