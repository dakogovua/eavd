<template>
    <q-form @submit="submitForm">
        <q-input v-if="tab == 'register'"
            outlined class="q-mb-md" v-model="formData.name" label="Name" />
        <q-input outlined class="q-mb-md" v-model="formData.email" type="email" label="Email" />
        <q-input outlined 
        v-if="tab == 'register'" class="q-mb-md" v-model="formData.password" type="password" label="password" />
        <q-input outlined class="q-mb-md" v-model="formData.password2" type="password" label="repeat password" />
        <div class="row">
            <q-space/>
            <q-btn :loading="loading4" color="primary" @click="simulateProgress(4)" :disable=fdisabled style="width: 150px"
                    type="submit">
                    {{tab}}
                    <template v-slot:loading>
                        <q-spinner-hourglass class="on-left" />
                        Loading...
                    </template>
            </q-btn>
            

        </div>
       
    </q-form>
</template>

<script>
import {mapActions} from 'vuex'

export default {
    props: ['tab'],
    data(){
        return{
             loading4: false,
            formData:{
                name: '',
                email: '',
                password: '',
                password2: ''
            }
        }
    },

    methods: {
        ...mapActions('kstore', ['registerUser']),
    simulateProgress (number) {
      // we set loading state
      this[`loading${number}`] = true
      // simulate a delay
      setTimeout(() => {
        // we're done, we reset loading state
        this[`loading${number}`] = false
      }, 2000)
    },
    submitForm(){
        if (this.tab == 'login'){
            console.log('login submit')
        }
        else{
           // console.log('register submit')
            this.registerUser(this.formData);
        }
    }
  },
    computed:{
    fdisabled(){
      if (this.tab == 'login'){
          return false;
      }
      if (this.formData.password != '' && this.formData.password == this.formData.password2){
          return false;
      }

      return true;
    
    }
  }
}
</script>