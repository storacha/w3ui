<script>
export default {
  props: ['progressStatuses']
}
</script>

<template>
  <div>
    <div v-for="status in Object.values(progressStatuses)">
      <div v-if="status.lengthComputable" className='relative w2 h5 ba b--white flex flex-column justify-end'>
        <div className='bg-white w100' :style='{ height: Math.floor((status.loaded / status.total) * 100) + "%" }'>
        </div>
      </div>
      <div v-else className='spinner' />
    </div>
  </div>
</template>
