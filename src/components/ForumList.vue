<template>
    <div>
        <ForumListItem v-for="forum in forums" :key="forum['.key']" :forum="forum" />
    </div>
</template>

<script>
import ForumListItem from './ForumListItem'
export default {
  components: {
    ForumListItem
  },
  props: {
    forums: {
      requred: true,
      type: Array
    }
  }
}
</script>

<style scoped>
</style>
