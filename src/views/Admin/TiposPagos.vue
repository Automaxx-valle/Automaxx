<template>
  <div id="app" v-if="show == 8">
    <div class="container">
      <div class="home">
        <header>
          <h1>Métodos de pago</h1>
        </header>
        <section>
          <h2>Métodos de pagos</h2>
          <p>
            En esta sección podrás gestionar los métodos de pago permitidos para
            el autolavado, por ejemplo, efectivo, con tarjeta, etcétera. Así
            como los folios para las cortesías.
          </p>

          <div class="card">
            <form @submit.prevent="agregarTipoVehiculo">
              <div class="cardi doble-ancho f amarillo">
                <h3>Agregar un nuevo descuento</h3>
                <div class="horizontal">
                  <strong class="espacio-der">Nombre del tipo de pago:</strong>
                  <input
                    v-model="nuevoTipo"
                    type="text"
                    placeholder="Ej. Efectivo"
                    class="form-control espacio"
                    required
                  />
                </div>
                <button type="submit" class="btn button is-primary">
                  <strong>Agregar método de pago</strong>
                </button>
              </div>
            </form>

            <!--Existentes-->
            <div class="cardi doble-ancho f amarillo">
              <h3>Métodos de pago:</h3>
              <div class="doble-ancho f">
                <ul>
                  <li
                    v-for="tipo in tiposVehiculos"
                    :key="tipo.id"
                    class="horizontal"
                  >
                    <strong class="espacio-der">{{ tipo.id }}</strong>
                    <div class="horizontal">
                      <button
                        @click="eliminarTipoVehiculo(tipo.id)"
                        class="btn button is-primary"
                        v-if="tipo.id != 'Cortesía' && tipo.id != 'Efectivo'"
                      >
                        Eliminar
                      </button>
                      <!--No se permite eliminar la cortesía ni el efectivo-->
                      <button class="btn button is-primary" v-else disabled>
                        Eliminar
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!--Error-->
            <div class="error" v-if="error">
              <hr />
              <div class="notification is-danger">
                {{ error }}
              </div>
            </div>
          </div>
        </section>

        <Cortesias></Cortesias>
      </div>
    </div>
  </div>
</template>

<script>
//importar firebase
import "firebase/compat/auth";
import "firebase/compat/firestore";
import db from "../../firebase/init.js";
import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
} from "firebase/firestore";

//Importar las cortesías
import Cortesias from "./Cortesias.vue";

export default {
  components: {
    Cortesias,
  },
  props: {
    show: Number,
  },
  data() {
    return {
      nuevoTipo: "", // Nombre del nuevo tipo de vehículo
      nuevaDescripcion: null, // Descripción del nuevo tipo
      tiposVehiculos: [], // Lista de tipos de vehículos
      error: null,
    };
  },
  mounted() {
    this.obtenerTiposVehiculos();
  },
  methods: {
    // Agregar un nuevo método de pago sin descripción
    async agregarTipoVehiculo() {
      if (!this.nuevoTipo.trim()) {
        this.error = "El nombre del tipo de pago no puede ser vacío.";
      } else {
        try {
          await setDoc(doc(db, "Pagos", this.nuevoTipo.trim()), {
            descripcion: "n",
          });
          //Muestra el nuevo descuento sin necesidad de una consulta a firebase
          this.tiposVehiculos.push({
            id: this.nuevoTipo,
            descripcion: "n",
          });
          //Reinicia las variables
          this.nuevoTipo = null;
          this.error = null;
        } catch (error) {
          this.error = "Error al agregar el tipo de pago: " + error;
        }
      }
    },

    // Obtener los tipos de vehículos
    async obtenerTiposVehiculos() {
      try {
        const querySnapshot = await getDocs(collection(db, "Pagos"));
        this.tiposVehiculos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
        }));
        this.error = null;
      } catch (error) {
        this.error = "Error al obtener los tipos de pagos: " + error;
      }
    },

    // Eliminar un tipo de método de pago
    async eliminarTipoVehiculo(id) {
      try {
        await deleteDoc(doc(db, "Pagos", id.trim()));
        this.tiposVehiculos = this.tiposVehiculos.filter(
          (pago) => pago.id !== id
        );
        this.error = null;
      } catch (error) {
        this.error = "Error al eliminar el tipo de pago: " + error;
      }
    },
  },
};
</script>
