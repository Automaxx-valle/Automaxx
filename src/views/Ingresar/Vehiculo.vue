<template>
  <!--Datos del vehiculo-->
  <section v-if="show">
    <h2>Datos del vehículo</h2>

    <div class="card">
      <div class="espacio-en-medio">
        <!--Placas-->
        <div class="cardi">
          <div class="horizontal">
            <img src="../../components/assets/placas.jpg" class="search" />
            <div class="col-xs-6 mr-auto mt-auto mb-auto">
              Ingresa las <b>placas</b> del vehículo.
              <input
                class="form-control"
                v-model="placas"
                type="text"
                placeholder="Ej. JJP183"
                required
              />
            </div>
          </div>
        </div>

        <!--Modelo-->
        <div class="cardi">
          <div class="horizontal">
            <img src="../../components/assets/modelo.jpg" class="search" />
            <div class="col-xs-6 mr-auto mt-auto mb-auto">
              Ingresa el <b>modelo</b> del vehículo.
              <input
                class="form-control"
                v-model="modelo"
                type="text"
                placeholder="Ej. PORSHE 911S"
                required
              />
            </div>
          </div>
        </div>

        <!--Tipo de vehículo-->
        <div class="cardi">
          <div class="horizontal">
            <img src="../../components/assets/vehiculo.jpg" class="search" />
            <div class="col-xs-6 mr-auto mt-auto mb-auto">
              Selecciona el tipo de <b>vehículo</b>.
              <select
                class="form-control"
                v-model="tipo"
                @change="filtrarPrecios"
                required
              >
                <option
                  v-for="(tipo, index) in tiposVehiculos"
                  :key="tipo.id"
                  :value="tipo.id"
                >
                  {{ tipo.id.toUpperCase() }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!--Servicios-->
  <section v-if="show">
    <h2>Servicios</h2>
    <div class="card">
      <p v-if="servicios[0] == null">
        Los servicios aperecerán al seleccionar el tipo de vehículo.
      </p>
      <ul>
        <li v-for="(item, index) in servicios" :key="index">
          <input
            type="checkbox"
            class="mycheck espacio-der"
            @change="cambiarEstado(index)"
          />
          <strong>{{ item.id }}: </strong>${{ item.precio }}
        </li>
      </ul>
    </div>
  </section>

  <section v-if="show">
    <h2>Datos para el equipo</h2>
    <div class="card">
      <div class="espacio-en-medio">
        <!--Datos para el equipo-->
        <div class="cardi">
          <div class="horizontal">
            <img src="../../components/assets/lavado.jpg" class="search" />
            <div class="col-xs-6 mr-auto mt-auto mb-auto">
              Selecciona el <b>equipo</b> que se encargará de antender a este
              vehículo
              <select class="form-control" v-model="equipo">
                <option
                  v-for="equipo in equipos"
                  :key="equipo.id"
                  :value="equipo.id"
                >
                  {{ equipo.id }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!--Observaciones-->
        <div class="cardi">
          <div class="horizontal">
            <img src="../../components/assets/nota.png" class="search" />
            <div class="col-xs-6 mr-auto mt-auto mb-auto">
              <b>Observaciones adicionales</b> para quienes atenderán al
              vehículo.
              <input class="form-control" v-model="observacion" type="text" />
            </div>
          </div>
        </div>

        <!--Costo extra-->
        <div class="cardi">
          <div class="horizontal">
            <img src="../../components/assets/desc.png" class="search" />
            <div class="col-xs-6 mr-auto mt-auto mb-auto">
              Si el servicio genera un <b>costo extra</b> respecto a los costos
              previos, se puede incluir en este apartado.
              <input
                class="form-control"
                v-model="extra"
                type="number"
                @wheel.prevent
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!--Generar el ID-->
  <section v-if="show">
    <h2>Ingresar el vehículo</h2>
    <div class="card">
      <form class="f">
        <button
          class="btn button btn-primary"
          type="button"
          @click="regresar"
          :disabled="!formIsValid"
        >
          <strong>
            <i class="fa fa-id-badge espacio-der"></i>
            Ingresar el vehículo
          </strong>
        </button>
      </form>
    </div>
  </section>
</template>

<script>
//importar firebase
import "firebase/compat/auth";
import "firebase/compat/firestore";
import db from "../../firebase/init.js";
import { getDocs, collection } from "firebase/firestore";

export default {
  props: {
    show: Boolean,
  },
  data() {
    return {
      //lecturas desde firebase
      tiposVehiculos: [],
      servicios: [],
      equipos: [],
      todosLosPrecios: [],
      //vehiculo
      placas: null,
      tipo: null,
      modelo: null,
      equipo: null,
      seleccionados: [],
      observacion: "",
      extra: 0,
    };
  },
  name: "Vehiculo",
  mounted() {
    this.obtenerTiposVehiculos();
    this.obtenerTodosLosPrecios();
    this.obtenerEquipos();
  },
  watch: {
    extra() {
      this.$emit("aviso", 1);
    },
  },
  methods: {
    // Obtener los tipos de vehículos
    async obtenerTiposVehiculos() {
      try {
        const querySnapshot = await getDocs(collection(db, "tiposVehiculos"));
        this.tiposVehiculos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          descripcion: doc.data().descripcion || "",
        }));
      } catch (error) {
        this.$emit("aviso", 0, error);
      }
    },

    //Leer todos los precios y filtrarlos localmente
    async obtenerTodosLosPrecios() {
      try {
        const querySnapshot = await getDocs(collection(db, "Precios"));
        this.todosLosPrecios = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          preciosPorTipo: doc.data().preciosPorTipo || {}, // Asegura que siempre hay un objeto
        }));
      } catch (error) {
        this.$emit("aviso", 0, error);
      }
    },
    filtrarPrecios() {
      this.servicios = this.todosLosPrecios
        .map((item) => ({
          id: item.id,
          precio: item.preciosPorTipo[this.tipo] || null,
        }))
        .filter((item) => item.precio !== null);
    },

    // Obtener los equipos
    async obtenerEquipos() {
      try {
        const querySnapshot = await getDocs(collection(db, "Equipos"));
        this.equipos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
        }));
      } catch (error) {
        this.$emit("aviso", 0, error);
      }
    },

    // Seleccionar los servicios
    cambiarEstado(index) {
      this.seleccionados[index] = !this.seleccionados[index];
    },

    //Enviar la informacion al componente padre
    regresar() {
      //Validar que no se haya ingresado una cantidad negativa en el costo extra
      if (this.extra < 0) {
        this.$emit(
          "aviso",
          0,
          "El costo extra tiene una cantidad menor que cero"
        );
      } else {
        //Calcular el costo total de los servicios seleccionados
        let total = 0;
        let nombresSeleccionados = [];
        let preciosSeleccionados = [];

        for (let i = 0; i < this.seleccionados.length; i++) {
          if (this.seleccionados[i]) {
            total += this.servicios[i].precio;
            nombresSeleccionados.push(this.servicios[i].id);
            preciosSeleccionados.push(this.servicios[i].precio);
          }
        }

        //Si hay costo extra se agrega a los servicios
        if (this.extra > 1) {
          total += this.extra;
          nombresSeleccionados.push("COSTO EXTRA");
          preciosSeleccionados.push(this.extra);
        }
        //Empaquetar la información
        const data = [
          this.placas,
          this.tipo,
          this.modelo,
          this.equipo,
          this.observacion ? this.observacion.toString() : "",
        ];
        if (this.formIsValid) {
          this.$emit(
            "close",
            total,
            data,
            nombresSeleccionados,
            preciosSeleccionados
          );
        } else {
          this.$emit("aviso", 0, "Hay algún campo inválido");
        }
      }
    },
  },
  computed: {
    formIsValid() {
      const haySeleccionado = this.seleccionados.some((item) => item === true);
      return !!this.placas && !!this.tipo && !!this.equipo && haySeleccionado;
    },
  },
};
</script>
