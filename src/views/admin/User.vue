divdivdiv<script setup>
import Breadcrumb from "../../components/admin/Breadcrumb.vue";
</script>

<template>
    <!-- begin:: breadcrumb -->
    <Breadcrumb :crumbs="crumbs" />
    <!-- end:: breadcrumb -->

    <div class="w-full bg-white border rounded-lg p-4">
        <EasyDataTable buttons-pagination :headers="headers" :items="users" :rows-per-page="10">
            <template #item-active="{active}">
                <font-awesome-icon v-if="active === 'y'" icon="fa-solid fa-check" />
                <font-awesome-icon v-else icon="fa-solid fa-times" />
            </template>

            <template #item-action="{uid, report, active}">
                <div v-if="report >= 1">
                    <button v-if="active === 'y'"
                        class="bg-red-500 btn-sm hover:bg-red-700 text-white font-medium px-3 py-2 rounded-lg"
                        @click="blockUser(uid)">Block</button>
                    <button v-else
                        class="bg-green-500 btn-sm hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg"
                        @click="blockUser(uid)">Open</button>
                </div>
            </template>
        </EasyDataTable>
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
            headers: [
                {text: "id", value: "id"},
                {text: "uid", value: "uid"},
                {text: "name", value: "name"},
                {text: "email", value: "email"},
                {text: "active", value: "active"},
                {text: "action", value: "action"},
            ],
        }
    },
    methods: {
        async getData() {
            const tblUsers = collection(db, 'Users');
            const qryUsers = query(tblUsers);
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
