<template>
  <div class="container">
    <div class="columns">
      <div class="column is-6 is-offset-3">
        <h3 class="title is-3">Actualiza tu cuenta</h3>
        <hr />
        <form action="#" @submit.prevent="update">
          <div class="field">
            <label class="label">Nombre</label>
            <div class="control">
              <input
                class="input"
                type="text"
                placeholder="e.g Alex Smith"
                v-model="name"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Correo</label>
            <div class="control">
              <input
                class="input"
                type="text"
                placeholder="e.g Alex Smith"
                v-model="email"
                readonly
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Contraseña</label>
            <div class="control">
              <input class="input" type="password" v-model="password" />
            </div>
          </div>
          <div class="field">
            <label class="label">Servidor</label>
            <div class="control">
              <input class="input" type="password" v-model="servidor" />
            </div>
          </div>
          <br /><button
            type="submit"
            class="button is-primary"
            :disabled="!formIsValid"
          >
            Actualizar
          </button>
        </form>

        <!--No se pudo actualizar-->
        <div class="error" v-if="error">
          <hr />
          <div class="notification is-danger">
            {{ error }}
          </div>
        </div>

        <!--Sí pudo-->
        <div class="alert" v-if="good">
          <hr />
          <div class="alert alert-primary alert-dismissible fade show">
            ¡Actualización registrada con éxito!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      servidor: "",
      error: "",
      good: false,
    };
  },
  name: "Update",
  mounted() {
    this.identificarUsuario();
  },
  methods: {
    identificarUsuario() {
      const user = firebase.auth().currentUser;
      if (user) {
        this.name = user.displayName;
        this.email = user.email;
      } else {
        this.$router.push({ name: "dashboard" });
      }
    },
    update() {
      if (this.name && this.password) {
        if (this.servidor == "AXEL2002") {
          const user = firebase.auth().currentUser;

          if (user) {
            // Actualizar el perfil del usuario con el nuevo nombre
            user
              .updateProfile({
                displayName: this.name,
              })
              .then(() => {
                // Actualizar la contraseña del usuario
                return user.updatePassword(this.password);
              })
              .then(() => {
                this.name = "";
                this.password = "";
                this.email = "";
                this.good = true;

                setTimeout(() => {
                  // Recargar la página para visualizar el cambio
                  window.location.reload();
                }, 1000);
              })
              .catch((err) => {
                this.error = err.message;
              });
          } else {
            this.error = "No hay usuario autenticado.";
          }
        }
      } else {
        this.error = "Todos los campos son requeridos";
      }
    },
  },
  computed: {
    formIsValid() {
      return !!this.name || !!this.password;
    },
  },
};
</script>
