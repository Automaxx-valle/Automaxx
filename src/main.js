import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'

//importar firebase para saber cuando el usuario inicia sesion
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

//importar bulma sass
import 'bulma/css/bulma.css';

/*crear una sola instancia de la aplicacion
(sin esto, se pueden crear muchas aplicaciones, se puede recargar la página o se puede generar un 
comportamiento inesperado)
con esto, cada que se inicie o cierre sesión, no se va a crear una nueva instancia de la aplicación*/

let app = null;
firebase.auth().onAuthStateChanged(()=>{
    if(!app){
        app = createApp(App).use(router).mount('#app')
    }
});