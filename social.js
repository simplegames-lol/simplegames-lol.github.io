import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  createUserWithEmailAndPassword, deleteUser, getAuth, onAuthStateChanged,
  signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit,
  onSnapshot, orderBy, query, runTransaction, serverTimestamp, setDoc,
  updateDoc, where, writeBatch
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzJu7zyLTZWwffbS5wcxAGym5orePvNKg",
  authDomain: "simplegames-23c2c.firebaseapp.com",
  projectId: "simplegames-23c2c",
  storageBucket: "simplegames-23c2c.firebasestorage.app",
  messagingSenderId: "993873419513",
  appId: "1:993873419513:web:14e22dfff6d7f0c7051628",
  measurementId: "G-NC81W7MYG0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const $ = (selector) => document.querySelector(selector);
const panel = $("#social-panel");
const authView = $("#auth-view");
const socialView = $("#social-view");
const status = $("#social-status");
let profile = null;
let activeFriend = null;
let stopProfile = () => {};
let stopRequests = () => {};
let stopFriends = () => {};
let stopMessages = () => {};

function showStatus(message = "", error = false) {
  status.textContent = message;
  status.style.color = error ? "#ff8585" : "#ffcb65";
}

function friendlyError(error) {
  const messages = {
    "auth/email-already-in-use": "That email already has an account.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Wait a bit and try again.",
    "auth/weak-password": "The password must contain at least 6 characters."
  };
  return messages[error.code] || error.message || "Something went wrong.";
}

$("#account-open").addEventListener("click", () => { panel.hidden = false; showStatus(); });
$("#social-close").addEventListener("click", () => { panel.hidden = true; });
panel.addEventListener("click", (event) => { if (event.target === panel) panel.hidden = true; });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") panel.hidden = true; });

function showAuth(mode) {
  $("#login-form").hidden = mode !== "login";
  $("#signup-form").hidden = mode !== "signup";
  $("#login-tab").setAttribute("aria-pressed", String(mode === "login"));
  $("#signup-tab").setAttribute("aria-pressed", String(mode === "signup"));
  showStatus();
}
$("#login-tab").addEventListener("click", () => showAuth("login"));
$("#signup-tab").addEventListener("click", () => showAuth("signup"));
showAuth("login");

$("#signup-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const username = String(data.get("username")).trim();
  const usernameLower = username.toLowerCase();
  const email = String(data.get("email")).trim();
  const password = String(data.get("password"));
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) return showStatus("Username must be 3–20 letters, numbers, or underscores.", true);
  if (password.length < 6) return showStatus("Password must contain at least 6 characters.", true);
  showStatus("Creating account…");
  let credential;
  let profileCreated = false;
  try {
    credential = await createUserWithEmailAndPassword(auth, email, password);
    await runTransaction(db, async (transaction) => {
      const usernameRef = doc(db, "usernames", usernameLower);
      const usernameDoc = await transaction.get(usernameRef);
      if (usernameDoc.exists()) {
        const linkedUser = await transaction.get(doc(db, "users", usernameDoc.data().uid));
        if (linkedUser.exists()) throw new Error("That username is already taken.");
      }
      transaction.set(usernameRef, { uid: credential.user.uid, username });
      transaction.set(doc(db, "users", credential.user.uid), { username, usernameLower, createdAt: serverTimestamp() });
    });
    profileCreated = true;
    profile = { username, usernameLower };
    authView.hidden = true;
    socialView.hidden = false;
    $("#profile-username").textContent = `@${username}`;
    $("#account-open").textContent = username;
    listenForRequests(credential.user.uid);
    listenForFriends(credential.user.uid);
    form.reset();
    showStatus("Account created.");
  } catch (error) {
    if (credential?.user && !profileCreated) await deleteUser(credential.user).catch(() => {});
    showStatus(friendlyError(error), true);
  }
});

$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  showStatus("Logging in…");
  try {
    await signInWithEmailAndPassword(auth, String(data.get("email")).trim(), String(data.get("password")));
    form.reset();
    showStatus();
  } catch (error) { showStatus(friendlyError(error), true); }
});
$("#sign-out").addEventListener("click", () => signOut(auth));

function pairId(a, b) { return [a, b].sort().join("_"); }
function itemRow(name, actions = []) {
  const row = document.createElement("div");
  row.className = "social-list-item";
  const label = document.createElement("span");
  label.textContent = name;
  row.append(label, ...actions);
  return row;
}
function actionButton(text, handler) {
  const button = document.createElement("button");
  button.className = "secondary-button";
  button.type = "button";
  button.textContent = text;
  button.addEventListener("click", handler);
  return button;
}

function listenForRequests(uid) {
  stopRequests();
  stopRequests = onSnapshot(query(collection(db, "friendRequests"), where("toUid", "==", uid)), async (snapshot) => {
    const list = $("#request-list");
    list.replaceChildren();
    const pending = snapshot.docs.filter((entry) => entry.data().status === "pending");
    if (!pending.length) return list.append(Object.assign(document.createElement("p"), { textContent: "No requests" }));
    for (const request of pending) {
      const requestData = request.data();
      const sender = await getDoc(doc(db, "users", requestData.fromUid));
      const name = sender.data()?.username || "Unknown user";
      const accept = actionButton("Accept", async () => {
        const friendshipId = pairId(uid, requestData.fromUid);
        const batch = writeBatch(db);
        batch.update(request.ref, { status: "accepted", respondedAt: serverTimestamp() });
        batch.set(doc(db, "friendships", friendshipId), { members: [uid, requestData.fromUid], createdAt: serverTimestamp() });
        await batch.commit().catch((error) => showStatus(friendlyError(error), true));
      });
      const decline = actionButton("Decline", () => updateDoc(request.ref, { status: "declined", respondedAt: serverTimestamp() }));
      list.append(itemRow(name, [accept, decline]));
    }
  }, (error) => showStatus(friendlyError(error), true));
}

function listenForFriends(uid) {
  stopFriends();
  stopFriends = onSnapshot(query(collection(db, "friendships"), where("members", "array-contains", uid)), async (snapshot) => {
    const list = $("#friend-list");
    list.replaceChildren();
    if (snapshot.empty) return list.append(Object.assign(document.createElement("p"), { textContent: "No friends yet" }));
    for (const friendship of snapshot.docs) {
      const otherUid = friendship.data().members.find((member) => member !== uid);
      const other = await getDoc(doc(db, "users", otherUid));
      if (!other.exists()) continue;
      const friend = { uid: otherUid, username: other.data().username, friendshipId: friendship.id };
      const open = actionButton(friend.username, () => openChat(friend));
      open.classList.add("friend-button");
      list.append(itemRow("", [open]));
    }
  }, (error) => showStatus(friendlyError(error), true));
}

$("#friend-search").addEventListener("submit", async (event) => {
  event.preventDefault();
  const requestedName = String(new FormData(event.currentTarget).get("username")).trim().toLowerCase();
  if (requestedName.length < 3) return showStatus("Enter the exact username.", true);
  try {
    const match = await getDoc(doc(db, "usernames", requestedName));
    if (!match.exists()) return showStatus("No user has that exact username.", true);
    const targetUid = match.data().uid;
    if (targetUid === auth.currentUser.uid) return showStatus("You cannot add yourself.", true);
    if ((await getDoc(doc(db, "blocks", `${auth.currentUser.uid}_${targetUid}`))).exists() || (await getDoc(doc(db, "blocks", `${targetUid}_${auth.currentUser.uid}`))).exists()) return showStatus("This friend request cannot be sent.", true);
    if ((await getDoc(doc(db, "friendships", pairId(auth.currentUser.uid, targetUid)))).exists()) return showStatus("You are already friends.");
    await setDoc(doc(db, "friendRequests", `${auth.currentUser.uid}_${targetUid}`), { fromUid: auth.currentUser.uid, toUid: targetUid, status: "pending", createdAt: serverTimestamp() });
    event.currentTarget.reset();
    showStatus(`Friend request sent to ${match.data().username}.`);
  } catch (error) { showStatus(friendlyError(error), true); }
});

function openChat(friend) {
  activeFriend = friend;
  $("#chat-title").textContent = friend.username;
  $("#chat-actions").hidden = false;
  $("#message-form").hidden = false;
  const chatId = pairId(auth.currentUser.uid, friend.uid);
  stopMessages();
  stopMessages = onSnapshot(query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"), limit(100)), (snapshot) => {
    const list = $("#message-list");
    list.replaceChildren();
    if (snapshot.empty) list.append(Object.assign(document.createElement("p"), { textContent: "No messages yet. Say hi!" }));
    snapshot.forEach((messageDoc) => {
      const data = messageDoc.data();
      const bubble = document.createElement("div");
      bubble.className = `message${data.senderId === auth.currentUser.uid ? " mine" : ""}`;
      const text = document.createElement("span");
      text.textContent = data.text;
      const time = document.createElement("small");
      time.textContent = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "Sending…";
      bubble.append(text, time);
      list.append(bubble);
    });
    list.scrollTop = list.scrollHeight;
  }, (error) => showStatus(friendlyError(error), true));
}

$("#message-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeFriend) return;
  const field = event.currentTarget.elements.message;
  const text = field.value.trim();
  if (!text || text.length > 500) return;
  const chatId = pairId(auth.currentUser.uid, activeFriend.uid);
  try {
    await setDoc(doc(db, "chats", chatId), { members: [auth.currentUser.uid, activeFriend.uid], updatedAt: serverTimestamp(), lastMessage: text.slice(0, 80) }, { merge: true });
    await addDoc(collection(db, "chats", chatId, "messages"), { senderId: auth.currentUser.uid, text, createdAt: serverTimestamp() });
    field.value = "";
  } catch (error) { showStatus(friendlyError(error), true); }
});

$("#block-user").addEventListener("click", async () => {
  if (!activeFriend || !confirm(`Block ${activeFriend.username}? You will no longer be friends.`)) return;
  await setDoc(doc(db, "blocks", `${auth.currentUser.uid}_${activeFriend.uid}`), { blockerUid: auth.currentUser.uid, blockedUid: activeFriend.uid, createdAt: serverTimestamp() });
  await deleteDoc(doc(db, "friendships", pairId(auth.currentUser.uid, activeFriend.uid))).catch(() => {});
  activeFriend = null;
  stopMessages();
  $("#chat-title").textContent = "Select a friend";
  $("#chat-actions").hidden = true;
  $("#message-form").hidden = true;
  $("#message-list").textContent = "User blocked.";
});

$("#report-user").addEventListener("click", async () => {
  if (!activeFriend) return;
  const reason = prompt(`Why are you reporting ${activeFriend.username}?`);
  if (!reason?.trim()) return;
  await addDoc(collection(db, "reports"), { reporterUid: auth.currentUser.uid, reportedUid: activeFriend.uid, reason: reason.trim().slice(0, 500), createdAt: serverTimestamp() });
  showStatus("Report sent. Thank you.");
});

onAuthStateChanged(auth, async (user) => {
  stopProfile(); stopRequests(); stopFriends(); stopMessages();
  activeFriend = null;
  if (!user) {
    profile = null;
    authView.hidden = false;
    socialView.hidden = true;
    $("#account-open").textContent = "Log in";
    return;
  }
  authView.hidden = true;
  socialView.hidden = false;
  $("#profile-username").textContent = "Loading username…";
  $("#account-open").textContent = "Account";
  stopProfile = onSnapshot(doc(db, "users", user.uid), (profileDoc) => {
    if (!profileDoc.exists()) return;
    profile = profileDoc.data();
    $("#profile-username").textContent = `@${profile.username}`;
    $("#account-open").textContent = profile.username;
  });
  listenForRequests(user.uid);
  listenForFriends(user.uid);
});
