<template>
  <transition name="fade">
    <div class="modal-overlay" v-if="show"></div>
  </transition>

  <transition name="fade">
    <div class="home mooodal" v-if="show">
      <header>
        <h1>{{ titles[opc] }}</h1>
      </header>
      <span
        >{{ descriptions[opc] }}
        <i
          ><u>{{ mess }}</u> </i
        >.
      </span>

      <!--Enlace cuando se elimina un usuario-->
      <a
        href="https://console.firebase.google.com/u/0/project/autolavado-8cbe3/authentication/users?hl=es-419"
        target="_blank"
        v-if="opc == 6"
      >
        Firebase Auth.
      </a>

      <!--Formulario del modal-->
      <form class="f">
        <!--Recargar la pagina al cerrar el modal-->
        <button
          class="btn button btn-primary"
          @click="ref"
          type="button"
          v-if="mess == 'éxito!'"
        >
          Aceptar
        </button>

        <!--Cerrar normalmente el modal-->
        <button
          class="btn button btn-primary"
          @click="closeModal"
          type="button"
          v-else
        >
          <strong v-if="opc == 9">Cancelar</strong>
          <strong v-else>Aceptar</strong>
        </button>

        <!--Aceptar cuando se quiere eliminar un mes-->
        <button
          class="btn button btn-primary"
          @click="eliminarColeccion"
          type="button"
          v-if="opc == 9"
        >
          <strong>Eliminar</strong>
        </button>
      </form>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    show: Boolean,
    opc: Number,
    mess: String,
  },
  data() {
    return {
      titles: [
        //Error
        "¡Error!", //(0)
        //Ingresar
        "Aviso", //(1)
        "Registro exitoso", //(2)
        //Ingresar, cobrar y gastos
        "Registro exitoso", //(3)
        "Clave de seguridad", //(4)
        //Cobrar
        "Vehículo reconocido", //(5)
        //Panel
        "Correcto", //(6)
        "Modificación", //(7)
        "Búsqueda sin éxito", //(8)
        "Confirmación", //(9) (ya no se usó)
        //Listo
        "Estatus actualizado", //(10)
        "Importante", //(11)
      ],
      descriptions: [
        //Error
        "El servidor devolvió un error a la solicitud. ", //(0)
        //Ingresar
        "Se ha modificado el costo extra", //(1)
        "El cliente fue registrado con éxito en el servidor", //(2)
        //Ingresar, cobrar y gastos
        "¡Información registrada con ", //(3)
        "Ahora ingresa la clave del ", //(4)
        //Cobrar
        "El vehículo fue reconocido exitosamente", //(5)
        //Panel
        "Usuario eliminado con éxito", //(6)
        "La información se modificó correctamente", //(7)
        "No se encontró al vehículo buscado en ninguno de los 31 días del mes", //(8)
        "¿Seguro que desea vacíar este mes?", //(9) (ya no se usó)
        //Listo
        "El vehículo se marcó como ", //(10)
        "El vehículo que se está entregando aún no ha sido pagado en su totalidad. Solicite al cliente realizar el pago correspondiente para poder liberar el vehículo", //(11)
      ],
    };
  },
  methods: {
    descuento() {
      this.$emit("cierto");
    },
    ref() {
      this.$emit("ref");
    },
    closeModal() {
      this.$emit("close");
    },
    eliminarColeccion() {
      this.$emit("eliminar");
    },
  },
};
</script>
