<template>
  <div class="container">
    <div class="home">
      <header>
        <h1>Autolavado maxx</h1>
      </header>

      <section>
        <h2>PÁGINA DE INICIO.</h2>
        <p>Inicia sesión para acceder al sistema.</p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeView",
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Open+Sans&display=swap");

/* HOMEVIEW Y GENERAL */
.home {
  margin: 0;
  font-family: "Open Sans", sans-serif;
  font-size: 16px;
  line-height: 1.5;
  background-color: #eeeeee;
  text-align: justify;
  padding-bottom: 10px;
}

.home h1,
.home h2,
.home h3,
.home span,
.mooodal a {
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  text-transform: uppercase;
}

.home p,
.home ul {
  font-family: "Montserrat", sans-serif;
  font-weight: 500;
  text-transform: none;
  margin-bottom: 20px;
  color: gray;
}

.home header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  color: #fff;
  background-color: #fac400;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  overflow: hidden;
}

.home h1 {
  font-size: 36px;
  text-align: center;
  color: #fff;
}

.home h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.home h3 {
  font-size: 18px;
  color: black;
}

.home section {
  margin: 10px;
  padding: 20px;
  padding-top: 10px;
  width: 100%;
}

.home li {
  margin-bottom: 10px;
  color: gray;
  margin-left: 10px;
}

.home span {
  font-size: 16px;
  margin-left: 30px;
  color: #333;
}

.f {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  margin: 10px;
  width: 80%;
}

.espacio-en-medio {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

/* Ingresar */
.cardi {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 350px;
  transition: transform 0.3s, box-shadow 0.3s;
  padding: 16px;
  margin-right: 15px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.cardi:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.cardi-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.horizontal {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  align-items: center;
}

.search {
  width: 150px;
  height: 100px;
  margin-right: 30px;
  margin-bottom: 10px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.form-control {
  margin-top: 5px;
}

.mycheck {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  background-color: #e40d0d;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  width: 24px;
  height: 24px;
  appearance: none;
  border: 2px solid #444444;
  background-position: 0 -2rem;
  background-size: 100%;
  background-repeat: no-repeat;
  transition: all 0.3s ease-in-out;
}
.mycheck:checked {
  background-color: rgb(75, 156, 13);
  color: rgb(75, 156, 13);
  background-position: 0 0;
}

.mycheck:focus {
  border-color: rgb(0, 0, 0);
}

/* DASHBOARD */
.container {
  margin-bottom: 10px;
}

.card {
  height: 50%;
  width: 95% - 10px;
  margin: 20px;
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* NAVIGATION */
.logo {
  height: 80px;
  margin: 10px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.logo:hover {
  transform: translateY(-5px);
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2);
}

.white {
  color: white;
  background-color: white;
}

.underline-on-hover:hover {
  text-decoration: underline;
  color: black;
}

.espacio {
  margin-bottom: 10px;
}

.espacio-izq {
  margin-left: 15px;
}

.espacio-der {
  margin-right: 5px;
}

.input-group {
  display: flex;
  align-items: center;
}

.cincuenta {
  width: 50%;
  margin: 0px;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
}

.mooodal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  box-shadow: 3px 3px rgba(0, 0, 0, 0.4);
  z-index: 101;
}

/* PANEL ADMINISTRADOR */
.doble-ancho {
  width: 100%;
}

.contenedor {
  display: flex; /* Activa Flexbox */
  flex-wrap: wrap; /* Permite que los elementos pasen a la siguiente línea */
  gap: 10px; /* Espacio entre elementos */
  list-style: none; /* Quita los puntos de la lista */
  padding: 0; /* Elimina el padding predeterminado */
  margin: 0; /* Elimina el margen predeterminado */
}

.contenedor li {
  background-color: #448aff;
  border-radius: 10px;
  padding: 10px;
  flex: 1 1 calc(30% - 10px); /* Distribuye en 3 columnas con espacio entre ellos */
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.floating-button {
  position: fixed;
  bottom: 80px;
  right: 40px;
  width: 50px;
  height: 50px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 9999; /* 🔥 Asegura que el botón esté por encima de todo */
}

.floating-button:hover {
  background-color: #0056b3;
  transform: translateY(-5px);
  box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.3);
}

/* PANEL DE ADMINISTRADOR Y LISTO */
.amarillo {
  background-color: #fac400;
}

/* CORTESIAS */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 10px auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* FOOTER */
footer {
  font-size: 14px;
  color: gray;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #f2f2f2;
  padding: 10px;
  text-align: center;
}
</style>
