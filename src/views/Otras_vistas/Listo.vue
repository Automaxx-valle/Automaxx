<template>
  <div id="app" v-if="user">
    <div class="container">
      <div class="home">
        <header>
          <h1>Vehículo listo</h1>
        </header>

        <!--Seleccionar la lista deseada-->
        <section>
          <h2>Estatus de los vehículos</h2>
          <div class="card">
            <div class="horizontal">
              <button
                class="btn button btn-primary"
                type="submit"
                @click="cambiarOpcion(3)"
              >
                <strong>
                  <i class="fa fa-cog espacio-der"></i>
                  En proceso
                </strong>
              </button>
              <button
                class="btn button btn-primary"
                type="submit"
                @click="cambiarOpcion(1)"
              >
                <strong>
                  <i class="fa fa-check espacio-der"></i>
                  Listos
                </strong>
              </button>
              <button
                class="btn button btn-primary"
                type="submit"
                @click="cambiarOpcion(2)"
              >
                <strong>
                  <i class="fa fa-car espacio-der"></i>
                  Entregados
                </strong>
              </button>
              <button
                class="btn button btn-primary"
                type="submit"
                @click="cambiarOpcion(4)"
              >
                <strong>
                  <i class="fa fa-credit-card espacio-der"></i>
                  Descuento
                </strong>
              </button>
            </div>
          </div>

          <!--Spinner de carga-->
          <div v-if="cargando" class="spinner"></div>
        </section>

        <!--Muestra vehículos en proceso-->
        <section v-if="this.opc == 3">
          <h2>Vehículos en proceso ({{ this.otros.length }})</h2>
          <info-vehiculo
            v-for="(documento, index) in otros"
            :key="index"
            :documento="documento"
            :mostrarBoton="1"
            @actualizar="actualizar_listo"
          ></info-vehiculo>
        </section>

        <!--Muestra vehículos listos-->
        <section v-if="this.opc == 1">
          <h2>Vehículos listos ({{ this.listos.length }})</h2>
          <info-vehiculo
            v-for="(documento, index) in listos"
            :key="index"
            :documento="documento"
            :mostrarBoton="2"
            @entregar="actualizar_entregar"
          ></info-vehiculo>
        </section>

        <!--Muestra vehículos entregados-->
        <section v-if="this.opc == 2">
          <h2>Vehículos entregados ({{ this.entregados.length }})</h2>
          <info-vehiculo
            v-for="(documento, index) in entregados"
            :key="index"
            :documento="documento"
            :mostrarBoton="0"
          ></info-vehiculo>
        </section>

        <!--Muestra vehículos con descuento-->
        <section v-if="this.opc == 4">
          <h2>Vehículos con descuento ({{ this.descuento.length }})</h2>
          <info-vehiculo
            v-for="(documento, index) in descuento"
            :key="index"
            :documento="documento"
            :mostrarBoton="0"
          ></info-vehiculo>
        </section>
      </div>
    </div>
  </div>

  <!--Modal-->
  <dialog-component
    :show="showModal"
    :opc="opcion"
    :mess="message"
    @close="closeModal"
  ></dialog-component>
</template>

<script>
//importar firebase
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import db from "../../firebase/init.js";

//importar las ventana emergentes
import DialogComponent from "@/components/layout/Modal.vue";
import InfoVehiculo from "@/components/layout/InfoVehiculo.vue";

export default {
  components: {
    DialogComponent,
    InfoVehiculo,
  },
  data() {
    return {
      //usuario firebase
      user: null,
      //vehiculos
      listos: [],
      otros: [],
      entregados: [],
      descuento: [],
      opc: null,
      //fecha
      day: null,
      cargando: false,
      //modal
      showModal: false,
      opcion: null,
      message: null,
    };
  },
  name: "Listo",
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

    //Obtiene el día y reinicia las listas
    obtenerMes() {
      const serverTimestamp = firebase.firestore.Timestamp.now();
      const fecha = serverTimestamp.toDate();
      this.day = fecha.getDate().toString();

      this.listos = [];
      this.otros = [];
      this.entregados = [];
      this.cargando = true;
      this.buscarVehiculo();
    },

    //Obtener los vehículos
    buscarVehiculo() {
      this.cargando = true;

      //Obtiene el día actual
      const hoy = new Date();
      hoy.setDate(parseInt(this.day)); // ya tienes this.day desde obtenerMes()
      const diaActual = hoy.getDate().toString();

      //Obtiene un día antes
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);
      const diaAnterior = ayer.getDate().toString();

      //Realiza las consultas
      const diasConsulta = [diaAnterior, diaActual];
      diasConsulta.forEach((dia) => {
        const collectionRef = db.collection(dia);
        collectionRef
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              this.clasificar(doc, dia);
            });
          })
          .catch((err) => {
            this.openModal(0, err.message);
          });
      });
      this.cargando = false;
    },
    clasificar(doc, dia) {
      if (doc.data().ya_entregado != true) {
        if (doc.data().listo == true) {
          this.listos.push({ id: doc.id, data: doc.data(), mes: dia });
        } else {
          this.otros.push({ id: doc.id, data: doc.data(), mes: dia });
        }
      } else {
        this.entregados.push({ id: doc.id, data: doc.data(), mes: dia });
      }
      //Agregar un duplicado si el vehículo tuvo descuento
      if (doc.data().descuento > 0) {
        this.descuento.push({ id: doc.id, data: doc.data(), mes: dia });
      }
    },

    //cambiar opcion
    cambiarOpcion(opcion) {
      this.opc = opcion;
    },

    //Actualizar a listo
    actualizar_listo(data) {
      const docRef = db.collection(data.mes).doc(data.id);
      docRef
        .update({
          listo: true,
        })
        .then(() => {
          // Buscar el índice del documento en el arreglo "otros"
          const index = this.otros.findIndex((doc) => doc.id === data.id);
          if (index !== -1) {
            // Sacar el elemento del arreglo "otros"
            const [documento] = this.otros.splice(index, 1);
            // Actualizar su estado
            documento.data.listo = true;
            // Moverlo a "listos"
            this.listos.push(documento);
          }
          this.openModal(10, "listo");
        })
        .catch((err) => {
          this.openModal(0, err.message);
        });
    },

    //Actualizar a entregado
    actualizar_entregar(data) {
      if (data.dado < data.total) {
        this.openModal(11);
      } else {
        const docRef = db.collection(data.mes).doc(data.id);
        docRef
          .update({
            ya_entregado: true,
            usuario_entrego: this.user,
            fecha_entrega: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            // Buscar el índice del documento en el arreglo "listos"
            const index = this.listos.findIndex((doc) => doc.id === data.id);
            if (index !== -1) {
              // Sacar el elemento del arreglo "listos"
              const [documento] = this.listos.splice(index, 1);
              // Actualizar su estado
              documento.data.ya_entregado = true;
              // Moverlo a "entregados"
              this.entregados.push(documento);
            }
            this.openModal(10, "entregado");
          })
          .catch((err) => {
            this.openModal(0, err.message);
          });
      }
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
            if (doc.data().rol > 3) {
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
