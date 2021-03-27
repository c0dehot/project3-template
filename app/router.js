const orm = require( './db/orm.mongoose' )
const sessionManager = require( './session-manager' )

// session checking middleware
async function authRequired(req, res, next){
   // check session set, and it's valid
   const sessionData = sessionManager.verify( req.headers.session )
   if( !sessionData ){
      console.log( ` .. [authRequired] url(${req.url}) session(${req.headers.session || ''}) invalid session, refusing (403)` )
      res.status(403).send( { status: false, message: 'Requires valid session. Please login again.' } )
      return
   }
   console.log( ` .. [authRequired] session GOOD - url(${req.url}) session(${req.headers.session || ''}) ` )
   // session was good, pass info on, let's continue endpoint processing...
   req.sessionData = sessionData
   next()
}


function router( app ){
   app.post('/api/users/register', async function(req, res) {
      console.log( '[POST] register request:', req.body )
      const { status, userData, message }= await orm.userRegister( req.body )
      if( !status ){
         res.status(403).send( { status, message } )
         return
      }

      // generate a session-key
      const session = sessionManager.create( userData.id )
      console.log( `.. registration complete! session: ${session}` )

      res.send( { status, session, userData, message } )
   })

   app.post('/api/users/login', async function(req, res) {
      console.log( '[POST] login request:', req.body )
      const { status, userData, message }= await orm.userLogin( req.body.email, req.body.password )
      if( !status ){
         res.status(403).send( { status, message } )
         return
      }

      // generate a session-key
      const session = sessionManager.create( userData.id )
      console.log( `.. login complete! session: ${session}` )

      res.send( { status, session, userData, message } )
   })

   app.get('/api/users/logout', authRequired, async function(req, res) {
      sessionManager.remove( req.header.session )
      console.log( ` .. removed session ${req.header.session}`)
      res.send( { status: true, message: 'Logout complete' } )
   })


   // all these endpoints require VALID session info
   app.get('/api/tasks', authRequired, async function(req, res) {
      const { status, tasks, message }= await orm.taskList( req.sessionData.userId )
      res.send( { status, tasks, message } )
   })

   app.post('/api/tasks', authRequired, async function(req, res) {
      const newTask = req.body.task
      const { status, tasks, message }= await orm.taskSave( newTask, req.sessionData.userId )
      res.send( { status, tasks, message } )
   })
}

module.exports = router