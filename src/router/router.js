import { createRouter, createWebHashHistory, RouterLink } from 'vue-router'

//importar las rutas de las vistas
import HomeView from '../views/Otras_vistas/HomeView.vue'
import Login from '../views/Auth/Login.vue'
import Dashboard from '../views/Reportes/Dashboard.vue'
import Update from '../views/Auth/Update.vue'
import UpdateSecret from '@/views/Auth/UpdateSecret.vue'
import Ingresar from '../views/Ingresar/Ingresar.vue'
import Cobrar from '../views/Cobrar/Cobrar.vue'
import Listo from '../views/Otras_vistas/Listo.vue'
import Panel from '../views/Admin/Panel.vue'
import Gastos from '@/views/Otras_vistas/Gastos.vue'

//importar Firebase para recuperar el usuario y darle acceso al Dashboard
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      requireAuth: true
    }
  },
  {
  path: '/update',
  name: 'update',
  component: Update,
  meta: {
    requireAuth: true
  }
},
{
  path: '/updateSecret',
  name: 'updateSecret',
  component: UpdateSecret,
  meta: {
    requireAuth: true
  }
},
{
  path: '/Ingresar',
  name: 'Ingresar',
  component: Ingresar,
  meta: {
    requireAuth: true
  }
},
{
  path: '/Cobrar',
  name: 'Cobrar',
  component: Cobrar,
  meta: {
    requireAuth: true
  }
},
{
  path: '/Listo',
  name: 'Listo',
  component: Listo,
  meta: {
    requireAuth: true
  }
},
{
  path: '/Panel',
  name: 'Panel',
  component: Panel,
  meta: {
    requireAuth: true
  }
},
{
  path: '/Gastos',
  name: 'Gastos',
  component: Gastos,
  meta: {
    requireAuth: true
  }
},
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

//solo permitir el acceso si se ha iniciado sesión
router.beforeEach((to, from, next) => {
  if(to.matched.some(ruta=>ruta.meta.requireAuth)){
    const user = firebase.auth().currentUser;
    if(user){
      next();
    }else{
      next({
        name: 'login'
      })
    }
  }else{
    next();
  }
})

export default router;