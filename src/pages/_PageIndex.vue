<template>
 <q-page padding>

    <div class="text-h4">
      Отзыв дел
    </div>
<q-form  @submit="onSubmit" >
          <div class="q-btn">
            <q-btn :loading="loading4" class="q-mt-sm" type="submit" :disable = "fdisabled"  label="Отозвать" color="primary"> 
              <template v-slot:loading>
                  <q-spinner-hourglass class="on-left"></q-spinner-hourglass>
                  Loading...
                </template>
                
            </q-btn>
            <q-tooltip
              v-if = "fdisabled"
              anchor="bottom middle"
              self="top middle">
                  Заполните все поля
              </q-tooltip>
          </div>
            <q-space/>  
  
  
  <q-btn class="q-mt-sm"   label="TEST" color="primary"  @click="test" >
{{fdisabled}}
  </q-btn>
  <q-space/>

    <div class="q-pa-md">
    <!-- <q-btn color="primary" label="Trigger" @click="trigger" /> -->
    <!-- action="http://localhost:3000" method="post" -->
    </div>
   
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
                label="Выберите фин учреждение" />
        

          
          <!-- <hot-table ref="hotTableComponent" 
          :data="data" 
          name="hotdata"
          licenseKey ='non-commercial-and-evaluation' >
            <hot-column title="№ договора">
            </hot-column>
            <hot-column title="Причина">
            </hot-column>
          </hot-table> -->

          <div id="example"></div>
            
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
            <q-btn label="Заполнить" @click="fillData" :disable=reasondis color="primary"/>
          </div>
      </div>
          
      </div>
      </div>
  </div>

  </q-form>

  
  </q-page>
</template>

<script>




//import { HotTable, HotColumn } from '@handsontable/vue';
var hot, tableArr, mess;

export default {
  components: {
      // HotTable, 
      // HotColumn
    },
  data(){
    return {
      
      table: '',

      data: [
          ["", "", ""],
        ],

        //dataf: {},
        loading4: false,
        modelFinOrgan: null,
        
        options: [
        {
          desc: 'Воля'
        },
         {
          desc: 'Idea'
        },
        {
          desc: 'Tas',
          inactive: false
        },
        {
          desc: 'Galaxy',
          inactive: false
        },
        {
          desc: 'Укртелеком',
         // inactive: false
        },
        {
          desc: 'ЦФР',
          inactive: false
        }
      ],

      
   //   modelFinOrgan: '',// {desc: 'Воля'},

      reasons: [
        'Отзыв по инициативе клиента',
        'Должник мобилизован',
        'Должник умер',
        'Дело связано с мошенничеством'
      ],

      modelreason: '', 
     // dataclass : ''

    }
  },

  mounted() {
    
              var container = document.getElementById('example');
              
              hot = new Handsontable(container, {
                data: this.data,
                colHeaders: ['№ договора', 'Причина', 'Дата реестра(опционально)'],
                // rowHeaders: true,
                licenseKey : 'non-commercial-and-evaluation',
                // colHeaders: true,
                filters: false,
                dropdownMenu: false
              });

  },
  methods:{
    simulateProgress (number) {
      // we set loading state
      this[`loading${number}`] = true
      // simulate a delay
      setTimeout(() => {
        // we're done, we reset loading state
        this[`loading${number}`] = false
      }, 3000)
    },
    
    onSubmit(evt){
      console.log('onSubmit')
        this.simulateProgress(4);

       // let hotdata = hot.getSourceData();
       
       //let hotdata = this.$refs.hotTableComponent.hotInstance.getSourceData();
       
       //console.log('hotdatalength', hotdata.length)   

        let hotdata = hot.getSourceData();
 
          if (hotdata[0][0]  == ''){
                      let mess = {
                        type : "error",
                        title : `Кажется, не хватает данных`,
                        table : '',
                        text : `Что-то пошло не так. `
                      }

                      this.showError(mess);
                  }
          else{
            hotdata.unshift(this.modelFinOrgan);
            this.data = hotdata;
            this.post('withdraw', hotdata);
          }
      
    },
    showError(message) {
      console.log('showError')
      this.$q.dialog({
        title: `<span class="${message.type}">${message.title}</span><em>!</em>`,
        message: `<hr><strong>${message.text}</strong>`,
        html: true,
        
      })},

      

    showDialog(message) {

        let text = this.maketable(message.text);
      this.$q.dialog({
        title: `<span class="${message.type}">${message.title}</span><em>!</em>`,
        message: `<hr><table id="table" >${text}</table>`,
        html: true,
        cancel: true,
        persistent: true,
        class: message.class

      }).onOk(() => {
        //console.log('onOkmessage', message)
       

        if (message.type == 'error'){
          this.post( 'withdraw', this.data )
        }

        if (message.type == 'next_pin'){
          this.post( 'withdraw/pin', [ this.modelFinOrgan , message.table ] )
        }

        if (message.type == 'next_check'){
          this.post( 'withdraw/check', [ this.modelFinOrgan , message.table ] )
        }

        if (message.type == 'next_finish'){
          
          this.post( 'withdraw/finish', [ this.modelFinOrgan , message.table ] )
        }

       if (message.type == 'next_end'){
          window.location.reload()
          this.post( 'semclose', [ this.modelFinOrgan , this.table ] )
        }
        
      }).onCancel(() => {
        
        if (message.text.includes('quasar')){
          
          this.post( 'semclose', [ this.modelFinOrgan , this.table ] )
        }
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    },
    post(route, data){
      console.log('postdata', data);
      this.$q.loading.show();
      this.$http.post(
        `http://localhost:3000/actions/${route}`, 
        data, 
      ).then((response) => {
         this.$q.loading.hide()
        // your action after success
        console.log('resp', response.data);
        
        // switch (response.data.type){
        // case "next_finish":
        //   console.log('case next_finish')
        //   tableArr = response.data.text;
        //   mess = {
        //       type :  response.data.type,
        //       title : `Проверьте перед отзывом `,
        //       table : '',
        //       text : `<div id="table">Если пусто, то уже проверьти не отозвано ли</div>`
        //     }
        //   this.maketable(tableArr, mess)
        // break;

        // case "next_check":
        //   console.log("case next_check")
        //   tableArr = response.data.text;
        //   mess = {
        //       type :  response.data.type,
        //       title : response.data.title,
        //       table : '',
        //       text : `<div id="table">Если пусто, то уже проверьти не отозвано ли</div>`
        //     }
        //   this.maketable(tableArr, mess)
        // break;
        
        // case "next_end":
        //   tableArr = response.data.text;
        //   console.log('case next_end');
        //   this.$q.loading.hide()

        //   mess = {
        //       type : "ok",
        //       title : `Кажется, вы что-то отозвали `,
        //       table : '',
        //       text : `<div id="table">Показывает отозванные за сегодня</div>`
        //     }
        //   this.maketable(tableArr, mess)
        // break;
        
        // default:
        //   this.showDialog(response.data);
        // }
        this.table = response.table
        this.showDialog(response.data)

      });
    },
    fillData(){
      //let hotdata = this.$refs.hotTableComponent.hotInstance.getSourceData();
      let hotdata = hot.getSourceData();
      hotdata.forEach(element => 
        {         
          element[1] = this.modelreason;
                   });

      //console.log('filldatahotdata', hotdata)

      //this.$refs.hotTableComponent.hotInstance.loadData(hotdata);
      hot.loadData(hotdata);
      
    },
    test(){
      console.log('testtesttesttest');
      // let kdata =  [ 'Воля', [ 'asd', 'asd' ] ]
      // 
     // this.post('withdraw/test');
     let hotdata = hot.getSourceData();
    console.log('hotdata test', hotdata)
    this.post('withdraw/test', hotdata);
      //let hotdata = this.$refs.hotTableComponent.hotInstance.getSourceData();
        //console.log('hotdatalength', hotdata.length)   
      


      // let hotdata = hot.getSourceData();
      // console.log('hotdata', hotdata)   
      
      // var tableArr = [[null,null,"2020-09-23T13:52:37.000Z",3497330,"6484321721","ТОВ \"ФК\"Центр Фінансових Рішень\"","2020-09-16T21:00:00.000Z","К-20/100909-613/260620-2869(3040)","AABqkUAAvAAAqD6AAK"]]
      // for (let row of tableArr) {
      //   console.log('rowrow', row)
      // }

      // console.log('tableArr LENGTH', tableArr.length);
      // let mess = {
      //         type : "ok",
      //         title : `Кажется, вы что-то отозвали `,
      //         table : '',
      //         text : tableArr
      //       }


    //  this.showDialog(mess)

      
    },

    maketable(arrtable){
      console.log('arrtable', arrtable)
     
      let str = '';

      var obj = JSON.parse(arrtable);

      console.log('objobj', obj)
      
      for (let row of obj) {
        str += '<tr>';
        for (let cell of row) {
          str += '<td>' + cell + '</td>'
          //let newCell = table.rows[table.rows.length - 1].insertCell();
          // newCell.textContent = cell;
        }
        str += '</tr>';
      }
    //  console.log('strstr', str)
      return str;
    }
  
  },

  computed:{
    fdisabled(){
      console.log('this.data', this.data[0])
      return !this.modelFinOrgan
    
    },
    reasondis(){
      //console.log('modelreason', this.modelreason ==)
      return (this.modelreason == '') ? true : false;
    }    
  }
}
</script>

<style>
  .kflex {
    display: flex;
  
  }

.kdiv {
    width: 100%;
}

  .error {
    color: red;
  }

  .nextpin, .success, .next, .final, .ok {
    color: green;
  }

  
  .q-dialog-plugin.q-card.kossfullwidth {
    width: 100%;
  }

  .q-dialog__inner--minimized > div.kossfullwidth {
    max-width: 100%;
  }

  #table td, #table th {
  border: 1px solid #ddd;
  padding: 8px;
  }

  #table tr:nth-child(even){background-color: #f2f2f2;}

  #table tr:hover {background-color: #ddd;}

  
  
</style>