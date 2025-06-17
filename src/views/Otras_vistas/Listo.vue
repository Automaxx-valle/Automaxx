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
              <button class="btn button btn-primary" @click="cambiarOpcion(1)">
                <strong>
                  <i class="fa fa-cog espacio-der"></i>
                  Pendientes
                </strong>
              </button>
              <button class="btn button btn-primary" @click="cambiarOpcion(2)">
                <strong>
                  <i class="fa fa-check espacio-der"></i>
                  Pagados
                </strong>
              </button>
              <button class="btn button btn-primary" @click="cambiarOpcion(4)">
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

        <!--Muestra vehículos pendientes-->
        <section v-if="this.opc == 1">
          <h2>Vehículos pendientes ({{ this.listos.length }})</h2>
          <input
            type="text"
            class="form-control espacio"
            placeholder="Búsqueda por folio o modelo del vehículo"
            v-model="busqueda"
          />
          <info-vehiculo
            v-for="(documento, index) in vehiculosFiltradosPendientes
              .slice()
              .reverse()"
            :key="index"
            :documento="documento"
          ></info-vehiculo>
        </section>

        <!--Muestra vehículos pagados-->
        <section v-if="this.opc == 2">
          <h2>Vehículos pagados ({{ this.entregados.length }})</h2>
          <input
            type="text"
            class="form-control espacio"
            placeholder="Búsqueda por folio o modelo del vehículo"
            v-model="busqueda"
          />
          <info-vehiculo
            v-for="(documento, index) in vehiculosFiltradosPagados
              .slice()
              .reverse()"
            :key="index"
            :documento="documento"
          ></info-vehiculo>
        </section>

        <!--Muestra vehículos con descuento-->
        <section v-if="this.opc == 4">
          <h2>Vehículos con descuento ({{ this.descuento.length }})</h2>
          <info-vehiculo
            v-for="(documento, index) in descuento.slice().reverse()"
            :key="index"
            :documento="documento"
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
import InfoVehiculo from "@/components/layout/InfoVehiculorRes.vue";

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
      busqueda: null,
      listos: [],
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
      this.entregados = [];
      this.cargando = true;
      this.buscarVehiculo();
    },

    //Obtener los vehículos
    buscarVehiculo() {
      this.cargando = true;

      const hoy = new Date();
      hoy.setDate(parseInt(this.day));
      const diaActual = hoy.getDate().toString();

      const diasConsulta = [diaActual];

      const promesas = diasConsulta.map((dia) => {
        return db
          .collection(dia)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              this.clasificar(doc, dia);
            });
          });
      });

      Promise.all(promesas)
        .then(() => {
          this.cargando = false;
        })
        .catch((err) => {
          this.openModal(0, err.message);
          this.cargando = false;
        });
    },
    clasificar(doc, dia) {
      const total = doc.data().total - doc.data().descuento;
      if (total <= doc.data().pagado) {
        this.entregados.push({ id: doc.id, data: doc.data(), mes: dia });
      } else {
        this.listos.push({ id: doc.id, data: doc.data(), mes: dia });
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
  computed: {
    vehiculosFiltradosPagados() {
      const filtro = (this.busqueda || "").toString().toLowerCase();

      return this.entregados.filter((doc) => {
        const folio = typeof doc.id === "string" ? doc.id.toLowerCase() : "";
        const modelo =
          typeof doc.data?.caract_veh?.[2] === "string"
            ? doc.data.caract_veh[2].toLowerCase()
            : "";

        return folio.includes(filtro) || modelo.includes(filtro);
      });
    },
    vehiculosFiltradosPendientes() {
      const filtro = (this.busqueda || "").toString().toLowerCase();

      return this.listos.filter((doc) => {
        const folio = typeof doc.id === "string" ? doc.id.toLowerCase() : "";
        const modelo =
          typeof doc.data?.caract_veh?.[2] === "string"
            ? doc.data.caract_veh[2].toLowerCase()
            : "";

        return folio.includes(filtro) || modelo.includes(filtro);
      });
    },
  },
};
</script>

<style>
@import url(https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css);
@import url(https://use.fontawesome.com/releases/v5.0.13/css/all.css);
</style>
