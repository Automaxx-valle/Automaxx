<template>
  <div id="app" v-if="show == 2">
    <div class="container">
      <div class="home">
        <header>
          <h1>Vehículos</h1>
        </header>

        <section>
          <h2>Vehículos</h2>
          <p>
            En esta sección podrás revisar el registro de un vehículo que haya
            ingresado en cualquier día del mes (los usuarios no administradores
            pueden gestionar únicamente el día actual), en base a su FOLIO.
          </p>

          <div class="card">
            <form class="f">
              <input
                type="text"
                class="form-control espacio"
                placeholder="ID del vehículo"
                v-model="id_ve"
              />
              <button
                class="btn button btn-primary"
                type="button"
                @click="buscarVehiculo()"
                :disabled="!this.id_ve"
              >
                <strong>
                  <i class="fa fa-search espacio-der"></i>
                  Buscar
                </strong>
              </button>
            </form>

            <!--Spinner de carga-->
            <div v-if="cargando" class="spinner"></div>

            <!--Obtener info del vehiculo buscado-->
            <info-vehiculo
              v-for="(documento, index) in vehiculo"
              :key="index"
              :documento="documento"
              :mostrarBoton="0"
            ></info-vehiculo>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import "firebase/compat/auth";
import "firebase/compat/firestore"; // Importar Firestore
import db from "../../firebase/init.js";
import InfoVehiculo from "@/components/layout/InfoVehiculo.vue";

export default {
  components: {
    InfoVehiculo,
  },
  props: {
    show: Number,
  },
  data() {
    return {
      id_ve: null,
      cliente: null,
      vehiculo: [],
      cargando: false,
    };
  },
  methods: {
    //Buscar vehiculo en cualquier mes
    buscarVehiculo() {
      this.cargando = true;
      for (let i = 1; i <= 31; i++) {
        const collectionRef = db.collection(i.toString());
        const docRef = collectionRef.doc(this.id_ve);
        docRef
          .get()
          .then((doc) => {
            if (doc.exists) {
              this.vehiculo = [];
              this.vehiculo.push({ id: doc.id, data: doc.data(), mes: i });
              this.cliente = doc.data().cliente;
              this.$emit("mensaje", { opc: 5, text: "" });
              this.cargando = false;
              return;
            }
          })
          .catch((err) => {
            this.$emit("mensaje", { opc: 0, text: err.message });
          });
      }
      (this.cargando = false), this.$emit("mensaje", { opc: 8, text: "" });
    },
  },
};
</script>

<style></style>
