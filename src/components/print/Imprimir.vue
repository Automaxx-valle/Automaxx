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
        <button class="btn button btn-primary" @click="imprimirPDF">
          <strong>Volver a imprimir</strong>
        </button>
        <button class="btn button btn-primary" @click="closePrint">
          <strong>Cerrar</strong>
        </button>
      </form>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    show: Boolean,
    data: JSON,
  },
  name: "Imprimir",
  watch: {
    show: function (newShowValue) {
      if (newShowValue) {
        this.imprimirPDF();
      }
    },
  },
  methods: {
    imprimirPDF() {
      //Construir las filas dinámicamente de los servicios
      const listaServicios = this.data.servicios.map((servicio, index) => {
        return {
          nombre: servicio,
          precio: this.data.precios[index],
        };
      });
      let filasServicios = listaServicios
        .map(
          (servicio) => `
        <tr>
          <td>${servicio.nombre}</td>
          <td>${servicio.precio}</td>
        </tr>
      `
        )
        .join("");

      //Construir la fila del descuento dinámicamente
      const filaDescuento =
        this.data.descuento > 0
          ? `
    <tr>
      <td>DESCUENTO</td>
      <td>${this.data.descuento}</td>
    </tr>`
          : "";

      //Variable html
      const content = `
      <div style= "margin: 0; padding: 0; line-height: 0.4;">
      <img src="${require("@/components/assets/logo_al.png")}" style="width: 200px;">
      <h2>Folio: ${this.data.id}</h2>
      <div>
        <p>Vehículo: ${this.data.modelo} - ${this.data.placas}</p>
        <h1>EQ: ${this.data.equipo}</h1>
        <p>Ingreso: ${this.data.fecha}</p>
        <p>Teléfono: ${this.data.tel}</p>
        <table border="1">
          <tr>
              <th>Servicios</th>
              <th>Importe</th>
          </tr>
          ${filasServicios}
          ${filaDescuento}
          <tr>
            <td>TOTAL</td>
            <td>${this.data.total - this.data.descuento}</td>
          </tr>
          <tr>
            <td>Observaciones:</td>
            <td>${this.data.observacion}</td>
          </tr>
      </table>
      </div>
      </div>
      <p style="font-size: 9px;">IMPORTANTE: NO NOS HACEMOS RESPONSABLES POR LOS OBJETOS DE VALOR OLVIDADOS DENTRO DEL AUTO, 
        NI POR FALLAS MECÁNICAS O ELÉCTRICAS, NI POR EL DAÑO Y/O ROBO TOTAL O PARCIAL DEL AUTO, EL 
        SERVICIO DE LAVADO ES DE 45 MINUTOS, POR LO QUE PEDIMOS DE LA MANERA MÁS ATENTA RECOGER SU 
        AUTOMÓVIL EN EL TIEMPO SEÑALADO, DE LO CONTRARIO SE ESTACIONARÁ EN LA CALLE, SIN HACERNOS 
        RESPONSABLES POR CUALQUIER DAÑO, GOLPES, RAYONES, ROBO TOTAL O PARCIAL DEL VEHÍCULO.</p>
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
