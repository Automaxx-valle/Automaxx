<template>
  <transition name="fade">
    <div class="modal-overlay" v-if="show"></div>
  </transition>

  <transition name="fade">
    <div class="home mooodal" v-if="show">
      <header>
        <h1>Imprimir</h1>
      </header>
      <form class="f">
        <button
          class="btn button btn-primary"
          @click="obtenerDescripciones"
          type="button"
        >
          <strong>Volver a imprimir</strong>
        </button>
        <button
          class="btn button btn-primary"
          @click="closePrint"
          type="button"
        >
          <strong>Cerrar</strong>
        </button>
      </form>

      <!--Error en el inicio de sesión-->
      <div class="error" v-if="error">
        <hr />
        <div class="notification is-danger">
          {{ error }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

export default {
  props: {
    show: Boolean,
    data: JSON,
  },
  name: "ImprimirPago",
  watch: {
    show: function (newShowValue) {
      if (newShowValue) {
        this.obtenerDescripciones();
      }
    },
  },
  data() {
    return {
      descripciones: [], // Aquí se almacenarán las descripciones
      error: null,
    };
  },
  methods: {
    //Obtiene los datos para el ticket
    async obtenerDescripciones() {
      try {
        const db = getFirestore(); // Obtener la instancia de Firestore
        const coleccionRef = collection(db, "Adicional"); // Referencia a la colección
        const consulta = query(coleccionRef, orderBy("__name__")); //Ordenar por id de documento
        const snapshot = await getDocs(consulta); // Obtener documentos ordenados

        // Extraer el campo 'descripcion' de cada documento
        this.descripciones = snapshot.docs.map((doc) => doc.data().descripcion);
        this.error = null;
        this.imprimirPDF();
      } catch (error) {
        this.error = "Error al obtener las descripciones:" + error;
      }
    },

    //Mandar a imprimir el recibo
    imprimirPDF() {
      const content = `
      <div style="text-align: center;">
      <p>${this.data.fecha}</p>
      <h2>${this.data.cajero}</h2>
      <h2>${this.descripciones[1]}</h2>
      <p></p>
      <p>RFC: ${this.descripciones[2]}</p>
      <p>FOLIO: ${this.data.id}</p>
        <table border="1">
          <tr>
              <th>Vehículo</th>
              <th>Método de pago</th>
              <th>Total</th>
              <th>Pagado</th>
              <th>Restante</th>
          </tr>
          <tr>
              <th>${this.data.modelo} ${this.data.placas.toUpperCase()}</th>
              <th>${this.data.tp}</th>
              <th>${this.data.total}</th>
              <th>${this.data.pagado}</th>
              <th>${this.data.restante}</th>
          </tr>
      </table>
      <p>Teléfono: ${this.descripciones[4]}</p>
      <h2>WIFI</h2>
      <h3>Red: ${this.descripciones[3]}</h3>
      <h3>Contraseña: ${this.descripciones[0]}</h3>
      </div>
    `;

      //Mandar a imprimir
      var ventana = window.open("", "PRINT", "height=400,width=600");
      ventana.document.write(
        "<html><head><title>" +
          this.data.id_ve +
          "</title>" +
          "<style>@page { size: 80mm 297mm; } p {text-align: justify;}</style></head><body>"
      );
      ventana.document.write(content);
      ventana.document.write("</body></html>");
      ventana.document.close();
      ventana.focus();
      ventana.print();

      return true;
    },

    //Cierra el cuadro de impresión
    closePrint() {
      this.$emit("close");
    },
  },
};
</script>

<style>
@import url(https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css);
@import url(https://use.fontawesome.com/releases/v5.0.13/css/all.css);
</style>
