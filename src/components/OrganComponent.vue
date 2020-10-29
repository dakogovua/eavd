<template>
    <div>
        <q-badge color="secondary" multi-line>
            Фин учреждение: {{ modelFinOrgan }}
          </q-badge>

          <q-select 
                filled 
                :rules="[ val => val && val.length > 0 || 'Пожалуй, надо сделать выбор']"
                hint="Выберите из списка"
                v-model="modelFinOrgan" 
                :options="options" 
                option-value="desc"
                option-label="desc"
                option-disable="inactive"
                emit-value
                map-options
                label="Выберите фин учреждение" 
                @input="$emit('input', $event)"
                />

    </div>
</template>
<script>
export default {
   props:['options'],
    data(){
        return{
              modelFinOrgan: null,
        
        }
    }, 

}
</script>