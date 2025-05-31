<template>
  <transition name="fade">
    <div class="modal-overlay" v-if="show"></div>
  </transition>

  <transition name="fade">
    <div class="home mooodal" v-if="show">
      <header>
        <h1>Total a pagar</h1>
      </header>

      <section v-if="show">
        <h3>Costo de los servicios: ${{ subtotal }}</h3>
        <h3>Descuento: ${{ descuento }}</h3>
        <h3>Lo que se va a pagar: ${{ total }}</h3>
        <form class="f">
          <!--Descuentos-->
          <button
            class="btn button btn-primary"
            type="button"
            @click="obtenerDescuentos"
            v-if="descuentos.length < 1"
          >
            <strong>
              <i class="fa fa-shopping-basket espacio-der"></i>
              Agregar descuento
            </strong>
          </button>
          <div class="card" v-if="descuentos.length > 0">
            Posibles descuentos a aplicar:
            <ul>
              <li v-for="(item, index) in descuentos" :key="index">
                <input
                  type="checkbox"
                  class="mycheck espacio-der"
                  :checked="seleccionados[index]"
                  @change="cambiarEstado(index)"
                />
                <strong v-if="item.tipo == 'porcentaje'"
                  >{{ item.id }}: {{ item.valor }}%</strong
                >
                <strong v-if="item.tipo == 'fijo'"
                  >{{ item.id }}: ${{ item.valor }}</strong
                >
              </li>
            </ul>
          </div>

          <!--Subir la información-->
          <button
            class="btn button btn-primary"
            type="button"
            @click="correcto"
            :disabled="deshabilitado"
          >
            <strong>
              <i class="fa fa-upload espacio-der"></i>
              Cargar datos al servidor
            </strong>
          </button>

          <!--Cerrar el modal de pago-->
          <button class="btn button btn-primary" @click="cerrar" type="button">
            <strong>
              <i class="fa fa-arrow-left espacio-der"></i>
              Regresar
            </strong>
          </button>
        </form>

        <!--Error en el inicio de sesión-->
        <div class="error" v-if="error">
          <hr />
          <div class="notification is-danger">
            {{ error }}
          </div>
        </div>
      </section>
    </div>
  </transition>
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
    subtotal: Number,
    vehiculo: String,
  },
  data() {
    return {
      //costos
      descuentos: [],
      seleccionados: [],
      descuento: 0,
      total: this.subtotal,
      //error
      error: null,
      deshabilitado: false,
    };
  },
  name: "Pago",
  watch: {
    show() {
      this.obtenerTotal();
    },
  },
  methods: {
    // Obtener los descuentos
    async obtenerDescuentos() {
      //Limpiar variables
      this.descuentos = [];
      this.descuento = 0;

      //Hacer la consulta a Firebase
      try {
        const querySnapshot = await getDocs(collection(db, "Descuentos"));
        if (querySnapshot.empty) {
          // No hay documentos en la colección
          this.error =
            "No hay descuentos disponibles. Solicita al usuario administrador que agregue algunos desde el panel de administrador.";
        } else {
          // Sí hay documentos
          this.descuentos = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            valor: doc.data().cantidad,
            tipo: doc.data().tipo,
          }));
          this.error = null;
          this.igualar();
        }
      } catch (error) {
        this.error = "Error al obtener los descuentos: " + error;
      }
    },

    // Igualar la longitud de seleccionados con descuentos
    igualar() {
      this.seleccionados = [];
      for (let i = 0; i < this.descuentos.length; i++) {
        this.seleccionados.push(false);
      }
    },

    // Seleccionar los descuentos
    cambiarEstado(index) {
      // Si el descuento está activo lo desactiva
      let opcion = true;
      if (this.seleccionados[index] == true) {
        opcion = false;
      }
      // Si el descuento no está activo, lo activa, desactivando los demás primero
      this.igualar();
      if(opcion){
        this.seleccionados[index] = !this.seleccionados[index];
      }
      // Se actualiza el total con el descuento correspondiente
      this.obtenerTotal();
    },

    //Obtener costo total del serivicio
    obtenerTotal() {
      this.descuento = 0;
      for (let i = 0; i < this.seleccionados.length; i++) {
        if (this.seleccionados[i]) {
          if(this.descuentos[i].tipo == 'porcentaje'){
            this.descuento = (this.total * this.descuentos[i].valor) / 100;
          }else{
            this.descuento = this.descuentos[i].valor;
          }
          break;
        }
      }
      this.total = this.subtotal - this.descuento;
    },

    //Seguir con el pago
    correcto() {
      this.deshabilitado = true;
      if (this.total >= 0) {
        this.error = null;
        this.$emit("pago", this.descuento);
      } else {
        this.error = "El descuento no puede superar al total";
      }
    },

    //Regresar y cancelar pago
    cerrar() {
      this.seleccionados = [];
      this.$emit("close");
    },
  },
};
</script>
