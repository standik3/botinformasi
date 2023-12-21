<script setup>
import Breadcrumb from "../../components/admin/Breadcrumb.vue";
</script>

<template>
    <!-- begin:: breadcrumb -->
    <Breadcrumb :crumbs="crumbs" />
    <!-- end:: breadcrumb -->

    <div class="lg:flex justify-between items-center mb-6">
        <p class="text-2xl font-semibold mb-2 lg:mb-0">Selamat Datang, Admin!</p>
    </div>

     <div class="w-full bg-white border rounded-lg p-4">
        <table class="table-auto w-full text-center border">
            <thead>
                <tr>
                    <th class="border p-6">Nama</th>
                    <th class="border p-6">Email</th>
                    <th class="border p-6">Uid</th>
                    <th class="border p-6">Report</th>
                    <th class="border p-6">Active</th>
                    <th class="border p-6">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, index) in displayedItems" :key="index">
                    <td class="border p-3">{{ row.name }}</td>
                    <td class="border p-3">{{ row.email }}</td>
                    <td class="border p-3">{{ row.uid }}</td>
                    <td class="border p-3">{{ row.report }}</td>
                    <td class="border p-3">
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
        <!-- Pagination controls -->
        <div>
            <button class="bg-red-500 btn-sm hover:bg-red-700 text-white font-medium px-3 py-2 rounded-lg" @click="prevPage" :disabled="currentPage === 1">Previous Page</button>
            <span>     {{ currentPage }} of {{ totalPages }}     </span>
            <button class="bg-green-500 btn-sm hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg" @click="nextPage" :disabled="currentPage === totalPages"> Next</button>
        </div>
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
    name: 'Dashboard',
    data() {
        return {
            crumbs: [{
                'link': '/admin/dashboard',
                'name': 'Dashboard'
            }, ],
            users: [],
            itemsPerPage: 10,
            currentPage: 1,
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.users.length / this.itemsPerPage);
        },
        displayedItems() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.users.slice(startIndex, endIndex);
        },
    },
    methods: {
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        async getData() {
            const tblUsers = collection(db, 'Users');
            const qryUsers = query(tblUsers);
            const getUsers = await getDocs(qryUsers);
            if (!getUsers.empty) {
                const dataPromises = getUsers.docs.map(async (doc) => {
                const tblReport = collection(db, "Reports");
                const qryReport = query(tblReport, where("uid", "==", doc.data().uid));
                const resReport = await getCountFromServer(qryReport);
                    return {
                        id: doc.id,
                        uid: doc.data().uid,
                        name: doc.data().name,
                        email: doc.data().email,
                        active: doc.data().active,
                        report: resReport.data().count,
                    };
                });
                Promise.all(dataPromises)
                .then((userData) => {
                    this.users = userData;
                    this.sortDataByName();
                })
                .catch((error) => {
                    console.error("Error fetching user data: ", error);
                });
            } else {
                console.log("No matching documents.");
            }
            // if (!getUsers.empty) {
            //     onSnapshot(qryUsers, (snapshot) => {
            //         this.users = [];
            //         snapshot.docs.forEach(async doc => {
            //             const tblReport = collection(db, "Reports");
            //             const qryReport = query(tblReport, where("uid", "==", doc.data().uid));
            //             const resReport = await getCountFromServer(qryReport)

            //             this.users.push({
            //                 id: doc.id,
            //                 uid: doc.data().uid,
            //                 name: doc.data().name,
            //                 email: doc.data().email,
            //                 active: doc.data().active,
            //                 report: resReport.data().count
            //             });
            //         });
            //     });
            //     this.sortDataByName();
            // } else {
            //     console.log('No matching documents.');
            // }
        },
        sortDataByName() {
            this.users.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
        },
        async blockUser(uid) {
            const tblUsers = collection(db, 'Users');
            const qryUsers = query(tblUsers, where('uid', '==', uid));
            try {
                const getUsers = await getDocs(qryUsers);
                getUsers.forEach(async (row) => {
                    const docRef = doc(db, 'Users', row.id);
                    const newActiveStatus = row.data().active === 'y' ? 'n' : 'y';
                    await updateDoc(docRef, {
                    active: newActiveStatus
                    });
                    console.log('Document successfully updated!');
                });
                this.getData();
            } catch (error) {
            console.error('Error updating document: ', error);
            }
        }
    },
    mounted() {
        this.getData();
    },
}
</script>