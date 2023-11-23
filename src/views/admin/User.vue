divdivdiv<script setup>
import Breadcrumb from "../../components/admin/Breadcrumb.vue";
</script>

<template>
    <!-- begin:: breadcrumb -->
    <Breadcrumb :crumbs="crumbs" />
    <!-- end:: breadcrumb -->

    <div class="w-full bg-white border rounded-lg p-4">
        <table class="table-auto w-full text-center">
            <thead>
                <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Id</th>
                    <th>Report</th>
                    <th>Active</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in users" :key="row.id">
                    <td>{{ row.name }}</td>
                    <td>{{ row.email }}</td>
                    <td>{{ row.id }}</td>
                    <td>{{ row.report }}</td>
                    <td>
                        <font-awesome-icon v-if="row.active === 'y'" icon="fa-solid fa-check" />
                        <font-awesome-icon v-else icon="fa-solid fa-times" />
                    </td>
                    <td>
                        <div v-if="row.report >= 1">
                            <button v-if="row.active === 'y'" class="bg-red-500 btn-sm hover:bg-red-700 text-white font-medium px-3 py-2 rounded-lg" @click="blockUser(row.uid)">Block</button>
                            <button v-else class="bg-green-500 btn-sm hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg" @click="blockUser(row.uid)">Open</button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { db } from "../../firebase";
import {
    collection,
    query,
    getDocs,
    onSnapshot,
    where,
    getCountFromServer, 
    orderBy,
    updateDoc,
    doc,
} from "firebase/firestore";

export default {
    name: 'User',
    data() {
        return {
            crumbs: [
                { 'link': '/admin/dashboard', 'name': 'Dashboard' },
                { 'link': '#', 'name': 'User' },
            ],
            users: [],
        }
    },
    methods: {
        async getData() {
            const tblUsers = collection(db, 'Users');
            const qryUsers = query(tblUsers, orderBy('uid', 'asc'));
            const getUsers = await getDocs(qryUsers);

            if (!getUsers.empty) {
                onSnapshot(qryUsers, (snapshot) => {
                    this.users = [];
                    snapshot.docs.forEach(async doc => {
                        const tblReport = collection(db, "Reports");
                        const qryReport = query(tblReport, where("uid", "==", doc.data().uid));
                        const resReport = await getCountFromServer(qryReport)

                        this.users.push({
                            id: doc.id,
                            uid: doc.data().uid,
                            name: doc.data().name,
                            email: doc.data().email,
                            active: doc.data().active,
                            report: resReport.data().count
                        });
                    });
                });
            } else {
                console.log('No matching documents.');
            }
        },
        async blockUser(uid) {
            const tblUsers = collection(db, 'Users');
            const qryUsers = query(tblUsers, where('uid', '==', uid));
            const getUsers = await getDocs(qryUsers);

            getUsers.forEach(async row => {
                const docRef = doc(db, "Users/" + row.id);

                let active = (row.data().active === 'y' ? 'n' : 'y'); 

                updateDoc(docRef, {
                    active: active
                }).then(() => {
                    console.log("Document successfully updated!");
                }).catch((error) => {
                    console.error("Error updating document: ", error);
                });
            });
        }
    },
    mounted() {
        this.getData();
    },
}
</script>
