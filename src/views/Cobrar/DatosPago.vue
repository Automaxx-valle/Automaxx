<template>
  <section v-if="this.info">
    <div v-if="this.total > 0">
      <h2>Datos del pago</h2>
      <form class="f" enctype="multipart/form-data">
        <!--Cantidad-->
        <div class="cardi">
          <div class="horizontal">
            <img src="@/components/assets/total.png" class="search" />
            <div class="col-xs-6 mr-auto mt-auto mb-auto">
              Ingresa la <b>cantidad</b> a pagar del vehículo. Se deben
              <b>${{ total }}.</b>
              <input
                class="form-control"
                v-model="pagado"
                type="number"
                placeholder="Cantidad"
                :disabled="medio == 'Cortesía'"
              />
            </div>
          </div>
        </div>

        <!--Medio-->
        <div class="cardi">
          <div class="horizontal">
            <img src="@/components/assets/metodo.png" class="search" />
            <div class="col-xs-6 mr-auto mt-auto mb-auto">
              Selecciona el medio de <b>pago</b>.
              <select class="form-control" v-model="medio">
                <option v-for="tipo in tipos" :key="tipo.id" :value="tipo.id">
                  {{ tipo.id }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!--Validar cortesía-->
        <div class="cardi" v-if="medio == 'Cortesía'">
          <div class="horizontal">
            <img src="@/components/assets/desc.png" class="search" />
            <div class="col-xs-6 mr-auto mt-auto mb-auto">
              Ingresa el <b>folio</b> de la cortesía.
              <input
                class="form-control"
                v-model="cortesia"
                type="text"
                placeholder="Folio"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
    <div v-else>
      <h2>El vehículo no tiene ningún adeudo</h2>
      <p>
        Se liquidó el pago el día {{ this.fecha_pago }} a
        {{ this.info.usuario_pagaron }}
      </p>
    </div>
  </section>

  <!--Entregado-->
  <section v-if="this.info">
    <div v-if="!this.info.ya_entregado">
      <h2>Entregado</h2>
      <div class="card">
        <ul>
          <li>
            <input type="checkbox" class="mycheck" v-model="entregado_a" />
            <span>¿entregado?</span>
          </li>
          <li v-if="this.total < 1">
            <form class="f">
              <button
                class="btn button btn-primary"
                type="submit"
                @click="entregarVehiculo()"
                :disabled="!this.entregado_a"
              >
                <strong>
                  <i class="fa fa-upload espacio-der"></i>
                  Cargar datos al servidor
                </strong>
              </button>
            </form>
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <h2>El vehículo ya fue entregado a su dueño</h2>
      <p>
        Se entregó el vehículo el día {{ this.fecha_entrega }} por
        {{ this.info.usuario_entrego }}
      </p>
    </div>
  </section>

  <!--Actualizar los parámetros-->
  <section v-if="this.total > 0">
    <h2>Enviar los datos</h2>
    <form class="f">
      <button
        class="btn button btn-primary"
        type="submit"
        @click="validarCortesia"
        :disabled="!pagado || !medio"
      >
        <strong>
          <i class="fa fa-upload espacio-der"></i>
          Proceder con el pago
        </strong>
      </button>
    </form>
  </section>
</template>

<script>
//importar firebase
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import db from "../../firebase/init.js";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";

export default {
  props: {
    id: String,
    day: Number,
    info: Object,
    user: String,
  },
  data() {
    return {
      //info a llenar
      pagado: null,
      medio: null,
      cortesia: null,
      entregado_a: false,
      //tipos de pagos
      total: 0,
      tipos: [],
      //fechas
      fecha_pago: null,
      fecha_entrega: null,
    };
  },
  name: "DatosPago",
  watch: {
    //Se activa cuando detecta un cambio en info
    info() {
      if (this.info) {
        this.total = this.info.total - this.info.pagado - this.info.descuento;
        this.guardarInfo();
        if (this.total > 0) {
          this.obtenerTiposPagos();
        }
      }
    },
    //Se activa cuando detecta un cambio en medio
    medio(newVal) {
      if (newVal === "Cortesía") {
        this.pagado = this.total;
      }
    },
  },
  methods: {
    //Obtener los tipos de pagos
    obtenerTiposPagos() {
      getDocs(collection(db, "Pagos"))
        .then((querySnapshot) => {
          this.tipos = querySnapshot.docs.map((doc) => ({
            id: doc.id,
          }));
        })
        .catch((error) => {
          this.$emit("aviso", 0, error);
        });
    },

    //Guardar en las variables la info correspondiente del vehiculo
    guardarInfo() {
      //Revisar si ya esta pagado
      if (this.total == 0) {
        const date = new Date(this.info.fecha_pago.seconds * 1000);
        this.fecha_pago = date.toLocaleString();
      }

      //Revisar si ya fue entregado
      if (this.info.ya_entregado) {
        const date = new Date(this.info.fecha_entrega.seconds * 1000);
        this.fecha_entrega = date.toLocaleString();
      }
    },

    //Validar el folio de la cortesía
    async validarCortesia() {
      if (this.cortesia) {
        if (this.pagado == this.total) {
          try {
            const docRef = doc(db, "Cortesias", this.cortesia);
            const docSnapshot = await getDoc(docRef);

            //Si encuentra la cortesía la elimina
            if (docSnapshot.exists()) {
              await deleteDoc(docRef);
              this.enviar();
            } else {
              this.$emit("aviso", 0, "El folio ya fue canjeado o no existe");
            }
          } catch (error) {
            this.$emit(
              "aviso",
              0,
              "No fue posible canjear la cortesía. " + error
            );
          }
        } else {
          this.$emit("aviso", 0, "El total no coincide con lo pagado");
        }
      } else {
        this.enviar();
      }
    },

    //Regresar la informacion al componente padre
    enviar() {
      if (this.pagado <= this.total && this.medio) {
        if (this.entregado_a) {
          this.entregarVehiculo();
        }
        this.$emit("regreso", this.pagado, this.medio);
      } else {
        this.$emit(
          "aviso",
          0,
          "La cantidad que se va a pagar es mayor que lo que el cliente debe"
        );
      }
    },

    //Entregar el vehiculo
    entregarVehiculo() {
      if (this.pagado == this.total) {
        const docRef = db.collection(this.day).doc(this.id);
        docRef
          .update({
            ya_entregado: this.entregado_a,
            usuario_entrego: this.user,
            fecha_entrega: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            this.$emit("aviso", 3, "éxito!");
          })
          .catch((err) => {
            this.$emit("aviso", 0, err.message);
          });
      } else {
        this.$emit(
          "aviso",
          0,
          "No se puede entregar el vehículo porque aún tiene un adeudo"
        );
      }
    },
  },
};
</script>
