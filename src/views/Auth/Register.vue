<template>
  <div id="app" v-if="show == 1">
    <div class="container">
      <div class="home">
        <header>
          <h1>Usuarios</h1>
        </header>

        <section>
          <h2>Usuarios</h2>
          <p>
            En esta sección podrás registrar nuevos usuarios, así como gestionar
            los roles de los usuarios que se encuentren registrados en el
            servidor de Firebase Auth.
          </p>
          <p>
            Si deseas eliminar un usuario, debes hacerlo desde aquí (para
            eliminar su rol) y en el servidor de Firebase Auth (para eliminarlo
            completamente). Si deseas reestablecer la constraseña de un usuario,
            debes acceder directamente al servidor de Firebase Auth.
          </p>

          <div class="card">
            <!--Registrar-->
            <div class="cardi doble-ancho f amarillo">
              <p>
                <strong class="espacio-der"
                  >NOTA IMPORTANTE: Recuerda que al registrar al usuario, tu
                  sesión cambiará por la del usuario nuevo.</strong
                >
              </p>
              <form @submit.prevent="registrarUsuario" class="f">
                <input
                  v-model="nombre"
                  type="text"
                  placeholder="Nombre del usuario"
                  class="form-control espacio"
                  required
                />
                <input
                  v-model="email"
                  type="email"
                  placeholder="Correo del usuario"
                  class="form-control espacio"
                  required
                />
                <input
                  v-model="password"
                  type="password"
                  placeholder="Contraseña"
                  class="form-control espacio"
                  required
                />
                <select class="form-control" v-model="rol" required>
                  <option value="1">Administrador</option>
                  <option value="2">Cajero</option>
                  <option value="3">Ticketero</option>
                </select>
                <button type="submit" class="btn button is-primary">
                  Registrar Usuario
                </button>
              </form>
            </div>

            <!--Modificar-->
            <div class="cardi doble-ancho f amarillo">
              <div class="card" v-for="usuario in usuarios" :key="usuario.id">
                <p><strong>ID:</strong> {{ usuario.id }}</p>
                <p><strong>Nombre:</strong> {{ usuario.nombre }}</p>
                <div class="horizontal">
                  <select
                    v-model="usuario.rol"
                    @change="actualizarRol(usuario)"
                    class="form-control"
                  >
                    <option value="1">Administrador</option>
                    <option value="2">Cajero</option>
                    <option value="3">Ticketero</option>
                  </select>
                  <button
                    @click="eliminarUsuario(usuario.id)"
                    class="btn button is-primary"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>

            <!--Ir a firebase-->
            <div class="cardi doble-ancho f amarillo">
              <p>
                <strong class="espacio-der"
                  >NOTA IMPORTANTE: Recuerda que para eliminar completamente a
                  un usuario debes quitarlo directamente del servidor.</strong
                >
              </p>
              <a
                class="btn button is-primary"
                href="https://console.firebase.google.com/u/0/project/autolavado-8cbe3/authentication/users?hl=es-419"
                target="_blank"
                >Acceder al panel de Firebase Auth</a
              >
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>

  <dialog-component
    :show="showModal"
    :opc="opcion"
    :mess="message"
    @close="closeModal"
  ></dialog-component>
</template>

<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import db from "../../firebase/init.js";
import DialogComponent from "../../components/layout/Modal.vue";

export default {
  components: {
    DialogComponent,
  },
  props: {
    show: Number,
  },
  data() {
    return {
      //modal
      showModal: false,
      opcion: null,
      message: null,
      //registrar usuario
      email: null,
      password: null,
      nombre: null,
      rol: null,
      //modificar usuarios
      usuarios: [],
    };
  },
  name: "Register",
  mounted() {
    this.obtenerUsuarios();
  },
  methods: {
    //Modal
    openModal(opc, mess) {
      this.showModal = true;
      this.opcion = opc;
      this.message = mess;
    },
    closeModal() {
      this.showModal = false;
    },

    //Validaciones
    validarInfo() {
      return (
        !this.email ||
        !this.password ||
        !this.nombre ||
        !this.validarRol(this.rol)
      );
    },
    validarRol(rol) {
      return rol !== null && rol !== "" && !isNaN(rol) && rol > 0 && rol < 4;
    },

    //Registrar usuario
    async registrarUsuario() {
      if (this.validarInfo()) {
        this.openModal(0, "Por favor, completa todos los campos correctamente");
      } else {
        try {
          const userCredential = await firebase
            .auth()
            .createUserWithEmailAndPassword(this.email, this.password);

          //Almacenar al recien creado usuario en una variable
          const user = userCredential.user;

          // Guardar el nombre en Firebase Authentication
          await user.updateProfile({
            displayName: this.nombre,
          });

          // Agregar el usuario a la colección "Usuarios" en Firestore
          await db
            .collection("Usuarios")
            .doc(user.uid)
            .set({
              nombre: this.nombre,
              rol: String(this.rol),
            });

          // Limpiar los campos del formulario
          this.email = null;
          this.password = null;
          this.nombre = null;
          this.rol = null;
        } catch (error) {
          this.openModal(0, error.message);
        }
      }
    },

    // Obtener todos los usuarios
    async obtenerUsuarios() {
      try {
        const snapshot = await db.collection("Usuarios").get();
        this.usuarios = snapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
          rol: doc.data().rol,
        }));
      } catch (error) {
        this.openModal(0, error.message);
      }
    },

    // Actualizar el rol de un usuario
    async actualizarRol(usuario) {
      if (!this.validarRol(usuario.rol)) {
        try {
          await db
            .collection("Usuarios")
            .doc(usuario.id)
            .update({
              rol: String(usuario.rol),
            });
        } catch (error) {
          this.openModal(0, error.message);
        }
      } else {
        this.openModal(0, "Rol inválido");
      }
    },

    // Eliminar usuario
    async eliminarUsuario(userId) {
      try {
        await db.collection("Usuarios").doc(userId).delete();
        //Actualiza la lista de usuarios sin necesidad de recargar la página
        this.usuarios = this.usuarios.filter(
          (usuario) => usuario.id !== userId
        );
        this.openModal(
          6,
          "Recuerda que para eliminar completamente al usuario, debes hacerlo directamente desde el servidor de Firebase Auth"
        );
      } catch (error) {
        this.openModal(0, error.message);
      }
    },
  },
};
</script>
