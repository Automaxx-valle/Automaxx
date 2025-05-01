<template>
  <div class="card">
    <div :class="{ amarillo: documento.data.descuento > 0 }">
      <h2>Folio: {{ documento.id }}</h2>
      <div class="espacio-en-medio">
        <div class="cardi">
          <h3>Vehículo</h3>
          <p>
            <span
              >{{ documento.data.caract_veh[2] }} -
              {{ documento.data.caract_veh[0] }} -
              {{ documento.data.caract_veh[1] }}</span
            >
          </p>
          <p>
            <span>{{ documento.data.caract_veh[4] }}</span>
          </p>
        </div>

        <div class="cardi">
          <h3>Servicios:</h3>
          <p><span>Equipo: </span>{{ documento.data.caract_veh[3] }}</p>
          <p v-for="(servicio, index) in documento.data.servicios" :key="index">
            <span>
              {{ servicio }}
            </span>
          </p>
        </div>

        <div class="cardi" v-if="fechaIngresada">
          <h3>Ingreso</h3>
          <p><span>Fecha: </span>{{ fechaFormateada }}</p>
          <p><span> Hace: </span>{{ tiempoTranscurrido }}</p>
          <p><span>Usuario: </span>{{ documento.data.usuario_ingreso }}</p>
        </div>
        <div class="cardi" v-else>
          <h3>Ingreso</h3>
          <p>Cargando información...</p>
        </div>

        <div class="cardi">
          <h3>Costos</h3>
          <p><span>Total: </span>${{ documento.data.total }}</p>
          <p><span>Descuento: </span>${{ documento.data.descuento }}</p>
          <p><span>Pagado: </span>${{ documento.data.pagado }}</p>
        </div>

        <div class="cardi">
          <h3>Entrega</h3>
          <p>
            <span>Entregado: </span
            >{{ documento.data.ya_entregado ? "Sí" : "No" }}
          </p>
          <p><span>Usuario: </span>{{ documento.data.usuario_entrego }}</p>
          <p v-if="this.documento.data.fecha_entrega">
            <span>Fecha: </span>
            {{
              new Date(
                this.documento.data.fecha_entrega.seconds * 1000
              ).toLocaleString()
            }}
          </p>
        </div>

        <div class="cardi" v-if="ultimoPago">
          <h3>Último pago</h3>
          <p><strong>Método:</strong> {{ ultimoPago.medio }}</p>
          <p><strong>Usuario:</strong> {{ ultimoPago.usuario }}</p>
          <p>
            <strong>Fecha:</strong>
            {{ new Date(ultimoPago.fecha.seconds * 1000).toLocaleString() }}
          </p>
        </div>
        <div class="cardi" v-else>
          <h3>Último pago</h3>
          <p>Cargando información...</p>
        </div>

        <div class="cardi">
          <h3>Cliente</h3>
          <p><span>Nombre: </span>{{ documento.data.nombre }}</p>
          <p><span>Teléfono: </span>{{ documento.data.cliente }}</p>
        </div>

        <div class="cardi">
          <h3>Día del mes en el que se encontró:</h3>
          <p>{{ documento.mes }}</p>
        </div>
      </div>

      <!--Botones correspondientes con el estatus del carro-->
      <form class="f">
        <div class="horizontal">
          <!--Botón para imprimir el ticket de ingreso-->
          <button
            class="btn button btn-primary"
            type="submit"
            @click="imprimirPDF(documento)"
          >
            <strong>
              <i class="fa fa-print espacio-der"></i>
              Imprimir ticket
            </strong>
          </button>
          <!--Botón para imprimir el ticket de pago-->
          <button
            class="btn button btn-primary"
            type="submit"
            @click="imprimirPago(documento)"
            v-if="mostrarBoton == 0"
          >
            <strong>
              <i class="fa fa-credit-card espacio-der"></i>
              Imprimir último pago
            </strong>
          </button>
          <!--Botón para marcar al vehículo como listo-->
          <button
            class="btn button btn-primary"
            type="submit"
            @click="
              actualizar_listo(
                documento.id,
                documento.mes,
                documento.data.cliente
              )
            "
            v-if="mostrarBoton == 1"
          >
            <strong>
              <i class="fa fa-check espacio-der"></i>
              Actualizar estatus a vehículo listo
            </strong>
          </button>
          <!--Botón para marcar al vehículo como entregado-->
          <button
            class="btn button btn-primary"
            type="submit"
            @click="
              actualizar_entregado(
                documento.id,
                documento.mes,
                documento.data.pagado,
                documento.data.descuento,
                documento.data.total
              )
            "
            v-if="mostrarBoton == 2"
          >
            <strong>
              <i class="fa fa-car espacio-der"></i>
              Entregar vehículo
            </strong>
          </button>
        </div>

        <!--Botón para enviar mensaje al cliente-->
        <button
          class="btn button btn-primary"
          type="submit"
          @click="sendWhatsAppMessage(documento.data.cliente)"
          v-if="mostrarBoton == 2"
          :disabled="!esTelefonoValido(documento.data.cliente)"
        >
          <strong>
            <i class="fa fa-phone espacio-der"></i>
            Enviar mensaje al cliente
          </strong>
        </button>
      </form>
    </div>
  </div>

  <!--Imprimir-->
  <imprimir-component :show="showPrint" :data="data" @close="closePrint">
  </imprimir-component>

  <!--Imprimir el comprobante de pago-->
  <imprimir-pago
    :show="showPrintP"
    :data="dataP"
    @close="closePrintP"
  ></imprimir-pago>
</template>

<script>
//Importar componentes
import ImprimirComponent from "../print/Imprimir.vue";
import ImprimirPago from "../print/ImprimirPago.vue";

export default {
  props: {
    documento: Object,
    mostrarBoton: String,
  },
  components: {
    ImprimirComponent,
    ImprimirPago,
  },
  data() {
    return {
      //Imprimir ingreso
      showPrint: false,
      data: null,
      //Imprimir pago
      showPrintP: false,
      dataP: null,
    };
  },
  methods: {
    // Valida que el número de teléfono del cliente sea válido
    esTelefonoValido(numero) {
      return /^\d{10}$/.test(numero);
    },
    // Envía los parámetros para actualizar el estatus del vahiculo
    actualizar_listo(id, mes, number) {
      this.sendWhatsAppMessage(number);
      this.$emit("actualizar", { id, mes });
    },

    // Envía los parámetros para actualizar el estatus del vahiculo
    actualizar_entregado(id, mes, pagado, descuento, total) {
      const dado = pagado + descuento;
      this.$emit("entregar", { id, mes, dado, total });
    },

    //Envía un mensaje al cliente
    sendWhatsAppMessage(number) {
      if (this.esTelefonoValido(number)) {
        const completo = "521" + number;
        const message = `AUTOMAXX, Tu vehículo ${this.documento.data.caract_veh[2]} ${this.documento.data.caract_veh[0]} se encuentra listo.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${completo}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");
      }
    },

    // Imprimir ingreso
    imprimirPDF(doc) {
      this.data = {
        id: doc.id,
        tipo: doc.data.caract_veh[1],
        modelo: doc.data.caract_veh[2],
        placas: doc.data.caract_veh[0],
        equipo: doc.data.caract_veh[3],
        fecha: new Date(
          doc.data.fecha_ingresado.seconds * 1000
        ).toLocaleString(),
        tel: doc.data.cliente,
        servicios: doc.data.servicios,
        precios: doc.data.precios,
        descuento: doc.data.descuento,
        total: doc.data.total,
      };
      this.showPrint = true;
    },
    closePrint() {
      this.showPrint = false;
    },

    //Imprimir pago
    imprimirPago(doc) {
      const ultimoPago = this.ultimoPago;

      this.dataP = {
        fecha: new Date(ultimoPago.fecha.seconds * 1000).toLocaleString(),
        cajero: ultimoPago.usuario,
        id: doc.id,
        modelo: doc.data.caract_veh[2],
        tp: ultimoPago.medio,
        total: doc.data.total - doc.data.descuento,
        pagado: doc.data.pagado,
        restante: doc.data.total - doc.data.pagado - doc.data.descuento,
        tel: doc.data.cliente ? doc.data.cliente : "",
      };
      this.showPrintP = true;
    },
    closePrintP() {
      this.showPrintP = false;
    },
  },
  computed: {
    fechaIngresada() {
      return new Date(this.documento.data.fecha_ingresado.seconds * 1000);
    },
    fechaFormateada() {
      return this.fechaIngresada.toLocaleString(); // Formato legible
    },
    tiempoTranscurrido() {
      const ahora = new Date();
      const diferenciaMs = ahora - this.fechaIngresada; // Diferencia en milisegundos
      const minutos = Math.floor(diferenciaMs / (1000 * 60)) % 60;
      const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));

      return `${horas} horas y ${minutos} minutos`;
    },
    ultimoPago() {
      const pagos = this.documento?.data?.pagos || [];
      return pagos.length > 0 ? pagos[pagos.length - 1] : null;
    },
  },
};
</script>
