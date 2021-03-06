import store from '../store'

import Vue from 'vue'
import axios from 'axios'

// Vue.prototype.$axios = axios

Vue.prototype.$http = axios;
const token = localStorage.getItem('token')
if (token) {
  Vue.prototype.$http.defaults.headers.common['Authorization'] = token
}