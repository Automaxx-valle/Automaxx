<template>
  <section>
    <h2>Cortesías</h2>

    <div class="card">
      <!--Nuevo-->
      <form @submit.prevent="agregarCortesias">
        <div class="cardi doble-ancho f amarillo">
          <h3>Agregar cortesías</h3>
          <div class="horizontal">
            <strong class="espacio-der">Cantidad de cortesías:</strong>
            <input
              v-model="nuevoTipo"
              type="number"
              placeholder="Ej. 10"
              class="form-control espacio"
              required
            />
          </div>
          <div class="horizontal">
            <strong class="espacio-der">Descripción:</strong>
            <input
              v-model="nuevaDescripcion"
              type="text"
              placeholder="Ej. Empresa x"
              class="form-control espacio"
            />
          </div>

          <button type="submit" class="btn button is-primary">
            <strong>Generar cortesías</strong>
          </button>
        </div>
      </form>
      <!--Spinner de carga-->
      <div v-if="cargando" class="spinner"></div>

      <!--Existentes-->
      <div class="cardi doble-ancho f amarillo">
        <h3>Cortesías aún sin canjear:</h3>
        <div class="doble-ancho f">
          <ul>
            <div
              v-for="(grupo, descripcion) in gruposVehiculosOrdenados"
              :key="descripcion"
            >
              <hr />
              <li>
                <h3>Cortesías para {{ descripcion }}: {{ grupo.length }}</h3>
              </li>

              <li v-for="tipo in grupo" :key="tipo.id" class="horizontal">
                <strong class="espacio-der">{{ tipo.id }}</strong>
                <input
                  v-model="tipo.descripcion"
                  type="text"
                  placeholder="Descripción"
                  class="form-control espacio"
                />
                <div class="horizontal">
                  <button
                    @click="modificarTipoVehiculo(tipo.id, tipo.descripcion)"
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
            </div>
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
  writeBatch,
} from "firebase/firestore";

export default {
  data() {
    return {
      nuevoTipo: "", // Nombre del nuevo tipo de vehículo
      nuevaDescripcion: "", // Descripción del nuevo tipo
      tiposVehiculos: [], // Lista de tipos de vehículos
      nuevosTipos: [],
      gruposVehiculos: {},
      gruposVehiculosOrdenados: {},
      error: null,
      cargando: false,
    };
  },
  mounted() {
    this.obtenerTiposVehiculos();
  },
  methods: {
    //Numero valido
    validarNumero(cantidad) {
      return (
        cantidad !== null && cantidad !== "" && !isNaN(cantidad) && cantidad > 0
      );
    },

    // Agrega n cortesias con su descripción
    async agregarCortesias() {
      this.cargando = true;

      // Valida que la cantidad de cortesías sea válida
      if (!this.validarNumero(this.nuevoTipo)) {
        this.error = "Debe agregar al menos un documento.";
      } else {
        // Crear un batch para operación en lote y almacenar los nuevos registros localmente
        const batch = writeBatch(db);
        const nuevosTipos = [];

        // Intantar subir los n registros a la base de datos
        try {
          for (let i = 1; i <= this.nuevoTipo; i++) {
            // Genera ID's unicos con 1ms de diferencia
            await new Promise((resolve) => setTimeout(resolve, 1));
            const idCorto = (
              Date.now().toString(36) +
              Math.random().toString(36).substring(2, 5)
            ).substring(0, 8);

            const nuevoDocRef = doc(collection(db, "Cortesias"), idCorto);
            batch.set(nuevoDocRef, {
              descripcion: this.nuevaDescripcion,
            });

            // Agregar a los nuevos registros al arreglo local
            nuevosTipos.push({
              id: idCorto,
              descripcion: this.nuevaDescripcion,
            });
          }

          // Ejecuta la operación en lote
          await batch.commit(); 

          // Insertar los nuevos elementos en el arreglo global sin recargar Firebase y se agrupan
          this.tiposVehiculos.push(...nuevosTipos);
          this.agruparVehiculos();

          // Limpiar variables
          this.nuevoTipo = null;
          this.nuevaDescripcion = null;
          this.error = null;
        } catch (error) {
          this.error = "Error al agregar cortesías: " + error;
        }
      }
      this.cargando = false;
    },

    // Modificar un tipo de vehículo (nombre y descripción)
    async modificarTipoVehiculo(id, nuevaDescripcion) {
      try {
        await setDoc(doc(db, "Cortesias", id.trim()), {
          descripcion: nuevaDescripcion.trim(),
        });
        this.error = null;
        this.agruparVehiculos();
      } catch (error) {
        this.error = "Error al modificar la cortesía: " + error;
      }
    },

    // Obtener los tipos de vehículos
    async obtenerTiposVehiculos() {
      this.cargando = true;
      try {
        const querySnapshot = await getDocs(collection(db, "Cortesias"));
        this.tiposVehiculos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          descripcion: doc.data().descripcion || "",
        }));
        this.error = null;
        this.agruparVehiculos();
      } catch (error) {
        this.error = "Error al obtener las cortesías: " + error;
      }
      this.cargando = false;
    },

    //Agrupar los tipos de cortesías
    agruparVehiculos() {
      // Agrupar por descripción
      const grupos = this.tiposVehiculos.reduce((acc, tipo) => {
        if (!acc[tipo.descripcion]) acc[tipo.descripcion] = [];
        acc[tipo.descripcion].push(tipo);
        return acc;
      }, {});
      // Convertir objeto en array, ordenarlo y volverlo a convertir en objeto
      this.gruposVehiculosOrdenados = Object.fromEntries(
        Object.entries(grupos).sort((a, b) => a[1].length - b[1].length)
      );
    },

    // Eliminar un tipo de vehículo
    async eliminarTipoVehiculo(id) {
      try {
        await deleteDoc(doc(db, "Cortesias", id.trim()));
        this.error = null;

        // Se elimina del arreglo local y se vuelven a agrupar los elementos restantes
        this.tiposVehiculos = this.tiposVehiculos.filter(
          (tipo) => tipo.id !== id
        );
        this.agruparVehiculos();
      } catch (error) {
        this.error = "Error al eliminar la cortesía: " + error;
      }
    },
  },
};
</script>
