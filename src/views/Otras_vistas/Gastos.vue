<template>
  <div id="app" v-if="user">
    <div class="container">
      <div class="home">
        <header>
          <h1>Registrar gastos</h1>
        </header>
        <section>
          <div class="p-4 max-w-md mx-auto">
            <h2>Registrar Gastos del Autolavado</h2>

            <div class="card">
              <form @submit.prevent="guardarGasto">
                <h3 class="block mb-1">Cantidad ($)</h3>
                <input
                  type="number"
                  v-model="cantidad"
                  class="form-control espacio"
                  required
                />
                <h3 class="block mb-1">Descripción</h3>
                <input
                  type="text"
                  v-model="descripcion"
                  class="form-control espacio"
                  required
                />
                <h3>Tipo de pago</h3>
                <select v-model="tipoPago" class="form-control" required>
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="cuenta de cheques">Cuenta de cheques</option>
                </select>
                <button type="submit" class="btn button btn-primary">
                  Guardar Gasto
                </button>
              </form>
            </div>

            <p v-if="mensaje" class="mt-4 text-green-600">{{ mensaje }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>

  <!--Modal-->
  <dialog-component
    :show="showModal"
    :opc="opcion"
    :mess="message"
    @ref="closeModal"
  ></dialog-component>
</template>

<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import db from "../../firebase/init.js";
import DialogComponent from "../../components/layout/Modal.vue";

export default {
  components: {
    DialogComponent,
  },
  data() {
    return {
      //firebase
      user: null,
      //modal
      showModal: false,
      opcion: null,
      message: null,
      //fecha
      dia: null,
      mes: null,
      //gastos
      cantidad: null,
      descripcion: null,
      tipoPago: null,
    };
  },
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

    obtenerMes() {
      const hoy = new Date();
      this.dia = hoy.getDate().toString();
      this.mes = (hoy.getMonth() + 1).toString();
    },

    //Guardar gasto en firebase
    async guardarGasto() {
      try {
        await db.collection("Gastos").add({
          cantidad: parseFloat(this.cantidad),
          descripcion: this.descripcion,
          tipo_pago: this.tipoPago,
          dia: this.dia,
          mes: this.mes,
        });
        this.openModal(3, "éxito!");
        this.cantidad = null;
        this.descripcion = null;
        this.tipoPago = null;
      } catch (error) {
        this.openModal(0, error);
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
