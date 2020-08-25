<template>


        <q-page padding>

    
    <div class="text-h4">
      Отзыв дел
    </div>

    
    <div class="q-pa-md">
      <q-ajax-bar
        ref="bar"
        position="top"
        color="accent"
        size="10px"
        skip-hijack
      />
    <!-- <q-btn color="primary" label="Trigger" @click="trigger" /> -->
    <!-- action="http://localhost:3000" method="post" -->
    </div>
<q-form  @submit="onSubmit" >
    <div class="q-pa-md" style="max-width: 300px">
      <!-- <q-input
        label="Required Field"
        :rules="[val => !!val || 'Field text is required']"
        v-model="text"
        filled
        type="textarea"
        name = "text"
      /> -->

      <div class="q-pa-md">
        <div class="q-gutter-md">
          <q-badge color="secondary" multi-line>
            Фин учреждение: {{ modelFinOrgan }}
          </q-badge>

          <q-select 
                name = "finorgan"
                filled 
                :rules="[ val => val != null || 'Please select' ]"
                v-model="modelFinOrgan" 
                :options="options" 
                label="Выберите фин учреждение" />
          </div>
          <div class="q-gutter-md">
            <q-btn class="q-mt-sm" type="submit" :disable=fdisabled  label="Отозвать" color="primary"/> 
            <q-space/>
          </div>

          <hot-table ref="hotTableComponent" 
          :data="data" 
          name="hotdata"
          licenseKey ='non-commercial-and-evaluation' >
            <hot-column title="№ договора">
            </hot-column>
            <hot-column title="Причина">
            </hot-column>
          </hot-table>


            <!-- <div class="q-gutter-md"> -->
              <!-- <q-badge color="secondary" multi-line>
                Причина: {{ modelReasons }}
              </q-badge> -->

              <!-- <q-select 
                    name = "fincase"
                    filled 
                    :rules="[ val => val != null || 'Please select' ]"
                    v-model="modelReasons" 
                    :options="reasons" 
                    label="Выберите причину" />
                    -->
                    
                    
            <!-- </div> -->
      </div>
    
  </div>

  </q-form>
  
  </q-page>
</template>

<script>
import { HotTable, HotColumn } from '@handsontable/vue';

export default {
  components: {
      HotTable, 
      HotColumn
    },
  data(){
    return {
      data: [
          // ['укажите # договора', 'укажите причину'],
          ["900781178","По решению руководства"],
          ["900709865","Возврат оборудования"],
          ["806283833","Возврат оборудования"]
          
        ],

        dataf: {},


      options: [
        'Idea', 
        'Tas', 
        'Воля'
        ],

      reasons: [
        'Отзыв по инициативе клиента',
        'Должник мобилизован',
        'Должник умер'
      ],
      modelFinOrgan: 'Воля',

    }
  },
  methods:{
    send(){
      this.trigger(); // запускаем аякс - анимацию

      // let ks = this.text.replace(/ /g, "").split("\n"); // убираем пробелы
      
    },

     trigger () {
      const bar = this.$refs.bar

      bar.start()

      this.timer = setTimeout(() => {
        if (this.$refs.bar) {
          this.$refs.bar.stop()
        }
      }, Math.random() * 3000 + 1000)
    },
    onSubmit(evt){
        // console.log('@submit evt.target', evt.target)
        // console.log('@submit - do something here', evt)
        // this.send();
       let hotdata = this.$refs.hotTableComponent.hotInstance.getSourceData();
      
      hotdata.unshift(this.modelFinOrgan);


      this.$http.post(
        'http://localhost:3000/actions/withdraw', 
        hotdata, 
      ).then((response) => {
        // your action after success
     //   console.log('resp', response.data);
        this.showDialog(response.data);
      });

      // evt.target.submit()

       
    },
    showDialog(message) {
      this.$q.dialog({
        title: 'Alert<em>!</em>',
        message: message + '<hr><span class="text-red">Таблица ЗАНЯТА</span> <strong>Попробуйте попизже!</strong>',
        html: true
      }).onOk(() => {
        // console.log('OK')
      }).onCancel(() => {
        // console.log('Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }
  
  },

  computed:{
    fdisabled(){
      console.log('this.data', this.data)
      return !this.data || !this.modelFinOrgan
    
    }
  }
}
</script>
<style src="../../node_modules/handsontable/dist/handsontable.full.css"></style>