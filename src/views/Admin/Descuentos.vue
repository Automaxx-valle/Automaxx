<template>
  <div id="app" v-if="show == 6">
    <div class="container">
      <div class="home">
        <header>
          <h1>Descuentos</h1>
        </header>
        <section>
          <h2>Descuentos</h2>
          <p>
            En esta sección podrás gestionar los tipos de descuentos que se
            ofertan en el autolavado.
          </p>

          <div class="card">
            <!--Nuevo-->
            <form @submit.prevent="agregarTipoVehiculo">
              <div class="cardi doble-ancho f amarillo">
                <h3>Agregar un nuevo descuento</h3>
                <div class="horizontal">
                  <strong class="espacio-der">Nombre del descuento:</strong>
                  <input
                    v-model="nuevoTipo"
                    type="text"
                    placeholder="Ej. Garantía de Lluvia"
                    class="form-control espacio"
                    required
                  />
                </div>
                <div class="horizontal">
                  <strong class="espacio-der">Cantidad:</strong>
                  <input
                    v-model="nuevaDescripcion"
                    type="number"
                    placeholder="Ej. 100"
                    class="form-control espacio"
                    required
                  />
                </div>

                <button type="submit" class="btn button is-primary">
                  <strong>Agregar descuento</strong>
                </button>
              </div>
            </form>

            <!--Existentes-->
            <div class="cardi doble-ancho f amarillo">
              <h3>Tipos de descuentos:</h3>
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
                      type="number"
                      placeholder="Cantidad"
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
      nuevaDescripcion: null, // Descripción del nuevo tipo
      tiposVehiculos: [], // Lista de tipos de vehículos
      error: null,
    };
  },
  mounted() {
    this.obtenerTiposVehiculos();
  },
  methods: {
    //Numero valido
    validarDescuento(cantidad) {
      return (
        cantidad !== null && cantidad !== "" && !isNaN(cantidad) && cantidad > 0
      );
    },

    // Agregar un nuevo tipo de descuento con descripción
    async agregarTipoVehiculo() {
      if (
        !this.nuevoTipo.trim() ||
        !this.validarDescuento(this.nuevaDescripcion)
      ) {
        this.error = "Hay algún campo vacío o inválido.";
      } else {
        try {
          await setDoc(doc(db, "Descuentos", this.nuevoTipo.trim()), {
            cantidad: this.nuevaDescripcion,
          });
          //Muestra el nuevo descuento sin necesidad de una consulta a firebase
          this.tiposVehiculos.push({
            id: this.nuevoTipo,
            descripcion: this.nuevaDescripcion,
          });
          //Reinicia las variables
          this.nuevoTipo = null;
          this.nuevaDescripcion = null;
          this.error = null;
        } catch (error) {
          this.error = "Error al agregar el descuento: " + error;
        }
      }
    },

    // Modificar un descuento (nombre y descripción)
    async modificarTipoVehiculo(id, nuevaDescripcion) {
      if (!this.validarDescuento(nuevaDescripcion)) {
        this.error = "Cantidad inválida";
      } else {
        try {
          await setDoc(doc(db, "Descuentos", id.trim()), {
            cantidad: nuevaDescripcion,
          });
          this.error = null;
          this.$emit("correcto");
        } catch (error) {
          this.error = "Error al modificar el descuento: " + error;
        }
      }
    },

    // Obtener los tipos de vehículos
    async obtenerTiposVehiculos() {
      try {
        const querySnapshot = await getDocs(collection(db, "Descuentos"));
        this.tiposVehiculos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          descripcion: doc.data().cantidad,
        }));
        this.error = null;
      } catch (error) {
        this.error = "Error al obtener los descuentos: " + error;
      }
    },

    // Eliminar un tipo de vehículo
    async eliminarTipoVehiculo(id) {
      try {
        await deleteDoc(doc(db, "Descuentos", id.trim()));
        this.tiposVehiculos = this.tiposVehiculos.filter(desc => desc.id !== id);
        this.error = null;
      } catch (error) {
        this.error = "Error al eliminar el descuento: " + error;
      }
    },
  },
};
</script>
