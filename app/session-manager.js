const uuid = require( 'uuid' )

// track valid sessions in memory for speed & ease of implementation
let userSessions = []

function verify( requestSession ){
   if( userSessions.length<1 ) {
      return false
   }
   const sessionMatch = userSessions.filter( sessionData=>sessionData.session===requestSession )
   // console.log( `  .. [verify session] ${requestSession} found?${sessionMatch.length===1}` )
   return ( sessionMatch.length!==1 ? false : sessionMatch[0] )
}

function create( userId ){
   session = uuid.v4()
   // remember this session
   userSessions.push( { session, userId } )
   return session
}

function remove( userSession ){
   // remove the current one
   userSessions = userSessions.filter( sessionData=>sessionData.session!==userSession )
}

module.exports = { verify, create, remove }