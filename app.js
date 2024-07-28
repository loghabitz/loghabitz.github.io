import { initializeApp } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCvK-BdntgbpAj-CvY4IQAFPEro38ARjME",
    authDomain: "loghabitz.firebaseapp.com",
    projectId: "loghabitz",
    storageBucket: "loghabitz.appspot.com",
    messagingSenderId: "210868047620",
    appId: "1:210868047620:web:354ecf9d038405e8ad8a51",
    measurementId: "G-LSHVDT8VJL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', () => {
    const habitsContainer = document.getElementById('habitsContainer');
    const calendarContainer = document.getElementById('calendarContainer');
    const uploadModal = document.getElementById('uploadModal');
    const progressImageInput = document.getElementById('progressImage');
    const uploadButton = document.getElementById('uploadButton');
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    let currentUser = null;
    let currentHabitId = null;
    let selectedDay = null;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            loadHabits(user.uid); // Load habits when the user is authenticated
        } else {
            console.log("User is not signed in");
        }
    });

    async function loadHabits(userId) {
        habitsContainer.innerHTML = ''; // Clear existing habits
        const q = query(collection(db, "habits"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const habit = doc.data();
            const habitDiv = document.createElement('div');
            habitDiv.className = 'habit';
            habitDiv.textContent = habit.name;
            habitDiv.addEventListener('click', () => {
                currentHabitId = doc.id;
                loadCalendar(currentHabitId);
            });
            habitsContainer.appendChild(habitDiv);
        });
    }

    async function loadCalendar(habitId) {
        calendarContainer.innerHTML = ''; // Clear existing calendar
        const habitDoc = await getDoc(doc(db, "habits", habitId));
        if (habitDoc.exists()) {
            const habitData = habitDoc.data();
            for (let i = 1; i <= daysInMonth; i++) {
                const dayDiv = document.createElement('div');
                dayDiv.textContent = i;
                dayDiv.className = habitData.log && habitData.log[i] ? 'completed' : '';
                dayDiv.addEventListener('click', () => {
                    selectedDay = i;
                    handleDayClick(habitData.log, currentHabitId, selectedDay);
                });
                calendarContainer.appendChild(dayDiv);
            }
        }
    }

    async function handleDayClick(log, habitId, day) {
        if (log && log[day]) {
            loadImage(habitId, day);
        } else {
            openModal();
            uploadButton.onclick = async () => {
                if (progressImageInput.files.length > 0 && currentHabitId && selectedDay) {
                    const file = progressImageInput.files[0];
                    const storageRef = ref(storage, `progress_images/${currentUser.uid}/${currentHabitId}/${selectedDay}`);
                    await uploadBytes(storageRef, file);
                    const imageUrl = await getDownloadURL(storageRef);

                    const habitRef = doc(db, "habits", currentHabitId);
                    const habitDoc = await getDoc(habitRef);
                    const habitData = habitDoc.data();

                    if (!habitData.log) {
                        habitData.log = {};
                    }
                    habitData.log[selectedDay] = imageUrl;

                    await setDoc(habitRef, habitData, { merge: true });

                    uploadModal.style.display = 'none';
                    loadCalendar(currentHabitId); // Reload calendar to reflect the logged habit
                }
            };
        }
    }

    async function loadImage(habitId, day) {
        const storageRef = ref(storage, `progress_images/${currentUser.uid}/${habitId}/${day}`);
        try {
            const url = await getDownloadURL(storageRef);
            displayImage(url);
        } catch (error) {
            console.error("Error loading image: ", error);
            alert('No image found for this date.');
        }
    }

    function displayImage(url) {
        const imageElement = document.createElement('img');
        imageElement.src = url;
        imageElement.alt = 'Progress Image';
        imageElement.style.maxWidth = '100%';
        imageElement.style.maxHeight = '100%';
        const modalContent = uploadModal.querySelector('.modal-content');
        // Clear previous content except for the upload form
        modalContent.innerHTML = `<span class="close">&times;</span><h2>Upload Progress Picture</h2><input type="file" id="progressImage"><button id="uploadButton">Upload</button>`;
        modalContent.appendChild(imageElement);
        uploadModal.style.display = 'block';
    }

    function openModal() {
        uploadModal.style.display = 'block';
        document.querySelector('.close').onclick = () => {
            uploadModal.style.display = 'none';
        };
        window.onclick = (event) => {
            if (event.target == uploadModal) {
                uploadModal.style.display = 'none';
            }
        };
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target == uploadModal) {
            uploadModal.style.display = 'none';
        }
    });

    // Close modal when clicking the close button
    document.querySelector('.close').addEventListener('click', () => {
        uploadModal.style.display = 'none';
    });
});
