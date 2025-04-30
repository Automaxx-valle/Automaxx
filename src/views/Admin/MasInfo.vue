<template>
  <div id="app" v-if="show == 7">
    <div class="container">
      <div class="home">
        <header>
          <h1>Información adicional</h1>
        </header>
        <section>
          <h2>Información adicional</h2>
          <p>
            En este apartado podrás configurar algunos parámetros adicionales,
            como lo es el nombre y la contraseña de la red WIFI que se imprime
            en los tickets, o el domicilio y teléfono del autolavado, así como
            el propio RFC.
          </p>

          <div class="card">
            <div class="cardi doble-ancho f amarillo">
              <h3>Información:</h3>
              <div class="doble-ancho f">
                <ul>
                  <li
                    v-for="tipo in tiposVehiculos"
                    :key="tipo.id"
                    class="horizontal"
                  >
                    <strong class="espacio-der">{{ tipo.id }}</strong>
                    <input
                      v-model="tipo.descripcion"
                      type="text"
                      placeholder="Descripción"
                      class="form-control espacio"
                    />
                    <div class="horizontal">
                      <button
                        @click="
                          modificarTipoVehiculo(tipo.id, tipo.descripcion)
                        "
                        class="btn button is-primary"
                      >
                        Modificar
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
      </div>
    </div>
  </div>
</template>

<script>
//importar firebase
import "firebase/compat/auth";
import "firebase/compat/firestore";
import db from "../../firebase/init.js";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";

export default {
  props: {
    show: Number,
  },
  data() {
    return {
      tiposVehiculos: [], // Lista de tipos de vehículos
      clave: null,
      error: null,
    };
  },
  mounted() {
    this.obtenerTiposVehiculos();
  },
  methods: {
    // Obtener los campos
    async obtenerTiposVehiculos() {
      try {
        const querySnapshot = await getDocs(collection(db, "Adicional"));
        this.tiposVehiculos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          descripcion: doc.data().descripcion,
        }));
      } catch (error) {
        this.error = "Error al obtener los adicionales: " + error;
      }
    },

    // Modificar un campo (nombre y descripción)
    async modificarTipoVehiculo(id, nuevaDescripcion) {
      try {
        await setDoc(doc(db, "Adicional", id), {
          descripcion: nuevaDescripcion,
        });
        this.error = null;
        this.$emit("correcto");
      } catch (error) {
        this.error = "Error al modificar el campo: " + error;
      }
    },
  },
};
</script>
