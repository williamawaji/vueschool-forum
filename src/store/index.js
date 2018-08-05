import Vue from 'vue'
import Vuex from 'vuex'
import sourceData from '@/data'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ...sourceData,
    authId: 'VXjpr2WHa8Ux4Bnggym8QFLdv5C3'
  },
  getters: {
    authUser (state) {
      return state.users[state.authId]
    }
  },
  actions: {
    createPost (context, post) {
      const postId = 'greatPost' + Math.random()
      post['.key'] = postId
      context.commit('setPost', { post, postId })
      context.commit('appendPostToThread', { postId, threadId: post.threadId })
      context.commit('appendPostToUser', { postId, userId: post.userId })
    },
    updateUser (context, user) {
      context.commit('setUser', { userId: user['.key'], user })
    }
  },
  mutations: {
    setPost (state, { post, postId }) {
      Vue.set(state.posts, postId, post)
    },
    setUser (state, { user, userId }) {
      Vue.set(state.users, userId, user)
    },
    appendPostToThread (state, { postId, threadId }) {
      const thread = state.threads[threadId]
      Vue.set(thread.posts, postId, postId)
    },
    appendPostToUser (state, { postId, userId }) {
      const user = state.users[userId]
      Vue.set(user.posts, postId, postId)
    }
  }
})
