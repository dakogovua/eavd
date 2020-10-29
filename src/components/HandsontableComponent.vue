<template>
<div>
    <div id="khandsontable"></div>
    
</div>
</template>
<script>
    
    var hot
// , tableArr, mess;
export default {
    // name: 'khandsontable',
    props:['data', 'titles'],
      mounted() {
    
              var container = document.getElementById('khandsontable');
              
              hot = new Handsontable(container, {
                data: this.data,
                //colHeaders: ['№ договора', 'Причина', 'Дата реестра(опционально)'],
                colHeaders: this.titles,
                // rowHeaders: true,
                licenseKey : 'non-commercial-and-evaluation',
                // colHeaders: true,
                filters: false,
                dropdownMenu: false,
                //   afterChange: (changes) => {
                //   changes.forEach(([row, prop, oldValue, newValue]) => {
                //     // console.log(row, prop, oldValue, newValue)
                //   });
                // }

              });
               // console.log('hot',hot)

          //    this.$emit('hotemit', hot)

  },
  watch:{
    data: function(data) { // watch it
          console.log('Prop changed: ', data)
          //console.log('hot', hot)
          hot.loadData(data);
          hot.render();
        }
  }
}
</script>