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
                  <strong class="espacio-der">Tipo de descuento:</strong>
                  <select
                    v-model="tipoDescuento"
                    class="form-control espacio"
                    required
                  >
                    <option disabled value="">Selecciona tipo</option>
                    <option value="fijo">Cantidad fija ($)</option>
                    <option value="porcentaje">Porcentaje (%)</option>
                  </select>
                </div>

                <div class="horizontal">
                  <strong class="espacio-der">
                    {{
                      tipoDescuento === "porcentaje"
                        ? "Porcentaje:"
                        : "Cantidad:"
                    }}
                  </strong>
                  <input
                    v-model.number="nuevaDescripcion"
                    type="number"
                    :placeholder="
                      tipoDescuento === 'porcentaje' ? 'Ej. 50' : 'Ej. 100'
                    "
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
                    <p
                      class="espacio-izq espacio-der"
                      v-if="tipo.tipo == 'porcentaje'"
                    >
                      {{ tipo.descripcion }}%
                    </p>
                    <p class="espacio-izq espacio-der" v-else>
                      ${{ tipo.descripcion }}
                    </p>
                    <button
                      @click="eliminarTipoVehiculo(tipo.id)"
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
      nuevoTipo: "", // Nombre del nuevo tipo de vehículo
      nuevaDescripcion: null, // Descripción del nuevo tipo
      tipoDescuento: null,  // Tipo de descuento, cantidad o porcentaje
      tiposVehiculos: [], // Lista de tipos de vehículos
      error: null,
    };
  },
  mounted() {
    this.obtenerTiposVehiculos();
  },
  methods: {
    //Numero valido
    validarDescuento(valor) {
      if (this.tipoDescuento === "porcentaje") {
        return valor > 0 && valor <= 100;
      } else if (this.tipoDescuento === "fijo") {
        return valor > 0;
      }
      return false;
    },

    // Agregar un nuevo tipo de descuento con descripción
    async agregarTipoVehiculo() {
      if (
        !this.nuevoTipo?.trim() ||
        !this.validarDescuento(this.nuevaDescripcion) ||
        !this.tipoDescuento
      ) {
        this.error = "Hay algún campo vacío o inválido.";
      } else {
        try {
          await setDoc(doc(db, "Descuentos", this.nuevoTipo.trim()), {
            cantidad: this.nuevaDescripcion,
            tipo: this.tipoDescuento, // "fijo" o "porcentaje"
          });

          // Mostrar el nuevo descuento sin necesidad de consultar Firebase
          this.tiposVehiculos.push({
            id: this.nuevoTipo.trim(),
            descripcion: this.nuevaDescripcion,
            tipo: this.tipoDescuento,
          });

          // Reiniciar variables
          this.nuevoTipo = null;
          this.nuevaDescripcion = null;
          this.tipoDescuento = null;
          this.error = null;
        } catch (error) {
          this.error = "Error al agregar el descuento: " + error;
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
          tipo: doc.data().tipo,
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
        this.tiposVehiculos = this.tiposVehiculos.filter(
          (desc) => desc.id !== id
        );
        this.error = null;
      } catch (error) {
        this.error = "Error al eliminar el descuento: " + error;
      }
    },
  },
};
</script>
