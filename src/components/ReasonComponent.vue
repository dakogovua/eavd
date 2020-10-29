<template>
    <div class="row kflex">          
          <div class="column kdiv">        
          <q-badge color="warning" multi-line>
            Заполнить причину: "{{ modelreason }}"
          </q-badge>


            <q-select
              filled
              v-model="modelreason"
              :options="reasons"
              label="Заполнит причину"
              emit-value
              clearable
            />
          </div>
        
          <div class="column  kdiv">
            <q-btn label="Заполнить" 
            @click="onReason"
        
            :disable=reasondis 
            color="primary"/>
          </div>
      </div>
</template>
<script>
export default {
    props:['reasons'],
    data(){
        return{
            modelreason: ''  
        }
    },
    methods: {
        onReason(){
            
            this.$emit('onReasonemit', this.modelreason)
           // console.log('onReason e', this.modelreason)
        }
    },
    computed: {
            reasondis(){
      //console.log('modelreason', this.modelreason ==)
      return (this.modelreason == '') ? true : false;
    }   
    }
}   


</script>