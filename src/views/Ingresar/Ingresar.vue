<template>
  <div id="app" v-if="user">
    <div class="container">
      <div class="home">
        <header>
          <h1>Ingresar vehículo</h1>
        </header>

        <!--Datos del cliente-->
        <section>
          <h2>Datos del cliente</h2>
          <div class="card">
            <input
              type="text"
              class="form-control espacio"
              placeholder="Nombre"
              v-model="nombre"
            />
            <input
              type="number"
              class="form-control espacio"
              placeholder="Teléfono"
              v-model="tel"
              @wheel.prevent
            />
          </div>
        </section>

        <!--Datos del vehículo-->
        <Vehiculo :show="true" @close="vehiculo" @aviso="openModal"> </Vehiculo>

        <!--Agregar descuento-->
        <Pago
          :show="agregarDescuento"
          :subtotal="total"
          @close="closePago"
          @pago="pago"
        ></Pago>
      </div>
    </div>
  </div>

  <!--Modal-->
  <dialog-component
    :show="showModal"
    :opc="opcion"
    :mess="message"
    @close="closeModal"
    @ref="recargar"
  ></dialog-component>

  <!--Imprimir-->
  <imprimir-component :show="showPrint" :data="data" @close="closePrint">
  </imprimir-component>
</template>

<script>
//importar firebase
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import db from "../../firebase/init.js";

//importar componentes
import DialogComponent from "../../components/layout/Modal.vue";
import ImprimirComponent from "@/components/print/Imprimir.vue";
import Vehiculo from "./Vehiculo.vue";
import Pago from "./Pago.vue";

export default {
  components: {
    DialogComponent,
    ImprimirComponent,
    Vehiculo,
    Pago,
  },
  data() {
    return {
      //usuario firebase
      user: null,
      //fecha
      day: null,
      fecha: null,
      //cliente
      nombre: null,
      tel: null,
      //vehiculo
      id_ve: null,
      caract: [],
      servicios: [],
      //costos
      precios: [],
      total: 0,
      agregarDescuento: false,
      descuento: 0,
      //modal
      showModal: false,
      opcion: null,
      message: null,
      //imprimir
      showPrint: false,
      data: null,
    };
  },
  name: "Ingresar",
  mounted() {
    this.identificarUsuario();
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
    recargar() {
      this.closeModal();
      setTimeout(() => {
        window.location.reload();
      }, 0);
    },

    //Vehiculo
    async vehiculo(total, caract, servicios, precios) {
      this.total = total;
      this.caract = caract;
      this.servicios = servicios;
      this.precios = precios;
      this.fechaYhora();
      this.id_ve = await this.generarFolio();
      this.agregarDescuento = true;
    },
    async generarFolio() {
      const folioRef = db.collection("folios").doc("vehiculos");

      try {
        const newFolio = await db.runTransaction(async (transaction) => {
          const folioDoc = await transaction.get(folioRef);
          let current = 0;
          if (folioDoc.exists) {
            current = folioDoc.data().contador || 0; // Obtén el valor del contador
          }

          // Si el contador supera los 99999 (5 dígitos), reiniciamos a 1
          const next = current >= 99999 ? 1 : current + 1;

          // Actualiza el contador
          transaction.set(folioRef, { contador: next }, { merge: true });

          return next;
        });

        // Devuelve el folio con 5 dígitos, añadiendo ceros a la izquierda si es necesario
        return String(newFolio).padStart(5, "0");
      } catch (e) {
        console.error("Error generando folio:", e);
        return "ERR"; // Valor por defecto si algo falla
      }
    },

    //Obtener la fecha y hora del servidor
    fechaYhora() {
      const serverTimestamp = firebase.firestore.Timestamp.now();
      const fecha = serverTimestamp.toDate();
      var year = (fecha.getFullYear() % 100).toString();
      var month = (fecha.getMonth() + 1).toString(); // Los meses en JavaScript son de 0 a 11, así que agregamos 1
      this.day = fecha.getDate().toString();
      var hours = fecha.getHours().toString();
      var minutes = fecha.getMinutes().toString();
      this.fecha =
        year + "-" + month + "-" + this.day + " " + hours + ":" + minutes;
    },

    //Pago
    closePago() {
      this.agregarDescuento = false;
    },
    pago(descuento) {
      //Guardar el descuento
      this.closePago();
      this.descuento = descuento;
      //Proceder con el ingreso
      if (this.datosValidos()) {
        const collectionRef = db.collection(this.day);
        collectionRef
          .doc(this.id_ve)
          .set({
            usuario_ingreso: this.user,
            cliente: this.tel ? this.tel.toString() : "",
            nombre: this.nombre ? this.nombre.toString() : "",
            caract_veh: this.caract,
            servicios: this.servicios,
            precios: this.precios,
            fecha_ingresado: firebase.firestore.FieldValue.serverTimestamp(),
            total: this.total,
            pagado: 0,
            pagos: [],
            descuento: this.descuento,
            listo: false,
            ya_entregado: false,
          })
          .then(() => {
            this.openModal(3, "éxito!");
            this.imprimirPDF();
          })
          .catch((err) => {
            this.openModal(0, err.message);
          });
      } else {
        this.openModal(
          0,
          "Algún dato en el formulario es inválido o no está bien definido"
        );
      }
    },
    datosValidos() {
      return (
        !!this.day &&
        !!this.id_ve &&
        !!this.user &&
        !!this.caract.length > 0 &&
        !!this.servicios.length > 0 &&
        !!this.precios.length > 0 &&
        !!this.total
      );
    },

    //Imprimir recibo
    imprimirPDF() {
      this.data = {
        id: this.id_ve,
        tipo: this.caract[1],
        modelo: this.caract[2],
        placas: this.caract[0],
        equipo: this.caract[3],
        observacion: this.caract[4],
        fecha: this.fecha,
        tel: this.tel,
        servicios: this.servicios,
        precios: this.precios,
        descuento: this.descuento,
        total: this.total,
      };
      this.showPrint = true;
    },
    closePrint() {
      this.showPrint = false;
    },

    //Usuario firebase
    identificarUsuario() {
      const user = firebase.auth().currentUser;
      if (user) {
        this.buscarRol(user.uid, user.displayName);
      } else {
        this.$router.push({ name: "home" });
      }
    },
    buscarRol(id, user) {
      const collectionRef = db.collection("Usuarios");
      const docRef = collectionRef.doc(id);
      docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            if (doc.data().rol != 1 && doc.data().rol != 3) {
              this.$router.push({ name: "home" });
            } else {
              this.user = user;
            }
          } else {
            this.$router.push({ name: "home" });
          }
        })
        .catch((err) => {
          this.$router.push({ name: "home" });
        });
    },
  },
};
</script>

<style>
@import url(https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css);
@import url(https://use.fontawesome.com/releases/v5.0.13/css/all.css);
</style>
