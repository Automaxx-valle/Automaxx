<template>
  <div id="app" v-if="show == 4">
    <div class="container">
      <div class="home">
        <header>
          <h1>Tipos de vehículos</h1>
        </header>

        <section>
          <h2>Tipos de vehículos</h2>
          <p>
            En esta sección podrás gestionar los tipos de vehículos en los
            cuales se clasifican los que llegan al autolavado.
          </p>

          <div class="card">
            <!--Nuevo-->
            <form @submit.prevent="agregarTipoVehiculo">
              <div class="cardi doble-ancho f amarillo">
                <h3>Agregar un nuevo tipo de vehículo</h3>
                <div class="horizontal">
                  <strong class="espacio-der"
                    >Nombre del tipo de vehículo:</strong
                  >
                  <input
                    v-model="nuevoTipo"
                    type="text"
                    placeholder="Ej. Auto"
                    class="form-control espacio"
                    required
                  />
                </div>
                <div class="horizontal">
                  <strong class="espacio-der">Descripción:</strong>
                  <input
                    v-model="nuevaDescripcion"
                    type="text"
                    placeholder="Ej. Vehículo de 4 ruedas"
                    class="form-control espacio"
                  />
                </div>

                <button type="submit" class="btn button is-primary">
                  <strong>Agregar tipo de vehículo</strong>
                </button>
              </div>
            </form>

            <!--Existentes-->
            <div class="cardi doble-ancho f amarillo">
              <h3>Tipos de Vehículos Existentes:</h3>
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
import firebase from "firebase/compat/app";
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
    // Agregar un nuevo tipo de vehículo con descripción
    async agregarTipoVehiculo() {
      if (!this.nuevoTipo.trim()) {
        this.error = "El nombre no puede estar vacío.";
      } else {
        try {
          await setDoc(doc(db, "tiposVehiculos", this.nuevoTipo.trim()), {
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
          this.error = "Error al agregar el tipo de vehículo: " + error;
        }
      }
    },

    // Modificar un tipo de vehículo (nombre y descripción)
    async modificarTipoVehiculo(id, nuevaDescripcion) {
      try {
        await setDoc(doc(db, "tiposVehiculos", id.trim()), {
          descripcion: nuevaDescripcion.trim(),
        });
        this.error = null;
        this.$emit("correcto");
      } catch (error) {
        this.error = "Error al modificar el tipo de vehículo: " + error;
      }
    },

    // Obtener los tipos de vehículos
    async obtenerTiposVehiculos() {
      try {
        const querySnapshot = await getDocs(collection(db, "tiposVehiculos"));
        this.tiposVehiculos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          descripcion: doc.data().descripcion || "",
        }));
        this.error = null;
      } catch (error) {
        this.error = "Error al obtener los tipos de vehículos: " + error;
      }
    },

    // Eliminar un tipo de vehículo
    async eliminarTipoVehiculo(id) {
      try {
        this.eliminarCampoEnMap(id.trim(), "preciosPorTipo");
        if (this.error == null) {
          await deleteDoc(doc(db, "tiposVehiculos", id.trim()));
          this.tiposVehiculos = this.tiposVehiculos.filter(tipo => tipo.id !== id);
        }
      } catch (error) {
        this.error = "Error al eliminar el tipo de vehículo: " + error;
      }
    },

    // Eliminar el tipo de vehiculo de los precios
    async eliminarCampoEnMap(mapa, campo) {
      try {
        // Obtener todos los documentos de la colección
        const snapshot = await db.collection("Precios").get();

        if (snapshot.empty) {
          this.error = "No hay documentos en la colección";
        } else {
          // Crear un batch para optimizar las operaciones
          const batch = db.batch();
          snapshot.forEach((doc) => {
            const ref = db.collection("Precios").doc(doc.id);
            const campoPath = `${mapa}.${campo}`;
            // Eliminar un campo dentro del Map
            batch.update(ref, {
              [campoPath]: firebase.firestore.FieldValue.delete(),
            });
          });

          // Aplicar el batch
          await batch.commit();
          this.error = null;
        }
      } catch (error) {
        this.error =
          "Error al eliminar los precios dentro del tipo de vehículo: " + error;
      }
    },
  },
};
</script>
