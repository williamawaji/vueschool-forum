import firebase from 'firebase'

export default {
  createPost ({ commit, state }, post) {
    const postId = 'greatPost' + Math.random()
    post['.key'] = postId
    post.userId = state.authId
    post.publishedAt = Math.floor(Date.now() / 1000)

    commit('setPost', { post, postId })
    commit('appendPostToThread', { parentId: post.threadId, childId: postId })
    commit('appendPostToUser', { parentId: post.userId, childId: postId })

    return Promise.resolve(state.posts[postId])
  },
  createThread ({ commit, state, dispatch }, { text, title, forumId }) {
    return new Promise((resolve, reject) => {
      const threadId = 'greatThread' + Math.random()
      const userId = state.authId
      const publishedAt = Math.floor(Date.now() / 1000)

      const thread = { '.key': threadId, title, forumId, publishedAt, userId }

      commit('setThread', { threadId, thread })
      commit('appendThreadToForum', { parentId: forumId, childId: threadId })
      commit('appendThreadToUser', { parentId: userId, childId: threadId })

      dispatch('createPost', { text, threadId }).then(post => {
        commit('setThread', {
          threadId,
          thread: { ...thread, firstPostId: post['.key'] }
        })
      })
      resolve(state.threads[threadId])
    })
  },
  updateThread ({ commit, state, dispatch }, { title, text, id }) {
    return new Promise((resolve, reject) => {
      const thread = state.threads[id]
      const newThread = { ...thread, title }

      commit('setThread', { thread: newThread, threadId: id })

      dispatch('updatePost', { id: thread.firstPostId, text }).then(() => {
        resolve(newThread)
      })
    })
  },
  updatePost ({ commit, state }, { id, text }) {
    return new Promise((resolve, reject) => {
      const post = state.posts[id]
      commit('setPost', {
        post: {
          ...post,
          text,
          edited: {
            at: Math.floor(Date.now() / 1000),
            by: state.authId
          }
        },
        postId: id
      })
      resolve(post)
    })
  },
  updateUser ({ commit }, user) {
    commit('setUser', { userId: user['.key'], user })
  },

  fetchCategory: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'categories', emoji: 'cat', id }),
  fetchForum: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'forums', emoji: 'forum', id }),
  fetchThread: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'threads', emoji: '📄', id }),
  fetchPost: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'posts', emoji: '💬‍', id }),
  fetchUser: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'users', emoji: '🙋‍', id }),

  fetchCategories: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'categories', emoji: 'cats', ids }),
  fetchForums: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'forums', emoji: 'forums', ids }),
  fetchThreads: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'threads', emoji: '📄s', ids }),
  fetchPosts: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'posts', emoji: 'chats', ids }),
  fetchUsers: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'users', emoji: '🙋‍s', ids }),

  fetchAllCategories ({ state, commit }) {
    console.log('🔥', 'cat', 'all')
    return new Promise((resolve, reject) => {
      firebase
        .database()
        .ref('categories')
        .once('value', snapshot => {
          const categoriesObject = snapshot.val()
          Object.keys(categoriesObject).forEach(categoryId => {
            const category = categoriesObject[categoryId]
            commit('setItem', { resource: 'categories', id: categoryId, item: category })
          })
        })
      resolve(Object.values(state.categories))
    })
  },
  fetchItem ({ state, commit }, { id, emoji, resource }) {
    console.log('🔥', emoji, id)
    return new Promise((resolve, reject) => {
      firebase
        .database()
        .ref(resource)
        .child(id)
        .once('value', snapshot => {
          commit('setItem', { resource, id: snapshot.key, item: snapshot.val() })
          resolve(state[resource][id])
        })
    })
  },
  fetchItems ({ dispatch }, { ids, resource, emoji }) {
    ids = Array.isArray(ids) ? ids : Object.keys(ids)
    return Promise.all(ids.map(id => dispatch('fetchItem', { id, resource, emoji })))
  }
}
