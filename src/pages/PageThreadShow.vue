<template>
    <div class="col-large push-top">
      <h1>{{thread.title}}
        <router-link :to="{name: 'ThreadEdit', id: this.id}" class="btn-green btn-small" tag="button">
          Edit thread
        </router-link>
      </h1>
      <p>
        By <a href="#" class="link-unstyled">{{user.name}}</a>, <AppDate :timestamp="thread.publishedAt" />.
        <span style="float:rigth; margin-top: 2px;" class="hide-mobile text-faded text-small">3 replies by 3 contributors</span>
      </p>
      <PostList :posts="posts"/>
      <PostEditor 
        :threadId="id" />
    </div>
</template>

<script>
import PostList from '@/components/PostList'
import PostEditor from '@/components/PostEditor'
import {mapGetters} from 'vuex'
export default {
  components: {
    PostList,
    PostEditor
  },
  props: {
    id: {
      required: true,
      type: String
    }
  },
  computed: {
    ...mapGetters({
      user: 'authUser'
    }),
    posts () {
      const postIds = Object.values(this.thread.posts)
      return Object.values(this.$store.state.posts)
        .filter(post => postIds.includes(post['.key']))
    },
    thread () {
      return this.$store.state.threads[this.id]
    }
  }
}
</script>
