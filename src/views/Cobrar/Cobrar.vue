<template>
  <div id="app" v-if="user">
    <div class="container">
      <div class="home">
        <header>
          <h1>Cobrar</h1>
        </header>

        <!--Identificar al vehículo-->
        <section v-if="!dataVe">
          <h2>ID del vehículo</h2>
          <div class="card">
            <form class="f">
              <input
                type="text"
                class="form-control espacio"
                placeholder="ID del vehículo"
                v-model="id_ve"
              />
              <div class="btn cincuenta">
                <button
                  class="btn button btn-primary"
                  type="button"
                  @click="buscarVehiculo()"
                >
                  <strong>
                    <i class="fa fa-search espacio-der"></i>
                    Buscar
                  </strong>
                </button>
              </div>
            </form>
          </div>

          <!--Spinner de carga-->
          <div v-if="cargando" class="spinner"></div>
        </section>

        <!--Datos del pago-->
        <datos-pago
          :info="dataVe"
          @aviso="openModal"
          @regreso="pagar"
        ></datos-pago>
      </div>
    </div>
  </div>

  <button class="floating-button" @click="otraBusqueda" v-if="dataVe">
    <i class="fa fa-chevron-circle-left" aria-hidden="true"></i>
  </button>

  <!--Modal-->
  <dialog-component
    :show="showModal"
    :opc="opcion"
    :mess="message"
    @close="closeModal"
    @ref="recargar"
  ></dialog-component>

  <!--Imprimir el comprobante de pago-->
  <imprimir-pago
    :show="showPrint"
    :data="data"
    @close="closePrint"
  ></imprimir-pago>
</template>

<script>
//importar firebase
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import db from "../../firebase/init.js";

//importar las ventanas emergentes
import DialogComponent from "@/components/layout/Modal.vue";
import ImprimirPago from "@/components/print/ImprimirPago.vue";
import DatosPago from "@/views/Cobrar/DatosPago.vue";

export default {
  components: {
    DialogComponent,
    ImprimirPago,
    DatosPago,
  },
  data() {
    return {
      //usuario firebase
      user: null,
      //vehiculo
      id_ve: null,
      total: null,
      previo_pagado: null,
      dataVe: null,
      //fecha
      day: null,
      fecha: null,
      //parametros de carga
      cargando: false,
      pagando: false,
      //modal
      showModal: false,
      opcion: null,
      message: null,
      //imprimir
      showPrint: false,
      data: null,
    };
  },
  name: "Cobrar",
  mounted() {
    this.identificarUsuario();
    this.obtenerMes();
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

    //Obtener el mes actual y el pasado
    obtenerMes() {
      const serverTimestamp = firebase.firestore.Timestamp.now();
      const fecha = serverTimestamp.toDate();
      var year = (fecha.getFullYear() % 100).toString();
      var month = (fecha.getMonth() + 1).toString();
      this.day = fecha.getDate().toString();
      var hours = fecha.getHours().toString();
      var minutes = fecha.getMinutes().toString();
      this.fecha =
        year + "-" + month + "-" + this.day + " " + hours + ":" + minutes;
    },

    //Obtener un vehículo
    buscarVehiculo() {
      this.cargando = true;

      //Obtiene el día actual
      const hoy = new Date();
      hoy.setDate(parseInt(this.day)); // ya tienes this.day desde obtenerMes()
      const diaActual = hoy.getDate().toString();

      //Obtiene el día anterior
      hoy.setDate(parseInt(this.day) - 1);
      const diaAnterior = hoy.getDate().toString();

      // Primero consulta el día actual
      const docRefActual = db.collection(diaActual).doc(this.id_ve);
      docRefActual
        .get()
        .then((doc) => {
          if (doc.exists) {
            this.guardarInfo(doc);
          } else {
            // Si no existe en el día actual, consulta el día anterior
            const docRefAnterior = db.collection(diaAnterior).doc(this.id_ve);
            docRefAnterior
              .get()
              .then((docAnt) => {
                if (docAnt.exists) {
                  this.guardarInfo(docAnt);
                } else {
                  this.openModal(0, "No se encontró al vehículo");
                }
              })
              .catch((err) => {
                this.openModal(0, err.message);
              });
          }
        })
        .catch((err) => {
          this.openModal(0, err.message);
        });
      this.cargando = false;
    },
    guardarInfo(doc) {
      this.openModal(5);
      this.dataVe = doc.data();
      this.previo_pagado = this.dataVe.pagado;
      this.total =
        this.dataVe.total - this.previo_pagado - this.dataVe.descuento;
    },

    //Actualizar datos del pago
    async pagar(pagado, medio) {
      if (this.pagando) return; // Evita ejecuciones múltiples simultáneas

      this.pagando = true;

      if (this.formIsValid) {
        const docRef = db.collection(this.day).doc(this.id_ve);
        const nuevoPago = {
          monto: pagado,
          medio: medio,
          fecha: new Date(),
          usuario: this.user,
        };

        // Verifica primero que no esté duplicado el pago
        try {
          const doc = await docRef.get();
          const data = doc.data();

          const yaPagado = data.pagos?.some(
            (p) =>
              p.monto === pagado &&
              p.medio === medio &&
              p.usuario === this.user &&
              Math.abs(new Date() - p.fecha.toDate()) < 10000 // Diferencia menor a 10 segundos
          );

          if (yaPagado) {
            return;
          }

          await docRef.update({
            pagos: firebase.firestore.FieldValue.arrayUnion(nuevoPago),
            pagado: firebase.firestore.FieldValue.increment(pagado),
          });

          this.imprimirPDF(pagado, medio);
          this.openModal(3, "éxito!");
        } catch (err) {
          this.openModal(0, err.message);
        } finally {
          this.pagando = false;
        }
      } else {
        this.pagando = false;
        this.openModal(
          0,
          "Algún dato en el formulario es inválido o no está bien definido"
        );
      }
    },

    //Imprimir
    imprimirPDF(pagado, medio) {
      const total = this.total + this.previo_pagado;
      const nuevoPagado = pagado + this.previo_pagado;
      //Empaquetar la información
      this.data = {
        fecha: this.fecha,
        cajero: this.user,
        id: this.id_ve,
        placas: this.dataVe.caract_veh[0],
        modelo: this.dataVe.caract_veh[2],
        tp: medio,
        total: total,
        pagado: nuevoPagado,
        restante: total - nuevoPagado,
      };
      this.showPrint = true;
    },
    closePrint() {
      this.showPrint = false;
    },

    //Permitir realizar otra busqueda
    otraBusqueda() {
      this.dataVe = null;
      this.id_ve = null;
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
            if (doc.data().rol > 2) {
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

  //Validar los campos que debe llenar el usuario
  computed: {
    formIsValid() {
      return !!this.day && !!this.id_ve && !!this.user;
    },
  },
};
</script>

<style>
@import url(https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css);
@import url(https://use.fontawesome.com/releases/v5.0.13/css/all.css);
</style>
