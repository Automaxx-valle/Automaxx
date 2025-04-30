<template>
  <div id="app" v-if="user && vista == 0">
    <div class="container">
      <div class="home">
        <header>
          <h1>Panel de adminsitrador</h1>
        </header>

        <section>
          <h2>Opciones de administrador</h2>
          <div class="card">
            <div class="espacio-en-medio">
              <!--Usuarios-->
              <div class="cardi">
                <div class="horizontal">
                  <button v-on:click="cambiarOpcion(1)">
                    <img
                      src="../../components/assets/usuarios.png"
                      class="search"
                    />
                  </button>
                  <h3 class="espacio-izq">Usuarios</h3>
                </div>
              </div>

              <!--Listado-->
              <div class="cardi">
                <div class="horizontal">
                  <button v-on:click="cambiarOpcion(2)">
                    <img
                      src="../../components/assets/modelo.jpg"
                      class="search"
                    />
                  </button>
                  <h3 class="espacio-izq">Encontrar un vehículo</h3>
                </div>
              </div>

              <!--Servicios-->
              <div class="cardi">
                <div class="horizontal">
                  <button v-on:click="cambiarOpcion(3)">
                    <img
                      src="../../components/assets/lavado.jpg"
                      class="search"
                    />
                  </button>
                  <h3 class="espacio-izq">Servicios</h3>
                </div>
              </div>

              <!--Tipos de vehículos-->
              <div class="cardi">
                <div class="horizontal">
                  <button v-on:click="cambiarOpcion(4)">
                    <img
                      src="../../components/assets/vehiculo.jpg"
                      class="search"
                    />
                  </button>
                  <h3 class="espacio-izq">Tipos de vehículos</h3>
                </div>
              </div>

              <!--Equipos-->
              <div class="cardi">
                <div class="horizontal">
                  <button v-on:click="cambiarOpcion(5)">
                    <img
                      src="../../components/assets/equipo.png"
                      class="search"
                    />
                  </button>
                  <h3 class="espacio-izq">Equipos</h3>
                </div>
              </div>

              <!--Descuentos-->
              <div class="cardi">
                <div class="horizontal">
                  <button v-on:click="cambiarOpcion(6)">
                    <img
                      src="../../components/assets/desc.png"
                      class="search"
                    />
                  </button>
                  <h3 class="espacio-izq">Descuentos</h3>
                </div>
              </div>

              <!--Info adicional-->
              <div class="cardi">
                <div class="horizontal">
                  <button v-on:click="cambiarOpcion(7)">
                    <img
                      src="../../components/assets/extra.png"
                      class="search"
                    />
                  </button>
                  <h3 class="espacio-izq">Información adicional</h3>
                </div>
              </div>

              <!--Métodos de pago-->
              <div class="cardi">
                <div class="horizontal">
                  <button v-on:click="cambiarOpcion(8)">
                    <img
                      src="../../components/assets/metodo.png"
                      class="search"
                    />
                  </button>
                  <h3 class="espacio-izq">Métodos de pago</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>

  <button class="floating-button" @click="cambiarOpcion(0)" v-if="vista != 0">
    <i class="fa fa-chevron-circle-left" aria-hidden="true"></i>
  </button>

  <!--Componentes adicionales-->
  <p class="white">a</p>
  <Register :show="vista"></Register>
  <Listado :show="vista" @mensaje="mensaje"></Listado>
  <Precios :show="vista" @correcto="openModal(7)"></Precios>
  <Tipos :show="vista" @correcto="openModal(7)"></Tipos>
  <Equipos :show="vista" @correcto="openModal(7)"></Equipos>
  <Descuentos :show="vista" @correcto="openModal(7)"></Descuentos>
  <MasInfo :show="vista" @correcto="openModal(7)"></MasInfo>
  <TiposPagos :show="vista"></TiposPagos>

  <dialog-component
    :show="showModal"
    :opc="opcion"
    :mess="message"
    @close="closeModal"
  ></dialog-component>
</template>

<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore"; // Importar Firestore
import db from "../../firebase/init.js";
import {
  doc,
  deleteDoc,
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";

//Importar componentes
import DialogComponent from "../../components/layout/Modal.vue";
import Register from "../Auth/Register.vue";
import Listado from "./BuscarUnVehiculo.vue";
import Precios from "./Precios.vue";
import Tipos from "./Tipos.vue";
import Equipos from "./Equipos.vue";
import Descuentos from "./Descuentos.vue";
import MasInfo from "./MasInfo.vue";
import TiposPagos from "./TiposPagos.vue";

export default {
  components: {
    DialogComponent,
    Register,
    Listado,
    Precios,
    Tipos,
    Equipos,
    Descuentos,
    MasInfo,
    TiposPagos,
  },
  data() {
    return {
      //usuario
      user: null,
      //modal
      showModal: false,
      opcion: null,
      message: null,
      //modificar cliente
      telefono: null,
      cliente: null,
      //eliminar mes
      mes: null,
      //opcion elegida
      vista: 0,
    };
  },
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
    mensaje(data) {
      this.openModal(data.opc, data.text);
    },

    //Elegir opcion
    cambiarOpcion(opc) {
      this.vista = opc;
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
            if (doc.data().rol != 1) {
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

<style></style>
