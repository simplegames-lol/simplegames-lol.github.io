import {getApp,getApps,initializeApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
// Every account module can start independently; never depend on script fetch order.
export const app=getApps().length?getApp():initializeApp({apiKey:'AIzaSyDzJu7zyLTZWwffbS5wcxAGym5orePvNKg',authDomain:'simplegames-23c2c.firebaseapp.com',projectId:'simplegames-23c2c',storageBucket:'simplegames-23c2c.firebasestorage.app',messagingSenderId:'993873419513',appId:'1:993873419513:web:14e22dfff6d7f0c7051628',measurementId:'G-NC81W7MYG0'});
