<template>
 <q-page padding>

    <div class="text-h4">
      Заметки
    </div>
<q-form  @submit="onSubmit" >
          <div class="q-btn">
            <q-btn :loading="loading4" class="q-mt-sm" type="submit" :disable = "fdisabled"  label="Сделать заметки" color="primary"> 
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
          <!-- <q-badge color="secondary" multi-line>
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
         -->
        
        <organselect 
            :options = "options"
            v-model="modelFinOrgan"
          />

          <khandsontable 
            ref="handdata"
            :data="data"
            :titles="['BUSINESS_N', 'заметка']"
            />

          <reasonselect
          
            :reasons = "reasons"
            @onReasonemit = "onReason"
          />

        <!-- <div class="row kflex">          
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
      </div> -->
          
      </div>
      </div>
  </div>

  </q-form>


  </q-page>
</template>

<script>
var hot;

//import { HotTable, HotColumn } from '@handsontable/vue';


import khandsontable from 'components/HandsontableComponent.vue'
import organselect from 'components/OrganComponent.vue'
import reasonselect from 'components/ReasonComponent.vue'

export default {
    components: { khandsontable, organselect, reasonselect },
  data(){
    return {
      
      
      table: '',

      data: [
          ["", ""],
        ],

        //dataf: {},
        loading4: false,
       modelFinOrgan: null,
        

            options: [
                {
                desc: 'Воля',
                inactive: true
                },
                {
                desc: 'Idea',
                inactive: true
                },
                {
                desc: 'Tas',
                inactive: true
                },
                {
                desc: 'Galaxy',
                inactive: false
                },
                {
                desc: 'Укртелеком',
                inactive: true
                },
                {
                desc: 'ЦФР',
                inactive: true
                }
            ],
        


      reasons: [
        'Запрос отправлен',
        'Должник мобилизован',
        'Должник умер',
        'Дело связано с мошенничеством'
      ],

    //  modelreason: '', 
      dataclass : ''

    }
  },

  methods:{
    onReason(e){
      // console.log('onReason', e)
      this.modelreason = e;
      this.fillData();
    },

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

        let hotdata = this.$refs.handdata.data;
 
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
          //  this.data = hotdata;
            //console.log('else hotdata', hotdata)
            this.post('notes', hotdata);
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
          this.post( 'notes', this.data )
        }

        if (message.type == 'next_select'){
          this.post( 'notes/select', [ this.modelFinOrgan , message.table ] )
        }

        if (message.type == 'next_check'){
          this.post( 'notes/check', [ this.modelFinOrgan , message.table ] )
        }

        if (message.type == 'next_finish'){
          
          this.post( 'notes/finish', [ this.modelFinOrgan , message.table ] )
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
    fillData(data){
      console.log('filldata', data)
     // console.log('this.data 1', this.data)
      // this.data.length = 0;

      // while(this.data.length > 0) {
      //   this.data.pop();    
      // }
      // console.log('this.data 1 [] ', this.data)

      //let hotdata = this.$refs.hotTableComponent.hotInstance.getSourceData();
      // let hotdata = hot.getSourceData();
      this.data = [];

      let hotdata = this.$refs.handdata.data;
      for (let i=0; i<hotdata.length; i++){
        this.data.push(
          [ hotdata[i][0], this.modelreason]
        )
        //this.data[i][0] = hotdata[i][0]
        //this.data[i][1] = this.modelreason

        // for (let j=0; j < hotdata[i].length; j++ ){
        //   this.data[i][j]=
        // }
      }
      // hotdata.forEach(element => 
      //   {   
      //    element[1] =  this.modelreason
      //    console.log(element[1] );
      //    this.data[] = hotdata
      //     //element[1] = this.modelreason;
      //    // this.data[1] = this.modelreason;
      //   });
        
    console.log('hotdata', hotdata)
    console.log('this.data 2', this.data)
      // console.log('filldatahotdata', hotdata)

      // this.$refs.hotTableComponent.hotInstance.loadData(hotdata);
      // hot.loadData(hotdata);
      
    },
    test(){
     // console.log('testtesttesttest', );

      // let kdata =  [ 'Воля', [ 'asd', 'asd' ] ]
      // this.post('withdraw', hotdata);
      // this.post('withdraw/test');

      let hotdata = this.$refs.handdata.data;
      

      this.data = [
        ['1', '2'],
        ['3', '4']
      ]

      console.log('hotdarefs test', hotdata)   
      console.log('this data test ', this.data)   
      


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
    },


  
  },

  computed:{
    fdisabled(){
     // console.log('this.data fdisabled', this.data[0])
      return !this.modelFinOrgan
    
    } 
  }
}
</script>

<style scoped>
  main {
    background-color: #eeffff;
  }

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