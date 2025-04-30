<template>
  <section>
    <h2>Corte de caja diario</h2>
    <p>
      El corte diario únicamente obtiene la cuenta de los ingresos y egresos en
      efectivo.
    </p>
    <button @click="generarCorteCaja" class="btn button btn-primary">
      Generar PDF
    </button>
  </section>
</template>

<script>
import db from "../../firebase/init.js";
import { jsPDF } from "jspdf";
import { logoBase64 } from "./logoBase64.js";

export default {
  data() {
    return {
      ingresos: [],
      gastos: [],
      month: null,
      year: null,
    };
  },
  methods: {
    //Obtener el día de hoy
    obtenerFechasRelevantes() {
      const hoy = new Date();
      this.month = (hoy.getMonth() + 1).toString().padStart(2, "0");
      this.year = hoy.getFullYear().toString();
      return hoy.getDate().toString();
    },

    //Realizar el corte de caja
    async generarCorteCaja() {
      const dia = this.obtenerFechasRelevantes();
      let totalIngresos = 0;
      let totalGastos = 0;
      let vehiculosDelMes = 0;
      this.ingresos = [];
      this.gastos = [];

      // Ingresos del día (colección con nombre del día)
      const pagosSnap = await db.collection(dia).get();
      pagosSnap.forEach((doc) => {
        const data = doc.data();
        vehiculosDelMes++;
        if (Array.isArray(data.pagos)) {
          data.pagos.forEach((pago) => {
            if (pago.medio === "Efectivo") {
              totalIngresos += Number(pago.monto || 0);
              this.ingresos.push({
                ...pago,
                dia,
                id_vehiculo: doc.id,
                caract_veh: data.caract_veh,
              });
            }
          });
        }
      });

      //Gastos del día (solo en efectivo)
      const gastosSnap = await db.collection("Gastos").get();
      gastosSnap.forEach((doc) => {
        const data = doc.data();
        if (
          data.tipo_pago === "efectivo" &&
          data.dia === dia // Comparamos con el campo 'dia' dentro del documento
        ) {
          totalGastos += Number(data.cantidad || 0);
          this.gastos.push({ ...data });
        }
      });

      //Calcular saldo
      const saldo = totalIngresos - totalGastos;

      // Generar PDF - Formato profesional
      const doc = new jsPDF();
      const marginLeft = 20;
      let y = 40;

      // Añadir el logo antes del título
      const pageWidth = doc.internal.pageSize.getWidth();
      const imageWidth = 50; // Cambia esto al ancho deseado del logo
      const imageX = (pageWidth - imageWidth) / 2;
      doc.addImage(logoBase64, "PNG", imageX, 10, imageWidth, 20); // (imagen, tipo, x, y, ancho, alto)

      // Encabezado
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(
        "CORTE DE CAJA - AUTOLAVADO AUTOMAXX",
        doc.internal.pageSize.getWidth() / 2,
        y,
        { align: "center" }
      );

      y += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Fecha del corte: ${dia}/${this.month}/${this.year}`,
        doc.internal.pageSize.getWidth() / 2,
        y,
        { align: "center" }
      );

      y += 10;
      doc.line(marginLeft, y, doc.internal.pageSize.getWidth() - marginLeft, y); // Línea divisoria
      y += 10;

      // Totales
      doc.setFont("helvetica", "bold");
      doc.text("Resumen del día:", marginLeft, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total de ingresos en efectivo: $${totalIngresos.toFixed(2)}`,
        marginLeft,
        y
      );
      y += 7;
      doc.text(
        `Total de gastos en efectivo: $${totalGastos.toFixed(2)}`,
        marginLeft,
        y
      );
      y += 7;
      doc.text(`Saldo final: $${saldo.toFixed(2)}`, marginLeft, y);

      y += 12;
      doc.line(marginLeft, y, doc.internal.pageSize.getWidth() - marginLeft, y); // Línea divisoria
      y += 10;

      // Detalles de ingresos
      doc.setFont("helvetica", "bold");
      doc.text("Detalles de los ingresos:", marginLeft, y);
      y += 8;
      doc.setFont("helvetica", "normal");

      if (this.ingresos.length === 0) {
        doc.text("Sin ingresos registrados en efectivo.", marginLeft, y);
        y += 10;
      } else {
        this.ingresos.forEach((i) => {
          const texto = `• ${i.dia}/${this.month}/${this.year} - ${i.caract_veh?.[1]} ${i.caract_veh?.[2]} ${i.caract_veh[0]} - $${i.monto} pagados en efectivo`;
          doc.text(texto, marginLeft, y);
          y += 8;
          if (y > 270) {
            // salto de página si es necesario
            doc.addPage();
            y = 20;
          }
        });
      }

      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Detalles de gastos:", marginLeft, y);
      y += 8;
      doc.setFont("helvetica", "normal");

      if (this.gastos.length === 0) {
        doc.text("Sin gastos registrados en efectivo.", marginLeft, y);
        y += 10;
      } else {
        this.gastos.forEach((g) => {
          const texto = `• ${g.dia}/${g.mes}/${this.year} - ${g.descripcion} - $${g.cantidad}`;
          doc.text(texto, marginLeft, y);
          y += 8;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });
      }

      // Agregar numeración de paginas
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(10);
        doc.text(
          `Página ${i} de ${totalPages}`,
          pageWidth - 40,
          pageHeight - 10
        );
      }

      // Guardar archivo
      doc.save(`Reporte del día ${dia}-${this.month}-${this.year} AUTOMAXX`);
    },
  },
};
</script>
