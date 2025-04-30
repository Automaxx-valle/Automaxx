<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand" v-if="rol">
      <router-link to="/">
        <img src="@/components/assets/logo_al.png" class="logo" />
      </router-link>

      <a
        role="button"
        class="navbar-burger"
        @click.prevent="toggleMenu"
        :class="{ 'is-active': isOpen }"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div
      id="navbarBasicExample"
      class="navbar-menu"
      :class="{ 'is-active': isOpen }"
    >
      <div class="navbar-end">
        <div class="navbar-item">
          <template v-if="user">
            <div class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link"> {{ user.displayName || user.email }} </a>
              <div class="navbar-dropdown">
                <!--Ingreso de vehiculos-->
                <router-link
                  class="navbar-item"
                  to="/Ingresar"
                  v-if="rol == 1 || rol == 3"
                >
                  <i class="fa fa-car"></i>
                  <span class="espacio-izq">Ingresar un vehículo</span>
                </router-link>
                <!--Cobrar-->
                <router-link
                  class="navbar-item"
                  to="/Cobrar"
                  v-if="rol > 0 && rol < 3"
                >
                  <i class="fa fa-credit-card"></i>
                  <span class="espacio-izq">Cobrar</span>
                </router-link>
                <!--Gastos-->
                <router-link
                  class="navbar-item"
                  to="/Gastos"
                  v-if="rol > 0 && rol < 3"
                >
                  <i class="fa fa-balance-scale"></i>
                  <span class="espacio-izq">Gastos</span>
                </router-link>
                <!--Lista de vehículos-->
                <router-link class="navbar-item" to="/Listo" v-if="rol > 0">
                  <i class="fa fa-check"></i>
                  <span class="espacio-izq">Lista de vehículos</span>
                </router-link>
                <!--Panel de administrador-->
                <router-link class="navbar-item" to="/Panel" v-if="rol == 1">
                  <i class="fa fa-id-badge"></i>
                  <span class="espacio-izq">Panel administrador</span>
                </router-link>
                <!--Dashboard-->
                <router-link
                  class="navbar-item"
                  to="/dashboard"
                  v-if="rol == 1"
                >
                  <i class="fa fa-bug"></i>
                  <span class="espacio-izq">Reportes</span>
                </router-link>
                <!--Update-->
                <router-link class="navbar-item" to="/update">
                  <i class="fa fa-user-circle"></i>
                  <span class="espacio-izq">Actualizar perfil</span>
                </router-link>
                <!--Cerrar sesión-->
                <a class="navbar-item" @click.prevent="logout">
                  <i class="fa fa-window-close"></i>
                  <span class="espacio-izq underline-on-hover"
                    >Cerrar sesión</span
                  ></a
                >
              </div>
              <p class="white">aaaaaaaaa</p>
            </div>
          </template>

          <template v-else>
            <div class="buttons">
              <!--<router-link class="button is-light" to="/register">
                <strong>Registrarme</strong>
              </router-link>-->
              <router-link class="button btn-primary" to="/login">
                Iniciar sesión
              </router-link>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
//importar firebase para saber cuando el usuario inicia sesion
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import db from "../../firebase/init.js";

export default {
  //atributos o propieddaes del componente
  data() {
    return {
      isOpen: false,
      user: null,
      rol: -1,
    };
  },
  //métodos del componente
  methods: {
    toggleMenu() {
      const status = !this.isOpen;
      this.isOpen = status;
    },
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.rol = -1;
          this.$router.push({ name: "login" });
        });
    },
    asignarRol() {
      const collectionRef = db.collection("Usuarios");
      const docRef = collectionRef.doc(this.user.uid);
      docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            this.rol = doc.data().rol;
          }
        })
        .catch((err) => {
          this.error = err.message;
        });
    },
  },
  //ciclo de vida, es cuando se crea el componente
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
        this.asignarRol();
      } else {
        this.user = null;
      }
    });
  },
};
</script>
