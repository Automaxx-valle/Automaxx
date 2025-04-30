//importar firebase para que se haga la conexion
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
    
// Your web app's Firebase configuration
/*const firebaseConfig = {
    apiKey: "AIzaSyCW5woX6JQAi7B5gN-uSAri7dqh08ocdNg",
    authDomain: "autolavado-8cbe3.firebaseapp.com",
    projectId: "autolavado-8cbe3",
    storageBucket: "autolavado-8cbe3.appspot.com",
    messagingSenderId: "1047342986521",
    appId: "1:1047342986521:web:7664e927029eabe1f0c188",
    measurementId: "G-H7ZSLNN3WL"
  };*/
  const firebaseConfig = {
    apiKey: "AIzaSyBCpjFaK1S3YWMtccf-oe4wKtEurlkg4kA",
    authDomain: "automaxx-valle.firebaseapp.com",
    projectId: "automaxx-valle",
    storageBucket: "automaxx-valle.firebasestorage.app",
    messagingSenderId: "175796764668",
    appId: "1:175796764668:web:4cf448eae93057ffa3fc79"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig);
firebaseApp.firestore().settings({timestampsInSnapshots:true});

export default firebaseApp.firestore();