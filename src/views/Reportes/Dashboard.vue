<template>
  <div id="app" v-if="user">
    <div class="container">
      <div class="home">
        <header>
          <h1>Reportes del autolavado</h1>
        </header>

        <!--Gráfico-->
        <section>
          <h2>Vehículos ingresados por mes</h2>
          <BarChart />
        </section>

        <!--Cortes de caja-->
        <CorteCaja></CorteCaja>
        <CorteMensual></CorteMensual>
      </div>
    </div>
  </div>
</template>

<script>
//Importar el grafico
import BarChart from "./BarChart.vue";
import CorteCaja from "./CorteCaja.vue";
import CorteMensual from "./CorteMensual.vue";

//Importar firebase
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import db from "../../firebase/init.js";

export default {
  name: "Dashboard",
  components: { BarChart, CorteCaja, CorteMensual },
  data() {
    return {
      user: null,
    };
  },
  mounted() {
    this.identificarUsuario();
  },
  methods: {
    //Usuario firebase
    identificarUsuario() {
      const user = firebase.auth().currentUser;
      if (user) {
        this.buscarRol(user.uid, user.displayName);
      } else {
        this.$router.push({ name: "home" });
      }
    },
    buscarRol(id, user) {
      const collectionRef = db.collection("Usuarios");
      const docRef = collectionRef.doc(id);
      docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            if (doc.data().rol != 1) {
              this.$router.push({ name: "home" });
            } else {
              this.user = id;
            }
          } else {
            this.$router.push({ name: "home" });
          }
        })
        .catch((err) => {
          this.$router.push({ name: "home" });
        });
    },
  },
};
</script>

<style>
@import url(https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css);
@import url(https://use.fontawesome.com/releases/v5.0.13/css/all.css);
</style>
