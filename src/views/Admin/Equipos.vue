<template>
  <div id="app" v-if="show == 5">
    <div class="container">
      <div class="home">
        <header>
          <h1>Equipos</h1>
        </header>
        <section>
          <h2>Equipos</h2>
          <p>
            En esta sección podrás gestionar los equipos de trabajo a los cuales
            se les asignarán los vehículos que hay que atender.
          </p>

          <div class="card">
            <!--Nuevo-->
            <form @submit.prevent="agregarTipoVehiculo">
              <div class="cardi doble-ancho f amarillo">
                <h3>Agregar un nuevo equipo</h3>
                <div class="horizontal">
                  <strong class="espacio-der">Nombre del equipo:</strong>
                  <input
                    v-model="nuevoTipo"
                    type="text"
                    placeholder="Ej. Equipo 1"
                    class="form-control espacio"
                    required
                  />
                </div>
                <div class="horizontal">
                  <strong class="espacio-der">Descripción:</strong>
                  <input
                    v-model="nuevaDescripcion"
                    type="text"
                    placeholder="Ej. Equipo de lavado"
                    class="form-control espacio"
                  />
                </div>

                <button type="submit" class="btn button is-primary">
                  <strong>Agregar equipo</strong>
                </button>
              </div>
            </form>

            <!--Existentes-->
            <div class="cardi doble-ancho f amarillo">
              <h3>Equipos Existentes:</h3>
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
                      <button
                        @click="eliminarTipoVehiculo(tipo.id)"
                        class="btn button is-primary"
                      >
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

export default {
  props: {
    show: Number,
  },
  data() {
    return {
      nuevoTipo: "", // Nombre del nuevo tipo de vehículo
      nuevaDescripcion: "", // Descripción del nuevo tipo
      tiposVehiculos: [], // Lista de tipos de vehículos
      error: null,
    };
  },
  mounted() {
    this.obtenerTiposVehiculos();
  },
  methods: {
    // Agregar un nuevo equipo con descripción
    async agregarTipoVehiculo() {
      if (!this.nuevoTipo.trim()) {
        this.error = "El nombre no puede estar vacío.";
      } else {
        try {
          await setDoc(doc(db, "Equipos", this.nuevoTipo.trim()), {
            descripcion: this.nuevaDescripcion.trim(),
          });
          //Muestra el nuevo servicio sin necesidad de una consulta a firebase
          this.tiposVehiculos.push({
            id: this.nuevoTipo,
            descripcion: this.nuevaDescripcion,
          });
          //Reinicia las variables
          this.nuevoTipo = null;
          this.nuevaDescripcion = null;
          this.error = null;
        } catch (error) {
          this.error = "Error al agregar el equipo: " + error;
        }
      }
    },

    // Modificar un equipo (nombre y descripción)
    async modificarTipoVehiculo(id, nuevaDescripcion) {
      try {
        await setDoc(doc(db, "Equipos", id.trim()), {
          descripcion: nuevaDescripcion.trim(),
        });
        this.error = null;
        this.$emit("correcto");
      } catch (error) {
        this.error = "Error al modificar el equipo: " + error;
      }
    },

    // Obtener los equipos
    async obtenerTiposVehiculos() {
      try {
        const querySnapshot = await getDocs(collection(db, "Equipos"));
        this.tiposVehiculos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          descripcion: doc.data().descripcion || "",
        }));
        this.error = null;
      } catch (error) {
        this.error = "Error al obtener los equipos: " + error;
      }
    },

    // Eliminar un equipo
    async eliminarTipoVehiculo(id) {
      try {
        await deleteDoc(doc(db, "Equipos", id.trim()));
        this.tiposVehiculos = this.tiposVehiculos.filter(tipo => tipo.id !== id);
        this.error = null;
      } catch (error) {
        this.error = "Error al eliminar el equipo: " + error;
      }
    },
  },
};
</script>
