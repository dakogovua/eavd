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
        

          
          <hot-table ref="hotTableComponent" 
          :data="data" 
          name="hotdata"
          licenseKey ='non-commercial-and-evaluation' >
            <hot-column title="№ договора">
            </hot-column>
            <hot-column title="Причина">
            </hot-column>
          </hot-table>
            
        <div class="row kflex">          
          <div class="column kdiv">        
          <q-badge color="warning" multi-line>
            Заполнить причину: "{{ modelreason }}"
          </q-badge>


            <q-select
              filled
              v-model="modelreason"
              :options="reasons"
              label="Заполнит правую колонку"
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
import { HotTable, HotColumn } from '@handsontable/vue';

export default {
  components: {
      HotTable, 
      HotColumn
    },
  data(){
    return {


      data: [
          ["",""],
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

      
      modelFinOrgan: '',// {desc: 'Воля'},

      reasons: [
        'Отзыв по инициативе клиента',
        'Должник мобилизован',
        'Должник умер'
      ],

      modelreason: '', 
      dataclass : ''

    }
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

       let hotdata = this.$refs.hotTableComponent.hotInstance.getSourceData();
        //console.log('hotdatalength', hotdata.length)   
 
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
      this.$q.dialog({
        title: `<span class="${message.type}">${message.title}</span><em>!</em>`,
        message: `<hr><strong>${message.text}</strong>`,
        html: true,
        cancel: true,
        persistent: true,
        class: this.dataclass

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
          //this.post( 'withdraw/finish', [ this.modelFinOrgan , message.table ] )
        }
        
      }).onCancel(() => {
        
        if (message.text.includes('quasar')){
          this.post( 'withdraw/semclose', [ this.modelFinOrgan , message.table ] )
        }
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    },
    post(route, data){
      console.log('postdata', data);

      this.$http.post(
        `http://localhost:3000/actions/${route}`, 
        data, 
      ).then((response) => {
        // your action after success
        console.log('resp', response.data);
        this.showDialog(response.data);
      });
    },
    fillData(){
      let hotdata = this.$refs.hotTableComponent.hotInstance.getSourceData();
      
      hotdata.forEach(element => 
        {         
          element[1] = this.modelreason;
                   });

      //console.log('filldatahotdata', hotdata)

      this.$refs.hotTableComponent.hotInstance.loadData(hotdata);
      
    },
    test(){
      console.log('testtesttesttest');
      // let kdata =  [ 'Воля', [ 'asd', 'asd' ] ]
      // this.post('withdraw', hotdata);
      //this.post('withdraw/test');

      //let hotdata = this.$refs.hotTableComponent.hotInstance.getSourceData();
        //console.log('hotdatalength', hotdata.length)   
      //  console.log('hotdata', hotdata)   
      const tableArr = [["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T11:43:05.000Z",3616255,"C16.977.77389","АТ \"Ідея Банк\" ","2020-11-29T21:00:00.000Z","К-5/100120-33/040920-2937(3112)","AABqkUAAvAAAjrLAAG"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T11:43:05.000Z",3618386,"F94.13067.004729768","АТ \"Ідея Банк\" ","2020-11-29T21:00:00.000Z","К-5/100120-33/040920-2937(3112)","AABqkUAAvAAAjrLAAC"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T11:43:04.000Z",3579745,"C-601-007819-18-980","АТ \"Ідея Банк\" ","2020-10-29T21:00:00.000Z","К-5/100120-30/030820-2906(3081)","AABqkUAAvAAAjqLAAJ"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T11:43:04.000Z",3616387,"C17.196.73532","АТ \"Ідея Банк\" ","2020-11-29T21:00:00.000Z","К-5/100120-33/040920-2937(3112)","AABqkUAAvAAAjqLAAE"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T11:43:04.000Z",3616348,"Z40.702.70569","АТ \"Ідея Банк\" ","2020-11-29T21:00:00.000Z","К-5/100120-33/040920-2937(3112)","AABqkUAAvAAAjpLAAJ"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T11:43:04.000Z",3616405,"Z52.290.70618","АТ \"Ідея Банк\" ","2020-11-29T21:00:00.000Z","К-5/100120-33/040920-2937(3112)","AABqkUAAvAAAjpLAAE"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3622385,"176384","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-23T21:00:00.000Z","К-231017/231017-218PRE/150920-2947(3122)","AABqkUAAoAAOlxSAAC"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3620667,"175847","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-18T21:00:00.000Z","К-231017/231017-217PRE/100920-2945(3120)","AABqkUAAoAAOlwTAAK"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3622495,"176566","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-23T21:00:00.000Z","К-231017/231017-218PRE/150920-2947(3122)","AABqkUAAoAAOlwTAAI"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3622556,"176155","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-23T21:00:00.000Z","К-231017/231017-218PRE/150920-2947(3122)","AABqkUAAoAAOlwTAAD"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3614857,"165174","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-11-29T21:00:00.000Z","К-231017/231017-213/020920-2934(3109)","AABqkUAAoAAOlvUAAK"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3619533,"174549","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-16T21:00:00.000Z","К-231017/231017-214PRE/080920-2939(3114)","AABqkUAAoAAOlvUAAF"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3619604,"174951","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-16T21:00:00.000Z","К-231017/231017-214PRE/080920-2939(3114)","AABqkUAAoAAOlvUAAB"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3622405,"178346","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-23T21:00:00.000Z","К-231017/231017-218PRE/150920-2947(3122)","AABqkUAAoAAOluVAAL"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3619512,"172773","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-16T21:00:00.000Z","К-231017/231017-214PRE/080920-2939(3114)","AABqkUAAoAAOluVAAI"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3622306,"180358","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-23T21:00:00.000Z","К-231017/231017-218PRE/150920-2947(3122)","AABqkUAAoAAOluVAAG"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3596960,"170968","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-03T21:00:00.000Z","К-231017/231017-207PRE/260820-2924(3099)","AABqkUAAoAAOluVAAC"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3620771,"175538","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-18T21:00:00.000Z","К-231017/231017-217PRE/100920-2945(3120)","AABqkUAAoAAOltWAAK"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3620745,"175654","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-18T21:00:00.000Z","К-231017/231017-217PRE/100920-2945(3120)","AABqkUAAoAAOltWAAJ"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3622475,"178154","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-23T21:00:00.000Z","К-231017/231017-218PRE/150920-2947(3122)","AABqkUAAoAAOltWAAH"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T08:41:50.000Z",3622474,"175443","ТОВ \"ФК \"ГЕЛЕКСІ\"","2020-10-23T21:00:00.000Z","К-231017/231017-218PRE/150920-2947(3122)","AABqkUAAoAAOltWAAC"],["Отзыв по инициативе клиента",{"_readableState":{"objectMode":false,"highWaterMark":16384,"buffer":{"head":null,"tail":null,"length":0},"length":0,"pipes":null,"pipesCount":0,"flowing":null,"ended":false,"endEmitted":false,"reading":false,"sync":true,"needReadable":false,"emittedReadable":false,"readableListening":false,"resumeScheduled":false,"emitClose":true,"autoDestroy":false,"destroyed":false,"defaultEncoding":"utf8","awaitDrainWriters":null,"multiAwaitDrain":false,"readingMore":false,"decoder":null,"encoding":null},"readable":true,"_events":{},"_eventsCount":1,"_writableState":{"objectMode":false,"highWaterMark":16384,"finalCalled":false,"needDrain":false,"ending":false,"ended":false,"finished":false,"destroyed":false,"decodeStrings":false,"defaultEncoding":"utf8","length":0,"writing":false,"corked":0,"sync":true,"bufferProcessing":false,"writecb":null,"writelen":0,"afterWriteTickInfo":null,"bufferedRequest":null,"lastBufferedRequest":null,"pendingcb":0,"prefinished":false,"errorEmitted":false,"emitClose":true,"autoDestroy":false,"bufferedRequestCount":0,"corkedRequestsFree":{"next":null,"entry":null}},"writable":true,"allowHalfOpen":true,"offset":1},"2020-09-21T07:13:06.000Z",3534338,"1201001015687520","ПАТ \"УКРТЕЛЕКОМ\"","2020-10-22T21:00:00.000Z","К-80D114-317/20/090620-17В/030720-2874(3046)","AABqkUAAvAAAkaXAAD"]]

      let table = document.createElement('table');
      for (let row of tableArr) {
        table.insertRow();
        for (let cell of row) {
          let newCell = table.rows[table.rows.length - 1].insertCell();
          newCell.textContent = cell;
          }
      }

      let mess = {
              type : "ok",
              title : `Кажется, не хватает данных `,
              table : '',
              text : `<div id="table">Показывает отозванные за сегодня</div>`
            }
    
     var promise  = new Promise((resolve, reject) =>{
       this.dataclass = 'kossfullwidth'
       this.showDialog(mess);
         if (true) {
          resolve("Stuff worked!");
        }
        else {
          reject(Error("It broke"));
        }
    });

    promise.then((result) => {
        console.log(result); // "Stuff worked!"
        // document.getElementById("table").innerHTML = table;
        document.getElementById("table").appendChild(table);
        
        
      }, (err) => {
        console.log(err); // Error: "It broke"
      });
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
<style src="../../node_modules/handsontable/dist/handsontable.full.css"></style>
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

  .nextpin, .success, .next, .final {
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