addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  let height = 600;
  let width = 600;
  let padding = 10;
  
  return new Response(respBody(request), {
          status: 200,
          headers : {
            'content-type': "text/html; charset=utf-8",
          }        
  })
}
