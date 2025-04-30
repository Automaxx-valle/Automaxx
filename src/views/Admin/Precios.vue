<template>
  <div id="app" v-if="show == 3">
    <div class="container">
      <div class="home">
        <header>
          <h1>Servicios</h1>
        </header>

        <section>
          <h2>Servicios</h2>
          <p>
            En esta sección podrás gestionar los servicios que se ofertan en el
            autolavado, así como el ajustar sus precios para cada tipo de
            vehículo.
          </p>

          <!--Nuevo servicio-->
          <div class="card">
            <form @submit.prevent="agregarServicio">
              <div class="cardi doble-ancho f amarillo">
                <h3>Agregar un servicio</h3>
                <div class="horizontal">
                  <strong class="espacio-der">Nombre del Servicio:</strong>
                  <input
                    v-model="nombre"
                    type="text"
                    class="form-control espacio"
                    required
                  />
                </div>
                <div
                  v-for="tipo in tiposVehiculos"
                  :key="tipo"
                  class="doble-ancho f"
                >
                  <div class="horizontal">
                    <strong class="espacio-der">{{ tipo.id }}:</strong>
                    <input
                      v-model="preciosNuevos[tipo.id]"
                      type="number"
                      placeholder="Precio"
                      class="form-control espacio"
                    />
                  </div>
                </div>
                <button type="submit" class="btn button is-primary">
                  Agregar Servicio
                </button>
              </div>
            </form>

            <!--Existentes-->
            <div class="cardi doble-ancho f amarillo">
              <h3>Servicios Existentes:</h3>
              <div class="horizontal f">
                <ul class="contenedor">
                  <li
                    v-for="servicio in servicios"
                    :key="servicio.id"
                    class="white"
                  >
                    <strong>{{ servicio.id }}</strong>

                    <div v-for="tipo in tiposVehiculos" :key="tipo.id">
                      <div class="horizontal">
                        <strong class="espacio-der"
                          >{{ tipo.descripcion || tipo.id }}:</strong
                        >
                        <input
                          v-model="servicio.precios[tipo.id]"
                          type="number"
                          placeholder="Precio"
                          class="form-control espacio"
                        />
                      </div>
                    </div>

                    <button
                      @click="modificarServicio(servicio)"
                      class="btn button is-primary"
                    >
                      Modificar
                    </button>
                    <button
                      @click="eliminarServicio(servicio.id)"
                      class="btn button is-primary"
                    >
                      Eliminar
                    </button>
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
      nombre: "", // Nombre del nuevo servicio a agregar
      tiposVehiculos: [], // Almacena los tipos de servicios
      preciosNuevos: {}, //Almacena los precios al agregar un servicio por tipo de vehiculo
      servicios: [], // Lista de servicios
      error: null,
    };
  },
  mounted() {
    this.obtenerTiposVehiculos();
    this.obtenerServicios();
  },
  methods: {
    // Agregar un servicio con precios por tipo de vehículo
    async agregarServicio() {
      // Valida que los campos no estén vacios
      if (!this.nombre.trim() && Object.keys(this.preciosNuevos).length === 0) {
        this.error = "Hay algún campo vacío";
      } else {
        const preciosValidos = Object.entries(this.preciosNuevos).every(
          ([tipo, precio]) => {
            return precio && !isNaN(precio) && precio > 0;
          }
        );
        // Valida que los precios ingresados sean validos
        if (!preciosValidos) {
          this.error = "Los precios no son válidos";
        } else {
          // Si todo es correcto, intenta insertar el registro
          try {
            await setDoc(doc(db, "Precios", this.nombre.trim()), {
              preciosPorTipo: this.preciosNuevos,
            });

            //Muestra el nuevo servicio sin necesidad de una consulta a firebase
            this.servicios.push({
              id: this.nombre,
              precios: this.preciosNuevos,
            });

            //Reinicia las variables
            this.nombre = null;
            this.preciosNuevos = {};
            this.error = null;
          } catch (error) {
            this.error = "Error al agregar el servicio: " + error;
          }
        }
      }
    },

    // Eliminar un servicio
    async eliminarServicio(id) {
      try {
        await deleteDoc(doc(db, "Precios", id.trim()));
        this.error = null;
        this.servicios = this.servicios.filter(servicio => servicio.id !== id);
      } catch (error) {
        this.error = "Error al eliminar el servicio: " + error;
      }
    },

    // Modificar un servicio y sus precios
    async modificarServicio(servicio) {
      this.error = null;
      try {
        const precios = {};
        this.tiposVehiculos.forEach((tipo) => {
          const precio = servicio.precios[tipo.id];
          // Validación de precio: debe ser un número, no vacío, y mayor que 0
          if (precio && !isNaN(precio) && precio > 0) {
            precios[tipo.id] = precio;
          } else {
            this.error = "Hay algún precio no valido";
          }
        });

        if (this.error == null) {
          await setDoc(doc(db, "Precios", servicio.id.trim()), {
            preciosPorTipo: precios,
          });
          this.$emit("correcto");
        }
      } catch (error) {
        this.error = "Error al modificar el servicio: " + error;
      }
    },

    // Obtener los tipos de vehículos
    async obtenerTiposVehiculos() {
      try {
        //Consulta de tipos de vehículos
        const querySnapshot = await getDocs(collection(db, "tiposVehiculos"));
        this.tiposVehiculos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          descripcion: doc.id,
        }));
        this.error = null;
      } catch (error) {
        this.error = "Error al obtener los tipos de vehículos: " + error;
      }
    },

    // Obtener los servicios y sus precios
    async obtenerServicios() {
      try {
        const querySnapshot = await getDocs(collection(db, "Precios"));
        this.servicios = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          precios: doc.data().preciosPorTipo || {},
        }));
        this.error = null;
      } catch (error) {
        this.error = "Error al obtener los servicios: " + error;
      }
    },
  },
};
</script>
