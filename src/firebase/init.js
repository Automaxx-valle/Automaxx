//importar firebase para que se haga la conexion
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
    
// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBCpjFaK1S3YWMtccf-oe4wKtEurlkg4kA",
    authDomain: "automaxx-valle.firebaseapp.com",
    projectId: "automaxx-valle",
    storageBucket: "automaxx-valle.appspot.com",
    messagingSenderId: "175796764668",
    appId: "1:175796764668:web:4cf448eae93057ffa3fc79"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig);
//firebaseApp.firestore().settings({timestampsInSnapshots:true});

export default firebaseApp.firestore();

//Santamargarita#4360