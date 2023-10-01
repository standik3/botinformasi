import express, { text } from "express";
import session from "express-session";
import dotEnv from "dotenv";
import cors from "cors";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";
import {
    initializeApp,
    applicationDefault
} from 'firebase-admin/app';
import {
    getMessaging
} from "firebase-admin/messaging";
import dialogflow from "dialogflow";
import { db } from "./firebase.js";
import { users, friends } from "./table.js";

dotEnv.config({
  path: './.env',
});

process.env.GOOGLE_APPLICATION_CREDENTIALS;

initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
});

const app = express();

// untuk cors
if (process.env.APP_STAGE === 'dev') {
  app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
  }));
} else {
  app.use(cors({
    origin: 'https://botinformasi.netlify.app',
    optionsSuccessStatus: 200
  }));
}

// untuk session
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET'
}));

// untuk json
app.use(express.json());

// untuk urlencoded
app.use(express.urlencoded({
  extended: false
}));

// untuk host
const port = process.env.PORT;
const host = "localhost";

app.listen(port, host, () => {
  console.log(`Server sedang berjalan pada http://${host}:${port}`);
});

// untuk home
app.get('/', function (req, res) {
  res.send('Hello World!');
});

// begin:: send message chat
app.post('/send/chat', async (req, res) => {
  const data = req.body;
  const user = await users();
  const friend = await friends();
  
  let dataUser = '';
  if (friend[0].id_receiver == data.uid) {
    dataUser = user.filter((user) => user.uid === friend[0].id_sender);
  } else if (friend[0].id_sender === data.uid) {
    dataUser = user.filter((user) => user.uid === friend[0].id_receiver);
  }

  // untuk cek token notification
  if (dataUser[0].token_notification != '') {
    const registrationToken = dataUser[0].token_notification;

    const message = {
      notification: {
        title: 'New Message',
        body: data.message,
      },
      token: registrationToken
    };

    const messaging = getMessaging();

    messaging.send(message).then((response) => {
      console.log('Successfully sent message: ', response);
    }).catch((error) => {
      console.log('Error sending message: ', error);
    });
  }

  const tableMessage = collection(db, "Friends/" + data.id + "/Messages");

  const addData = {
    uid: data.uid,
    message: data.message,
    created_at: serverTimestamp()
  }

  updateDoc(doc(db, "Friends", data.id), {
    seen: false,
    latest_message: data.message,
    latest_message_time: serverTimestamp()
  });

  addDoc(tableMessage, addData).then((docRef) => {
    console.log('Create data messages berhasil ' + docRef.id);

    res.status(200).send({
      status: true,
      message: "Berhasil",
      text: "Pesan Anda terkirim",
    });
  }).catch((error) => {
    console.log(error);
  });
});
// end:: send message chat

// begin:: send message group
app.post('/send/group', async (req, res) => {
  const data = req.body;
  const user = await users();

  const qryGroupMember = query(collection(db, "Groups/" + data.id + "/Members"), where("uid", "!=", data.uid));
  const resMembers = await getDocs(qryGroupMember);
  resMembers.docs.map((docMembers) => {
    // untuk cek token notification
    let dataUser = user.filter((user) => user.uid === docMembers.data().uid);
   
    if (dataUser[0].token_notification != '') {
      const registrationToken = dataUser[0].token_notification;

      const message = {
        notification: {
          title: 'New Message',
          body: data.message,
        },
        token: registrationToken
      };

      const messaging = getMessaging();

      messaging.send(message).then((response) => {
        console.log('Successfully sent message: ', response);
      }).catch((error) => {
        console.log('Error sending message: ', error);
      });
    }

    // untuk update seen
    if (docMembers.data().seen === true) {
      const docRef = doc(db, "Groups/" + data.id + "/Members", docMembers.id);
      updateDoc(docRef, {
        seen: false
      }).then(() => {
        console.log("Document successfully updated!");
      }).catch((error) => {
        console.error("Error updating document: ", error);
      });
    }
  });

  const tableMessage = collection(db, "Groups/" + data.id + "/Messages");

  const addData = {
    uid: data.uid,
    message: data.message,
    created_at: serverTimestamp()
  }

  updateDoc(doc(db, "Groups", data.id), {
      latest_message: data.message,
      latest_message_time: serverTimestamp()
  });

  addDoc(tableMessage, addData).then((docRef) => {
      console.log('Create data messages berhasil ' + docRef.id);

      res.status(200).send({
        status: true,
        message: "Berhasil",
        text: "Pesan Anda terkirim",
      });
  }).catch((error) => {
      console.log(error);
  });
});
// end:: send message group

// begin:: dialogflow
// untuk detect intent
app.post('/dialogflow/detect', (req, res) => {
  try {
    const data = req.body;

    const credentials = JSON.parse(process.env.DIALOGFLOW_CREDENTIALS);
    const projectId = credentials.project_id;
    const sessionId = process.env.DIALOGFLOW_SESSION_ID;
    const languageCode = 'id-ID';

    const config = {
      credentials: {
        private_key: credentials.private_key,
        client_email: credentials.client_email,
      }
    };

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient(config);
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: data.message,
          languageCode: languageCode,
        },
      },
      queryParams: {
        payload: {
          fields: {
            uid: {
              stringValue: data.uid
            },
            id: {
              stringValue: data.id
            }
          }
        }
      }
    };

    const tableMessage = collection(db, "Bots/" + data.id + "/Messages");

    const addData = {
      uid: data.uid,
      type: 'user',
      message: data.message,
      created_at: serverTimestamp()
    }

    updateDoc(doc(db, "Bots", data.id), {
      latest_message: data.message,
      latest_message_time: serverTimestamp()
    });

    addDoc(tableMessage, addData).then(async (docRef) => {
      await sessionClient.detectIntent(request);

      res.status(200).send({
        message: "Berhasil",
        text: "Berhasil pesan Anda dikirim ke firebase" + docRef.id
      });
    }).catch((error) => {
      res.status(400).send(error);
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// untuk webhook
app.post('/dialogflow/webhook', async (req, res) => {
  try {
    const data = req.body;
    const result = data.queryResult;
    const intent = data.originalDetectIntentRequest.payload;

    const tableMessage = collection(db, "Bots/" + intent.id + "/Messages");

    const addData = {
      uid: intent.uid,
      type: 'bot',
      message: result.fulfillmentText,
      created_at: serverTimestamp()
    };

    updateDoc(doc(db, "Bots", intent.id), {
      latest_message: result.fulfillmentText,
      latest_message_time: serverTimestamp()
    });

    addDoc(tableMessage, addData).then((docRef) => {
      res.status(200).send({
        message: "Berhasil",
        text: "Berhasil pesan Anda dikirim ke firebase" + docRef.id
      });
    }).catch((error) => {
      res.status(400).send(error);
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});
// end:: dialogflow