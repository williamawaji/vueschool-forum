import firebase from 'firebase'

export default {
  createPost ({ commit, state }, post) {
    const postId = firebase
      .database()
      .ref('posts')
      .push().key
    post.userId = state.authId
    post.publishedAt = Math.floor(Date.now() / 1000)

    const updates = {}
    updates[`posts/${postId}`] = post
    updates[`threads/${post.threadId}/posts/${postId}`] = postId
    updates[`threads/${post.threadId}/contributors/${post.userId}`] = post.userId
    updates[`users/${post.userId}/posts/${postId}`] = postId
    firebase
      .database()
      .ref()
      .update(updates)
      .then(() => {
        // update post
        commit('setItem', { resource: 'posts', item: post, id: postId })
        commit('appendPostToThread', { parentId: post.threadId, childId: postId })
        commit('appendContributorToThread', { parentId: post.threadId, childId: post.userId })
        commit('appendPostToUser', { parentId: post.userId, childId: postId })

        return Promise.resolve(state.posts[postId])
      })
  },
  createThread ({ commit, state, dispatch }, { text, title, forumId }) {
    return new Promise((resolve, reject) => {
      const threadId = firebase
        .database()
        .ref('threads')
        .push().key
      const postId = firebase
        .database()
        .ref('posts')
        .push().key
      const userId = state.authId
      const publishedAt = Math.floor(Date.now() / 1000)

      const thread = { title, publishedAt, forumId, userId, firstPostId: postId, posts: {} }
      thread.posts[postId] = postId
      const post = { text, publishedAt, threadId, userId }

      const updates = {}
      updates[`threads/${threadId}`] = thread
      updates[`forums/${forumId}/threads/${threadId}`] = threadId
      updates[`users/${userId}/threads/${threadId}`] = threadId

      updates[`posts/${postId}`] = post
      updates[`users/${userId}/posts/${postId}`] = postId

      firebase
        .database()
        .ref()
        .update(updates)
        .then(() => {
          // update thread
          commit('setItem', { resource: 'threads', item: thread, id: threadId })
          commit('appendThreadToForum', { parentId: forumId, childId: threadId })
          commit('appendThreadToUser', { parentId: userId, childId: threadId })
          // update post
          commit('setItem', { resource: 'posts', item: post, id: postId })
          commit('appendPostToThread', { parentId: threadId, childId: postId })
          commit('appendPostToUser', { parentId: userId, childId: postId })

          resolve(state.threads[threadId])
        })
    })
  },
  createUser ({ commit, state }, { id, email, name, username, avatar = null }) {
    return new Promise((resolve, reject) => {
      const registeredAt = Math.floor(Date.now() / 1000)
      const usernameLower = username.toLowerCase()
      email = email.toLowerCase()
      const user = { avatar, email, name, username, usernameLower, registeredAt }

      firebase
        .database()
        .ref('users')
        .child(id)
        .set(user)
        .then(() => {
          commit('setItem', { resource: 'users', id: id, item: user })
          resolve(state.users[id])
        })
    })
  },
  registerUserWithEmailAndPassword ({ dispatch }, { email, password, name, username, avatar = null }) {
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(user => {
        return dispatch('createUser', { id: user.uid, email, name, username, password, avatar })
      })
  },
  updateThread ({ commit, state, dispatch }, { title, text, id }) {
    return new Promise((resolve, reject) => {
      const thread = state.threads[id]
      const post = state.posts[thread.firstPostId]

      const edited = { at: Math.floor(Date.now() / 1000), by: state.authId }

      const updates = { text, edited }
      updates[`posts/${thread.firstPostId}/text`] = text
      updates[`posts/${thread.firstPostId}/edited`] = edited
      updates[`threads/${id}/title`] = title

      firebase
        .database()
        .ref()
        .update(updates)
        .then(() => {
          commit('setThread', { thread: { ...thread, title }, threadId: id })
          commit('setPost', { postId: thread.firstPostId, post: { ...post, text, edited } })
          resolve(post)
        })
    })
  },
  updatePost ({ commit, state }, { id, text }) {
    return new Promise((resolve, reject) => {
      const post = state.posts[id]
      const edited = { at: Math.floor(Date.now() / 1000), by: state.authId }

      const updates = { text, edited }

      firebase
        .database()
        .ref('posts')
        .child(id)
        .update(updates)
        .then(() => {
          commit('setPost', { postId: id, post: { ...post, text, edited } })
          resolve(post)
        })
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
