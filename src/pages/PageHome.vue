<template>
  <div class="col-full">
    <h1>Welcome to the forum</h1>
    <ForumList :forums="forums"/>
  </div>
</template>

<script>
import sourceData from '@/data'
import ForumList from '@/components/ForumList'
console.log(sourceData)

export default {
  components: {
    ForumList
  },
  data () {
    return {
      forums: Object.values(sourceData.forums),
      threads: Object.values(sourceData.threads),
      posts: sourceData.posts,
      users: sourceData.users
    }
  }
}
</script>