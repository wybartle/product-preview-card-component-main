import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2v5Gc-VEbIIPQcNo3NW50o7cWX-OaTQU",
    authDomain: "maui-test-project.firebaseapp.com",
    databaseURL: "https://maui-test-project.firebaseio.com",
    projectId: "maui-test-project",
    storageBucket: "maui-test-project.firebasestorage.app",
    messagingSenderId: "1053260758577",
    appId: "1:1053260758577:web:03f8233ffc91e0b59e5f10"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export async function getArticleData():Promise<any> { 

  const postLogsCollectionRef = collection(db, 'PostLogs');

  const querySnapshot = await getDocs(postLogsCollectionRef);
  let keaolamaArticle:any;

  querySnapshot.forEach( (doc:any) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    if (doc.id === "keaolama-log") {
        keaolamaArticle = doc.data().mostRecentArticle;
    }
  });

  const myPromise = new Promise((resolve, reject) => {
    resolve(keaolamaArticle);
  });

  return myPromise
}
