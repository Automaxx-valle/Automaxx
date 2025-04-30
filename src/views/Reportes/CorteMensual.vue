<template>
  <section>
    <h2>Corte de caja mensual</h2>
    <p>
      Recuerda que al hacer el corte mensual, los registros de los vehículos y
      de los gastos se <b>ELIMINARÁN</b> de la base de datos.
    </p>
    <button
      @click="generarCorteCaja"
      class="btn button btn-primary"
      :disabled="cargando"
    >
      Generar PDF
    </button>

    <!--Spinner de carga-->
    <div v-if="cargando" class="spinner"></div>
  </section>

  <!--Modal-->
  <dialog-component
    :show="showModal"
    :opc="opcion"
    :mess="message"
    @close="closeModal"
    @ref="recargar"
  ></dialog-component>
</template>

<script>
import db from "../../firebase/init.js";
import { jsPDF } from "jspdf";
import { logoBase64 } from "./logoBase64.js";
import DialogComponent from "../../components/layout/Modal.vue";

export default {
  components: {
    DialogComponent,
  },
  data() {
    return {
      ingresos: [],
      gastos: [],
      diaStr: null,
      month: null,
      year: null,
      cargando: false,
      //modal
      showModal: false,
      opcion: null,
      message: null,
    };
  },
  methods: {
    //Modal
    openModal(opc, mess) {
      this.showModal = true;
      this.opcion = opc;
      this.message = mess;
    },
    closeModal() {
      this.showModal = false;
    },

    //Convertir el numero del mes en texto
    obtenerNombreMes(numeroMes) {
      const nombresMeses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return nombresMeses[parseInt(numeroMes, 10) - 1] || "";
    },

    //Realizar el corte de caja
    async generarCorteCaja() {
      if (this.cargando) {
        this.cargando = true;
        const hoy = new Date();
        this.month = (hoy.getMonth() + 1).toString();
        this.year = hoy.getFullYear().toString();

        let totalIngresos = 0;
        let totalGastos = 0;
        let vehiculosDelMes = 0;
        this.ingresos = [];
        this.gastos = [];

        // Iterar todos los días del mes
        for (let dia = 1; dia <= 31; dia++) {
          this.diaStr = dia.toString();
          try {
            const pagosSnap = await db.collection(this.diaStr).get();
            pagosSnap.forEach((doc) => {
              const data = doc.data();
              vehiculosDelMes++;
              if (Array.isArray(data.pagos)) {
                data.pagos.forEach((pago) => {
                  totalIngresos += Number(pago.monto || 0);
                  this.ingresos.push({
                    ...pago,
                    dia: this.diaStr,
                    id_vehiculo: doc.id,
                    caract_veh: data.caract_veh,
                  });
                });
              }
            });
          } catch (e) {
            this.openModal(0, "Error al obtener la colección de un día. " + e);
          }
        }

        // Obtener gastos del mes
        const gastosSnap = await db.collection("Gastos").get();
        gastosSnap.forEach((doc) => {
          const data = doc.data();
          if (data.mes === this.month) {
            totalGastos += Number(data.cantidad || 0);
            this.gastos.push(data);
          }
        });

        // Saldo final
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
          "CORTE MENSUAL - AUTOLAVADO AUTOMAXX",
          doc.internal.pageSize.getWidth() / 2,
          y,
          { align: "center" }
        );

        y += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Fecha del corte: ${this.diaStr}/${this.month}/${this.year}`,
          doc.internal.pageSize.getWidth() / 2,
          y,
          { align: "center" }
        );

        y += 10;
        doc.line(
          marginLeft,
          y,
          doc.internal.pageSize.getWidth() - marginLeft,
          y
        ); // Línea divisoria
        y += 10;

        // Totales
        doc.setFont("helvetica", "bold");
        doc.text(
          `Resumen del mes ${this.obtenerNombreMes(this.month)} del año ${
            this.year
          }:`,
          marginLeft,
          y
        );
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.text(
          `Total de ingresos: $${totalIngresos.toFixed(2)}`,
          marginLeft,
          y
        );
        y += 7;
        doc.text(`Total de gastos: $${totalGastos.toFixed(2)}`, marginLeft, y);
        y += 7;
        doc.text(`Saldo final: $${saldo.toFixed(2)}`, marginLeft, y);

        y += 12;
        doc.line(
          marginLeft,
          y,
          doc.internal.pageSize.getWidth() - marginLeft,
          y
        ); // Línea divisoria
        y += 10;

        // Detalles de ingresos
        doc.setFont("helvetica", "bold");
        doc.text("Detalles de los ingresos:", marginLeft, y);
        y += 8;
        doc.setFont("helvetica", "normal");

        if (this.ingresos.length === 0) {
          doc.text("Sin ingresos registrados.", marginLeft, y);
          y += 10;
        } else {
          this.ingresos.forEach((i) => {
            const texto = `• ${i.dia}/${this.month}/${this.year} - ${i.caract_veh?.[1]} ${i.caract_veh?.[2]} ${i.caract_veh[0]} - $${i.monto} pagados en ${i.medio}`;
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
          doc.text("Sin gastos registrados.", marginLeft, y);
          y += 10;
        } else {
          this.gastos.forEach((g) => {
            const texto = `• ${g.dia}/${g.mes}/${this.year} - ${g.descripcion} - $${g.cantidad} pagados en ${g.tipo_pago}`;
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
        doc.save(`Reporte mensual ${this.month}-${this.year} AUTOMAXX`);

        //Ejecuta las funciones async pero una después de otra
        await this.guardarVehiculosDelMes(vehiculosDelMes);
        await this.borrarDias();
        await this.borrarTodosLosGastos();
        this.cargando = false;
      }
    },

    async guardarVehiculosDelMes(numero) {
      const mesNumero = parseInt(this.month, 10); // Por si viene como string "03"
      const mesesRef = db.collection("Meses");

      try {
        // Si es enero, reinicia la colección "Meses"
        if (mesNumero === 1) {
          const snapshot = await mesesRef.get();

          if (!snapshot.empty) {
            const batch = db.batch();

            snapshot.forEach((doc) => {
              batch.delete(doc.ref);
            });

            await batch.commit();
          }
        }

        // Ahora guarda el dato del mes actual (enero u otro)
        const mesDocRef = mesesRef.doc(mesNumero.toString());
        await mesDocRef.set(
          {
            vehiculos: numero,
          },
          { merge: true }
        );
      } catch (error) {
        this.openModal(
          0,
          "Error al actualizar los vehículos ingresados por mes. " + error
        );
      }
    },

    // Elimina los vehículos de los días
    async borrarDias() {
      for (let i = 1; i <= 31; i++) {
        const nombreColeccion = String(i);
        const coleccionRef = db.collection(nombreColeccion);

        try {
          const snapshot = await coleccionRef.get();
          const batch = db.batch(); // usamos un batch para eliminar en bloque
          snapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        } catch (error) {
          this.openModal(0, "Error al eliminar los ingresos del mes. " + error);
        }
      }
    },

    // Elimina todos los gastos
    async borrarTodosLosGastos() {
      try {
        const coleccionRef = db.collection("Gastos");
        const snapshot = await coleccionRef.get();

        if (!snapshot.empty) {
          const batch = db.batch();
          snapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        }
      } catch (error) {
        this.openModal(0, "Error al borrar los gastos del mes. " + error);
      }
    },
  },
};
</script>
