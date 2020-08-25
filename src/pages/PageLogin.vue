<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md" style="max-width: 600px">
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="login" label="Login" />
          <q-tab name="register" label="Register" />

        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="login">
            <login-register :tab = "tab"/>
          </q-tab-panel>

          <q-tab-panel name="register">
            <login-register :tab = "tab"/>
          </q-tab-panel>

        </q-tab-panels>
      </q-card>

      
    </div>
  </div>
</template>

<script>
import LoginRegister from 'components/LoginRegisterComponent.vue'
export default {
  components: {
      LoginRegister
  },
  data () {
    return {
      tab: 'login'
    }
  },
  methods: {
      login: function () {
        let email = this.email 
        let password = this.password
        this.$store.dispatch('login', { email, password })
       .then(() => this.$router.push('/'))
       .catch(err => console.log(err))
      }
    }
}
</script>
