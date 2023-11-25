<!-- untuk tampilan pencarian -->
<script setup>
    import NavbarGroup from '../../components/user/NavbarGroup.vue';
    import Loading from '../../components/Loading.vue';
</script>

<template>
    <!-- begin:: navbar -->
    <NavbarGroup :id="id" :uid="uid" />
    <!-- end:: navbar -->

    <div :class="loading ? 'hidden' : 'flex items-center justify-center h-screen'">
        <Loading />
    </div>
    <div class="px-4 pt-4 flex flex-col flex-grow h-0 overflow-auto">
        <ul class="space-y-4">
            <li class="bg-white rounded-lg shadow-md p-4" v-for="row in members" :key="row.id">
                <div class="flex justify-between mb-2">
                    <div class="flex items-center">
                        <img class="h-10 w-10 rounded-full object-cover mr-2" :src="row.photo" :alt="row.name">
                        <div>
                            <h2 class="font-bold text-lg">{{ row.name }}</h2>
                            <p class="text-gray-500">{{ row.email }}</p>
                        </div>
                    </div>
                    <div v-if="row.status" class="flex items-center">
                        <button class="bg-blue-500 m-1 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg" @click="addFriend(uid, row.uid)">Add</button>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>


<script>
    import {
        db
    } from "../../firebase";
    import {
        serverTimestamp,
        collection,
        getDocs,
        addDoc,
        query,
        where,
        and,
        or,
    } from "firebase/firestore";
    import Swal from 'sweetalert2'

    export default {
        name: 'GroupMember',
        props: {
            id: {
                type: String,
                required: true,
            },
        },
        data() {
            return {
                loading: false,
                uid: '',
                members: [],
                users: []
            }
        },
        methods: {
            loadUser() {
                let user = JSON.parse(localStorage.getItem('user'));

                this.uid = user.uid;
            },
            async loadMember() {
                // untuk ambil data users
                const tblUsers = query(collection(db, 'Users'));
                const getUsers = await getDocs(tblUsers);
                this.users = getUsers.docs.map((docUsers) => ({
                    id: docUsers.id,
                    ...docUsers.data()
                }));

                // untuk ambil data member group
                const tblMembers = collection(db, 'Groups/' + this.id + '/Members');
                const qryMembers = query(tblMembers, where('uid', '!=', this.uid));
                const getMembers = await getDocs(qryMembers);

                getMembers.forEach(async doc =>  {
                    let user = this.users.find((row) => row.uid == doc.data().uid);

                    // untuk ambil data friends
                    const tblFriends = collection(db, "Friends");
                    const qryFriends = query(tblFriends, or(
                        where("id_sender", "==", this.uid),
                        where("id_receiver", "==", doc.data().uid)
                    ));
                    const resFriends = await getDocs(qryFriends);
                    
                    this.members.push({
                        uid: user.uid,
                        name: user.name,
                        email: user.email,
                        photo: user.photo,
                        status: (resFriends.empty ? false : true)
                    });
                });

                this.loading = true;
            },
            async addFriend(idSender, idReceiver) {
                const tblFriends = collection(db, 'Friends');
                const qryFriends = query(
                    tblFriends,
                    or(
                        and(
                            where('id_sender', '==', idSender),
                            where('id_receiver', '==', idReceiver),
                        ),
                        and(
                            where('id_sender', '==', idReceiver),
                            where('id_receiver', '==', idSender),
                        ),
                    )
                );
                const getFriends = await getDocs(qryFriends);

                if (getFriends.empty) {
                    console.log('Collection does not exist');

                    const friendsAdd = {
                        id_sender: idSender,
                        id_receiver: idReceiver,
                        latest_message: '',
                        latest_message_time: serverTimestamp(),
                        seen: false,
                        status: true,
                    }

                    addDoc(tblFriends, friendsAdd).then((res) => {
                        this.$router.push({
                            name: 'user-home'
                        });

                        console.log('Friends berhasil ditambahkan => ' + res.id);
                    });
                } else {
                    console.log('Collection does exist');

                    getFriends.forEach((doc) => {
                        this.$router.push({
                            name: 'user-home'
                        });
                    });
                }
            },
        },
        mounted() {
            this.loadUser();
            this.loadMember();
        }
    }
</script>